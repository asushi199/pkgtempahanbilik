import Link from "next/link";
import { notFound } from "next/navigation";
import { approveByTokenAction } from "../actions";
import { verifyApprovalToken } from "../../../../lib/approval-token";
import { formatBookingStatus, formatRoom, formatSlot } from "../../../../lib/booking-rules";
import { formatMalayDate } from "../../../../lib/date";
import { loadPkg } from "../../../../lib/pkg";
import { getBooking, listRooms } from "../../../../lib/repository";

export default async function ApprovalPage({
  params,
  searchParams
}: {
  params: { pkg: string; id: string };
  searchParams: { token?: string };
}) {
  const pkg = (await loadPkg(params.pkg))!;
  const booking = await getBooking(params.pkg, params.id);
  if (!booking) notFound();

  const rooms = await listRooms(params.pkg, true);
  const token = searchParams.token || "";
  const validToken = await verifyApprovalToken(booking.id, token, booking.approval_token_hash);

  return (
    <main className="authShell">
      <section className="authCard approvalCard">
        <p className="eyebrow">Kelulusan Tempahan · {pkg.name}</p>
        <h1>{validToken ? "Semak Permohonan" : "Pautan Tidak Sah"}</h1>
        {!validToken ? (
          <>
            <p>Pautan kelulusan ini tidak sah atau sudah tidak boleh digunakan.</p>
            <Link className="textLink" href={`/${params.pkg}`}>
              Kembali ke jadual
            </Link>
          </>
        ) : (
          <>
            <div className="approvalDetails">
              <p>
                <strong>Status:</strong> {formatBookingStatus(booking.status)}
              </p>
              <p>
                <strong>Pemohon:</strong> {booking.name}
              </p>
              <p>
                <strong>Sekolah / Unit:</strong> {booking.school_or_unit}
              </p>
              <p>
                <strong>Bilik:</strong> {formatRoom(rooms, booking.room_slug)}
              </p>
              <p>
                <strong>Tarikh:</strong> {formatMalayDate(booking.date)}
              </p>
              <p>
                <strong>Slot:</strong> {formatSlot(booking.slot)}
              </p>
              <p>
                <strong>Tujuan:</strong> {booking.purpose}
              </p>
              <p>
                <strong>Telefon:</strong> {booking.contact}
              </p>
            </div>

            {booking.status === "pending" ? (
              <form action={approveByTokenAction} className="approvalSecureForm">
                <input name="pkg" type="hidden" value={params.pkg} />
                <input name="bookingId" type="hidden" value={booking.id} />
                <input name="token" type="hidden" value={token} />
                <label>
                  Kata laluan admin
                  <input
                    autoComplete="current-password"
                    name="adminPassword"
                    placeholder="Masukkan kata laluan admin"
                    required
                    type="password"
                  />
                </label>
                <div className="approvalActions">
                  <button className="primaryButton fullWidth" name="decision" type="submit" value="approve">
                    Luluskan
                  </button>
                  <button className="dangerButton fullWidth" name="decision" type="submit" value="reject">
                    Tolak
                  </button>
                </div>
              </form>
            ) : (
              <div className="notice success">Permohonan ini telah diproses.</div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
