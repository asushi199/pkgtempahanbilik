import Link from "next/link";
import { MobileTabBar } from "../../components/MobileTabBar";
import { resolveAmenities } from "../../lib/amenities";
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
            const amenities = resolveAmenities(room.amenities ?? []);
            return (
              <Link className="roomGalleryCard" href={`${base}/bilik/${room.slug}`} key={room.id}>
                {room.image_src ? (
                  <img alt={`${room.name} - ${room.category}`} className="roomGalleryImage" src={room.image_src} />
                ) : (
                  <div className="roomGalleryImage placeholder">Tiada gambar</div>
                )}
                <div className="roomGalleryBody">
                  <div>
                    <h2>{room.name}</h2>
                    <p className="muted">{room.category}</p>
                  </div>
                  {amenities.length > 0 ? (
                    <div className="amenityRow" aria-label="Kemudahan">
                      {amenities.slice(0, 6).map((item) => (
                        <span className="amenityChip" key={item.label} title={item.label}>
                          <span aria-hidden>{item.icon}</span> {item.label}
                        </span>
                      ))}
                      {amenities.length > 6 ? (
                        <span className="amenityChip amenityChip--more">+{amenities.length - 6}</span>
                      ) : null}
                    </div>
                  ) : null}
                  <span className="primaryButton fullWidth galleryCta">Lihat &amp; Tempah</span>
                </div>
              </Link>
            );
          })}
        </section>
      ) : null}

      <MobileTabBar active="jadual" isAdmin={isAdmin} pkgId={pkgId} />
    </main>
  );
}
