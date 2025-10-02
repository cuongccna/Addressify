import { NextResponse } from "next/server";
import { z } from "zod";

import { VTPQuoteService } from "@/lib/shipping-apis/vtpQuoteService";

const RATE_LIMIT_WINDOW_MS = 60_000;
const configuredMaxRequests = Number.parseInt(process.env.VTP_QUOTE_RATE_LIMIT ?? "20", 10);
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
  senderDistrictId: z.coerce.number().int().positive(),
  senderWardCode: z.string().min(1).optional(),
  receiverDistrictId: z.coerce.number().int().positive(),
  receiverWardCode: z.string().min(1).optional(),
  weightInGrams: z.coerce.number().int().positive(),
  lengthInCm: z.coerce.number().int().nonnegative().optional(),
  widthInCm: z.coerce.number().int().nonnegative().optional(),
  heightInCm: z.coerce.number().int().nonnegative().optional(),
  codAmount: z.coerce.number().nonnegative().optional(),
  insuranceValue: z.coerce.number().nonnegative().optional(),
  serviceCode: z.string().trim().min(1).optional()
});

export async function POST(request: Request) {
  try {
    const rateLimitResponse = enforceRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const payload = requestSchema.parse(body);

    const service = VTPQuoteService.fromEnv();
    const result = await service.getQuote(payload);

    return NextResponse.json({
      success: true,
      quote: result.quote
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

    console.error("[VTP] Quote API error", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    );
  }
}
