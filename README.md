# Tempahan Bilik PKG Daerah Manjung

Sistem tempahan bilik berbilang-PKG (multi-tenant) untuk Pusat Kegiatan Guru (PKG) di bawah PPD Manjung. Setiap PKG mempunyai jadual, bilik, dan admin tersendiri di bawah satu aplikasi.

PKG disokong: Sitiawan, Ayer Tawar, Seri Manjung, Beruas, Pantai Remis.

## Teknologi
- Next.js 14 (App Router) + TypeScript
- Supabase (PostgreSQL + Storage)

## Struktur URL
| Halaman | Laluan |
|---------|--------|
| Direktori semua PKG | `/` |
| Tempahan awam PKG | `/{pkg}` (cth. `/sitiawan`) |
| Semak permohonan | `/{pkg}/semak` |
| Log masuk admin | `/{pkg}/admin/login` |
| Panel admin | `/{pkg}/admin` |
| Urus bilik (admin) | `/{pkg}/admin/rooms` |
| Kelulusan token | `/{pkg}/approve/{id}` |

## Persediaan

1. **Pasang kebergantungan**
   ```bash
   npm install
   ```

2. **Konfigurasi persekitaran** — salin `.env.example` ke `.env.local` dan isi nilai (lihat fail untuk butiran).

3. **Sediakan pangkalan data** — jalankan `supabase/schema.sql` dalam Supabase SQL Editor. Ini mencipta jadual dan memasukkan 5 PKG awal.

4. **Cipta bucket gambar** — di Supabase: Storage → New bucket → nama `room-photos`, **Public = ON**.

5. **Tetapkan kata laluan admin setiap PKG** — kata laluan disimpan sebagai hash dalam `pkgs.admin_password_hash`:
   ```bash
   ADMIN_SESSION_SECRET=your-secret node scripts/hash-password.mjs "kata-laluan-pkg"
   ```
   Simpan hash yang dicetak ke lajur `admin_password_hash` PKG berkenaan, dan isi `whatsapp_admin_phone` (cth. `60123456789`).

6. **Jalankan**
   ```bash
   npm run dev
   ```

## Pengurusan bilik
Admin setiap PKG boleh menambah, mengemas kini, dan menyembunyikan bilik (termasuk muat naik gambar) di `/{pkg}/admin/rooms`. Bilik yang dipadam dinyahaktif (soft delete) supaya rekod tempahan lama kekal utuh.

## Notifikasi
Selepas tempahan dihantar, pemohon menekan butang WhatsApp untuk menghantar mesej (mengandungi pautan kelulusan) kepada nombor admin PKG tersebut secara manual. Tiada integrasi WhatsApp API.

## Tema
Antara muka menyokong mod cerah dan gelap. Suis di bahagian atas menyimpan pilihan dalam `localStorage` dan mengikut tetapan sistem secara lalai.

## Akan datang
Jadual `items` dan `item_rentals` telah disediakan untuk ciri sewaan barang pada masa hadapan.

## Skrip
- `npm run dev` — pelayan pembangunan
- `npm run build` — binaan produksi
- `npm run start` — jalankan binaan produksi
- `npm run lint` — semakan ESLint
