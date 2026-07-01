"use client";

import { useState } from "react";
import { AdminToast } from "./AdminToast";

/**
 * The button collapses to an icon-only circle on narrow screens (see
 * .exportButton in globals.css), so a toast confirms the download actually
 * started — the icon alone isn't enough feedback on mobile.
 */
export function ExportCsvButton({ href }: { href: string }) {
  const [toastKey, setToastKey] = useState(0);

  return (
    <>
      <a
        aria-label="Muat turun CSV"
        className="primaryButton exportButton"
        download
        href={href}
        onClick={() => setToastKey((key) => key + 1)}
        title="Muat turun CSV"
      >
        <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 3v12" />
          <path d="M7.5 10.5 12 15l4.5-4.5" />
          <path d="M4 19.5h16" />
        </svg>
        <span className="btnLabel">Muat turun CSV</span>
      </a>
      {toastKey > 0 ? <AdminToast key={toastKey} text="CSV sedang dimuat turun." tone="success" /> : null}
    </>
  );
}
