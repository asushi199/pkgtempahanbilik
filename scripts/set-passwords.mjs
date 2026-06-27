// Generates a ready-to-paste SQL statement that sets ALL PKG admin passwords
// to the same value. Reads ADMIN_SESSION_SECRET from .env.local automatically.
//
// Usage:
//   node scripts/set-passwords.mjs "your-admin-password"
//
// Then copy the printed SQL into Supabase → SQL Editor → Run.

import { createHmac } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = join(here, "..", ".env.local");

function readSecret() {
  // Prefer the live env var if present, otherwise parse .env.local.
  if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET.trim();

  let content;
  try {
    content = readFileSync(envPath, "utf8");
  } catch {
    return null;
  }

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*ADMIN_SESSION_SECRET\s*=\s*(.*)$/);
    if (match) {
      return match[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  return null;
}

const password = process.argv[2];
const secret = readSecret();

if (!secret) {
  console.error("Tidak jumpa ADMIN_SESSION_SECRET dalam .env.local.");
  process.exit(1);
}
if (!password) {
  console.error('Penggunaan: node scripts/set-passwords.mjs "kata-laluan-anda"');
  process.exit(1);
}

const hash = createHmac("sha256", secret).update(password).digest("hex");

console.log("\n-- Salin SQL di bawah ke Supabase SQL Editor, kemudian Run:\n");
console.log(`update public.pkgs set admin_password_hash = '${hash}';\n`);
