import Link from "next/link";
import { BookingForm } from "../../components/BookingForm";
import { CalendarBoard } from "../../components/CalendarBoard";
import { MobileTabBar } from "../../components/MobileTabBar";
import { isAdminSession } from "../../lib/admin-session";
import { getSlotBooking } from "../../lib/booking-rules";
import {
  addDays,
  addMonths,
  formatMalayDate,
  listDateRange,
  startOfMonth,
  startOfWeek,
  toIsoDate
} from "../../lib/date";
import { loadPkg } from "../../lib/pkg";
import { listActiveBookings, listRooms } from "../../lib/repository";
import { isSupabaseConfigured } from "../../lib/supabase";
import type { Booking, Room } from "../../lib/types";

type SearchParams = {
  room?: string;
  view?: string;
  start?: string;
};

function buildRoomSummaries(rooms: Room[], bookings: Booking[], dates: string[]) {
  return rooms.map((room) => {
    let pending = 0;
    let approved = 0;

    for (const date of dates) {
      for (const slot of ["am", "pm"] as const) {
        const booking = getSlotBooking(bookings, room.slug, date, slot);
        if (booking?.status === "pending") pending += 1;
        if (booking?.status === "approved") approved += 1;
      }
    }

    const totalSlots = dates.length * 2;
    return {
      ...room,
      approved,
      available: Math.max(totalSlots - pending - approved, 0),
      pending
    };
  });
}

