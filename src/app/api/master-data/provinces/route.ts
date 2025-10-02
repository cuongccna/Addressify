import { NextResponse } from "next/server";
import { GHNMasterDataService } from "@/lib/master-data/ghn-master-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const service = GHNMasterDataService.fromEnv();
    const provinces = await service.getProvinces(true);

    return NextResponse.json({
      success: true,
      data: provinces
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
