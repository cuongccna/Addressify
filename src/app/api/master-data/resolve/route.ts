import { NextResponse } from "next/server";
import { z } from "zod";
import { AddressMatcher } from "@/lib/master-data/address-matcher";

const requestSchema = z.object({
  province: z.string().min(1),
  district: z.string().min(1),
  ward: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { province, district, ward } = requestSchema.parse(body);

    const matcher = new AddressMatcher();
    const result = await matcher.resolveAddress(province, district, ward);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request",
          issues: error.issues
        },
        { status: 400 }
      );
    }

    console.error("[AddressMatcher] Resolve error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to resolve address"
      },
      { status: 500 }
    );
  }
}
