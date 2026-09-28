import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "class-admin-session";
const sessionLifetimeSeconds = 60 * 60 * 12;

export function hasAdminAuthConfig() {
  return Boolean(
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_PASSWORD.length >= 12 &&
    process.env.ADMIN_SESSION_SECRET &&
    process.env.ADMIN_SESSION_SECRET.length >= 32,
  );
}

function sessionSignature(expiresAt: number) {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || !secret) throw new Error("إعدادات دخول لوحة الإدارة غير مكتملة.");

  const passwordHash = createHash("sha256").update(password).digest("hex");
  return createHmac("sha256", secret)
    .update(`${expiresAt}:${passwordHash}`)
    .digest("base64url");
}

export async function createAdminSession(candidate: unknown) {
  const password = process.env.ADMIN_PASSWORD;
  if (!hasAdminAuthConfig() || typeof candidate !== "string" || candidate.length > 1024) {
    return false;
  }

  const expectedHash = createHash("sha256").update(password!).digest();
  const candidateHash = createHash("sha256").update(candidate).digest();
  if (!timingSafeEqual(expectedHash, candidateHash)) return false;

  const expiresAt = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds;
  const cookieStore = await cookies();
  cookieStore.set(cookieName, `${expiresAt}.${sessionSignature(expiresAt)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionLifetimeSeconds,
  });
  return true;
}

export async function isAdminAuthenticated() {
  if (!hasAdminAuthConfig()) return false;

  const value = (await cookies()).get(cookieName)?.value;
  if (!value) return false;

  const [expiresAtValue, signature] = value.split(".");
  const expiresAt = Number(expiresAtValue);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000) || !signature) {
    return false;
  }

  const expected = Buffer.from(sessionSignature(expiresAt));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function clearAdminSession() {
  (await cookies()).delete(cookieName);
}