import "server-only";

import fs from "fs";
import path from "path";
import pg from "pg";

export type CopPersonnel = {
  id: number;
  slug: string;
  sortOrder: number;
  region: string;
  area: string;
  areaLeader: string;
  district: string;
  districtLeader: string;
  phone: string;
  email: string;
  address: string;
};

export type CopPersonnelInput = Omit<CopPersonnel, "id" | "slug" | "sortOrder">;

type DbPersonnel = {
  id: number;
  slug: string;
  sort_order: number;
  region: string;
  area: string;
  area_leader: string;
  district: string;
  district_leader: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};


let pool: pg.Pool | undefined;

type Queryable = Pick<pg.Pool, "query"> | Pick<pg.PoolClient, "query">;

export function getCopPersonnelPool() {
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
    } catch (err) {
    }
  }

  if (!process.env.DATABASE_URL) {
    return undefined;
  }

  pool ??= new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,
    connectionTimeoutMillis: 10000,
    query_timeout: 15000,
    statement_timeout: 15000,
  });

  return pool;
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "personnel";
}

async function uniqueSlug(db: Queryable, person: Pick<CopPersonnel, "districtLeader" | "district" | "area">, id?: number) {
  const base = slugify(`${person.districtLeader} ${person.district} ${person.area}`);
  let slug = base;
  let suffix = 2;

  while (true) {
    const result = await db.query<{ id: number }>(
      'select id from public."cop personnel" where slug = $1 and ($2::integer is null or id <> $2) limit 1',
      [slug, id ?? null],
    );

    if (!result.rows[0]) {
      return slug;
    }

    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

function fromDb(row: DbPersonnel): CopPersonnel {
  return {
    id: row.id,
    slug: row.slug,
    sortOrder: row.sort_order,
    region: row.region,
    area: row.area,
    areaLeader: row.area_leader,
    district: row.district,
    districtLeader: row.district_leader,
    phone: row.phone ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
  };
}

export async function getCopPersonnel(): Promise<CopPersonnel[]> {
  const db = getCopPersonnelPool();

  if (!db) {
    throw new Error("DATABASE_URL is required to fetch COP personnel.");
  }

  try {
    const result = await db.query<DbPersonnel>(
      'select id, slug, sort_order, region, area, area_leader, district, district_leader, phone, email, address from public."cop personnel" order by sort_order asc',
    );
    return result.rows.map(fromDb);
  } catch (error) {
    console.error("Error fetching COP personnel from DB.", error);
    throw error;
  }
}

export async function getCopPersonBySlug(slug: string) {
  const db = getCopPersonnelPool();
  if (!db) {
    throw new Error("DATABASE_URL is required to fetch COP personnel.");
  }

  try {
    const result = await db.query<DbPersonnel>(
      'select id, slug, sort_order, region, area, area_leader, district, district_leader, phone, email, address from public."cop personnel" where slug = $1 limit 1',
      [slug],
    );

    if (result.rows[0]) {
      return fromDb(result.rows[0]);
    }

    return null;
  } catch (error) {
    throw error;
  }
}

export function getFallbackCopPersonnel() {
  throw new Error("Fallback personnel data removed; DATABASE_URL is required.");
}

export async function updateCopPerson(id: number, input: CopPersonnelInput) {
  const db = getCopPersonnelPool();

  if (!db) {
    throw new Error("DATABASE_URL is required to update COP personnel.");
  }

  const slug = await uniqueSlug(db, input, id);

  const result = await db.query<DbPersonnel>(
    `update public."cop personnel"
      set slug = $2,
        region = $3,
        area = $4,
        area_leader = $5,
        district = $6,
        district_leader = $7,
        phone = $8,
        email = $9,
        address = $10
      where id = $1
      returning id, slug, sort_order, region, area, area_leader, district, district_leader, phone, email, address`,
    [
      id,
      slug,
      input.region,
      input.area,
      input.areaLeader,
      input.district,
      input.districtLeader,
      input.phone,
      input.email,
      input.address,
    ],
  );

  if (!result.rows[0]) {
    throw new Error("COP personnel record was not found.");
  }

  return fromDb(result.rows[0]);
}

export async function createCopPerson(input: CopPersonnelInput) {
  const db = getCopPersonnelPool();

  if (!db) {
    throw new Error("DATABASE_URL is required to create COP personnel.");
  }

  const client = await db.connect();

  try {
    await client.query("begin");
    const next = await client.query<{ id: number; sort_order: number }>(
      'select coalesce(max(id), 0) + 1 as id, coalesce(max(sort_order), 0) + 1 as sort_order from public."cop personnel"',
    );
    const id = next.rows[0].id;
    const sortOrder = next.rows[0].sort_order;
    const slug = await uniqueSlug(client, input);

    const result = await client.query<DbPersonnel>(
      `insert into public."cop personnel" (
        id, slug, sort_order, region, area, area_leader, district, district_leader, phone, email, address
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      returning id, slug, sort_order, region, area, area_leader, district, district_leader, phone, email, address`,
      [
        id,
        slug,
        sortOrder,
        input.region,
        input.area,
        input.areaLeader,
        input.district,
        input.districtLeader,
        input.phone,
        input.email,
        input.address,
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

export async function retireCopPerson(id: number) {
  const db = getCopPersonnelPool();

  if (!db) {
    throw new Error("DATABASE_URL is required to retire COP personnel.");
  }

  const result = await db.query<DbPersonnel>(
    'delete from public."cop personnel" where id = $1 returning id, slug, sort_order, region, area, area_leader, district, district_leader, phone, email, address',
    [id],
  );

  if (!result.rows[0]) {
    throw new Error("COP personnel record was not found.");
  }

  return fromDb(result.rows[0]);
}

export async function transferAreaLeader(sourceArea: string, targetArea: string, mode: "direct" | "switch") {
  const db = getCopPersonnelPool();

  if (!db) {
    throw new Error("DATABASE_URL is required to transfer area heads.");
  }

  if (!sourceArea || !targetArea || sourceArea === targetArea) {
    throw new Error("Choose two different areas.");
  }

  const client = await db.connect();

  try {
    await client.query("begin");

    const areaRows = await client.query<{ area: string; area_leader: string }>(
      `select area, area_leader
        from public."cop personnel"
        where area = any($1::text[])
        order by area, sort_order asc
        for update`,
      [[sourceArea, targetArea]],
    );

    const areas = Array.from(
      new Map(areaRows.rows.map((row) => [row.area, row])).values(),
    );
    const source = areas.find((row) => row.area === sourceArea);
    const target = areas.find((row) => row.area === targetArea);

    if (!source || !target) {
      throw new Error("One or both areas were not found.");
    }

    if (mode === "switch") {
      await client.query('update public."cop personnel" set area_leader = $2 where area = $1', [
        source.area,
        target.area_leader,
      ]);
      await client.query('update public."cop personnel" set area_leader = $2 where area = $1', [
        target.area,
        source.area_leader,
      ]);
    } else {
      await client.query('update public."cop personnel" set area_leader = $2 where area = $1', [
        target.area,
        source.area_leader,
      ]);
      await client.query('update public."cop personnel" set area_leader = $2 where area = $1', [
        source.area,
        "Vacant",
      ]);
    }

    const changed = await client.query<DbPersonnel>(
      `select id, slug, sort_order, region, area, area_leader, district, district_leader, phone, email, address
        from public."cop personnel"
        where area = any($1::text[])
        order by sort_order asc`,
      [[sourceArea, targetArea]],
    );

    await client.query("commit");
    return changed.rows.map(fromDb);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function transferCopPersonnel(sourceId: number, targetId: number, mode: "direct" | "switch") {
  const db = getCopPersonnelPool();

  if (!db) {
    throw new Error("DATABASE_URL is required to transfer COP personnel.");
  }

  if (sourceId === targetId) {
    throw new Error("Choose two different personnel records.");
  }

  const client = await db.connect();

  try {
    await client.query("begin");

    const result = await client.query<DbPersonnel>(
      `select id, slug, sort_order, region, area, area_leader, district, district_leader, phone, email, address
        from public."cop personnel"
        where id = any($1::integer[])
        order by id
        for update`,
      [[sourceId, targetId]],
    );

    const source = result.rows.find((row) => row.id === sourceId);
    const target = result.rows.find((row) => row.id === targetId);

    if (!source || !target) {
      throw new Error("One or both COP personnel records were not found.");
    }

    if (mode === "switch") {
      await client.query(
        `update public."cop personnel"
          set district_leader = $2, phone = $3, email = $4
          where id = $1`,
        [source.id, target.district_leader, target.phone, target.email],
      );
      await client.query(
        `update public."cop personnel"
          set district_leader = $2, phone = $3, email = $4
          where id = $1`,
        [target.id, source.district_leader, source.phone, source.email],
      );
    } else {
      await client.query(
        `update public."cop personnel"
          set district_leader = $2, phone = $3, email = $4
          where id = $1`,
        [target.id, source.district_leader, source.phone, source.email],
      );
      await client.query(
        `update public."cop personnel"
          set district_leader = 'Vacant', phone = '', email = ''
          where id = $1`,
        [source.id],
      );
    }

    const changed = await client.query<DbPersonnel>(
      `select id, slug, sort_order, region, area, area_leader, district, district_leader, phone, email, address
        from public."cop personnel"
        where id = any($1::integer[])
        order by sort_order asc`,
      [[sourceId, targetId]],
    );

    for (const row of changed.rows) {
      const nextSlug = await uniqueSlug(client, {
        districtLeader: row.district_leader,
        district: row.district,
        area: row.area,
      }, row.id);

      await client.query('update public."cop personnel" set slug = $2 where id = $1', [
        row.id,
        nextSlug,
      ]);
    }

    const finalRows = await client.query<DbPersonnel>(
      `select id, slug, sort_order, region, area, area_leader, district, district_leader, phone, email, address
        from public."cop personnel"
        where id = any($1::integer[])
        order by sort_order asc`,
      [[sourceId, targetId]],
    );

    await client.query("commit");
    return finalRows.rows.map(fromDb);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
