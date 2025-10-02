import { describe, expect, it, vi } from "vitest";

import { GHTKQuoteService, type GHTKQuoteInput } from "../ghtkQuoteService";
import type { GHTKFeeQuotation, GHTKLeadtimeEstimate } from "../ghtk";

const quoteInput: GHTKQuoteInput = {
  pickProvince: "Hồ Chí Minh",
  pickDistrict: "Quận 1",
  pickWard: "Phường Bến Nghé",
  pickAddress: "19 Nguyễn Trãi",
  province: "Hà Nội",
  district: "Quận Hoàn Kiếm",
  ward: "Phường Hàng Trống",
  address: "25 Lý Thái Tổ",
  weightInGrams: 800,
  transport: "road"
};

describe("GHTKQuoteService", () => {
  it("returns quote and leadtime when both succeed", async () => {
    const quote: GHTKFeeQuotation = {
      total: 36000,
      shipFee: 32000,
      insuranceFee: 1000,
      codFee: 0,
      returnFee: 0,
      remoteAreasFee: 0,
      vatFee: 3000,
      deliveryType: "road",
      warningMessage: null,
      expectedDeliveryTime: "2025-09-28T19:00:00+07:00",
      expectedPickupTime: "2025-09-27T08:00:00+07:00"
    };

    const leadtime: GHTKLeadtimeEstimate = {
      estimatedDays: 2,
      expectedPickupTime: "2025-09-27T08:00:00+07:00",
      expectedDeliveryTime: "2025-09-29T19:00:00+07:00"
    };

    const client = {
      calculateFee: vi.fn().mockResolvedValue(quote),
      getLeadtime: vi.fn().mockResolvedValue(leadtime)
    };

    const service = new GHTKQuoteService(client);
    const result = await service.getQuote(quoteInput);

    expect(client.calculateFee).toHaveBeenCalledWith(quoteInput);
    expect(client.getLeadtime).toHaveBeenCalled();
    expect(result).toEqual({ quote, leadtime, warnings: [] });
  });

  it("skips leadtime when includeLeadtime is false", async () => {
    const quote: GHTKFeeQuotation = {
      total: 36000,
      shipFee: 32000,
      insuranceFee: 0,
      codFee: 0,
      returnFee: 0,
      remoteAreasFee: 0,
      vatFee: 4000,
      deliveryType: "road",
      warningMessage: null,
      expectedDeliveryTime: null,
      expectedPickupTime: null
    };

    const client = {
      calculateFee: vi.fn().mockResolvedValue(quote),
      getLeadtime: vi.fn()
    };

    const service = new GHTKQuoteService(client);
    const result = await service.getQuote({ ...quoteInput, includeLeadtime: false });

    expect(client.calculateFee).toHaveBeenCalledTimes(1);
    expect(client.getLeadtime).not.toHaveBeenCalled();
    expect(result).toEqual({ quote, leadtime: null, warnings: [] });
  });

  it("captures leadtime failures without throwing", async () => {
    const quote: GHTKFeeQuotation = {
      total: 36000,
      shipFee: 32000,
      insuranceFee: 0,
      codFee: 0,
      returnFee: 0,
      remoteAreasFee: 0,
      vatFee: 4000,
      deliveryType: "road",
      warningMessage: null,
      expectedDeliveryTime: null,
      expectedPickupTime: null
    };

    const client = {
      calculateFee: vi.fn().mockResolvedValue(quote),
      getLeadtime: vi.fn().mockRejectedValue(new Error("Service unavailable"))
    };

    const service = new GHTKQuoteService(client);
    const result = await service.getQuote(quoteInput);

    expect(result.quote).toEqual(quote);
    expect(result.leadtime).toBeNull();
    expect(result.warnings).toEqual([
      {
        stage: "leadtime",
        message: "Service unavailable"
      }
    ]);
  });
});
