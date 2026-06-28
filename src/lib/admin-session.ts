import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "pkg_admin";

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "tempahan-dev-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function createToken() {
  const payload = "admin";
  return `${payload}.${sign(payload)}`;
}

function isValidToken(token?: string) {
  if (!token) return false;

  const lastDot = token.lastIndexOf(".");
  if (lastDot < 0) return false;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  if (payload !== "admin" || !signature) return false;

  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

/** A single global admin session covers all PKGs. */
export function isAdminSession() {
  return isValidToken(cookies().get(COOKIE_NAME)?.value);
}

export function setAdminSession() {
  cookies().set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function clearAdminSession() {
  cookies().delete(COOKIE_NAME);
}
