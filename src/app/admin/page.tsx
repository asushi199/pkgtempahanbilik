import Link from "next/link";
import { AdminLoginForm } from "../../components/AdminLoginForm";
import { isAdminSession } from "../../lib/admin-session";
import { listPkgs } from "../../lib/repository";
import { isSupabaseConfigured } from "../../lib/supabase";
import type { Pkg } from "../../lib/types";
import { logoutAction } from "./actions";

function initials(name: string) {
  return name
    .replace(/^PKG\s+/i, "")
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function AdminHomePage() {
  if (!isAdminSession()) {
    return (
      <main className="authShell">
        <section className="authCard">
          <p className="eyebrow">Panel Admin</p>
          <h1>Log Masuk Admin</h1>
          <p>Masukkan kata laluan admin untuk mengurus tempahan semua PKG.</p>
          <AdminLoginForm />
          <Link className="textLink" href="/">
            Kembali ke laman utama
          </Link>
        </section>
      </main>
    );
  }

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
        <Link className="brandMark" href="/">
          <img alt="USTP Manjung" className="brandLogo" src="/ustp-manjung.png" />
          <strong>Panel Admin</strong>
        </Link>
        <div className="topNavLinks">
          <Link href="/">Laman Utama</Link>
          <form action={logoutAction}>
            <button className="dangerButton" type="submit">
              Log keluar
            </button>
          </form>
        </div>
      </nav>

      <section className="dashboardHeader">
        <div>
          <p className="eyebrow">Mod Admin</p>
          <h1>Pilih PKG untuk diurus</h1>
          <p className="heroText">
            Pilih sebuah PKG untuk masuk ke paparannya. Pilihan admin akan muncul di dalam paparan
            tersebut.
          </p>
        </div>
      </section>

      {error ? <div className="notice error">Data tidak dapat dibaca: {error}</div> : null}

      <section className="pkgGrid" aria-label="Senarai PKG">
        {pkgs.map((pkg) => (
          <Link className="pkgCard" href={`/${pkg.id}`} key={pkg.id}>
            {pkg.logo_src ? (
              <img alt={pkg.name} className="pkgCardLogo" src={pkg.logo_src} />
            ) : (
              <span className="pkgCardMark">{initials(pkg.name)}</span>
            )}
            <h2>{pkg.name}</h2>
            <span className="pkgCardGo">Masuk paparan →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
