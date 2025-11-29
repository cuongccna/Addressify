import {
  GHNCalculateFeeInput,
  GHNClient,
  type GHNClientFactoryOverrides,
  type GHNFeeQuotation,
  type GHNServiceDescription,
  type GHNServiceFilter
} from "./ghn";

export interface GHNQuoteInput extends GHNServiceFilter {
  heightInCm?: number;
  lengthInCm?: number;
  widthInCm?: number;
  insuranceValue?: number;
  couponCode?: string;
}

export interface GHNServiceQuote {
  service: GHNServiceDescription;
  fee: GHNFeeQuotation;
}

export interface GHNServiceFailure {
  service: GHNServiceDescription;
  error: string;
  errorCode?: string;
}

export interface GHNQuoteResult {
  quotes: GHNServiceQuote[];
  failures: GHNServiceFailure[];
}

interface GHNClientLike {
  listAvailableServices(filter: GHNServiceFilter): Promise<GHNServiceDescription[]>;
  calculateFee(input: GHNCalculateFeeInput): Promise<GHNFeeQuotation>;
}

// Service type constraints based on GHN documentation
const SERVICE_WEIGHT_LIMITS: Record<number, { min: number; max: number; name: string }> = {
  2: { min: 0, max: 20000, name: "Hàng nhẹ" },      // Hàng nhẹ: 0-20kg
  5: { min: 20000, max: 50000, name: "Hàng nặng" }  // Hàng nặng: 20-50kg
};

export class GHNQuoteService {
  constructor(private readonly client: GHNClientLike) {}

  static fromEnv(overrides?: GHNClientFactoryOverrides): GHNQuoteService {
    return new GHNQuoteService(GHNClient.fromEnv(overrides));
  }

  async getQuotes(input: GHNQuoteInput): Promise<GHNQuoteResult> {
    const services = await this.client.listAvailableServices({
      fromDistrictId: input.fromDistrictId,
      fromWardCode: input.fromWardCode,
      toDistrictId: input.toDistrictId,
      toWardCode: input.toWardCode,
      weightInGrams: input.weightInGrams
    });

    if (!services.length) {
      return { quotes: [], failures: [] };
    }

    // Filter services based on weight constraints
    const eligibleServices = services.filter(service => {
      const limits = SERVICE_WEIGHT_LIMITS[service.serviceTypeId];
      if (!limits) return true; // Unknown service type, try it
      
      const weight = input.weightInGrams;
      if (weight < limits.min) {
        console.log(`[GHNQuoteService] Skipping ${service.shortName} (${limits.name}): weight ${weight}g < min ${limits.min}g`);
        return false;
      }
      if (weight > limits.max) {
        console.log(`[GHNQuoteService] Skipping ${service.shortName} (${limits.name}): weight ${weight}g > max ${limits.max}g`);
        return false;
      }
      return true;
    });

    console.log(`[GHNQuoteService] Eligible services: ${eligibleServices.length}/${services.length} for weight ${input.weightInGrams}g`);

    if (!eligibleServices.length) {
      // Return info about why services were filtered
      return {
        quotes: [],
        failures: services.map(service => {
          const limits = SERVICE_WEIGHT_LIMITS[service.serviceTypeId];
          return {
            service,
            error: limits 
              ? `Weight ${input.weightInGrams}g not in range ${limits.min}-${limits.max}g for ${limits.name}`
              : "No eligible service for this weight",
            errorCode: "WEIGHT_OUT_OF_RANGE"
          };
        })
      };
    }

    const settled = await Promise.allSettled(
      eligibleServices.map(async (service) => {
        const feeInput: GHNCalculateFeeInput = {
          fromDistrictId: input.fromDistrictId,
          fromWardCode: input.fromWardCode,
          toDistrictId: input.toDistrictId,
          toWardCode: input.toWardCode,
          weightInGrams: input.weightInGrams,
          serviceId: service.serviceId,
          serviceTypeId: service.serviceTypeId,
          couponCode: input.couponCode,
          insuranceValue: input.insuranceValue,
          heightInCm: input.heightInCm,
          lengthInCm: input.lengthInCm,
          widthInCm: input.widthInCm
        };

        const fee = await this.client.calculateFee(feeInput);
        return { service, fee } satisfies GHNServiceQuote;
      })
    );

    const quotes: GHNServiceQuote[] = [];
    const failures: GHNServiceFailure[] = [];

    settled.forEach((result, index) => {
      const service = eligibleServices[index];
      if (result.status === "fulfilled") {
        quotes.push(result.value);
      } else {
        const errorMessage = result.reason instanceof Error ? result.reason.message : String(result.reason);
        // Extract error code from message if available
        let errorCode = "UNKNOWN";
        if (errorMessage.includes("route not found")) {
          errorCode = "ROUTE_NOT_FOUND";
        } else if (errorMessage.includes("Cân nặng không hợp lệ")) {
          errorCode = "INVALID_WEIGHT";
        }
        
        failures.push({
          service,
          error: errorMessage,
          errorCode
        });
      }
    });

    quotes.sort((a, b) => a.fee.total - b.fee.total);

    return { quotes, failures };
  }
}
