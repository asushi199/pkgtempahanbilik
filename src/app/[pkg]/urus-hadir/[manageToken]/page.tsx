import { headers } from "next/headers";
import Link from "next/link";
import QRCode from "qrcode";
import { resolveAppBaseUrl } from "../../../../lib/app-url";
import { formatRoom, formatSlot } from "../../../../lib/booking-rules";
import { formatMalayDate } from "../../../../lib/date";
import { loadPkg } from "../../../../lib/pkg";
import { getBookingByManageToken, listAttendees, listRooms } from "../../../../lib/repository";

export default async function ManageAttendancePage({
  params
}: {
  params: { pkg: string; manageToken: string };
}) {
  const pkg = await loadPkg(params.pkg);
  const booking = pkg ? await getBookingByManageToken(params.pkg, params.manageToken) : null;

  if (!pkg || !booking) {
    return (
      <main className="authShell">
        <section className="authCard">
          <p className="eyebrow">Urus Kehadiran</p>
          <h1>Pautan Tidak Sah</h1>
          <p>Pautan pengurusan kehadiran ini tidak sah.</p>
          <Link className="textLink" href={`/${params.pkg}`}>
            Kembali ke jadual
          </Link>
        </section>
      </main>
    );
  }

  const [rooms, attendees] = await Promise.all([
    listRooms(params.pkg, true),
    listAttendees(params.pkg, booking.id)
  ]);

  const baseUrl = resolveAppBaseUrl(process.env.APP_BASE_URL, headers());
  const registrationUrl = `${baseUrl}/${params.pkg}/hadir/${booking.attendance_token}`;
  const exportUrl = `/${params.pkg}/urus-hadir/${params.manageToken}/export`;
  const qrDataUrl = await QRCode.toDataURL(registrationUrl, { width: 320, margin: 1 });

  return (
    <main className="authShell">
      <section className="authCard">
        <p className="eyebrow">Urus Kehadiran · {pkg.name}</p>
        <h1>{booking.purpose}</h1>

        <div className="approvalDetails">
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

        <div className="attendanceQr">
          <img alt="QR pendaftaran kehadiran" height={240} src={qrDataUrl} width={240} />
          <p className="formHint">Imbas QR atau kongsi pautan ini untuk pendaftaran kehadiran:</p>
          <p className="attendanceLink">{registrationUrl}</p>
          <a className="ghostButton fullWidth" href={registrationUrl} rel="noreferrer" target="_blank">
            Buka borang pendaftaran
          </a>
        </div>

        <div className="formTitleRow">
          <h2>Senarai Kehadiran ({attendees.length})</h2>
          {attendees.length > 0 ? (
            <a className="primaryButton" download href={exportUrl}>
              Muat turun CSV
            </a>
          ) : null}
        </div>

        {attendees.length === 0 ? (
          <p>Belum ada kehadiran direkodkan.</p>
        ) : (
          <ol className="attendanceList">
            {attendees.map((attendee) => (
              <li key={attendee.id}>
                <span>{attendee.name}</span>
                <span className="muted">{attendee.contact}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
