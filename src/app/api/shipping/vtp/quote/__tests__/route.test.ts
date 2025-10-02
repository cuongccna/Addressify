import { describe, expect, it, vi, beforeEach } from "vitest";

import { POST } from "../route";
import { VTPQuoteService } from "@/lib/shipping-apis/vtpQuoteService";

vi.mock("@/lib/shipping-apis/vtpQuoteService", () => {
  return {
    VTPQuoteService: {
      fromEnv: vi.fn()
    }
  };
});

describe("POST /api/shipping/vtp/quote", () => {
  let mockService: { getQuote: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.resetAllMocks();
    mockService = {
      getQuote: vi.fn()
    };
    (VTPQuoteService.fromEnv as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockService);
  });

  it("returns quote from the VTP quote service", async () => {
    mockService.getQuote.mockResolvedValue({
      quote: {
        total: 48000,
        mainFee: 45000,
        codFee: 2000,
        insuranceFee: 1000,
        fuelSurcharge: 0,
        remoteAreasFee: 0,
        vatFee: 3000,
        serviceCode: "VTK_ECO",
        expectedDeliveryDays: 3
      }
    });

    const request = new Request("http://localhost/api/shipping/vtp/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderDistrictId: 1447,
        senderWardCode: "200101",
        receiverDistrictId: 1489,
        receiverWardCode: "100901",
        weightInGrams: 1000
      })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.quote.total).toBe(48000);
    expect(mockService.getQuote).toHaveBeenCalled();
  });

  it("validates payload and returns 400 on invalid input", async () => {
    const request = new Request("http://localhost/api/shipping/vtp/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderDistrictId: "oops",
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
    mockService.getQuote.mockRejectedValue(new Error("Token invalid"));

    const request = new Request("http://localhost/api/shipping/vtp/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderDistrictId: 1447,
        receiverDistrictId: 1489,
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
