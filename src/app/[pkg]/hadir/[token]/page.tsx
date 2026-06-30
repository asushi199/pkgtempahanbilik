import Link from "next/link";
import { AttendanceForm } from "../../../../components/AttendanceForm";
import { formatRoom, formatSlot } from "../../../../lib/booking-rules";
import { formatMalayDate } from "../../../../lib/date";
import { loadPkg } from "../../../../lib/pkg";
import { getBookingByAttendanceToken, listRooms } from "../../../../lib/repository";

export default async function AttendancePage({
  params
}: {
  params: { pkg: string; token: string };
}) {
  const pkg = await loadPkg(params.pkg);
  const booking = pkg ? await getBookingByAttendanceToken(params.pkg, params.token) : null;
  const valid = Boolean(booking && booking.status === "approved");
  const rooms = valid ? await listRooms(params.pkg, true) : [];

  return (
    <main className="authShell">
      <section className="authCard">
        <p className="eyebrow">Rekod Kehadiran · {pkg?.name ?? "PKG"}</p>
        <h1>{valid ? "Daftar Kehadiran" : "Pautan Tidak Sah"}</h1>

        {!valid || !booking ? (
          <>
            <p>Pautan kehadiran ini tidak sah atau mesyuarat belum diluluskan.</p>
            <Link className="textLink" href={`/${params.pkg}`}>
              Kembali ke jadual
            </Link>
          </>
        ) : (
          <>
            <div className="approvalDetails">
              <p>
                <strong>Mesyuarat:</strong> {booking.purpose}
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
            </div>

            <p className="formHint">Sila isi maklumat anda untuk merekod kehadiran.</p>
            <AttendanceForm pkgId={params.pkg} token={params.token} />
          </>
        )}
      </section>
    </main>
  );
}
