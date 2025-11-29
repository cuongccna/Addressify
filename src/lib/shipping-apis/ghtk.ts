import type { AxiosInstance } from "axios";

import { getServerEnv } from "../../config/env";
import { BaseShippingClient, type ShippingClientOptions } from "./base-client";

export interface GHTKClientOptions
  extends Omit<ShippingClientOptions, "defaultHeaders" | "token" | "shopId"> {
  token: string;
  shopId?: string;
}

export interface GHTKClientFactoryOverrides {
  baseURL?: string;
  token?: string;
  shopId?: string;
  timeoutMs?: number;
  maxRetries?: number;
  enableLogging?: boolean;
  httpClient?: AxiosInstance;
}

export interface GHTKFeeRequest {
  pickProvince: string;
  pickDistrict: string;
  pickWard?: string;
  pickAddress: string;
  province: string;
  district: string;
  ward?: string;
  address: string;
  weightInGrams: number;
  insuranceValue?: number;
  codAmount?: number;
  transport?: string;
  lengthInCm?: number;
  widthInCm?: number;
  heightInCm?: number;
}

export interface GHTKFeeQuotation {
  total: number;
  shipFee: number;
  insuranceFee: number;
  codFee: number;
  returnFee: number;
  remoteAreasFee: number;
  vatFee: number;
  deliveryType: string | null;
  warningMessage: string | null;
  expectedDeliveryTime: string | null;
  expectedPickupTime: string | null;
}

export interface GHTKLeadtimeRequest {
  pickProvince: string;
  pickDistrict: string;
  pickWard?: string;
  pickAddress: string;
  province: string;
  district: string;
  ward?: string;
  address: string;
  transport?: string;
}

export interface GHTKLeadtimeEstimate {
  estimatedDays: number | null;
  expectedPickupTime: string | null;
  expectedDeliveryTime: string | null;
}

interface GHTKFeeEnvelope {
  success: boolean;
  message?: string;
  fee: GHTKFeeResponse | null;
  delivery?: GHTKDeliveryResponse;
  warning_message?: string | null;
}

interface GHTKFeeResponse {
  total_fee?: number;
  total?: number;
  ship_fee?: number;
  fee?: number;
  main_service?: number;
  insurance_fee?: number;
  cod_fee?: number;
  return_fee?: number;
  remote_areas_fee?: number;
  vat_fee?: number;
  delivery_type?: string | null;
}

interface GHTKDeliveryResponse {
  expected_delivery_time?: string | null;
  expected_pick_time?: string | null;
  expected_pickup_time?: string | null;
}

interface GHTKLeadtimeEnvelope {
  success: boolean;
  message?: string;
  leadtime: {
    leadtime?: number;
    pick_up_time?: string | null;
    delivery_time?: string | null;
  } | null;
}

export class GHTKClient extends BaseShippingClient {
  constructor(options: GHTKClientOptions) {
    const { token, shopId, ...rest } = options;
    super({
      ...rest,
      shopId,
      defaultHeaders: {
        Token: token,
        ...(shopId ? { ShopId: shopId } : {})
      }
    });
  }

  static fromEnv(overrides: GHTKClientFactoryOverrides = {}): GHTKClient {
    const env = getServerEnv();

    const token = overrides.token ?? env.GHTK_API_TOKEN;
    if (!token) {
      throw new Error("GHTK_API_TOKEN is not configured. Set it in your environment variables.");
    }

    return new GHTKClient({
      baseURL: overrides.baseURL ?? env.GHTK_API_BASE_URL,
      token,
      shopId: overrides.shopId ?? env.GHTK_SHOP_ID,
      timeoutMs: overrides.timeoutMs ?? env.SHIPPING_API_TIMEOUT_MS,
      maxRetries: overrides.maxRetries ?? env.SHIPPING_API_MAX_RETRIES,
      enableLogging: overrides.enableLogging,
      httpClient: overrides.httpClient
    });
  }

  async calculateFee(input: GHTKFeeRequest): Promise<GHTKFeeQuotation> {
    const payload = buildFeePayload(input);
    const response = await this.post<GHTKFeeEnvelope>("/services/shipment/fee", payload);
    return mapFeeEnvelope(response);
  }

  async getLeadtime(input: GHTKLeadtimeRequest): Promise<GHTKLeadtimeEstimate> {
    try {
      const payload = buildLeadtimePayload(input);
      const response = await this.post<GHTKLeadtimeEnvelope>("/services/shipment/leadtime", payload);
      return mapLeadtimeEnvelope(response);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      // Handle 404 - API endpoint may not be available
      if (err.response?.status === 404) {
        console.warn('[GHTKClient] Leadtime API returned 404 - endpoint may not be available');
        return {
          estimatedDays: null,
          expectedPickupTime: null,
          expectedDeliveryTime: null
        };
      }
      throw error;
    }
  }
}

function buildFeePayload(input: GHTKFeeRequest) {
  return removeUndefined({
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
}

function buildLeadtimePayload(input: GHTKLeadtimeRequest) {
  return removeUndefined({
    pick_province: input.pickProvince,
    pick_district: input.pickDistrict,
    pick_ward: input.pickWard,
    pick_address: input.pickAddress,
    province: input.province,
    district: input.district,
    ward: input.ward,
    address: input.address,
    transport: input.transport
  });
}

function mapFeeEnvelope(envelope: GHTKFeeEnvelope): GHTKFeeQuotation {
  if (!envelope.success || !envelope.fee) {
    throw new Error(`GHTK fee calculation failed: ${envelope.message ?? "Unknown error"}`);
  }

  const fee = envelope.fee;
  const delivery = envelope.delivery;

  return {
    total: pickNumber(fee.total_fee, fee.total, fee.main_service, fee.ship_fee, 0),
    shipFee: pickNumber(fee.ship_fee, fee.main_service, fee.fee, 0),
    insuranceFee: fee.insurance_fee ?? 0,
    codFee: fee.cod_fee ?? 0,
    returnFee: fee.return_fee ?? 0,
    remoteAreasFee: fee.remote_areas_fee ?? 0,
    vatFee: fee.vat_fee ?? 0,
    deliveryType: fee.delivery_type ?? null,
    warningMessage: envelope.warning_message ?? null,
    expectedDeliveryTime: delivery?.expected_delivery_time ?? null,
    expectedPickupTime:
      delivery?.expected_pickup_time ?? delivery?.expected_pick_time ?? null
  };
}

function mapLeadtimeEnvelope(envelope: GHTKLeadtimeEnvelope): GHTKLeadtimeEstimate {
  if (!envelope.success || !envelope.leadtime) {
    throw new Error(`GHTK leadtime lookup failed: ${envelope.message ?? "Unknown error"}`);
  }

  const leadtime = envelope.leadtime;

  return {
    estimatedDays: leadtime.leadtime ?? null,
    expectedPickupTime: leadtime.pick_up_time ?? null,
    expectedDeliveryTime: leadtime.delivery_time ?? null
  };
}

function removeUndefined<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
  );
}

function pickNumber(...values: Array<number | undefined | null>): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return 0;
}
