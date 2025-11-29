import { NextResponse } from "next/server";
import { GHNMasterDataService } from "@/lib/master-data/ghn-master-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/locations/districts?provinceId=202
 * Get districts for a province from GHN
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceIdStr = searchParams.get("provinceId");

    if (!provinceIdStr) {
      return NextResponse.json(
        {
          success: false,
          message: "provinceId is required",
        },
        { status: 400 }
      );
    }

    const provinceId = Number(provinceIdStr);
    if (isNaN(provinceId)) {
      return NextResponse.json(
        {
          success: false,
          message: "provinceId must be a number",
        },
        { status: 400 }
      );
    }

    const service = GHNMasterDataService.fromEnv();
    const districts = await service.getDistricts(provinceId, true);

    // Transform to simplified format
    const simplified = districts.map((d) => ({
      id: d.DistrictID,
      provinceId: d.ProvinceID,
      name: d.DistrictName,
      code: d.Code,
      supportType: d.SupportType,
    }));

    return NextResponse.json({
      success: true,
      data: simplified,
    });
  } catch (error) {
    console.error("[LocationAPI] getDistricts error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch districts",
      },
      { status: 500 }
    );
  }
}
