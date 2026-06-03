import { NextRequest, NextResponse } from "next/server";
import { retireCopPerson, updateCopPerson, type CopPersonnelInput } from "@/lib/cop-personnel";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const fields: Array<keyof CopPersonnelInput> = [
  "region",
  "area",
  "areaLeader",
  "district",
  "districtLeader",
  "phone",
  "email",
  "address",
];

function cleanInput(value: unknown): CopPersonnelInput {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid personnel payload.");
  }

  const record = value as Record<string, unknown>;
  const input = Object.fromEntries(
    fields.map((field) => [field, String(record[field] ?? "").trim()]),
  ) as CopPersonnelInput;

  for (const field of fields.slice(0, 5)) {
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
