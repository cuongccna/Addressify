import { NextResponse } from "next/server";
import { masterDataDB } from "@/lib/master-data/master-data-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const provinces = await masterDataDB.getProvinces();

    // Transform to GHN format for backward compatibility
    const data = provinces.map(p => ({
      ProvinceID: p.ghnId,
      ProvinceName: p.name,
      Code: p.code,
      NameExtension: p.nameExtensions
    }));

    return NextResponse.json({
      success: true,
      data,
      source: "postgresql"
    });
  } catch (error) {
    console.error("[MasterData] Get provinces error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to get provinces"
      },
      { status: 500 }
    );
  }
}
