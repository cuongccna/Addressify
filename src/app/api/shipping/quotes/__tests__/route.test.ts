import { describe, expect, it, vi, beforeEach } from "vitest";

import { POST } from "../route";
import { GHNQuoteService } from "@/lib/shipping-apis/ghnQuoteService";
import { GHTKQuoteService } from "@/lib/shipping-apis/ghtkQuoteService";
import { VTPQuoteService } from "@/lib/shipping-apis/vtpQuoteService";

vi.mock("@/lib/shipping-apis/ghnQuoteService", () => ({ GHNQuoteService: { fromEnv: vi.fn() } }));
vi.mock("@/lib/shipping-apis/ghtkQuoteService", () => ({ GHTKQuoteService: { fromEnv: vi.fn() } }));
vi.mock("@/lib/shipping-apis/vtpQuoteService", () => ({ VTPQuoteService: { fromEnv: vi.fn() } }));

describe("POST /api/shipping/quotes (aggregator)", () => {
  let mockGHN: { getQuotes: ReturnType<typeof vi.fn> };
  let mockGHTK: { getQuote: ReturnType<typeof vi.fn> };
  let mockVTP: { getQuote: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.resetAllMocks();
    mockGHN = { getQuotes: vi.fn() };
    mockGHTK = { getQuote: vi.fn() };
    mockVTP = { getQuote: vi.fn() };
    (GHNQuoteService.fromEnv as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockGHN);
    (GHTKQuoteService.fromEnv as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockGHTK);
    (VTPQuoteService.fromEnv as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockVTP);
  });

  it("returns results from all providers when data is sufficient", async () => {
    mockGHN.getQuotes.mockResolvedValue({
      quotes: [{ service: { serviceId: 1, serviceTypeId: 2, shortName: "FAST", name: "Nhanh", expectedDeliveryTime: null }, fee: { total: 42000, serviceFee: 40000, codFee: 2000, insuranceFee: 0, discount: 0, expectedDeliveryTime: null } }],
      failures: []
    });

    mockGHTK.getQuote.mockResolvedValue({
      quote: { total: 36000, shipFee: 32000, insuranceFee: 1000, codFee: 0, returnFee: 0, remoteAreasFee: 0, vatFee: 3000, deliveryType: "road", warningMessage: null, expectedDeliveryTime: null, expectedPickupTime: null },
      leadtime: { estimatedDays: 2, expectedPickupTime: null, expectedDeliveryTime: null },
      warnings: []
    });

    mockVTP.getQuote.mockResolvedValue({
      quote: { total: 48000, mainFee: 45000, codFee: 2000, insuranceFee: 1000, fuelSurcharge: 0, remoteAreasFee: 0, vatFee: 3000, serviceCode: "VTK_ECO", expectedDeliveryDays: 3 }
    });

    const request = new Request("http://localhost/api/shipping/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Common
        weightInGrams: 1000,
        lengthInCm: 20,
        widthInCm: 15,
        heightInCm: 10,
        insuranceValue: 1000000,
        codAmount: 200000,
        // GHN
        fromDistrictId: 1447,
        toDistrictId: 1489,
        toWardCode: "100901",
        // GHTK
        pickProvince: "TP. Hồ Chí Minh",
        pickDistrict: "Quận 1",
        pickAddress: "19 Nguyễn Trãi",
        province: "Hà Nội",
        district: "Quận Hoàn Kiếm",
        address: "25 Lý Thái Tổ",
        // VTP
        senderDistrictId: 1447,
        receiverDistrictId: 1489
      })
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.ghn.quotes).toHaveLength(1);
    expect(json.data.ghtk.quote.total).toBe(36000);
    expect(json.data.vtp.quote.total).toBe(48000);
  });

  it("handles provider failures without failing the whole response", async () => {
    mockGHN.getQuotes.mockRejectedValue(new Error("GHN token invalid"));
    mockGHTK.getQuote.mockResolvedValue({ quote: { total: 36000, shipFee: 32000, insuranceFee: 0, codFee: 0, returnFee: 0, remoteAreasFee: 0, vatFee: 4000, deliveryType: "road", warningMessage: null, expectedDeliveryTime: null, expectedPickupTime: null }, leadtime: null, warnings: [] });
    mockVTP.getQuote.mockRejectedValue(new Error("VTP token invalid"));

    const request = new Request("http://localhost/api/shipping/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weightInGrams: 800,
        // GHN
        fromDistrictId: 1447,
        toDistrictId: 1489,
        toWardCode: "100901",
        // GHTK
        pickProvince: "TP. Hồ Chí Minh",
        pickDistrict: "Quận 1",
        pickAddress: "19 Nguyễn Trãi",
        province: "Hà Nội",
        district: "Quận Hoàn Kiếm",
        address: "25 Lý Thái Tổ",
        // VTP
        senderDistrictId: 1447,
        receiverDistrictId: 1489
      })
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.ghn.error).toContain("token invalid");
    expect(json.data.ghtk.quote.total).toBe(36000);
    expect(json.data.vtp.error).toContain("token invalid");
  });

  it("returns 400 on invalid payload", async () => {
    const request = new Request("http://localhost/api/shipping/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weightInGrams: 0 })
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.issues).toBeDefined();
  });
});
