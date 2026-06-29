import Link from "next/link";

type Tab = "bilik" | "semak";

/**
 * Mobile-only fixed bottom navigation. "Home" returns to the PKG directory;
 * "Bilik" returns to the room gallery to pick a room; "Tempah" opens the
 * booking sheet on the current page (only the room detail page has the form —
 * elsewhere it is a no-op). When an admin is logged in, an extra "Admin" tab
 * appears (regular users never see it).
 */
export function MobileTabBar({
  pkgId,
  active,
  isAdmin = false
}: {
  pkgId: string;
  active: Tab;
  isAdmin?: boolean;
}) {
  const base = `/${pkgId}`;

  return (
    <nav
      aria-label="Navigasi"
      className={`mobileTabBar${isAdmin ? " mobileTabBar--admin" : ""}`}
    >
      <Link className="mobileTab" href="/">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 11l9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </svg>
        Home
      </Link>

      <Link className={`mobileTab${active === "bilik" ? " active" : ""}`} href={base}>
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect height="7" rx="1.5" width="7" x="3" y="3" />
          <rect height="7" rx="1.5" width="7" x="14" y="3" />
          <rect height="7" rx="1.5" width="7" x="3" y="14" />
          <rect height="7" rx="1.5" width="7" x="14" y="14" />
        </svg>
        Bilik
      </Link>

      <a className="mobileTab tempahTab" href="#tempah">
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

      {isAdmin ? (
        <Link className="mobileTab adminTab" href={`${base}/admin`}>
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" />
          </svg>
          Admin
        </Link>
      ) : null}
    </nav>
  );
}
