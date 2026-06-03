import { NextRequest, NextResponse } from "next/server";
import { updateCopCalendarEvent, type CopCalendarEventInput } from "@/lib/cop-calendar";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid calendar event id." }, { status: 400 });
  }

  try {
    const input = cleanInput(await request.json());
    const event = await updateCopCalendarEvent(id, input);
    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update calendar event." },
      { status: 400 },
    );
  }
}
