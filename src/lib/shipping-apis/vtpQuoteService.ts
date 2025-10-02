import { VTPClient, type VTPClientFactoryOverrides, type VTPFeeQuotation, type VTPFeeRequest } from "./vtp";

export type VTPQuoteInput = VTPFeeRequest;

export interface VTPQuoteResult {
  quote: VTPFeeQuotation;
}

interface VTPClientLike {
  calculateFee(input: VTPFeeRequest): Promise<VTPFeeQuotation>;
}

export class VTPQuoteService {
  constructor(private readonly client: VTPClientLike) {}

  static fromEnv(overrides?: VTPClientFactoryOverrides): VTPQuoteService {
    return new VTPQuoteService(VTPClient.fromEnv(overrides));
  }

  async getQuote(input: VTPQuoteInput): Promise<VTPQuoteResult> {
    const quote = await this.client.calculateFee(input);
    return { quote };
  }
}
