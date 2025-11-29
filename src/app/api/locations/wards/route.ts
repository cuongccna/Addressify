import { NextResponse } from "next/server";
import { GHNMasterDataService } from "@/lib/master-data/ghn-master-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/locations/wards?districtId=1447
 * Get wards for a district from GHN
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtIdStr = searchParams.get("districtId");

    if (!districtIdStr) {
      return NextResponse.json(
        {
          success: false,
          message: "districtId is required",
        },
        { status: 400 }
      );
    }

    const districtId = Number(districtIdStr);
    if (isNaN(districtId)) {
      return NextResponse.json(
        {
          success: false,
          message: "districtId must be a number",
        },
        { status: 400 }
      );
    }

    const service = GHNMasterDataService.fromEnv();
    const wards = await service.getWards(districtId, true);

    // Transform to simplified format
    const simplified = wards.map((w) => ({
      code: w.WardCode,
      districtId: w.DistrictID,
      name: w.WardName,
      supportType: w.SupportType,
    }));

    return NextResponse.json({
      success: true,
      data: simplified,
    });
  } catch (error) {
    console.error("[LocationAPI] getWards error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch wards",
      },
      { status: 500 }
    );
  }
}
