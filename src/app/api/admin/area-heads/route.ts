import { NextRequest, NextResponse } from "next/server";
import {
  createCopAreaHead,
  getCopAreaHeads,
  type CopAreaHeadInput,
} from "@/lib/cop-personnel";

function cleanInput(value: unknown): CopAreaHeadInput {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid area head payload.");
  }

  const record = value as Record<string, unknown>;
  const input: CopAreaHeadInput = {
    sortOrder: Number(record.sortOrder ?? 0),
    region: String(record.region ?? "").trim(),
    area: String(record.area ?? "").trim(),
    name: String(record.name ?? "").trim(),
    phone: String(record.phone ?? "").trim(),
    email: String(record.email ?? "").trim(),
    address: String(record.address ?? "").trim(),
  };

  if (!input.region || !input.area || !input.name) {
    throw new Error("Region, area, and area head are required.");
  }

  return input;
}

export async function GET() {
  const areaHeads = await getCopAreaHeads();
  return NextResponse.json({ areaHeads });
}

export async function POST(request: NextRequest) {
  try {
    const input = cleanInput(await request.json());
    const areaHead = await createCopAreaHead(input);
    return NextResponse.json({ areaHead }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create area head." },
      { status: 400 },
    );
  }
}