export default async function PkgHomePage({
  params,
  searchParams
}: {
  params: { pkg: string };
  searchParams: SearchParams;
}) {
  const pkgId = params.pkg;
  const pkg = (await loadPkg(pkgId))!; // layout already guards existence
  const isAdmin = isAdminSession();
  const configured = isSupabaseConfigured();

  let rooms: Room[] = [];
  let bookings: Booking[] = [];
  let bookingError = "";

  if (configured) {
    try {
      [rooms, bookings] = await Promise.all([listRooms(pkgId), listActiveBookings(pkgId)]);
    } catch (error) {
      bookingError = error instanceof Error ? error.message : "Gagal membaca data tempahan.";
    }
  }

  const today = toIsoDate(new Date());
  const view = searchParams.view === "month" ? "month" : "week";
  const baseStart = searchParams.start || today;
  const start = view === "month" ? startOfMonth(baseStart) : startOfWeek(baseStart);
  const activeMobileRoom = rooms.find((room) => room.slug === searchParams.room)?.slug ?? rooms[0]?.slug ?? "";
  const dates = listDateRange(start, view === "month" ? 30 : 7);
  const previousStart = view === "month" ? addMonths(start, -1) : addDays(start, -7);
  const nextStart = view === "month" ? addMonths(start, 1) : addDays(start, 7);

  const roomSummaries = buildRoomSummaries(rooms, bookings, dates);
  const base = `/${pkgId}`;

  return (
    <main className="shell">
      <nav className="topNav topNav--public">
        <Link className="brandMark" href="/">
          <img alt={pkg.name} className="brandLogo" src={pkg.logo_src ?? "/ustp-manjung.png"} />
          <strong>{pkg.name}</strong>
        </Link>
        <div className="topNavLinks">
          <Link href="/">Laman Utama</Link>
          <Link href={`${base}/semak`}>Semak</Link>
          {isAdmin ? (
            <Link className="navAdminLink" href={`${base}/admin`}>
              Admin
            </Link>
          ) : null}
        </div>
      </nav>

      <section className="dashboardHeader">
        <div>
          <p className="eyebrow">{pkg.name}</p>
          <h1>Tempahan Bilik {pkg.name}</h1>
          <p className="heroText">
            Pilih bilik, semak slot kosong dan hantar permohonan untuk kelulusan admin.
          </p>
        </div>
        <div className="heroActions compactActions">
          <Link className="ghostButton" href={`${base}/semak`}>
            Semak Permohonan
          </Link>
          <Link className="primaryButton" href="#tempah">
            Tempah Sekarang
          </Link>
        </div>
      </section>

      {!configured ? (
        <div className="notice warning">
          Supabase belum dikonfigurasi. Jadual boleh dipratonton, tetapi penghantaran tempahan
          memerlukan tetapan dalam <code>.env.local</code>.
        </div>
      ) : null}

      {bookingError ? (
        <div className="notice error">
          Data Supabase tidak dapat dibaca: {bookingError}. Sila semak sambungan, service role key,
          dan pastikan <code>supabase/schema.sql</code> sudah dijalankan.
        </div>
      ) : null}

      {configured && !bookingError && rooms.length === 0 ? (
        <div className="notice warning">
          Belum ada bilik untuk PKG ini. Admin boleh menambah bilik di{" "}
          <Link className="textLink" href={`${base}/admin/rooms`}>
            panel pengurusan bilik
          </Link>
          .
        </div>
      ) : null}

      {rooms.length > 0 ? (
        <>
          <section className="roomSummaryGrid" aria-label="Ringkasan status bilik">
            {roomSummaries.map((room) => (
              <article className="roomSummaryCard" key={room.id}>
                {room.image_src ? (
                  <img alt={`${room.name} - ${room.category}`} className="roomSummaryImage" src={room.image_src} />
                ) : (
                  <div className="roomSummaryImage placeholder">Tiada gambar</div>
                )}
                <div className="roomSummaryBody">
                  <div>
                    <p className="eyebrow">Paparan {view === "month" ? "bulan" : "minggu"} ini</p>
                    <h2>{room.name}</h2>
                    <p>{room.category}</p>
                  </div>
                  <div className="summaryMetrics">
                    <span>
                      <strong>{room.available}</strong>
                      Kosong
                    </span>
                    <span>
                      <strong>{room.pending}</strong>
                      Menunggu
                    </span>
                    <span>
                      <strong>{room.approved}</strong>
                      Diluluskan
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="workspace">
            <div className="schedulePanel" id="jadual">
              <div className="panelHeader">
                <div className="scheduleIntro">
                  <p className="eyebrow">Status tempahan</p>
                  <h2>{view === "month" ? "Paparan Bulanan" : "Paparan Mingguan"}</h2>
                  <p className="scheduleRange">
                    {formatMalayDate(dates[0])} - {formatMalayDate(dates[dates.length - 1])}
                  </p>
                </div>
                <div className="scheduleControls">
                  <div className="viewControls" aria-label="Pilih paparan">
                    <Link className={view === "week" ? "activePill" : "pill"} href={`${base}/?view=week&start=${start}&room=${activeMobileRoom}`} scroll={false}>
                      Minggu
                    </Link>
                    <Link className={view === "month" ? "activePill" : "pill"} href={`${base}/?view=month&start=${start}&room=${activeMobileRoom}`} scroll={false}>
                      Bulan
                    </Link>
                  </div>
                  <div className="roomSwitch" aria-label="Pilih bilik">
                    {rooms.map((room) => (
                      <Link
                        className={room.slug === activeMobileRoom ? "activeRoomTab" : "roomTab"}
                        href={`${base}/?view=${view}&start=${start}&room=${room.slug}`}
                        key={room.id}
                        scroll={false}
                      >
                        {room.short_name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="scheduleMeta">
                <div className="navRow" aria-label="Navigasi tarikh">
                  <Link className="ghostButton" href={`${base}/?view=${view}&start=${previousStart}&room=${activeMobileRoom}`} scroll={false}>
                    Sebelum
                  </Link>
                  <Link className="ghostButton navToday" href={`${base}/?view=${view}&start=${today}&room=${activeMobileRoom}`} scroll={false}>
                    Hari ini
                  </Link>
                  <Link className="ghostButton" href={`${base}/?view=${view}&start=${nextStart}&room=${activeMobileRoom}`} scroll={false}>
                    Seterusnya
                  </Link>
                </div>
                <div className="statusLegend" aria-label="Petunjuk status">
                  <span>
                    <i className="legendDot availableDot" /> Kosong
                  </span>
                  <span>
                    <i className="legendDot pendingDot" /> Menunggu
                  </span>
                  <span>
                    <i className="legendDot bookedDot" /> Diluluskan
                  </span>
                </div>
              </div>
              <CalendarBoard activeMobileRoom={activeMobileRoom} bookings={bookings} dates={dates} rooms={rooms} />
            </div>
            <BookingForm bookings={bookings} configured={configured && !bookingError} pkgId={pkgId} rooms={rooms} />
          </section>
        </>
      ) : null}

      <MobileTabBar active="jadual" isAdmin={isAdmin} pkgId={pkgId} />
    </main>
  );
}
