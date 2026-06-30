import { NextResponse } from "next/server";
import { getBookingByManageToken, listAttendees } from "../../../../../lib/repository";

/** Wraps a CSV field, escaping quotes and forcing text so Excel keeps the value intact. */
function csvField(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("ms-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export async function GET(
  _request: Request,
  { params }: { params: { pkg: string; manageToken: string } }
) {
  const booking = await getBookingByManageToken(params.pkg, params.manageToken);
  if (!booking) {
    return new NextResponse("Pautan tidak sah.", { status: 404 });
  }

  const attendees = await listAttendees(params.pkg, booking.id);

  const rows = [
    ["Bil", "Nama", "Telefon / Emel", "Masa daftar"],
    ...attendees.map((attendee, index) => [
      String(index + 1),
      attendee.name,
      attendee.contact,
      formatTimestamp(attendee.created_at)
    ])
  ];

  // Prepend a UTF-8 BOM so Excel renders Malay/Chinese characters correctly.
  const csv = "﻿" + rows.map((row) => row.map(csvField).join(",")).join("\r\n");
  const filename = `kehadiran-${booking.date}-${booking.room_slug}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
