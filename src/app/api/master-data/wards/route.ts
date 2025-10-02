import { NextResponse } from "next/server";
import { GHNMasterDataService } from "@/lib/master-data/ghn-master-data";

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

    const service = GHNMasterDataService.fromEnv();
    const wards = await service.getWards(Number(districtId), true);

    return NextResponse.json({
      success: true,
      data: wards
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
