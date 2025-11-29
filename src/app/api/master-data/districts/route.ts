import { NextResponse } from "next/server";
import { masterDataDB } from "@/lib/master-data/master-data-db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get("province_id");

    const districts = await masterDataDB.getDistricts(
      provinceId ? Number(provinceId) : undefined
    );

    // Transform to GHN format for backward compatibility
    const data = districts.map(d => ({
      DistrictID: d.ghnId,
      DistrictName: d.name,
      Code: d.code,
      Type: d.type,
      SupportType: d.supportType,
      NameExtension: d.nameExtensions
    }));

    return NextResponse.json({
      success: true,
      data,
      source: "postgresql"
    });
  } catch (error) {
    console.error("[MasterData] Get districts error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to get districts"
      },
      { status: 500 }
    );
  }
}
