# Panduan Projek — Tempahan PKG Manjung

## Konteks
Aplikasi tempahan bilik berbilang-PKG (multi-tenant) untuk PKG Daerah Manjung. Dibina baharu, berasingan daripada projek asal `DashboardTempahanBilik` (yang hanya untuk PKG Pantai Remis dan masih digunakan — JANGAN sentuh projek itu).

## Seni bina
- Next.js 14 App Router + TypeScript, Supabase (PostgreSQL + Storage).
- Multi-tenant melalui laluan dinamik `src/app/[pkg]/...`. Setiap PKG ialah satu baris dalam jadual `pkgs`.
- **Setiap pertanyaan pangkalan data mesti ditapis dengan `pkg_id`.** Lihat `src/lib/repository.ts` — semua fungsi menerima `pkgId`.
- Bilik disimpan dalam jadual `rooms` (bukan hardcode), diurus sendiri oleh admin setiap PKG.
- Sesi admin terikat pada PKG (cookie `pkg_admin_{pkgId}`, lihat `src/lib/admin-session.ts`).

## Prinsip
- Kekalkan tapisan `pkg_id` pada setiap operasi data — jangan bocorkan data antara PKG.
- Guna pembolehubah CSS dalam `globals.css` untuk warna/jarak; jangan tulis warna secara terus (sokong mod cerah/gelap).
- Kekalkan teks UI dalam Bahasa Melayu.
- Padam bilik = soft delete (`active=false`), bukan padam sebenar — lindungi rekod tempahan lama.
- Logik konflik slot dalam `src/lib/booking-rules.ts`; trigger pangkalan data dalam `supabase/schema.sql` turut menguatkuasakannya.

## Pembangunan
- `npm run dev`, `npm run build`, `npx tsc --noEmit` untuk semakan jenis.
- Selepas perubahan, sahkan dengan `npm run build`.

## Bahasa
Balas pengguna dalam Bahasa Cina (ikut tetapan global pengguna).
