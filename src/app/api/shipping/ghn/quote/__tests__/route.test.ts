import { describe, expect, it, vi, beforeEach } from "vitest";

import { POST } from "../route";
import { GHNQuoteService } from "@/lib/shipping-apis/ghnQuoteService";

vi.mock("@/lib/shipping-apis/ghnQuoteService", () => {
  return {
    GHNQuoteService: {
      fromEnv: vi.fn()
    }
  };
});

describe("POST /api/shipping/ghn/quote", () => {
  let mockService: { getQuotes: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.resetAllMocks();
    mockService = {
      getQuotes: vi.fn()
    };
    (GHNQuoteService.fromEnv as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockService);
  });

  it("returns quotes from the GHN quote service", async () => {
  mockService.getQuotes.mockResolvedValue({
      quotes: [
        {
          service: { serviceId: 123, serviceTypeId: 2, shortName: "FAST", name: "Nhanh", expectedDeliveryTime: null },
          fee: { total: 42000, serviceFee: 40000, codFee: 2000, insuranceFee: 0, discount: 0, expectedDeliveryTime: null }
        }
      ],
      failures: []
    });

    const request = new Request("http://localhost/api/shipping/ghn/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromDistrictId: 1447,
        fromWardCode: "200101",
        toDistrictId: 1489,
        toWardCode: "100901",
        weightInGrams: 1000
      })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.quotes).toHaveLength(1);
    expect(payload.failures).toHaveLength(0);
    expect(mockService.getQuotes).toHaveBeenCalled();
  });

  it("validates payload and returns 400 on invalid input", async () => {
    const request = new Request("http://localhost/api/shipping/ghn/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromDistrictId: "invalid",
        weightInGrams: 0
      })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.success).toBe(false);
    expect(payload.issues).toBeDefined();
  });

  it("handles service errors with 500 response", async () => {
  mockService.getQuotes.mockRejectedValue(new Error("Token invalid"));

    const request = new Request("http://localhost/api/shipping/ghn/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromDistrictId: 1447,
        toDistrictId: 1489,
        toWardCode: "100901",
        weightInGrams: 1200
      })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.success).toBe(false);
    expect(payload.message).toContain("Token invalid");
  });
});
