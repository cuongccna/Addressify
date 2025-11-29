import { NextResponse } from "next/server";
import { masterDataDB } from "@/lib/master-data/master-data-db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get("district_id");

    if (!districtId) {
      return NextResponse.json(
        {
          success: false,
          message: "district_id is required"
        },
        { status: 400 }
      );
    }

    const wards = await masterDataDB.getWards(Number(districtId));

    // Transform to GHN format for backward compatibility
    const data = wards.map(w => ({
      WardCode: w.ghnCode,
      WardName: w.name,
      SupportType: w.supportType,
      CanUpdateCOD: w.canUpdateCOD,
      NameExtension: w.nameExtensions
    }));

    return NextResponse.json({
      success: true,
      data,
      source: "postgresql"
    });
  } catch (error) {
    console.error("[MasterData] Get wards error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to get wards"
      },
      { status: 500 }
    );
  }
}
