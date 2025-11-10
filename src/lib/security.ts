import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseServer } from "./supabaseServer";

const SECURITY_TABLE = "site_security";
const SECURITY_ROW_ID = "singleton";

export type Role = "guest" | "admin";

type SecurityRecord = {
  id: string;
  guest_password_hash: string;
  admin_password_hash: string;
  updated_at: string | null;
};

export async function ensureSecurityRecord() {
  const { data, error } = await supabaseServer
    .from<SecurityRecord>(SECURITY_TABLE)
    .select("*")
    .eq("id", SECURITY_ROW_ID)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") {
      // no rows, we'll seed below
    } else if (error.code === "42P01") {
      throw new Error(
        "Supabase table 'site_security' does not exist. Please run the provided SQL migration."
      );
    } else {
      throw new Error(`Failed to read security record: ${error.message}`);
    }
  }

  if (data) {
    return data;
  }

  const defaultGuestPassword =
    process.env.NEXT_PUBLIC_ACCESS_PASSWORD ?? "theloft2025";
  const defaultAdminPassword =
    process.env.ADMIN_PANEL_PASSWORD ?? "theloft-admin";

  const guestHash = await bcrypt.hash(defaultGuestPassword, 10);
  const adminHash = await bcrypt.hash(defaultAdminPassword, 10);

  const { data: inserted, error: insertError } = await supabaseServer
    .from<SecurityRecord>(SECURITY_TABLE)
    .upsert({
      id: SECURITY_ROW_ID,
      guest_password_hash: guestHash,
      admin_password_hash: adminHash,
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(`Failed to create security record: ${insertError.message}`);
  }

  return inserted;
}

export async function verifyPassword(role: Role, password: string) {
  const record = await ensureSecurityRecord();
  const hash =
    role === "admin"
      ? record.admin_password_hash
      : record.guest_password_hash;

  const isValid = await bcrypt.compare(password, hash);
  return isValid;
}

export async function updatePassword(role: Role, newPassword: string) {
  const hash = await bcrypt.hash(newPassword, 10);
  const updateColumn =
    role === "admin" ? "admin_password_hash" : "guest_password_hash";
  const { error } = await supabaseServer
    .from<SecurityRecord>(SECURITY_TABLE)
    .update({
      [updateColumn]: hash,
    })
    .eq("id", SECURITY_ROW_ID);

  if (error) {
    throw new Error(`Failed to update ${role} password: ${error.message}`);
  }
}

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? "change-this-secret";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export function createAdminSessionToken() {
  return jwt.sign({ role: "admin" }, SESSION_SECRET, {
    algorithm: "HS256",
    expiresIn: SESSION_TTL_SECONDS,
  });
}

export function verifyAdminSessionToken(token: string) {
  try {
    const payload = jwt.verify(token, SESSION_SECRET);
    if (typeof payload === "object" && payload.role === "admin") {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

