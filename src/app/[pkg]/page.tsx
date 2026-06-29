import Link from "next/link";
import { AmenityIcon } from "../../components/AmenityIcon";
import { MobileTabBar } from "../../components/MobileTabBar";
import { amenityCardLayout } from "../../lib/amenities";
import { titleCase } from "../../lib/text";
import { isAdminSession } from "../../lib/admin-session";
import { loadPkg } from "../../lib/pkg";
import { listRooms } from "../../lib/repository";
import { isSupabaseConfigured } from "../../lib/supabase";
import type { Room } from "../../lib/types";

export default async function PkgHomePage({ params }: { params: { pkg: string } }) {
  const pkgId = params.pkg;
  const pkg = (await loadPkg(pkgId))!; // layout already guards existence
  const isAdmin = isAdminSession();
  const configured = isSupabaseConfigured();

  let rooms: Room[] = [];
  let roomError = "";

  if (configured) {
    try {
      rooms = await listRooms(pkgId);
    } catch (error) {
      roomError = error instanceof Error ? error.message : "Gagal membaca data bilik.";
    }
  }

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
            Pilih bilik di bawah untuk melihat gambar, kemudahan dan status slot, kemudian hantar
            permohonan untuk kelulusan admin.
          </p>
        </div>
        <div className="heroActions compactActions">
          <Link className="ghostButton" href={`${base}/semak`}>
            Semak Permohonan
          </Link>
        </div>
      </section>

      {!configured ? (
        <div className="notice warning">
          Supabase belum dikonfigurasi. Senarai bilik boleh dipratonton, tetapi penghantaran tempahan
          memerlukan tetapan dalam <code>.env.local</code>.
        </div>
      ) : null}

      {roomError ? (
        <div className="notice error">
          Data Supabase tidak dapat dibaca: {roomError}. Sila semak sambungan, service role key, dan
          pastikan <code>supabase/schema.sql</code> sudah dijalankan.
        </div>
      ) : null}

      {configured && !roomError && rooms.length === 0 ? (
        <div className="notice warning">
          Belum ada bilik untuk PKG ini. Admin boleh menambah bilik di{" "}
          <Link className="textLink" href={`${base}/admin/rooms`}>
            panel pengurusan bilik
          </Link>
          .
        </div>
      ) : null}

      {rooms.length > 0 ? (
        <section className="roomGalleryGrid" aria-label="Senarai bilik">
          {rooms.map((room) => {
            const card = amenityCardLayout(room.amenities ?? []);
            const hasAmenities = (room.amenities?.length ?? 0) > 0;
            return (
              <Link className="roomGalleryCard" href={`${base}/bilik/${room.slug}`} key={room.id}>
                <div className="roomGalleryMedia">
                  {room.image_src ? (
                    <img alt={`${room.name} - ${room.category}`} className="roomGalleryImage" src={room.image_src} />
                  ) : (
                    <div className="roomGalleryImage placeholder">Tiada gambar</div>
                  )}
                  <span className="roomGalleryBadge">{room.category}</span>
                </div>
                <div className="roomGalleryBody">
                  <h2 className="roomGalleryTitle">{titleCase(room.name)}</h2>
                  {hasAmenities ? (
                    <div className="amenityBlock">
                      {card.textChips.length > 0 ? (
                        <div className="amenityRow" aria-label="Kemudahan utama">
                          {card.textChips.map((item) => (
                            <span className="amenityChip" key={item.label} title={item.label}>
                              <AmenityIcon name={item.key} /> {item.label}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {card.iconChips.length > 0 || card.extraCount > 0 ? (
                        <div className="amenityIconRow" aria-label="Kemudahan lain">
                          {card.iconChips.map((item) => (
                            <span className="amenityIconChip" key={item.label} title={item.label}>
                              <AmenityIcon name={item.key} />
                            </span>
                          ))}
                          {card.extraCount > 0 ? (
                            <span className="amenityIconChip amenityIconChip--more">+{card.extraCount}</span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <span className="galleryCta">
                    Lihat &amp; Tempah
                    <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </section>
      ) : null}

      <MobileTabBar active="bilik" isAdmin={isAdmin} pkgId={pkgId} />
    </main>
  );
}
