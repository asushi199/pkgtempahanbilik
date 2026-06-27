import Link from "next/link";
import { listPkgs } from "../lib/repository";
import { isSupabaseConfigured } from "../lib/supabase";
import type { Pkg } from "../lib/types";

function initials(name: string) {
  return name
    .replace(/^PKG\s+/i, "")
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function DirectoryPage() {
  const configured = isSupabaseConfigured();
  let pkgs: Pkg[] = [];
  let error = "";

  if (configured) {
    try {
      pkgs = await listPkgs();
    } catch (err) {
      error = err instanceof Error ? err.message : "Gagal membaca senarai PKG.";
    }
  }

  return (
    <main className="shell">
      <nav className="topNav">
        <span className="brandMark">
          <img alt="USTP Manjung" className="brandLogo" src="/ustp-manjung.png" />
          <strong>Tempahan Bilik · Daerah Manjung</strong>
        </span>
        <div className="topNavLinks">
          <span className="eyebrow">PPD Manjung</span>
        </div>
      </nav>

      <section className="dashboardHeader">
        <div>
          <p className="eyebrow">PPD Manjung · USTP</p>
          <h1>Sistem Tempahan Bilik PKG</h1>
          <p className="heroText">
            Pilih Pusat Kegiatan Guru (PKG) untuk menyemak jadual dan membuat tempahan bilik.
          </p>
        </div>
      </section>

      {!configured ? (
        <div className="notice warning">
          Supabase belum dikonfigurasi. Sila isi <code>SUPABASE_URL</code> dan{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> dalam <code>.env.local</code>.
        </div>
      ) : null}

      {error ? <div className="notice error">Data tidak dapat dibaca: {error}</div> : null}

      {configured && !error && pkgs.length === 0 ? (
        <div className="notice warning">
          Tiada PKG aktif. Jalankan <code>supabase/schema.sql</code> untuk memasukkan data awal.
        </div>
      ) : null}

      <section className="pkgGrid" aria-label="Senarai PKG">
        {pkgs.map((pkg) => (
          <Link className="pkgCard" href={`/${pkg.id}`} key={pkg.id}>
            {pkg.logo_src ? (
              <img alt={pkg.name} className="pkgCardLogo" src={pkg.logo_src} />
            ) : (
              <span className="pkgCardMark">{initials(pkg.name)}</span>
            )}
            <h2>{pkg.name}</h2>
            <span className="pkgCardGo">Buka tempahan →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
