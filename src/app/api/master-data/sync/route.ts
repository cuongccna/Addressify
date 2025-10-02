import { NextResponse } from "next/server";
import { GHNMasterDataService } from "@/lib/master-data/ghn-master-data";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const service = GHNMasterDataService.fromEnv();
    const result = await service.syncAll();

    return NextResponse.json({
      success: true,
      message: "Master data synced successfully",
      data: result
    });
  } catch (error) {
    console.error("[MasterData] Sync error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to sync master data"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Use POST to trigger sync",
    endpoints: {
      provinces: "/api/master-data/provinces",
      districts: "/api/master-data/districts",
      wards: "/api/master-data/wards"
    }
  });
}
