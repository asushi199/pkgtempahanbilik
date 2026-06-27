// Diagnoses admin login: compares the hash the app would compute for a given
// password against what is stored in pkgs.admin_password_hash.
//
// Usage: node scripts/diagnose-login.mjs "ustpmanjung"

import { createClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const here = dirname(fileURLToPath(import.meta.url));
const env = {};
try {
  for (const line of readFileSync(join(here, "..", ".env.local"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
} catch {
  console.error("Tidak jumpa .env.local");
  process.exit(1);
}

const password = process.argv[2] || "ustpmanjung";
const secret = env.ADMIN_SESSION_SECRET || "tempahan-dev-secret";
const expected = createHmac("sha256", secret).update(password).digest("hex");

console.log("\nADMIN_SESSION_SECRET (length):", secret.length, secret ? "(set)" : "(MISSING)");
console.log(`Hash dijangka untuk "${password}":`, expected, "\n");

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const { data, error } = await supabase.from("pkgs").select("id, admin_password_hash");
if (error) {
  console.error("Ralat membaca pkgs:", error.message);
  process.exit(1);
}

for (const row of data) {
  const stored = row.admin_password_hash;
  const match = stored === expected ? "✅ SEPADAN" : stored ? "❌ tidak sepadan" : "⚠️ kosong (NULL)";
  console.log(`  ${row.id.padEnd(14)} ${match}`);
  if (stored && stored !== expected) console.log(`     tersimpan: ${stored}`);
}
console.log("");
