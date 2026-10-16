import { env } from "cloudflare:workers";

import {
  createAdminSessionCookie,
  createSessionToken,
  getSessionExpiry,
  hashSessionToken,
  verifyPassword,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type LoginBody = {
  email?: string;
  password?: string;
};

type AdminRow = {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: "admin" | "manager" | "reception";
  is_active: number;
};

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return Response.json(
      { success: false, error: "Invalid request." },
      { status: 400 }
    );
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return Response.json(
      { success: false, error: "Email and password are required." },
      { status: 400 }
    );
  }

  const db = env.zaram_hotels_db;

  const admin = await db
    .prepare(
      `
        SELECT
          id,
          email,
          password_hash,
          full_name,
          role,
          is_active
        FROM admins
        WHERE email = ?
        LIMIT 1
      `
    )
    .bind(email)
    .first<AdminRow>();

  if (
    !admin ||
    admin.is_active !== 1 ||
    !(await verifyPassword(password, admin.password_hash))
  ) {
    return Response.json(
      { success: false, error: "Invalid email or password." },
      { status: 401 }
    );
  }

  // Remove expired sessions.
  await db
    .prepare(
      `
        DELETE FROM admin_sessions
        WHERE datetime(expires_at) <= datetime('now')
      `
    )
    .run();

  const token = createSessionToken();
  const tokenHash = await hashSessionToken(token);
  const expiresAt = getSessionExpiry();

  await db
    .prepare(
      `
        INSERT INTO admin_sessions (
          admin_id,
          token_hash,
          expires_at
        )
        VALUES (?, ?, ?)
      `
    )
    .bind(admin.id, tokenHash, expiresAt)
    .run();

  return Response.json(
    {
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        role: admin.role,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": createAdminSessionCookie(token, request.url),
      },
    }
  );
}
