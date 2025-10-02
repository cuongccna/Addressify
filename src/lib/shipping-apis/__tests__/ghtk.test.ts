import axios, { AxiosHeaders } from "axios";
import MockAdapter from "axios-mock-adapter";
import { beforeEach, describe, expect, it } from "vitest";

import { GHTKClient, type GHTKFeeRequest } from "../ghtk";

describe("GHTKClient", () => {
  const baseURL = "https://services.giaohangtietkiem.vn";
  const token = "dummy-token";
  const shopId = "S100001";

  let mock: MockAdapter;
  let client: GHTKClient;

  beforeEach(() => {
    const http = axios.create({ baseURL });
    mock = new MockAdapter(http);
    client = new GHTKClient({
      baseURL,
      token,
      shopId,
      httpClient: http,
      enableLogging: false
    });
  });

  it("sends the correct payload when calculating fees", async () => {
    const input: GHTKFeeRequest = {
      pickProvince: "Hồ Chí Minh",
      pickDistrict: "Quận 1",
      pickWard: "Phường Bến Nghé",
      pickAddress: "19 Nguyễn Trãi",
      province: "Hà Nội",
      district: "Quận Hoàn Kiếm",
      ward: "Phường Hàng Trống",
      address: "25 Lý Thái Tổ",
      weightInGrams: 1200,
      insuranceValue: 1500000,
      codAmount: 2500000,
      transport: "road",
      lengthInCm: 20,
      widthInCm: 15,
      heightInCm: 10
    };

    mock.onPost("/services/shipment/fee").reply((config) => {
      const payload = JSON.parse(config.data as string);
      expect(payload).toMatchObject({
        pick_province: input.pickProvince,
        pick_district: input.pickDistrict,
        pick_ward: input.pickWard,
        pick_address: input.pickAddress,
        province: input.province,
        district: input.district,
        ward: input.ward,
        address: input.address,
        weight: input.weightInGrams,
        value: input.insuranceValue,
        cod_amount: input.codAmount,
        transport: input.transport,
        length: input.lengthInCm,
        width: input.widthInCm,
        height: input.heightInCm
      });

      expect(readHeader(config.headers, "Token")).toBe(token);
      expect(readHeader(config.headers, "ShopId")).toBe(shopId);

      return [
        200,
        {
          success: true,
          message: "Success",
          fee: {
            total_fee: 44000,
            ship_fee: 40000,
            insurance_fee: 2000,
            cod_fee: 1000,
            return_fee: 3000,
            remote_areas_fee: 0,
            vat_fee: 4000,
            delivery_type: "road"
          },
          delivery: {
            expected_pickup_time: "2025-09-27T08:00:00+07:00",
            expected_delivery_time: "2025-09-28T19:00:00+07:00"
          }
        }
      ];
    });

    const result = await client.calculateFee(input);

    expect(result).toEqual({
      total: 44000,
      shipFee: 40000,
      insuranceFee: 2000,
      codFee: 1000,
      returnFee: 3000,
      remoteAreasFee: 0,
      vatFee: 4000,
      deliveryType: "road",
      warningMessage: null,
      expectedDeliveryTime: "2025-09-28T19:00:00+07:00",
      expectedPickupTime: "2025-09-27T08:00:00+07:00"
    });
  });

  it("maps leadtime responses", async () => {
    mock.onPost("/services/shipment/leadtime").reply(200, {
      success: true,
      leadtime: {
        leadtime: 2,
        pick_up_time: "2025-09-27T08:00:00+07:00",
        delivery_time: "2025-09-29T19:00:00+07:00"
      }
    });

    const result = await client.getLeadtime({
      pickProvince: "Hồ Chí Minh",
      pickDistrict: "Quận 1",
      pickAddress: "19 Nguyễn Trãi",
      province: "Hà Nội",
      district: "Quận Hoàn Kiếm",
      address: "25 Lý Thái Tổ"
    });

    expect(result).toEqual({
      estimatedDays: 2,
      expectedPickupTime: "2025-09-27T08:00:00+07:00",
      expectedDeliveryTime: "2025-09-29T19:00:00+07:00"
    });
  });

  it("throws when the GHTK API returns an unsuccessful envelope", async () => {
    mock.onPost("/services/shipment/fee").reply(200, {
      success: false,
      message: "Missing address",
      fee: null
    });

    await expect(
      client.calculateFee({
        pickProvince: "Hồ Chí Minh",
        pickDistrict: "Quận 1",
        pickAddress: "19 Nguyễn Trãi",
        province: "Hà Nội",
        district: "Quận Hoàn Kiếm",
        address: "25 Lý Thái Tổ",
        weightInGrams: 1200
      })
    ).rejects.toThrow(/Missing address/);
  });
});

function readHeader(headers: unknown, key: string): string | undefined {
  const normalized = headers instanceof AxiosHeaders
    ? headers
    : AxiosHeaders.from((headers ?? {}) as Record<string, string>);
  const value = normalized.get(key) ?? normalized.get(key.toLowerCase());
  return value == null ? undefined : String(value);
}
