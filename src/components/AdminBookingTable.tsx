import Link from "next/link";
import {
  approveBookingAction,
  cancelBookingAction,
  rejectBookingAction,
  updateBookingAction
} from "../app/[pkg]/admin/actions";
import { groupAdminBookings } from "../lib/admin-booking-groups";
import { formatBookingStatus, formatRoom, formatSlot, slots } from "../lib/booking-rules";
import { formatMalayDate } from "../lib/date";
import type { Booking, Room } from "../lib/types";

export function AdminBookingTable({
  bookings,
  pkgId,
  rooms
}: {
  bookings: Booking[];
  pkgId: string;
  rooms: Room[];
}) {
  if (bookings.length === 0) {
    return (
      <section className="emptyState">
        <h2>Belum ada tempahan</h2>
        <p>Rekod akan dipaparkan di sini selepas pengguna menghantar tempahan.</p>
      </section>
    );
  }

  const yearGroups = groupAdminBookings(bookings);

  return (
    <section className="adminTimeline">
      {yearGroups.map((yearGroup, yearIndex) => (
        <details className="adminYearGroup" key={yearGroup.year} open={yearIndex === 0}>
          <summary className="adminGroupSummary">
            <span>{yearGroup.year}</span>
            <strong>{yearGroup.total} tempahan</strong>
          </summary>

          <div className="adminMonthList">
            {yearGroup.months.map((monthGroup, monthIndex) => (
              <details className="adminMonthGroup" key={monthGroup.key} open={yearIndex === 0 && monthIndex === 0}>
                <summary className="adminMonthSummary">
                  <span>{monthGroup.label}</span>
                  <strong>{monthGroup.total} tempahan</strong>
                </summary>

                <div className="adminList">
                  {monthGroup.bookings.map((booking) => {
                    const inactive = booking.status === "cancelled" || booking.status === "rejected";

                    return (
                      <article className={`adminItem adminItem--${booking.status}${inactive ? " cancelled" : ""}`} key={booking.id}>
                        <div className="adminItemMain">
                          <div className="adminItemContent">
                            <div className="adminItemHeader">
                              <span
                                className={`statusBadge ${
                                  booking.status === "pending"
                                    ? "pendingBadge"
                                    : booking.status === "approved"
                                      ? "bookedBadge"
                                      : "mutedBadge"
                                }`}
                              >
                                {formatBookingStatus(booking.status)}
                              </span>
                              <span className="adminDateText">{formatMalayDate(booking.date)}</span>
                            </div>
                            <h2>{booking.purpose}</h2>
                            <div className="adminMetaList">
                              <span>
                                {formatRoom(rooms, booking.room_slug)} - {formatSlot(booking.slot)}
                              </span>
                              <span>{booking.name}</span>
                              <span>{booking.school_or_unit}</span>
                              <span>{booking.contact}</span>
                            </div>
                            {booking.notification_error ? (
                              <p className="inlineError">WhatsApp: {booking.notification_error}</p>
                            ) : null}
                          </div>

                          <div className="adminActions">
                            {booking.status === "pending" ? (
                              <>
                                <form action={approveBookingAction}>
                                  <input name="pkg" type="hidden" value={pkgId} />
                                  <input name="id" type="hidden" value={booking.id} />
                                  <button className="primaryButton" type="submit">
                                    Luluskan
                                  </button>
                                </form>
                                <form action={rejectBookingAction}>
                                  <input name="pkg" type="hidden" value={pkgId} />
                                  <input name="id" type="hidden" value={booking.id} />
                                  <button className="dangerButton" type="submit">
                                    Tolak
                                  </button>
                                </form>
                              </>
                            ) : null}

                            {booking.status === "approved" ? (
                              <>
                                {booking.attendance_manage_token ? (
                                  <Link
                                    className="ghostButton"
                                    href={`/${pkgId}/urus-hadir/${booking.attendance_manage_token}`}
                                  >
                                    Urus kehadiran
                                  </Link>
                                ) : null}
                                <form action={cancelBookingAction}>
                                  <input name="pkg" type="hidden" value={pkgId} />
                                  <input name="id" type="hidden" value={booking.id} />
                                  <button className="dangerButton" type="submit">
                                    Batal
                                  </button>
                                </form>
                              </>
                            ) : null}
                          </div>
                        </div>

                        {booking.status === "pending" || booking.status === "approved" ? (
                          <details className="editPanel">
                            <summary>Kemaskini tempahan</summary>
                            <form action={updateBookingAction} className="adminEditForm">
                              <input name="pkg" type="hidden" value={pkgId} />
                              <input name="id" type="hidden" value={booking.id} />
                              <label>
                                Tarikh
                                <input defaultValue={booking.date} name="date" required type="date" />
                              </label>
                              <label>
                                Bilik
                                <select defaultValue={booking.room_slug} name="room">
                                  {rooms.map((room) => (
                                    <option key={room.id} value={room.slug}>
                                      {room.name}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                Slot
                                <select defaultValue={booking.slot} name="slot">
                                  {slots.map((slot) => (
                                    <option key={slot.id} value={slot.id}>
                                      {slot.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                Nama
                                <input defaultValue={booking.name} name="name" required />
                              </label>
                              <label>
                                Sekolah / Unit
                                <input defaultValue={booking.school_or_unit} name="school_or_unit" required />
                              </label>
                              <label>
                                Tujuan
                                <input defaultValue={booking.purpose} name="purpose" required />
                              </label>
                              <label>
                                Telefon
                                <input defaultValue={booking.contact} name="contact" required />
                              </label>
                              <button className="primaryButton" type="submit">
                                Simpan perubahan
                              </button>
                            </form>
                          </details>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        </details>
      ))}
    </section>
  );
}
