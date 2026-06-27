import Link from "next/link";

type Tab = "jadual" | "semak";

/**
 * Mobile-only fixed bottom navigation. Frees the header to show just the
 * logo + name. "Home" returns to the PKG directory; "Tempah" opens the
 * booking sheet via the #tempah hash. Admin is intentionally not exposed
 * to public users — admins use the /[pkg]/admin URL directly.
 */
export function MobileTabBar({ pkgId, active }: { pkgId: string; active: Tab }) {
  const base = `/${pkgId}`;

  return (
    <nav aria-label="Navigasi" className="mobileTabBar">
      <Link className="mobileTab" href="/">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 11l9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </svg>
        Home
      </Link>

      <Link className={`mobileTab${active === "jadual" ? " active" : ""}`} href={base}>
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect height="18" rx="2" width="18" x="3" y="4" />
          <path d="M3 10h18M8 2v4M16 2v4" />
        </svg>
        Jadual
      </Link>

      <a className="mobileTab tempahTab" href={`${base}#tempah`}>
        <svg fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
        Tempah
      </a>

      <Link className={`mobileTab${active === "semak" ? " active" : ""}`} href={`${base}/semak`}>
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        Semak
      </Link>
    </nav>
  );
}
