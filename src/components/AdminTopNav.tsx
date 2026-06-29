import Link from "next/link";
import type { Pkg } from "../lib/types";

/**
 * Persistent top bar for admin pages. The clickable logo + name returns to the
 * home directory (/), giving a consistent "home" affordance across admin pages.
 */
export function AdminTopNav({ pkg, pkgId }: { pkg: Pkg; pkgId: string }) {
  return (
    <nav className="topNav">
      <Link className="brandMark" href="/">
        <img alt={pkg.name} className="brandLogo" src={pkg.logo_src ?? "/ustp-manjung.png"} />
        <strong>{pkg.name}</strong>
      </Link>
      <div className="topNavLinks">
        <Link aria-label="Tukar PKG" className="navIconLink" href="/admin" title="Tukar PKG">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 11l9-8 9 8" />
            <path d="M5 10v10h14V10" />
          </svg>
        </Link>
        <Link href={`/${pkgId}`}>Bilik</Link>
      </div>
    </nav>
  );
}
