import "server-only";

import fs from "fs";
import path from "path";

if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Za-z0-9_.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(.*))\s*$/);
        if (m) {
          const key = m[1];
          const value = m[2] ?? m[3] ?? m[4] ?? "";
          if (!process.env[key]) process.env[key] = value;
        }
      }
    }
  } catch {
    // ignore
  }
}

import { getCopPersonnelPool } from "@/lib/cop-personnel";

export type CopCalendarEvent = {
  id: number;
  title: string;
  start: string;
  end: string;
  category: string;
  color: string;
  description: string;
  sortOrder: number;
};

export type CopCalendarEventInput = Omit<CopCalendarEvent, "id" | "sortOrder">;

type DbCalendarEvent = {
  id: number;
  title: string;
  start_date: string | Date;
  end_date: string | Date;
  category: string;
  color: string;
  description: string | null;
  sort_order: number;
};


function toDateString(value: string | Date) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function fromDb(row: DbCalendarEvent): CopCalendarEvent {
  return {
    id: row.id,
    title: row.title,
    start: toDateString(row.start_date),
    end: toDateString(row.end_date),
    category: row.category,
    color: row.color,
    description: row.description ?? "",
    sortOrder: row.sort_order,
  };
}

export async function getCopCalendarEvents(): Promise<CopCalendarEvent[]> {
  const db = getCopPersonnelPool();
  if (!db) {
    throw new Error("DATABASE_URL is required to fetch COP calendar events.");
  }

  const result = await db.query<DbCalendarEvent>(
    "select id, title, start_date, end_date, category, color, description, sort_order from public.cop_calendar_events order by sort_order asc, start_date asc",
  );

  return result.rows.map(fromDb);
}

export async function updateCopCalendarEvent(id: number, input: CopCalendarEventInput) {
  const db = getCopPersonnelPool();

  if (!db) {
    throw new Error("DATABASE_URL is required to update calendar events.");
  }

  if (!input.title || !input.start || !input.end || !input.category) {
    throw new Error("Title, start date, end date, and category are required.");
  }

  if (input.end < input.start) {
    throw new Error("End date cannot be before start date.");
  }

  const result = await db.query<DbCalendarEvent>(
    `update public.cop_calendar_events
      set title = $2,
        start_date = $3,
        end_date = $4,
        category = $5,
        color = $6,
        description = $7,
        updated_at = now()
      where id = $1
      returning id, title, start_date, end_date, category, color, description, sort_order`,
    [id, input.title, input.start, input.end, input.category, input.color, input.description],
  );

  if (!result.rows[0]) {
    throw new Error("Calendar event was not found.");
  }

  return fromDb(result.rows[0]);
}

export async function createCopCalendarEvent(input: CopCalendarEventInput) {
  const db = getCopPersonnelPool();

  if (!db) {
    throw new Error("DATABASE_URL is required to create calendar events.");
  }

  if (!input.title || !input.start || !input.end || !input.category) {
    throw new Error("Title, start date, end date, and category are required.");
  }

  if (input.end < input.start) {
    throw new Error("End date cannot be before start date.");
  }

  const client = await db.connect();

  try {
    await client.query("begin");
    const next = await client.query<{ id: number; sort_order: number }>(
      "select coalesce(max(id), 0) + 1 as id, coalesce(max(sort_order), 0) + 1 as sort_order from public.cop_calendar_events",
    );
    const result = await client.query<DbCalendarEvent>(
      `insert into public.cop_calendar_events (
        id, title, start_date, end_date, category, color, description, sort_order
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8)
      returning id, title, start_date, end_date, category, color, description, sort_order`,
      [
        next.rows[0].id,
        input.title,
        input.start,
        input.end,
        input.category,
        input.color,
        input.description,
        next.rows[0].sort_order,
      ],
    );
    await client.query("commit");
    return fromDb(result.rows[0]);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
