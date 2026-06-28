import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBookingTable } from "../../../components/AdminBookingTable";
import { AdminTopNav } from "../../../components/AdminTopNav";
import { isAdminSession } from "../../../lib/admin-session";
import { loadPkg } from "../../../lib/pkg";
import { listAllBookings, listRooms } from "../../../lib/repository";
import type { Booking, Room } from "../../../lib/types";
import { logoutAction } from "./actions";

type SearchParams = {
  status?: string;
};

const messages: Record<string, string> = {
  updated: "Tempahan berjaya dikemas kini.",
  cancelled: "Tempahan berjaya dibatalkan.",
  approved: "Tempahan berjaya diluluskan.",
  rejected: "Tempahan berjaya ditolak.",
  conflict: "Tempahan tidak dikemas kini kerana slot tersebut sudah ditempah.",
  missing: "Sila lengkapkan semua maklumat."
};

export default async function AdminPage({
  params,
  searchParams
}: {
  params: { pkg: string };
  searchParams: SearchParams;
}) {
  const pkgId = params.pkg;
  const base = `/${pkgId}`;

  if (!isAdminSession()) {
    redirect("/admin");
  }

  const pkg = (await loadPkg(pkgId))!;

  let bookings: Booking[] = [];
  let rooms: Room[] = [];
  let dataError = "";
  try {
    [bookings, rooms] = await Promise.all([listAllBookings(pkgId), listRooms(pkgId, true)]);
  } catch (error) {
    dataError = error instanceof Error ? error.message : "Gagal membaca data tempahan.";
  }
  const message = searchParams.status ? messages[searchParams.status] : "";

  return (
    <main className="shell">
      <AdminTopNav pkg={pkg} pkgId={pkgId} />
      <section className="adminTop">
        <div>
          <p className="eyebrow">Panel Admin · {pkg.name}</p>
          <h1>Urus Tempahan Bilik</h1>
          <p>Kemas kini atau batalkan rekod tempahan untuk {pkg.name}.</p>
        </div>
        <div className="heroActions">
          <Link className="ghostButton" href={`${base}/admin/rooms`}>
            Urus Bilik
          </Link>
          <Link className="ghostButton" href={`${base}/admin/settings`}>
            Tetapan
          </Link>
          <form action={logoutAction}>
            <input name="pkg" type="hidden" value={pkgId} />
            <button className="dangerButton" type="submit">
              Log keluar
            </button>
          </form>
        </div>
      </section>

      {message ? (
        <div className={searchParams.status === "conflict" ? "notice error" : "notice success"}>{message}</div>
      ) : null}
      {dataError ? (
        <div className="notice error">Data Supabase tidak dapat dibaca: {dataError}.</div>
      ) : null}

      <AdminBookingTable bookings={bookings} pkgId={pkgId} rooms={rooms} />
    </main>
  );
}
