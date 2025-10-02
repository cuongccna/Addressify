import type { AxiosInstance } from "axios";

import { getServerEnv } from "../../config/env";
import { BaseShippingClient, type ShippingClientOptions } from "./base-client";

export interface GHNClientOptions
  extends Omit<ShippingClientOptions, "defaultHeaders" | "token"> {
  token: string;
  shopId: string;
}

export interface GHNClientFactoryOverrides {
  baseURL?: string;
  token?: string;
  shopId?: string;
  timeoutMs?: number;
  maxRetries?: number;
  enableLogging?: boolean;
  httpClient?: AxiosInstance;
}

export interface GHNCalculateFeeInput {
  fromDistrictId: number;
  fromWardCode?: string;
  toDistrictId: number;
  toWardCode: string;
  weightInGrams: number;
  serviceId?: number;
  serviceTypeId?: number;
  insuranceValue?: number;
  couponCode?: string;
  heightInCm?: number;
  lengthInCm?: number;
  widthInCm?: number;
}

export interface GHNFeeQuotation {
  total: number;
  serviceFee: number;
  codFee: number;
  insuranceFee: number;
  discount: number;
  expectedDeliveryTime: string | null;
}

export interface GHNServiceFilter {
  fromDistrictId: number;
  fromWardCode?: string;
  toDistrictId: number;
  toWardCode: string;
  weightInGrams: number;
}

export interface GHNServiceDescription {
  serviceId: number;
  serviceTypeId: number;
  shortName: string;
  name: string;
  expectedDeliveryTime: string | null;
}

interface GHNApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

interface GHNFeeResponse {
  total: number;
  service_fee: number;
  cod_fee: number;
  insurance_fee: number;
  coupon_value: number;
  expected_delivery_time: string | null;
}

interface GHNServiceResponseItem {
  service_id: number;
  service_type_id: number;
  short_name: string;
  service_name: string;
  expected_delivery_time: string | null;
}

export class GHNClient extends BaseShippingClient {
  private readonly shopId: string;

  constructor(options: GHNClientOptions) {
    const { token, shopId, ...rest } = options;
    super({
      ...rest,
      shopId,
      defaultHeaders: {
        Token: token
      }
    });

    this.shopId = shopId;
  }

  static fromEnv(overrides: GHNClientFactoryOverrides = {}): GHNClient {
    const env = getServerEnv();
    return new GHNClient({
      baseURL: overrides.baseURL ?? env.GHN_API_BASE_URL,
      token: overrides.token ?? env.GHN_API_TOKEN,
      shopId: overrides.shopId ?? env.GHN_SHOP_ID,
      timeoutMs: overrides.timeoutMs ?? env.SHIPPING_API_TIMEOUT_MS,
      maxRetries: overrides.maxRetries ?? env.SHIPPING_API_MAX_RETRIES,
      enableLogging: overrides.enableLogging,
      httpClient: overrides.httpClient
    });
  }

  async calculateFee(input: GHNCalculateFeeInput): Promise<GHNFeeQuotation> {
    const payload = buildFeePayload(this.shopId, input);
    console.log('[GHNClient] calculateFee request:', JSON.stringify(payload, null, 2));
    try {
      const response = await this.post<GHNApiEnvelope<GHNFeeResponse>>("/v2/shipping-order/fee", payload);
      console.log('[GHNClient] calculateFee response:', JSON.stringify(response, null, 2));
      return mapFeeEnvelope(response);
    } catch (error: any) {
      console.error('[GHNClient] calculateFee error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  async listAvailableServices(filter: GHNServiceFilter): Promise<GHNServiceDescription[]> {
    const payload = buildServicePayload(this.shopId, filter);
    console.log('[GHNClient] listAvailableServices request:', JSON.stringify(payload, null, 2));
    const response = await this.post<GHNApiEnvelope<GHNServiceResponseItem[]>>(
      "/v2/shipping-order/available-services",
      payload
    );
    console.log('[GHNClient] listAvailableServices response:', JSON.stringify(response, null, 2));
    return mapServiceEnvelope(response);
  }
}

function buildFeePayload(shopId: string, input: GHNCalculateFeeInput) {
  // Required fields per GHN API docs
  const payload: Record<string, unknown> = {
    shop_id: Number(shopId),
    to_district_id: input.toDistrictId,
    to_ward_code: input.toWardCode
  };
  
  // Must have either service_id OR service_type_id
  if (input.serviceId) {
    payload.service_id = input.serviceId;
  }
  if (input.serviceTypeId) {
    payload.service_type_id = input.serviceTypeId;
  }
  
  // Optional fields - only include if provided
  // NOTE: from_district_id/from_ward_code can cause "SHOP_INFO_ERROR" if shop doesn't have store address
  // Only include if explicitly provided AND you're sure shop has multiple stores configured
  // if (input.fromDistrictId) payload.from_district_id = input.fromDistrictId;
  // if (input.fromWardCode) payload.from_ward_code = input.fromWardCode;
  
  if (input.weightInGrams) payload.weight = input.weightInGrams;
  if (input.insuranceValue) payload.insurance_value = input.insuranceValue;
  if (input.couponCode) payload.coupon = input.couponCode;
  if (input.heightInCm) payload.height = input.heightInCm;
  if (input.lengthInCm) payload.length = input.lengthInCm;
  if (input.widthInCm) payload.width = input.widthInCm;
  
  return payload;
}

function buildServicePayload(shopId: string, input: GHNServiceFilter) {
  // Per GHN API docs: available-services only needs shop_id, from_district, to_district
  // Ward codes are NOT required for this endpoint
  const payload: Record<string, unknown> = {
    shop_id: Number(shopId),
    from_district: input.fromDistrictId,
    to_district: input.toDistrictId
  };
  
  return payload;
}

function mapFeeEnvelope(envelope: GHNApiEnvelope<GHNFeeResponse>): GHNFeeQuotation {
  if (envelope.code !== 200) {
    throw new Error(`GHN fee calculation failed: ${envelope.message}`);
  }

  const fee = envelope.data;
  return {
    total: fee.total,
    serviceFee: fee.service_fee,
    codFee: fee.cod_fee,
    insuranceFee: fee.insurance_fee,
    discount: fee.coupon_value,
    expectedDeliveryTime: fee.expected_delivery_time
  };
}

function mapServiceEnvelope(envelope: GHNApiEnvelope<GHNServiceResponseItem[]>): GHNServiceDescription[] {
  if (envelope.code !== 200) {
    throw new Error(`GHN list services failed: ${envelope.message}`);
  }

  return envelope.data.map((item) => ({
    serviceId: item.service_id,
    serviceTypeId: item.service_type_id,
    shortName: item.short_name,
    name: item.service_name,
    expectedDeliveryTime: item.expected_delivery_time
  }));
}
