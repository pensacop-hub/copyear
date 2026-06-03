import "server-only";

import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { getCopPersonnelPool } from "@/lib/cop-personnel";

export const ADMIN_SESSION_COOKIE = "copyear_admin_session";

type DbAdminUser = {
  id: number;
  email: string;
  password_hash: string;
  password_salt: string;
  role: string;
};

type AdminSessionPayload = {
  email: string;
  role: "admin";
  exp: number;
};

function normalizedEmail(email: string) {
  return email.trim().toLowerCase();
}

function base64Url(value: Buffer | string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is required for admin sessions.");
  }

  return secret;
}

function signPayload(payload: string) {
  return base64Url(createHmac("sha256", getSessionSecret()).update(payload).digest());
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

export function createPasswordRecord(password: string) {
  const salt = randomBytes(16).toString("hex");
  return {
    passwordHash: hashPassword(password, salt),
    passwordSalt: salt,
  };
}

export function verifyPassword(password: string, passwordHash: string, passwordSalt: string) {
  const given = Buffer.from(hashPassword(password, passwordSalt), "hex");
  const wanted = Buffer.from(passwordHash, "hex");

  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

export function createAdminSession(email: string) {
  const payload: AdminSessionPayload = {
    email: normalizedEmail(email),
    role: "admin",
    exp: Date.now() + 1000 * 60 * 60 * 8,
  };
  const encodedPayload = base64Url(JSON.stringify(payload));
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export function isValidAdminSession(session: string | undefined) {
  if (!session) {
    return false;
  }

  const [encodedPayload, signature] = session.split(".");
  if (!encodedPayload || !signature || signature !== signPayload(encodedPayload)) {
    return false;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as AdminSessionPayload;
    return payload.role === "admin" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function verifyAdminCredentials(email: string, password: string) {
  const db = getCopPersonnelPool();

  if (!db) {
    throw new Error("DATABASE_URL is required for admin login.");
  }

  const result = await db.query<DbAdminUser>(
    "select id, email, password_hash, password_salt, role from public.cms_admin_users where email = $1 limit 1",
    [normalizedEmail(email)],
  );
  const user = result.rows[0];

  if (!user || user.role !== "admin") {
    return null;
  }

  if (!verifyPassword(password, user.password_hash, user.password_salt)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role as "admin",
  };
}
