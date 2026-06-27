# AI Context Log

Rekod keputusan penting projek supaya konteks tidak hilang antara sesi.

## 2026-06-26 — Penciptaan projek
- **Mengapa:** PPD Manjung mahu memperluas sistem tempahan bilik (asalnya hanya PKG Pantai Remis, hardcode, single-tenant) kepada 5 PKG: Sitiawan, Ayer Tawar, Seri Manjung, Beruas, Pantai Remis.
- **Keputusan:** bina projek baharu berasingan (`tempahan-pkg-manjung`), JANGAN ubah `DashboardTempahanBilik` yang masih beroperasi.
- **Seni bina multi-tenant:**
  - Laluan dinamik `/[pkg]/...`.
  - Jadual baharu `pkgs`, `rooms` (ganti data hardcode); `bookings` tambah `pkg_id` + `room_slug`.
  - Kata laluan admin setiap PKG (hash HMAC-SHA256 dalam `pkgs.admin_password_hash`); sesi terikat PKG.
  - Bilik diurus sendiri oleh admin + muat naik gambar ke Supabase Storage (`room-photos`). Padam = soft delete.
  - Notifikasi: kekal cara manual WhatsApp share, nombor dibaca per-PKG.
- **UI:** reka semula bergaya moden/teknologi (USTP), dwi-mod cerah/gelap melalui pembolehubah CSS.
- **Disediakan untuk masa depan:** jadual `items` + `item_rentals` untuk sewaan barang.
- **Status:** semua laluan dibina, `tsc --noEmit` lulus, `next build` berjaya (9 laluan). Belum disambung ke Supabase sebenar / belum deploy.
