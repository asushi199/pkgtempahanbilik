import Link from "next/link";
import { logoutAction } from "../app/[pkg]/admin/actions";

/**
 * Slim "admin mode" toolbar shown on public pages ONLY when an admin session
 * is active. Gives logged-in admins access to management tools + logout, while
 * regular users see nothing. Rendered on both mobile and desktop.
 */
export function AdminBar({ pkgId }: { pkgId: string }) {
  const base = `/${pkgId}`;

  return (
    <div className="adminBar">
      <span className="adminBarLabel">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" />
        </svg>
        Mod Admin
      </span>
      <div className="adminBarLinks">
        <Link href={`${base}/admin`}>Tempahan</Link>
        <Link href={`${base}/admin/rooms`}>Urus Bilik</Link>
        <Link href={`${base}/admin/settings`}>Tetapan</Link>
        <form action={logoutAction}>
          <input name="pkg" type="hidden" value={pkgId} />
          <button className="adminBarLogout" type="submit">
            Log keluar
          </button>
        </form>
      </div>
    </div>
  );
}
