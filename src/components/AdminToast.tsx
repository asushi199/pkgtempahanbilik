"use client";

import { useEffect, useState } from "react";

/**
 * Floating, auto-dismissing status toast for admin actions. Stays visible
 * regardless of scroll position (the inline banner at the top of a long page
 * is easy to miss after editing a room deep in the list). Also strips the
 * `status` query param so a refresh does not show it again.
 */
export function AdminToast({ text, tone }: { text: string; tone: "success" | "error" }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("status")) {
      url.searchParams.delete("status");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
    const timer = setTimeout(() => setShow(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div aria-live="polite" className={`adminToast notice ${tone}`} role="status">
      {text}
      <button aria-label="Tutup" className="adminToastClose" onClick={() => setShow(false)} type="button">
        ×
      </button>
    </div>
  );
}
