// One-shot fix: set a strong ADMIN_SESSION_SECRET, regenerate the admin
// password hash, and update all PKG rows in Supabase to match.
//
// Usage: node scripts/fix-secret.mjs "ustpmanjung"

import { createClient } from "@supabase/supabase-js";
import { createHmac, randomBytes } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = join(here, "..", ".env.local");

const password = process.argv[2] || "ustpmanjung";

// Parse .env.local
const raw = readFileSync(envPath, "utf8");
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

// Generate a strong new secret
const newSecret = randomBytes(32).toString("hex");

// Rewrite the ADMIN_SESSION_SECRET line (or append if missing)
let updated;
if (/^\s*ADMIN_SESSION_SECRET\s*=.*$/m.test(raw)) {
  updated = raw.replace(/^\s*ADMIN_SESSION_SECRET\s*=.*$/m, `ADMIN_SESSION_SECRET=${newSecret}`);
} else {
  updated = raw.trimEnd() + `\nADMIN_SESSION_SECRET=${newSecret}\n`;
}
writeFileSync(envPath, updated, "utf8");
console.log("✓ .env.local: ADMIN_SESSION_SECRET ditetapkan kepada nilai rawak yang kuat.");

// Compute the hash with the new secret
const hash = createHmac("sha256", newSecret).update(password).digest("hex");

// Update all PKG rows (service role bypasses RLS)
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const { data, error } = await supabase
  .from("pkgs")
  .update({ admin_password_hash: hash })
  .neq("id", "")
  .select("id");

if (error) {
  console.error("✗ Gagal mengemas kini pkgs:", error.message);
  process.exit(1);
}

console.log(`✓ ${data.length} PKG dikemas kini dengan kata laluan "${password}".`);
console.log("\nLangkah seterusnya: MULAKAN SEMULA dev server supaya secret baharu dimuatkan.\n");
