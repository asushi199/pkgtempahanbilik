// Generates the admin_password_hash for a PKG.
// Usage:
//   ADMIN_SESSION_SECRET=your-secret node scripts/hash-password.mjs "the-password"
// Then store the printed hash in pkgs.admin_password_hash for that PKG.

import { createHmac } from "crypto";

const secret = process.env.ADMIN_SESSION_SECRET;
const password = process.argv[2];

if (!secret) {
  console.error("Missing ADMIN_SESSION_SECRET env var (must match the deployed value).");
  process.exit(1);
}
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "the-password"');
  process.exit(1);
}

const hash = createHmac("sha256", secret).update(password).digest("hex");
console.log(hash);
