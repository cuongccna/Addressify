import axios, { AxiosHeaders } from "axios";
import MockAdapter from "axios-mock-adapter";
import { beforeEach, describe, expect, it } from "vitest";

import { VTPClient, type VTPFeeRequest } from "../vtp";

describe("VTPClient", () => {
  const baseURL = "https://partner.viettelpost.vn";
  const token = "dummy-token";

  let mock: MockAdapter;
  let client: VTPClient;

  beforeEach(() => {
    const http = axios.create({ baseURL });
    mock = new MockAdapter(http);
    client = new VTPClient({ baseURL, token, httpClient: http, enableLogging: false });
  });

  it("sends the correct payload when calculating fees", async () => {
    const input: VTPFeeRequest = {
      senderDistrictId: 1447,
      senderWardCode: "200101",
      receiverDistrictId: 1489,
      receiverWardCode: "100901",
      weightInGrams: 1200,
      lengthInCm: 20,
      widthInCm: 15,
      heightInCm: 10,
      codAmount: 2500000,
      insuranceValue: 1500000,
      serviceCode: "VTK_ECO"
    };

    mock.onPost("/api/fee").reply((config) => {
      const payload = JSON.parse(config.data as string);

      expect(payload).toMatchObject({
        sender_district_id: input.senderDistrictId,
        sender_ward_code: input.senderWardCode,
        receiver_district_id: input.receiverDistrictId,
        receiver_ward_code: input.receiverWardCode,
        weight: input.weightInGrams,
        length: input.lengthInCm,
        width: input.widthInCm,
        height: input.heightInCm,
        cod_amount: input.codAmount,
        insurance_value: input.insuranceValue,
        service_code: input.serviceCode
      });

      const headers = config.headers instanceof AxiosHeaders
        ? config.headers
        : AxiosHeaders.from((config.headers ?? {}) as Record<string, string>);
      expect(headers.get("Authorization")).toBe(`Bearer ${token}`);

      return [
        200,
        {
          status: 200,
          data: {
            total_fee: 48000,
            main_fee: 45000,
            cod_fee: 2000,
            insurance_fee: 1000,
            fuel_surcharge: 0,
            remote_areas_fee: 0,
            vat_fee: 3000,
            service: "VTK_ECO",
            expected_days: 3
          }
        }
      ];
    });

    const result = await client.calculateFee(input);

    expect(result).toEqual({
      total: 48000,
      mainFee: 45000,
      codFee: 2000,
      insuranceFee: 1000,
      fuelSurcharge: 0,
      remoteAreasFee: 0,
      vatFee: 3000,
      serviceCode: "VTK_ECO",
      expectedDeliveryDays: 3
    });
  });

  it("throws when the VTP API returns a non-success envelope", async () => {
    mock.onPost("/api/fee").reply(200, {
      status: 400,
      message: "Invalid payload",
      data: null
    });

    await expect(
      client.calculateFee({
        senderDistrictId: 1,
        receiverDistrictId: 2,
        weightInGrams: 100
      })
    ).rejects.toThrow(/Invalid payload/);
  });
});
