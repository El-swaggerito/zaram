export const ADMIN_SESSION_COOKIE = "zaram_admin_session";

export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const PBKDF2_ITERATIONS = 600_000;
const PBKDF2_KEY_LENGTH = 32;
const SALT_LENGTH = 16;

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < a.length; index += 1) {
    difference |= a[index] ^ b[index];
  }

  return difference === 0;
}

async function derivePasswordHash(
  password: string,
  salt: Uint8Array,
  iterations: number
) {
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations,
    },
    passwordKey,
    PBKDF2_KEY_LENGTH * 8
  );

  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  if (password.length < 12) {
    throw new Error("Admin passwords must be at least 12 characters long.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  const hash = await derivePasswordHash(
    password,
    salt,
    PBKDF2_ITERATIONS
  );

  return [
    "pbkdf2_sha256",
    PBKDF2_ITERATIONS,
    bytesToBase64(salt),
    bytesToBase64(hash),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  storedHash: string
) {
  const parts = storedHash.split("$");

  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") {
    return false;
  }

  const iterations = Number(parts[1]);

  if (
    !Number.isInteger(iterations) ||
    iterations < 100_000 ||
    iterations > 2_000_000
  ) {
    return false;
  }

  try {
    const salt = base64ToBytes(parts[2]);
    const expectedHash = base64ToBytes(parts[3]);

    const actualHash = await derivePasswordHash(
      password,
      salt,
      iterations
    );

    return constantTimeEqual(actualHash, expectedHash);
  } catch {
    return false;
  }
}

export function createSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToBase64(bytes)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export async function hashSessionToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token)
  );

  return bytesToHex(new Uint8Array(digest));
}

export function getSessionExpiry() {
  return new Date(
    Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000
  ).toISOString();
}

export function getCookieValue(
  cookieHeader: string | null,
  name: string
) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

export function createAdminSessionCookie(
  token: string,
  requestUrl: string
) {
  const secure =
    new URL(requestUrl).protocol === "https:" ? "; Secure" : "";

  return [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    `Max-Age=${ADMIN_SESSION_TTL_SECONDS}`,
  ].join("; ") + secure;
}

export function clearAdminSessionCookie(requestUrl: string) {
  const secure =
    new URL(requestUrl).protocol === "https:" ? "; Secure" : "";

  return [
    `${ADMIN_SESSION_COOKIE}=`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    "Max-Age=0",
  ].join("; ") + secure;
}
