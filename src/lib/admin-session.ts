import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "tempahan-dev-secret";
}

function cookieName(pkgId: string) {
  return `pkg_admin_${pkgId}`;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function createToken(pkgId: string) {
  const payload = `admin:${pkgId}`;
  return `${payload}.${sign(payload)}`;
}

function isValidToken(pkgId: string, token?: string) {
  if (!token) return false;

  const lastDot = token.lastIndexOf(".");
  if (lastDot < 0) return false;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  if (payload !== `admin:${pkgId}` || !signature) return false;

  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

export function isAdminSession(pkgId: string) {
  return isValidToken(pkgId, cookies().get(cookieName(pkgId))?.value);
}

export function setAdminSession(pkgId: string) {
  cookies().set(cookieName(pkgId), createToken(pkgId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/${pkgId}`,
    maxAge: 60 * 60 * 8
  });
}

export function clearAdminSession(pkgId: string) {
  cookies().delete(cookieName(pkgId));
}
