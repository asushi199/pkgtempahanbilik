# AGENTS.md

Panduan ringkas untuk ejen AI yang bekerja dalam repo ini. Lihat `CLAUDE.md` untuk butiran penuh.

## Peraturan utama
- **Multi-tenant:** setiap pertanyaan data mesti ditapis dengan `pkg_id`. Jangan tambah pertanyaan tanpa `pkgId`.
- **Jangan sentuh projek lain:** projek asal `DashboardTempahanBilik` adalah berasingan dan masih digunakan.
- **Tema:** guna pembolehubah CSS (`src/app/globals.css`); jangan hardcode warna.
- **Bahasa UI:** Bahasa Melayu.
- **Soft delete bilik** (`active=false`), jangan padam baris bilik.

## Lokasi penting
- Logik data: `src/lib/repository.ts`
- Peraturan slot/konflik: `src/lib/booking-rules.ts`
- Sesi/kata laluan admin: `src/lib/admin-session.ts`, `src/lib/pkg.ts`
- Muat naik gambar: `src/lib/storage.ts`
- Skema + seed: `supabase/schema.sql`

## Pengesahan
Jalankan `npx tsc --noEmit` dan `npm run build` sebelum menganggap kerja selesai.
