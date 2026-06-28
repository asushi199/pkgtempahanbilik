import { timingSafeEqual } from "crypto";
import { getPkg } from "./repository";
import type { Pkg } from "./types";

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

/** Verifies the single global admin password (ADMIN_PASSWORD env var). */
export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password) return false;

  const actual = Buffer.from(password);
  const expectedBuffer = Buffer.from(expected);

  if (actual.length !== expectedBuffer.length) return false;
  return timingSafeEqual(actual, expectedBuffer);
}
