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
        <Link href="/admin">Tukar PKG</Link>
        <Link href={`/${pkgId}`}>Jadual</Link>
      </div>
    </nav>
  );
}
