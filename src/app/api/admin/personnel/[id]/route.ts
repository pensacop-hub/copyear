import { NextRequest, NextResponse } from "next/server";
import { retireCopPerson, updateCopPerson, type CopPersonnelInput } from "@/lib/cop-personnel";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function cleanInput(value: unknown): CopPersonnelInput {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid personnel payload.");
  }

  const record = value as Record<string, unknown>;
  const input: CopPersonnelInput = {
    sortOrder: Number(record.sortOrder ?? 0),
    region: String(record.region ?? "").trim(),
    area: String(record.area ?? "").trim(),
    areaLeader: String(record.areaLeader ?? "").trim(),
    district: String(record.district ?? "").trim(),
    districtLeader: String(record.districtLeader ?? "").trim(),
    phone: String(record.phone ?? "").trim(),
    email: String(record.email ?? "").trim(),
    address: String(record.address ?? "").trim(),
  };

  for (const field of ["region", "area", "areaLeader", "district", "districtLeader"] as const) {
    if (!input[field]) {
      throw new Error(`${field} is required.`);
    }
  }

  return input;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid personnel id." }, { status: 400 });
  }

  try {
    const input = cleanInput(await request.json());
    const person = await updateCopPerson(id, input);
    return NextResponse.json({ person });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update personnel." },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid personnel id." }, { status: 400 });
  }

  try {
    const person = await retireCopPerson(id);
    return NextResponse.json({ person });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to retire personnel." },
      { status: 400 },
    );
  }
}
