import { getSlotBooking } from "../lib/booking-rules";
import { formatDayName, formatMalayDate } from "../lib/date";
import { titleCase } from "../lib/text";
import type { Booking, Room } from "../lib/types";

export function CalendarBoard({
  activeMobileRoom,
  bookings,
  dates,
  rooms
}: {
  activeMobileRoom: string;
  bookings: Booking[];
  dates: string[];
  rooms: Room[];
}) {
  const visibleRooms = rooms.filter((room) => room.slug === activeMobileRoom);

  return (
    <div className="calendarWrap">
      <div className="calendarGrid headerGrid calendarDesktopOnly">
        <div className="dateHeader">Tarikh</div>
        {visibleRooms.map((room) => (
          <div className="roomHeader" key={room.id}>
            {titleCase(room.name)} <span>{room.category}</span>
          </div>
        ))}
      </div>

      <div className="calendarGrid slotHeaderGrid calendarDesktopOnly">
        <div />
        {visibleRooms.map((room) => (
          <div className="slotHeaderPair" key={room.id}>
            <span>Pagi</span>
            <span>Petang</span>
          </div>
        ))}
      </div>

      {dates.map((date) => (
        <div className="calendarGrid dayRow" key={date}>
          <div className="dateCell">
            <strong>{formatDayName(date)}</strong>
            <span>{formatMalayDate(date, { year: undefined })}</span>
          </div>
          {visibleRooms.map((room) => (
            <div className="slotPair" key={`${date}-${room.id}`}>
              <div className="mobileRoomLabel">{titleCase(room.name)}</div>
              {(["am", "pm"] as const).map((slot) => {
                const booking = getSlotBooking(bookings, room.slug, date, slot);
                const isFullDay = booking?.slot === "full_day";
                const statusLabel = booking?.status === "pending" ? "Menunggu Kelulusan" : "Diluluskan";

                const cellTone = booking
                  ? booking.status === "pending"
                    ? "pending"
                    : "booked"
                  : "available";

                return (
                  <div className={`slotCell slotCell--${cellTone}`} key={slot}>
                    <span className="slotTime">{slot === "am" ? "Pagi" : "Petang"}</span>
                    {booking ? (
                      <>
                        <p className="slotPurpose" title={booking.purpose}>
                          {booking.purpose}
                        </p>
                        <p className="slotMeta">
                          {booking.name}
                          <span className="slotMetaDivider">·</span>
                          {statusLabel}
                        </p>
                        {isFullDay ? <span className="slotTag slotTag--fullDay">Penuh hari</span> : null}
                      </>
                    ) : (
                      <span className="slotEmpty">Kosong</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
