import { describe, expect, it, vi } from "vitest";

import { GHNQuoteService, type GHNQuoteInput } from "../ghnQuoteService";
import type { GHNFeeQuotation, GHNServiceDescription } from "../ghn";

const createService = (overrides: Partial<GHNServiceDescription> = {}): GHNServiceDescription => ({
  serviceId: overrides.serviceId ?? 1,
  serviceTypeId: overrides.serviceTypeId ?? 2,
  shortName: overrides.shortName ?? "FAST",
  name: overrides.name ?? "Nhanh",
  expectedDeliveryTime: overrides.expectedDeliveryTime ?? null
});

const quoteInput: GHNQuoteInput = {
  fromDistrictId: 1447,
  fromWardCode: "200101",
  toDistrictId: 1489,
  toWardCode: "100901",
  weightInGrams: 1200
};

describe("GHNQuoteService", () => {
  it("returns quotes sorted by total fee", async () => {
    const services: GHNServiceDescription[] = [
      createService({ serviceId: 100, shortName: "EXP" }),
      createService({ serviceId: 200, shortName: "ECO" })
    ];

    const fees: GHNFeeQuotation[] = [
      { total: 50000, serviceFee: 48000, codFee: 2000, insuranceFee: 0, discount: 0, expectedDeliveryTime: "2025-09-28" },
      { total: 40000, serviceFee: 38000, codFee: 2000, insuranceFee: 0, discount: 0, expectedDeliveryTime: "2025-09-30" }
    ];

    const client = {
      listAvailableServices: vi.fn().mockResolvedValue(services),
      calculateFee: vi
        .fn()
        .mockResolvedValueOnce(fees[0])
        .mockResolvedValueOnce(fees[1])
    };

    const service = new GHNQuoteService(client);
    const result = await service.getQuotes(quoteInput);

    expect(client.listAvailableServices).toHaveBeenCalledWith({
      fromDistrictId: quoteInput.fromDistrictId,
      fromWardCode: quoteInput.fromWardCode,
      toDistrictId: quoteInput.toDistrictId,
      toWardCode: quoteInput.toWardCode,
      weightInGrams: quoteInput.weightInGrams
    });

    expect(client.calculateFee).toHaveBeenCalledTimes(2);
    expect(result.failures).toHaveLength(0);

    expect(result.quotes.map((item) => item.service.shortName)).toEqual(["ECO", "EXP"]);
    expect(result.quotes.map((item) => item.fee.total)).toEqual([40000, 50000]);
  });

  it("captures failures without throwing", async () => {
    const services: GHNServiceDescription[] = [
      createService({ serviceId: 100 }),
      createService({ serviceId: 200 })
    ];

    const client = {
      listAvailableServices: vi.fn().mockResolvedValue(services),
      calculateFee: vi
        .fn()
        .mockResolvedValueOnce({ total: 42000, serviceFee: 40000, codFee: 2000, insuranceFee: 0, discount: 0, expectedDeliveryTime: null })
        .mockRejectedValueOnce(new Error("Service unavailable"))
    };

    const service = new GHNQuoteService(client);
    const result = await service.getQuotes(quoteInput);

    expect(result.quotes).toHaveLength(1);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].error).toContain("Service unavailable");
  });

  it("returns empty arrays when no services are available", async () => {
    const client = {
      listAvailableServices: vi.fn().mockResolvedValue([]),
      calculateFee: vi.fn()
    };

    const service = new GHNQuoteService(client);
    const result = await service.getQuotes(quoteInput);

    expect(result).toEqual({ quotes: [], failures: [] });
    expect(client.calculateFee).not.toHaveBeenCalled();
  });
});
