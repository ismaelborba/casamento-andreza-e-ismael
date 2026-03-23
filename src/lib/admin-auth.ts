const encoder = new TextEncoder();

export const ADMIN_EMAIL =
  (process.env.ADMIN_EMAIL ?? "casamento.ismaeleandreza@gmail.com").trim().toLowerCase();
export const ADMIN_COOKIE_NAME = "andreza_ismael_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  email: string;
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD;

  if (!secret) {
    throw new Error("ADMIN_PASSWORD or ADMIN_SESSION_SECRET must be configured.");
  }

  return secret;
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(input: Uint8Array) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";

  for (let index = 0; index < input.length; index += 3) {
    const a = input[index] ?? 0;
    const b = input[index + 1] ?? 0;
    const c = input[index + 2] ?? 0;
    const triple = (a << 16) | (b << 8) | c;

    output += chars[(triple >> 18) & 63];
    output += chars[(triple >> 12) & 63];
    output += index + 1 < input.length ? chars[(triple >> 6) & 63] : "=";
    output += index + 2 < input.length ? chars[triple & 63] : "=";
  }

  return output.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const bytes: number[] = [];

  for (let index = 0; index < padded.length; index += 4) {
    const a = chars.indexOf(padded[index] ?? "A");
    const b = chars.indexOf(padded[index + 1] ?? "A");
    const c = padded[index + 2] === "=" ? -1 : chars.indexOf(padded[index + 2]);
    const d = padded[index + 3] === "=" ? -1 : chars.indexOf(padded[index + 3]);
    const triple =
      ((a & 63) << 18) |
      ((b & 63) << 12) |
      (((c === -1 ? 0 : c) & 63) << 6) |
      ((d === -1 ? 0 : d) & 63);

    bytes.push((triple >> 16) & 255);

    if (c !== -1) {
      bytes.push((triple >> 8) & 255);
    }

    if (d !== -1) {
      bytes.push(triple & 255);
    }
  }

  return new Uint8Array(bytes);
}

async function sign(value: string) {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

export function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createAdminSessionToken(email: string) {
  const payload: SessionPayload = {
    email: normalizeAdminEmail(email),
    exp: Date.now() + SESSION_TTL_MS,
  };

  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await sign(encodedPayload);

  if (expectedSignature !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(encodedPayload)),
    ) as SessionPayload;

    if (!payload.email || payload.exp <= Date.now()) {
      return null;
    }

    if (normalizeAdminEmail(payload.email) !== ADMIN_EMAIL) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function isAdminPasswordValid(password: string) {
  return password === process.env.ADMIN_PASSWORD;
}
