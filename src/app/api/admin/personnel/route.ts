import { NextRequest, NextResponse } from "next/server";
import { createCopPerson, getCopPersonnel, type CopPersonnelInput } from "@/lib/cop-personnel";

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

export async function GET() {
  const personnel = await getCopPersonnel();
  return NextResponse.json({ personnel });
}

export async function POST(request: NextRequest) {
  try {
    const input = cleanInput(await request.json());
    const person = await createCopPerson(input);
    return NextResponse.json({ person }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create personnel." },
      { status: 400 },
    );
  }
}
