import { NextRequest, NextResponse } from "next/server";
import { transferAreaLeader } from "@/lib/cop-personnel";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sourceArea = String(body.sourceArea ?? "").trim();
    const targetArea = String(body.targetArea ?? "").trim();
    const mode = body.mode === "direct" ? "direct" : "switch";

    const personnel = await transferAreaLeader(sourceArea, targetArea, mode);
    return NextResponse.json({ personnel });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to transfer area head." },
      { status: 400 },
    );
  }
}
