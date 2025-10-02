import { NextResponse } from "next/server";
import { z } from "zod";

import { GHNQuoteService } from "@/lib/shipping-apis/ghnQuoteService";
import { GHTKQuoteService } from "@/lib/shipping-apis/ghtkQuoteService";
import { VTPQuoteService } from "@/lib/shipping-apis/vtpQuoteService";

// Simple per-IP rate limiting
const RATE_LIMIT_WINDOW_MS = 60_000;
const configuredMaxRequests = Number.parseInt(process.env.AGG_QUOTE_RATE_LIMIT ?? "20", 10);
const RATE_LIMIT_MAX_REQUESTS = Number.isNaN(configuredMaxRequests)
  ? 20
  : Math.max(1, configuredMaxRequests);
const rateLimitStore = new Map<string, { count: number; expiresAt: number }>();

// Simple in-memory caching by request payload
const CACHE_TTL_MS = 30_000;
const cacheStore = new Map<string, { data: unknown; expiresAt: number }>();

function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function enforceRateLimit(request: Request): NextResponse | null {
  if (process.env.NODE_ENV === "test") return null;
  const id = getClientIdentifier(request);
  const now = Date.now();
  const existing = rateLimitStore.get(id);
  if (existing && existing.expiresAt > now) {
    if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
      return NextResponse.json(
        {
          success: false,
          message: "Rate limit exceeded. Please wait a moment before trying again."
        },
        { status: 429, headers: { "Retry-After": Math.ceil((existing.expiresAt - now) / 1000).toString() } }
      );
    }
    rateLimitStore.set(id, { count: existing.count + 1, expiresAt: existing.expiresAt });
    return null;
  }
  rateLimitStore.set(id, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
  return null;
}

const requestSchema = z.object({
  // Common package fields
  weightInGrams: z.coerce.number().int().positive(),
  lengthInCm: z.coerce.number().int().nonnegative().optional(),
  widthInCm: z.coerce.number().int().nonnegative().optional(),
  heightInCm: z.coerce.number().int().nonnegative().optional(),
  insuranceValue: z.coerce.number().nonnegative().optional(),
  codAmount: z.coerce.number().nonnegative().optional(),

  // GHN fields
  fromDistrictId: z.coerce.number().int().positive().optional(),
  fromWardCode: z.string().min(1).optional(),
  toDistrictId: z.coerce.number().int().positive().optional(),
  toWardCode: z.string().min(1).optional(),
  couponCode: z.string().min(1).optional(),

  // GHTK fields
  pickProvince: z.string().trim().min(1).optional(),
  pickDistrict: z.string().trim().min(1).optional(),
  pickWard: z.string().trim().min(1).optional(),
  pickAddress: z.string().trim().min(1).optional(),
  province: z.string().trim().min(1).optional(),
  district: z.string().trim().min(1).optional(),
  ward: z.string().trim().min(1).optional(),
  address: z.string().trim().min(1).optional(),
  transport: z.string().trim().min(1).optional(),
  includeLeadtime: z.boolean().optional(),

  // VTP fields
  senderDistrictId: z.coerce.number().int().positive().optional(),
  senderWardCode: z.string().min(1).optional(),
  receiverDistrictId: z.coerce.number().int().positive().optional(),
  receiverWardCode: z.string().min(1).optional(),
  serviceCode: z.string().trim().min(1).optional()
});

export async function POST(request: Request) {
  try {
    const rateLimitResponse = enforceRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const payload = requestSchema.parse(body);

    // Caching (skip in test)
    const cacheKey = process.env.NODE_ENV === "test" ? null : JSON.stringify(payload);
    if (cacheKey) {
      const entry = cacheStore.get(cacheKey);
      if (entry && entry.expiresAt > Date.now()) {
        return NextResponse.json({ success: true, data: entry.data, cache: "HIT" });
      }
    }

    const tasks: Array<Promise<[string, unknown]>> = [];

    // GHN call if sufficient fields present
    if (
      payload.fromDistrictId &&
      payload.toDistrictId &&
      payload.toWardCode &&
      payload.weightInGrams
    ) {
      tasks.push(
        (async () => {
          try {
            const s = GHNQuoteService.fromEnv();
            const result = await s.getQuotes({
              fromDistrictId: payload.fromDistrictId!,
              fromWardCode: payload.fromWardCode,
              toDistrictId: payload.toDistrictId!,
              toWardCode: payload.toWardCode!,
              weightInGrams: payload.weightInGrams,
              heightInCm: payload.heightInCm,
              lengthInCm: payload.lengthInCm,
              widthInCm: payload.widthInCm,
              insuranceValue: payload.insuranceValue,
              couponCode: payload.couponCode
            });
            return ["ghn", { quotes: result.quotes, failures: result.failures }] as [string, unknown];
          } catch (e) {
            const message = e instanceof Error ? e.message : "Unknown error";
            return ["ghn", { error: message }] as [string, unknown];
          }
        })()
      );
    }

    // GHTK call if sufficient fields present
    if (
      payload.pickProvince &&
      payload.pickDistrict &&
      payload.pickAddress &&
      payload.province &&
      payload.district &&
      payload.address
    ) {
      tasks.push(
        (async () => {
          try {
            const s = GHTKQuoteService.fromEnv();
            const result = await s.getQuote({
              pickProvince: payload.pickProvince!,
              pickDistrict: payload.pickDistrict!,
              pickWard: payload.pickWard,
              pickAddress: payload.pickAddress!,
              province: payload.province!,
              district: payload.district!,
              ward: payload.ward,
              address: payload.address!,
              weightInGrams: payload.weightInGrams,
              insuranceValue: payload.insuranceValue,
              codAmount: payload.codAmount,
              transport: payload.transport,
              lengthInCm: payload.lengthInCm,
              widthInCm: payload.widthInCm,
              heightInCm: payload.heightInCm,
              includeLeadtime: payload.includeLeadtime ?? true
            });
            return ["ghtk", result] as [string, unknown];
          } catch (e) {
            const message = e instanceof Error ? e.message : "Unknown error";
            return ["ghtk", { error: message }] as [string, unknown];
          }
        })()
      );
    }

    // VTP call if sufficient fields present
    if (payload.senderDistrictId && payload.receiverDistrictId && payload.weightInGrams) {
      tasks.push(
        (async () => {
          try {
            const s = VTPQuoteService.fromEnv();
            const result = await s.getQuote({
              senderDistrictId: payload.senderDistrictId!,
              senderWardCode: payload.senderWardCode,
              receiverDistrictId: payload.receiverDistrictId!,
              receiverWardCode: payload.receiverWardCode,
              weightInGrams: payload.weightInGrams,
              lengthInCm: payload.lengthInCm,
              widthInCm: payload.widthInCm,
              heightInCm: payload.heightInCm,
              codAmount: payload.codAmount,
              insuranceValue: payload.insuranceValue,
              serviceCode: payload.serviceCode
            });
            return ["vtp", result] as [string, unknown];
          } catch (e) {
            const message = e instanceof Error ? e.message : "Unknown error";
            return ["vtp", { error: message }] as [string, unknown];
          }
        })()
      );
    }

    const pairs = await Promise.all(tasks);
    const data = Object.fromEntries(pairs);

    if (cacheKey) {
      cacheStore.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    }

    return NextResponse.json({ success: true, data, cache: cacheKey ? "MISS" : undefined });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request payload",
          issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }))
        },
        { status: 400 }
      );
    }
    console.error("[AGG] Quote API error", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}
