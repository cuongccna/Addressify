import {
  GHTKClient,
  type GHTKClientFactoryOverrides,
  type GHTKFeeQuotation,
  type GHTKFeeRequest,
  type GHTKLeadtimeEstimate,
  type GHTKLeadtimeRequest
} from "./ghtk";

export interface GHTKQuoteInput extends GHTKFeeRequest {
  includeLeadtime?: boolean;
}

export interface GHTKQuoteWarning {
  stage: "leadtime";
  message: string;
}

export interface GHTKQuoteResult {
  quote: GHTKFeeQuotation;
  leadtime: GHTKLeadtimeEstimate | null;
  warnings: GHTKQuoteWarning[];
}

interface GHTKClientLike {
  calculateFee(input: GHTKFeeRequest): Promise<GHTKFeeQuotation>;
  getLeadtime(input: GHTKLeadtimeRequest): Promise<GHTKLeadtimeEstimate>;
}

export class GHTKQuoteService {
  constructor(private readonly client: GHTKClientLike) {}

  static fromEnv(overrides?: GHTKClientFactoryOverrides): GHTKQuoteService {
    return new GHTKQuoteService(GHTKClient.fromEnv(overrides));
  }

  async getQuote(input: GHTKQuoteInput): Promise<GHTKQuoteResult> {
    const quote = await this.client.calculateFee(input);

    const shouldFetchLeadtime = input.includeLeadtime ?? true;
    if (!shouldFetchLeadtime) {
      return {
        quote,
        leadtime: null,
        warnings: []
      };
    }

    const warnings: GHTKQuoteWarning[] = [];
    let leadtime: GHTKLeadtimeEstimate | null = null;

    try {
      leadtime = await this.client.getLeadtime(toLeadtimeRequest(input));
    } catch (error) {
      warnings.push({
        stage: "leadtime",
        message: error instanceof Error ? error.message : "Failed to fetch leadtime from GHTK"
      });
    }

    return { quote, leadtime, warnings };
  }
}

function toLeadtimeRequest(input: GHTKQuoteInput): GHTKLeadtimeRequest {
  return {
    pickProvince: input.pickProvince,
    pickDistrict: input.pickDistrict,
    pickWard: input.pickWard,
    pickAddress: input.pickAddress,
    province: input.province,
    district: input.district,
    ward: input.ward,
    address: input.address,
    transport: input.transport
  };
}
