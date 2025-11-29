import { NextResponse } from "next/server";
import { GHNMasterDataService } from "@/lib/master-data/ghn-master-data";

export const dynamic = "force-dynamic";

/**
 * GET /api/locations/provinces
 * Get all provinces from GHN
 */
export async function GET() {
  try {
    const service = GHNMasterDataService.fromEnv();
    const provinces = await service.getProvinces(true);

    // Transform to simplified format
    const simplified = provinces.map((p) => ({
      id: p.ProvinceID,
      name: p.ProvinceName,
      code: p.Code,
    }));

    return NextResponse.json({
      success: true,
      data: simplified,
    });
  } catch (error) {
    console.error("[LocationAPI] getProvinces error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch provinces",
      },
      { status: 500 }
    );
  }
}
