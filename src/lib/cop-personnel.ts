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

export type CopPersonnelInput = Omit<CopPersonnel, "id" | "slug">;

export type CopAreaHead = {
  id: number;
  sortOrder: number;
  region: string;
  area: string;
  name: string;
  phone: string;
  email: string;
  address: string;
};

export type CopAreaHeadInput = Omit<CopAreaHead, "id">;

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

type DbAreaHead = {
  id: number;
  sort_order: number;
  region: string;
  area: string;
  name: string;
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
    } catch {
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

function areaHeadFromDb(row: DbAreaHead): CopAreaHead {
  return {
    id: row.id,
    sortOrder: row.sort_order,
    region: row.region,
    area: row.area,
    name: row.name,
    phone: row.phone ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
  };
}

const personnelSelect = `select
  p.id,
  p.slug,
  p.sort_order,
  p.region,
  p.area,
  coalesce(nullif(ah.name, ''), p.area_leader) as area_leader,
  p.district,
  p.district_leader,
  p.phone,
  p.email,
  p.address
from public."cop personnel" p
left join public.cop_area_heads ah on lower(trim(ah.area)) = lower(trim(p.area))`;

export async function getCopPersonnel(): Promise<CopPersonnel[]> {
  const db = getCopPersonnelPool();

  if (!db) {
    throw new Error("DATABASE_URL is required to fetch COP personnel.");
  }

  try {
    const result = await db.query<DbPersonnel>(
      `${personnelSelect} order by p.sort_order asc`,
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
      `${personnelSelect} where p.slug = $1 limit 1`,
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

export async function getCopAreaHeads(): Promise<CopAreaHead[]> {
  const db = getCopPersonnelPool();

  if (!db) {
    throw new Error("DATABASE_URL is required to fetch COP area heads.");
  }

  const result = await db.query<DbAreaHead>(
    "select id, sort_order, region, area, name, phone, email, address from public.cop_area_heads order by sort_order asc, area asc",
  );

  return result.rows.map(areaHeadFromDb);
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
        sort_order = $3,
        region = $4,
        area = $5,
        area_leader = coalesce((select name from public.cop_area_heads where lower(trim(area)) = lower(trim($5)) limit 1), $6),
        district = $7,
        district_leader = $8,
        phone = $9,
        email = $10,
        address = $11
      where id = $1
      returning id, slug, sort_order, region, area, area_leader, district, district_leader, phone, email, address`,
    [
      id,
      slug,
      input.sortOrder,
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
    const sortOrder = input.sortOrder > 0 ? input.sortOrder : next.rows[0].sort_order;
    const slug = await uniqueSlug(client, input);

    const result = await client.query<DbPersonnel>(
      `insert into public."cop personnel" (
        id, slug, sort_order, region, area, area_leader, district, district_leader, phone, email, address
      )
      values (
        $1, $2, $3, $4, $5,
        coalesce((select name from public.cop_area_heads where lower(trim(area)) = lower(trim($5)) limit 1), $6),
        $7, $8, $9, $10, $11
      )
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

    const areaRows = await client.query<DbAreaHead>(
      `select id, sort_order, region, area, name, phone, email, address
        from public.cop_area_heads
        where area = any($1::text[])
        order by area, sort_order asc
        for update`,
      [[sourceArea, targetArea]],
    );

    const source = areaRows.rows.find((row) => row.area === sourceArea);
    const target = areaRows.rows.find((row) => row.area === targetArea);

    if (!source || !target) {
      throw new Error("One or both areas were not found.");
    }

    if (mode === "switch") {
      await client.query("update public.cop_area_heads set name = $2, phone = $3, email = $4, address = $5, updated_at = now() where id = $1", [
        source.id,
        target.name,
        target.phone,
        target.email,
        target.address,
      ]);
      await client.query("update public.cop_area_heads set name = $2, phone = $3, email = $4, address = $5, updated_at = now() where id = $1", [
        target.id,
        source.name,
        source.phone,
        source.email,
        source.address,
      ]);
    } else {
      await client.query("update public.cop_area_heads set name = $2, phone = $3, email = $4, address = $5, updated_at = now() where id = $1", [
        target.id,
        source.name,
        source.phone,
        source.email,
        source.address,
      ]);
      await client.query("update public.cop_area_heads set name = 'Vacant', phone = '', email = '', address = '', updated_at = now() where id = $1", [
        source.id,
      ]);
    }

    await client.query(
      `update public."cop personnel" p
        set area_leader = ah.name
        from public.cop_area_heads ah
        where lower(trim(ah.area)) = lower(trim(p.area))
          and p.area = any($1::text[])`,
      [[sourceArea, targetArea]],
    );

    const changed = await client.query<DbPersonnel>(
      `${personnelSelect} where p.area = any($1::text[]) order by p.sort_order asc`,
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
      `${personnelSelect}
        where p.id = any($1::integer[])
        order by p.sort_order asc`,
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

export async function updateCopAreaHead(id: number, input: CopAreaHeadInput) {
  const db = getCopPersonnelPool();

  if (!db) {
    throw new Error("DATABASE_URL is required to update COP area heads.");
  }

  if (!input.region || !input.area || !input.name) {
    throw new Error("Region, area, and area head are required.");
  }

  const result = await db.query<DbAreaHead>(
    `update public.cop_area_heads
      set sort_order = $2,
        region = $3,
        area = $4,
        name = $5,
        phone = $6,
        email = $7,
        address = $8,
        updated_at = now()
      where id = $1
      returning id, sort_order, region, area, name, phone, email, address`,
    [
      id,
      input.sortOrder,
      input.region,
      input.area,
      input.name,
      input.phone,
      input.email,
      input.address,
    ],
  );

  if (!result.rows[0]) {
    throw new Error("COP area head was not found.");
  }

  await db.query('update public."cop personnel" set area_leader = $2 where lower(trim(area)) = lower(trim($1))', [
    input.area,
    input.name,
  ]);

  return areaHeadFromDb(result.rows[0]);
}

export async function createCopAreaHead(input: CopAreaHeadInput) {
  const db = getCopPersonnelPool();

  if (!db) {
    throw new Error("DATABASE_URL is required to create COP area heads.");
  }

  if (!input.region || !input.area || !input.name) {
    throw new Error("Region, area, and area head are required.");
  }

  const client = await db.connect();

  try {
    await client.query("begin");
    const next = await client.query<{ id: number; sort_order: number }>(
      "select coalesce(max(id), 0) + 1 as id, coalesce(max(sort_order), 0) + 1 as sort_order from public.cop_area_heads",
    );
    const result = await client.query<DbAreaHead>(
      `insert into public.cop_area_heads (
        id, sort_order, region, area, name, phone, email, address
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8)
      returning id, sort_order, region, area, name, phone, email, address`,
      [
        next.rows[0].id,
        input.sortOrder > 0 ? input.sortOrder : next.rows[0].sort_order,
        input.region,
        input.area,
        input.name,
        input.phone,
        input.email,
        input.address,
      ],
    );

    await client.query('update public."cop personnel" set area_leader = $2 where lower(trim(area)) = lower(trim($1))', [
      input.area,
      input.name,
    ]);

    await client.query("commit");
    return areaHeadFromDb(result.rows[0]);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
