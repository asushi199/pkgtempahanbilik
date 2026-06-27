import Link from "next/link";
import { redirect } from "next/navigation";
import { RoomManager } from "../../../../components/RoomManager";
import { isAdminSession } from "../../../../lib/admin-session";
import { loadPkg } from "../../../../lib/pkg";
import { listRooms } from "../../../../lib/repository";
import type { Room } from "../../../../lib/types";

type SearchParams = { status?: string };

const messages: Record<string, { text: string; tone: "success" | "error" }> = {
  created: { text: "Bilik berjaya ditambah.", tone: "success" },
  updated: { text: "Bilik berjaya dikemas kini.", tone: "success" },
  deactivated: { text: "Bilik dinyahaktif dan disembunyikan daripada tempahan awam.", tone: "success" },
  reactivated: { text: "Bilik diaktifkan semula.", tone: "success" },
  missing: { text: "Sila lengkapkan maklumat bilik.", tone: "error" },
  upload_error: { text: "Muat naik gambar gagal. Semak format (JPG/PNG/WEBP) dan saiz (≤5MB).", tone: "error" }
};

export default async function AdminRoomsPage({
  params,
  searchParams
}: {
  params: { pkg: string };
  searchParams: SearchParams;
}) {
  const pkgId = params.pkg;
  const base = `/${pkgId}`;

  if (!isAdminSession(pkgId)) {
    redirect(`${base}/admin/login`);
  }

  const pkg = (await loadPkg(pkgId))!;

  let rooms: Room[] = [];
  let dataError = "";
  try {
    rooms = await listRooms(pkgId, true);
  } catch (error) {
    dataError = error instanceof Error ? error.message : "Gagal membaca senarai bilik.";
  }

  const message = searchParams.status ? messages[searchParams.status] : undefined;

  return (
    <main className="shell">
      <section className="adminTop">
        <div>
          <p className="eyebrow">Pengurusan Bilik · {pkg.name}</p>
          <h1>Urus Bilik</h1>
          <p>Tambah, kemas kini atau sembunyikan bilik yang boleh ditempah.</p>
        </div>
        <div className="heroActions">
          <Link className="ghostButton" href={`${base}/admin`}>
            Tempahan
          </Link>
          <Link className="ghostButton" href={base}>
            Jadual awam
          </Link>
        </div>
      </section>

      {message ? <div className={`notice ${message.tone}`}>{message.text}</div> : null}
      {dataError ? <div className="notice error">{dataError}</div> : null}

      <RoomManager pkgId={pkgId} rooms={rooms} />
    </main>
  );
}
