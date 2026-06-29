import Link from "next/link";
import { notFound } from "next/navigation";
import { AmenityIcon } from "../../../../components/AmenityIcon";
import { BookingForm } from "../../../../components/BookingForm";
import { CalendarBoard } from "../../../../components/CalendarBoard";
import { MobileTabBar } from "../../../../components/MobileTabBar";
import { resolveAmenities } from "../../../../lib/amenities";
import { isAdminSession } from "../../../../lib/admin-session";
import { titleCase } from "../../../../lib/text";
import { addMonths, formatMalayDate, listDateRange, startOfMonth, toIsoDate } from "../../../../lib/date";
import { loadPkg } from "../../../../lib/pkg";
import { getRoomBySlug, listActiveBookings } from "../../../../lib/repository";
import { isSupabaseConfigured } from "../../../../lib/supabase";
import type { Booking } from "../../../../lib/types";

type SearchParams = {
  start?: string;
};

export default async function RoomDetailPage({
  params,
  searchParams
}: {
  params: { pkg: string; slug: string };
  searchParams: SearchParams;
}) {
  const pkgId = params.pkg;
  const pkg = (await loadPkg(pkgId))!; // layout already guards existence
  const isAdmin = isAdminSession();
  const configured = isSupabaseConfigured();

  if (!configured) notFound();

  const room = await getRoomBySlug(pkgId, params.slug);
  if (!room) notFound();

  let bookings: Booking[] = [];
  let bookingError = "";
  try {
    bookings = await listActiveBookings(pkgId);
  } catch (error) {
    bookingError = error instanceof Error ? error.message : "Gagal membaca data tempahan.";
  }

  const today = toIsoDate(new Date());
  const start = startOfMonth(searchParams.start || today);
  const dates = listDateRange(start, 30);
  const previousStart = addMonths(start, -1);
  const nextStart = addMonths(start, 1);

  const amenities = resolveAmenities(room.amenities ?? []);
  const base = `/${pkgId}`;
  const detailBase = `${base}/bilik/${room.slug}`;

  return (
    <main className="shell">
      <nav className="topNav topNav--public">
        <Link className="brandMark" href="/">
          <img alt={pkg.name} className="brandLogo" src={pkg.logo_src ?? "/ustp-manjung.png"} />
          <strong>{pkg.name}</strong>
        </Link>
        <div className="topNavLinks">
          <Link href={base}>Laman Utama</Link>
          <Link href={`${base}/semak`}>Semak</Link>
          {isAdmin ? (
            <Link className="navAdminLink" href={`${base}/admin`}>
              Admin
            </Link>
          ) : null}
        </div>
      </nav>

      <div className="detailBackRow">
        <Link className="ghostButton" href={base}>
          ← Kembali ke senarai bilik
        </Link>
      </div>

      <section className="roomDetailHero">
        {room.image_src ? (
          <img alt={`${room.name} - ${room.category}`} className="roomDetailImage" src={room.image_src} />
        ) : (
          <div className="roomDetailImage placeholder">Tiada gambar</div>
        )}
        <div className="roomDetailInfo">
          <p className="eyebrow">{room.category}</p>
          <h1>{titleCase(room.name)}</h1>
          <div className="amenityList" aria-label="Kemudahan bilik">
            <h2>Kemudahan</h2>
            {amenities.length > 0 ? (
              <ul>
                {amenities.map((item) => (
                  <li className="amenityItem" key={item.label}>
                    <AmenityIcon name={item.key} />
                    {item.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Tiada maklumat kemudahan.</p>
            )}
          </div>
        </div>
      </section>

      {bookingError ? (
        <div className="notice error">
          Data Supabase tidak dapat dibaca: {bookingError}.
        </div>
      ) : null}

      <section className="workspace">
        <div className="schedulePanel" id="jadual">
          <div className="panelHeader">
            <div className="scheduleIntro">
              <p className="eyebrow">Status tempahan</p>
              <h2>Paparan Bulanan</h2>
              <p className="scheduleRange">
                {formatMalayDate(dates[0])} - {formatMalayDate(dates[dates.length - 1])}
              </p>
            </div>
          </div>
          <div className="scheduleMeta">
            <div className="navRow" aria-label="Navigasi tarikh">
              <Link className="ghostButton" href={`${detailBase}?start=${previousStart}`} scroll={false}>
                Sebelum
              </Link>
              <Link className="ghostButton navToday" href={`${detailBase}?start=${today}`} scroll={false}>
                Bulan ini
              </Link>
              <Link className="ghostButton" href={`${detailBase}?start=${nextStart}`} scroll={false}>
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
          <CalendarBoard activeMobileRoom={room.slug} bookings={bookings} dates={dates} rooms={[room]} />
        </div>
        <BookingForm bookings={bookings} configured={!bookingError} pkgId={pkgId} rooms={[room]} />
      </section>

      <MobileTabBar active="bilik" isAdmin={isAdmin} pkgId={pkgId} showTempah />
    </main>
  );
}
