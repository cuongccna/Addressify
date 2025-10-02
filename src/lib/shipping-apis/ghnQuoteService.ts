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
}

export interface GHNQuoteResult {
  quotes: GHNServiceQuote[];
  failures: GHNServiceFailure[];
}

interface GHNClientLike {
  listAvailableServices(filter: GHNServiceFilter): Promise<GHNServiceDescription[]>;
  calculateFee(input: GHNCalculateFeeInput): Promise<GHNFeeQuotation>;
}

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

    const settled = await Promise.allSettled(
      services.map(async (service) => {
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
      const service = services[index];
      if (result.status === "fulfilled") {
        quotes.push(result.value);
      } else {
        failures.push({
          service,
          error: result.reason instanceof Error ? result.reason.message : String(result.reason)
        });
      }
    });

    quotes.sort((a, b) => a.fee.total - b.fee.total);

    return { quotes, failures };
  }
}
