import { NextRequest, NextResponse } from "next/server";
import { createCopCalendarEvent, getCopCalendarEvents, type CopCalendarEventInput } from "@/lib/cop-calendar";

function cleanInput(value: unknown): CopCalendarEventInput {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid calendar event payload.");
  }

  const record = value as Record<string, unknown>;
  return {
    title: String(record.title ?? "").trim(),
    start: String(record.start ?? "").trim(),
    end: String(record.end ?? "").trim(),
    category: String(record.category ?? "").trim(),
    color: String(record.color ?? "blue").trim() || "blue",
    description: String(record.description ?? "").trim(),
  };
}

export async function GET() {
  const events = await getCopCalendarEvents();
  return NextResponse.json({ events });
}

export async function POST(request: NextRequest) {
  try {
    const input = cleanInput(await request.json());
    const event = await createCopCalendarEvent(input);
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create calendar event." },
      { status: 400 },
    );
  }
}
