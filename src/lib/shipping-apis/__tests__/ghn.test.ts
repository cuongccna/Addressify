import axios, { AxiosHeaders } from "axios";
import MockAdapter from "axios-mock-adapter";
import { beforeEach, describe, expect, it } from "vitest";

import { GHNClient, type GHNCalculateFeeInput } from "../ghn";

describe("GHNClient", () => {
  const baseURL = "https://online-gateway.ghn.vn/shiip/public-api";
  const token = "dummy-token";
  const shopId = "123456";

  let mock: MockAdapter;
  let client: GHNClient;

  beforeEach(() => {
    const http = axios.create({ baseURL });
    mock = new MockAdapter(http);
    client = new GHNClient({
      baseURL,
      token,
      shopId,
      httpClient: http,
      enableLogging: false
    });
  });

  it("sends the correct payload when calculating fees", async () => {
    const input: GHNCalculateFeeInput = {
      fromDistrictId: 1447,
      toDistrictId: 1489,
      toWardCode: "100901",
      weightInGrams: 1200,
      couponCode: "FREESHIP",
      insuranceValue: 1500000,
      heightInCm: 10,
      lengthInCm: 20,
      widthInCm: 15
    };

    mock.onPost("/v2/shipping-order/fee").reply((config) => {
      const payload = JSON.parse(config.data as string);

      expect(payload).toMatchObject({
        shop_id: Number(shopId),
        from_district_id: input.fromDistrictId,
        to_district_id: input.toDistrictId,
        to_ward_code: input.toWardCode,
        weight: input.weightInGrams,
        coupon: input.couponCode,
        insurance_value: input.insuranceValue
      });

  expect(readHeader(config.headers, "Token")).toBe(token);
  expect(readHeader(config.headers, "ShopId")).toBe(shopId);

      return [
        200,
        {
          code: 200,
          message: "Success",
          data: {
            total: 42000,
            service_fee: 40000,
            cod_fee: 2000,
            insurance_fee: 3000,
            coupon_value: 1000,
            expected_delivery_time: "2025-09-28"
          }
        }
      ];
    });

    const result = await client.calculateFee(input);

    expect(result).toEqual({
      total: 42000,
      serviceFee: 40000,
      codFee: 2000,
      insuranceFee: 3000,
      discount: 1000,
      expectedDeliveryTime: "2025-09-28"
    });
  });

  it("maps available services into camelCase fields", async () => {
    mock.onPost("/v2/shipping-order/available-services").reply(200, {
      code: 200,
      message: "OK",
      data: [
        {
          service_id: 53320,
          service_type_id: 2,
          short_name: "ECO",
          service_name: "Economy",
          expected_delivery_time: null
        },
        {
          service_id: 53321,
          service_type_id: 1,
          short_name: "EXP",
          service_name: "Express",
          expected_delivery_time: "2025-09-27"
        }
      ]
    });

    const services = await client.listAvailableServices({
      fromDistrictId: 1447,
      toDistrictId: 1489,
      toWardCode: "100901",
      weightInGrams: 200
    });

    expect(services).toEqual([
      {
        serviceId: 53320,
        serviceTypeId: 2,
        shortName: "ECO",
        name: "Economy",
        expectedDeliveryTime: null
      },
      {
        serviceId: 53321,
        serviceTypeId: 1,
        shortName: "EXP",
        name: "Express",
        expectedDeliveryTime: "2025-09-27"
      }
    ]);
  });

  it("throws when the GHN API returns a non-success envelope", async () => {
    mock.onPost("/v2/shipping-order/fee").reply(200, {
      code: 400,
      message: "Invalid payload",
      data: null
    });

    await expect(
      client.calculateFee({
        fromDistrictId: 1,
        toDistrictId: 2,
        toWardCode: "00000",
        weightInGrams: 100
      })
    ).rejects.toThrow(/Invalid payload/);
  });
});

function readHeader(headers: unknown, key: string): string | undefined {
  const normalized = headers instanceof AxiosHeaders
    ? headers
    : AxiosHeaders.from((headers ?? {}) as Record<string, string>);
  const value = normalized.get(key) ?? normalized.get(key.toLowerCase());
  return value == null ? undefined : String(value);
}
