import { env } from "cloudflare:workers";

import {
  ADMIN_SESSION_COOKIE,
  getCookieValue,
  hashSessionToken,
} from "@/lib/admin-auth";

export type CurrentAdmin = {
  id: number;
  email: string;
  fullName: string;
  role: "admin" | "manager" | "reception";
};

type AdminSessionRow = {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "manager" | "reception";
};

export async function getCurrentAdmin(
  cookieHeader: string | null
): Promise<CurrentAdmin | null> {
  const token = getCookieValue(
    cookieHeader,
    ADMIN_SESSION_COOKIE
  );

  if (!token) {
    return null;
  }

  const tokenHash = await hashSessionToken(token);

  const admin = await env.zaram_hotels_db
    .prepare(
      `
        SELECT
          a.id,
          a.email,
          a.full_name,
          a.role
        FROM admin_sessions s

        JOIN admins a
          ON a.id = s.admin_id

        WHERE
          s.token_hash = ?
          AND datetime(s.expires_at) > datetime('now')
          AND a.is_active = 1

        LIMIT 1
      `
    )
    .bind(tokenHash)
    .first<AdminSessionRow>();

  if (!admin) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    fullName: admin.full_name,
    role: admin.role,
  };
}
