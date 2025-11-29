import { NextResponse } from "next/server";
import { MasterDataDBService } from "@/lib/master-data/master-data-db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const service = MasterDataDBService.fromEnv();
    const result = await service.syncAll();

    return NextResponse.json({
      success: true,
      message: "Master data synced to PostgreSQL successfully",
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
  try {
    const service = MasterDataDBService.fromEnv();
    const stats = await service.getStats();
    
    return NextResponse.json({
      success: true,
      message: "Use POST to trigger sync from GHN API to PostgreSQL",
      database: stats,
      endpoints: {
        sync: "POST /api/master-data/sync",
        provinces: "/api/master-data/provinces",
        districts: "/api/master-data/districts?province_id=xxx",
        wards: "/api/master-data/wards?district_id=xxx"
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to get stats"
    }, { status: 500 });
  }
}
