import { describe, expect, it, vi } from "vitest";

import { VTPQuoteService, type VTPQuoteInput } from "../vtpQuoteService";
import type { VTPFeeQuotation } from "../vtp";

const quoteInput: VTPQuoteInput = {
  senderDistrictId: 1447,
  senderWardCode: "200101",
  receiverDistrictId: 1489,
  receiverWardCode: "100901",
  weightInGrams: 900
};

describe("VTPQuoteService", () => {
  it("returns quote from client", async () => {
    const quote: VTPFeeQuotation = {
      total: 38000,
      mainFee: 36000,
      codFee: 0,
      insuranceFee: 0,
      fuelSurcharge: 0,
      remoteAreasFee: 0,
      vatFee: 2000,
      serviceCode: "VTK_ECO",
      expectedDeliveryDays: 3
    };

    const client = {
      calculateFee: vi.fn().mockResolvedValue(quote)
    };

    const service = new VTPQuoteService(client);
    const result = await service.getQuote(quoteInput);

    expect(client.calculateFee).toHaveBeenCalledWith(quoteInput);
    expect(result).toEqual({ quote });
  });
});
