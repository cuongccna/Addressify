import { NextResponse } from "next/server";
import { GHNMasterDataService } from "@/lib/master-data/ghn-master-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get("province_id");

    const service = GHNMasterDataService.fromEnv();
    const districts = await service.getDistricts(
      provinceId ? Number(provinceId) : undefined,
      true
    );

    return NextResponse.json({
      success: true,
      data: districts
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
