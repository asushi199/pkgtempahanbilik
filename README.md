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

5. **Tetapkan kata laluan admin** — satu kata laluan global untuk semua PKG, melalui env var `ADMIN_PASSWORD` dalam `.env.local`. Nombor WhatsApp setiap PKG diisi sendiri oleh admin di halaman Tetapan (`/{pkg}/admin/settings`).

6. **Jalankan**
   ```bash
   npm run dev
   ```

## Admin
Satu log masuk global di `/admin` (kata laluan `ADMIN_PASSWORD`) menguruskan semua PKG. Selepas log masuk, pilih sebuah PKG untuk masuk ke paparannya — pilihan **Admin** akan muncul di bar bawah (telefon) atau bar atas (desktop), membawa ke kelulusan tempahan, pengurusan bilik, dan tetapan. Pengguna biasa tidak nampak sebarang entri admin.

## Pengurusan bilik
Admin boleh menambah, mengemas kini, dan menyembunyikan bilik (termasuk muat naik gambar) di `/{pkg}/admin/rooms`. Bilik yang dipadam dinyahaktif (soft delete) supaya rekod tempahan lama kekal utuh.

## Notifikasi
Selepas tempahan dihantar, pemohon menekan butang WhatsApp untuk menghantar mesej (mengandungi pautan kelulusan) kepada nombor admin PKG tersebut secara manual. Tiada integrasi WhatsApp API.

## Akan datang
Jadual `items` dan `item_rentals` telah disediakan untuk ciri sewaan barang pada masa hadapan.

## Skrip
- `npm run dev` — pelayan pembangunan
- `npm run build` — binaan produksi
- `npm run start` — jalankan binaan produksi
- `npm run lint` — semakan ESLint
