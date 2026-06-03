import { NextRequest, NextResponse } from "next/server";
import { transferCopPersonnel } from "@/lib/cop-personnel";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sourceId = Number(body.sourceId);
    const targetId = Number(body.targetId);
    const mode = body.mode === "direct" ? "direct" : "switch";

    if (!Number.isInteger(sourceId) || !Number.isInteger(targetId)) {
      return NextResponse.json({ error: "Choose valid source and target records." }, { status: 400 });
    }

    const personnel = await transferCopPersonnel(sourceId, targetId, mode);
    return NextResponse.json({ personnel });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to complete transfer." },
      { status: 400 },
    );
  }
}
