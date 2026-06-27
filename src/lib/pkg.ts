import { createHmac, timingSafeEqual } from "crypto";
import { getPkg, getPkgAdminHash } from "./repository";
import type { Pkg } from "./types";

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "tempahan-dev-secret";
}

/** Deterministic HMAC-SHA256 hash of an admin password, stored in pkgs.admin_password_hash. */
export function hashAdminPassword(password: string) {
  return createHmac("sha256", getSecret()).update(password).digest("hex");
}

export function isValidPkgSlug(value: string) {
  return /^[a-z0-9]+$/.test(value);
}

/** Loads a PKG by slug; returns null if missing or inactive. */
export async function loadPkg(pkgId: string): Promise<Pkg | null> {
  if (!isValidPkgSlug(pkgId)) return null;
  const pkg = await getPkg(pkgId);
  if (!pkg || !pkg.active) return null;
  return pkg;
}

export async function verifyPkgAdminPassword(pkgId: string, password: string) {
  if (!password) return false;

  const storedHash = await getPkgAdminHash(pkgId);
  if (!storedHash) return false;

  const actual = Buffer.from(hashAdminPassword(password));
  const expected = Buffer.from(storedHash);

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
