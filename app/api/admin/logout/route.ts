import { env } from "cloudflare:workers";

import {
  ADMIN_SESSION_COOKIE,
  clearAdminSessionCookie,
  getCookieValue,
  hashSessionToken,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const token = getCookieValue(
    request.headers.get("cookie"),
    ADMIN_SESSION_COOKIE
  );

  if (token) {
    const tokenHash = await hashSessionToken(token);

    await env.zaram_hotels_db
      .prepare(
        `
          DELETE FROM admin_sessions
          WHERE token_hash = ?
        `
      )
      .bind(tokenHash)
      .run();
  }

  return Response.json(
    { success: true },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": clearAdminSessionCookie(request.url),
      },
    }
  );
}
