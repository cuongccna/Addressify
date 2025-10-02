import type { AxiosInstance } from "axios";

import { getServerEnv } from "../../config/env";
import { BaseShippingClient, type ShippingClientOptions } from "./base-client";

export interface VTPClientOptions
  extends Omit<ShippingClientOptions, "defaultHeaders" | "token" | "shopId"> {
  token: string;
}

export interface VTPClientFactoryOverrides {
  baseURL?: string;
  token?: string;
  timeoutMs?: number;
  maxRetries?: number;
  enableLogging?: boolean;
  httpClient?: AxiosInstance;
}

export interface VTPFeeRequest {
  senderDistrictId: number;
  senderWardCode?: string;
  receiverDistrictId: number;
  receiverWardCode?: string;
  weightInGrams: number;
  lengthInCm?: number;
  widthInCm?: number;
  heightInCm?: number;
  codAmount?: number;
  insuranceValue?: number;
  serviceCode?: string; // optional specific service
}

export interface VTPFeeQuotation {
  total: number;
  mainFee: number;
  codFee: number;
  insuranceFee: number;
  fuelSurcharge: number;
  remoteAreasFee: number;
  vatFee: number;
  serviceCode: string | null;
  expectedDeliveryDays: number | null;
}

interface VTPFeeEnvelope {
  status: number; // 200 success
  message?: string;
  data?: {
    total_fee?: number;
    main_fee?: number;
    cod_fee?: number;
    insurance_fee?: number;
    fuel_surcharge?: number;
    remote_areas_fee?: number;
    vat_fee?: number;
    service?: string | null;
    expected_days?: number | null;
  };
}

export class VTPClient extends BaseShippingClient {
  constructor(options: VTPClientOptions) {
    const { token, ...rest } = options;
    super({
      ...rest,
      defaultHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  static fromEnv(overrides: VTPClientFactoryOverrides = {}): VTPClient {
    const env = getServerEnv();

    const token = overrides.token ?? env.VTP_API_TOKEN;
    if (!token) {
      throw new Error("VTP_API_TOKEN is not configured. Set it in your environment variables.");
    }

    return new VTPClient({
      baseURL: overrides.baseURL ?? env.VTP_API_BASE_URL,
      token,
      timeoutMs: overrides.timeoutMs ?? env.SHIPPING_API_TIMEOUT_MS,
      maxRetries: overrides.maxRetries ?? env.SHIPPING_API_MAX_RETRIES,
      enableLogging: overrides.enableLogging,
      httpClient: overrides.httpClient
    });
  }

  async calculateFee(input: VTPFeeRequest): Promise<VTPFeeQuotation> {
    const payload = buildFeePayload(input);
    const res = await this.post<VTPFeeEnvelope>("/api/fee", payload);
    return mapFeeEnvelope(res);
  }
}

function buildFeePayload(input: VTPFeeRequest) {
  return removeUndefined({
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
}

function mapFeeEnvelope(envelope: VTPFeeEnvelope): VTPFeeQuotation {
  if (envelope.status !== 200 || !envelope.data) {
    throw new Error(`VTP fee calculation failed: ${envelope.message ?? "Unknown error"}`);
  }

  const d = envelope.data;
  return {
    total: pickNumber(d.total_fee, d.main_fee, 0),
    mainFee: d.main_fee ?? 0,
    codFee: d.cod_fee ?? 0,
    insuranceFee: d.insurance_fee ?? 0,
    fuelSurcharge: d.fuel_surcharge ?? 0,
    remoteAreasFee: d.remote_areas_fee ?? 0,
    vatFee: d.vat_fee ?? 0,
    serviceCode: d.service ?? null,
    expectedDeliveryDays: d.expected_days ?? null
  };
}

function removeUndefined<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined && v !== null)
  );
}

function pickNumber(...values: Array<number | undefined | null>): number {
  for (const v of values) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return 0;
}
