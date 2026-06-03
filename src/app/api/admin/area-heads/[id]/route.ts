import { NextRequest, NextResponse } from "next/server";
import { updateCopAreaHead, type CopAreaHeadInput } from "@/lib/cop-personnel";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid area head id." }, { status: 400 });
  }

  try {
    const input = cleanInput(await request.json());
    const areaHead = await updateCopAreaHead(id, input);
    return NextResponse.json({ areaHead });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update area head." },
      { status: 400 },
    );
  }
}
