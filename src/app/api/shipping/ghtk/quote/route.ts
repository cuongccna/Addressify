import { NextResponse } from "next/server";
import { z } from "zod";

import { GHTKQuoteService } from "@/lib/shipping-apis/ghtkQuoteService";

const RATE_LIMIT_WINDOW_MS = 60_000;
const configuredMaxRequests = Number.parseInt(process.env.GHTK_QUOTE_RATE_LIMIT ?? "20", 10);
const RATE_LIMIT_MAX_REQUESTS = Number.isNaN(configuredMaxRequests)
  ? 20
  : Math.max(1, configuredMaxRequests);

const rateLimitStore = new Map<string, { count: number; expiresAt: number }>();

function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

function enforceRateLimit(request: Request): NextResponse | null {
  if (process.env.NODE_ENV === "test") {
    return null;
  }

  const identifier = getClientIdentifier(request);
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (existing && existing.expiresAt > now) {
    if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
      return NextResponse.json(
        {
          success: false,
          message: "Rate limit exceeded. Please wait a moment before trying again."
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((existing.expiresAt - now) / 1000).toString()
          }
        }
      );
    }

    rateLimitStore.set(identifier, {
      count: existing.count + 1,
      expiresAt: existing.expiresAt
    });
    return null;
  }

  rateLimitStore.set(identifier, {
    count: 1,
    expiresAt: now + RATE_LIMIT_WINDOW_MS
  });

  return null;
}

const requestSchema = z.object({
  pickProvince: z.string().trim().min(1),
  pickDistrict: z.string().trim().min(1),
  pickWard: z.string().trim().min(1).optional(),
  pickAddress: z.string().trim().min(1),
  province: z.string().trim().min(1),
  district: z.string().trim().min(1),
  ward: z.string().trim().min(1).optional(),
  address: z.string().trim().min(1),
  weightInGrams: z.coerce.number().int().positive(),
  insuranceValue: z.coerce.number().nonnegative().optional(),
  codAmount: z.coerce.number().nonnegative().optional(),
  transport: z.string().trim().min(1).optional(),
  lengthInCm: z.coerce.number().nonnegative().optional(),
  widthInCm: z.coerce.number().nonnegative().optional(),
  heightInCm: z.coerce.number().nonnegative().optional(),
  includeLeadtime: z.boolean().optional()
});

export async function POST(request: Request) {
  try {
    const rateLimitResponse = enforceRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const payload = requestSchema.parse(body);

    const service = GHTKQuoteService.fromEnv();
    const result = await service.getQuote({
      ...payload,
      pickWard: payload.pickWard ?? undefined,
      ward: payload.ward ?? undefined,
      transport: payload.transport ?? undefined
    });

    return NextResponse.json({
      success: true,
      quote: result.quote,
      leadtime: result.leadtime,
      warnings: result.warnings
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request payload",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    console.error("[GHTK] Quote API error", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    );
  }
}
