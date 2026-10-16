import { env } from "cloudflare:workers";

import {
  ADMIN_SESSION_COOKIE,
  hashSessionToken,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type AdminRow = {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  is_active: number;
};

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function verifyPasswordCloudflare(
  password: string,
  storedHash: string
) {
  try {
    const parts = storedHash.split("$");

    if (parts.length !== 4) {
      return false;
    }

    const [
      algorithm,
      iterationsText,
      saltBase64,
      expectedBase64,
    ] = parts;

    if (algorithm !== "pbkdf2_sha256") {
      return false;
    }

    const iterations =
      Number(iterationsText);

    if (
      !Number.isInteger(iterations) ||
      iterations <= 0
    ) {
      return false;
    }

    const salt =
      base64ToBytes(saltBase64);

    const expected =
      base64ToBytes(expectedBase64);

    const key =
      await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(
          password
        ),
        "PBKDF2",
        false,
        ["deriveBits"]
      );

    const bits =
      await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          hash: "SHA-256",
          salt,
          iterations,
        },
        key,
        expected.length * 8
      );

    const actual =
      new Uint8Array(bits);

    if (
      actual.length !==
      expected.length
    ) {
      return false;
    }

    let difference = 0;

    for (
      let i = 0;
      i < actual.length;
      i++
    ) {
      difference |=
        actual[i] ^ expected[i];
    }

    return difference === 0;
  } catch (error) {
    console.error(
      "Password verification failed:",
      error
    );

    return false;
  }
}

function generateSessionToken() {
  const bytes =
    crypto.getRandomValues(
      new Uint8Array(32)
    );

  let binary = "";

  for (const byte of bytes) {
    binary +=
      String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export async function POST(
  request: Request
) {
  let body: {
    email?: string;
    password?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        success: false,
        error:
          "Invalid request.",
      },
      { status: 400 }
    );
  }

  const email =
    body.email
      ?.trim()
      .toLowerCase();

  const password =
    body.password ?? "";

  if (!email || !password) {
    return Response.json(
      {
        success: false,
        error:
          "Email and password are required.",
      },
      { status: 400 }
    );
  }

  const db =
    env.zaram_hotels_db;

  const admin =
    await db
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
          WHERE LOWER(email) = ?
          LIMIT 1
        `
      )
      .bind(email)
      .first<AdminRow>();

  if (
    !admin ||
    admin.is_active !== 1
  ) {
    return Response.json(
      {
        success: false,
        error:
          "Invalid email or password.",
      },
      { status: 401 }
    );
  }

  const passwordValid =
    await verifyPasswordCloudflare(
      password,
      admin.password_hash
    );

  if (!passwordValid) {
    return Response.json(
      {
        success: false,
        error:
          "Invalid email or password.",
      },
      { status: 401 }
    );
  }

  await db
    .prepare(
      `
        DELETE FROM admin_sessions
        WHERE datetime(expires_at)
          <= datetime('now')
      `
    )
    .run();

  const token =
    generateSessionToken();

  const tokenHash =
    await hashSessionToken(token);

  const expiresAt =
    new Date(
      Date.now() +
        12 * 60 * 60 * 1000
    ).toISOString();

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
    .bind(
      admin.id,
      tokenHash,
      expiresAt
    )
    .run();

  const secure =
    new URL(request.url)
      .protocol === "https:";

  const cookie = [
    `${ADMIN_SESSION_COOKIE}=${token}`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    "Max-Age=43200",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  return Response.json(
    {
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName:
          admin.full_name,
        role: admin.role,
      },
    },
    {
      headers: {
        "Set-Cookie": cookie,
      },
    }
  );
}
