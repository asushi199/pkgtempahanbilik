import type { Booking, Room, Slot } from "./types";

export const slots: Array<{ id: Slot; label: string; shortLabel: string }> = [
  { id: "am", label: "Pagi", shortLabel: "AM" },
  { id: "pm", label: "Petang", shortLabel: "PM" },
  { id: "full_day", label: "Sepanjang Hari", shortLabel: "Hari" }
];

export function slotsOverlap(existingSlot: Slot, requestedSlot: Slot) {
  return (
    existingSlot === requestedSlot ||
    existingSlot === "full_day" ||
    requestedSlot === "full_day"
  );
}

export function blocksSlot(booking: Booking) {
  return booking.status === "pending" || booking.status === "approved";
}

export function getConflictingBooking(
  bookings: Booking[],
  roomSlug: string,
  date: string,
  slot: Slot
) {
  return bookings.find((booking) => {
    if (!blocksSlot(booking)) return false;
    if (booking.room_slug !== roomSlug || booking.date !== date) return false;

    return slotsOverlap(booking.slot, slot);
  });
}

export function isSlotAvailable(
  bookings: Booking[],
  roomSlug: string,
  date: string,
  slot: Slot
) {
  return !getConflictingBooking(bookings, roomSlug, date, slot);
}

export function getSlotBooking(bookings: Booking[], roomSlug: string, date: string, slot: Slot) {
  return bookings.find((booking) => {
    if (!blocksSlot(booking)) return false;
    if (booking.room_slug !== roomSlug || booking.date !== date) return false;

    if (booking.slot === "full_day") return true;
    return booking.slot === slot;
  });
}

export function formatSlot(slot: Slot) {
  return slots.find((item) => item.id === slot)?.label ?? slot;
}

export function formatRoom(rooms: Room[], roomSlug: string) {
  return rooms.find((item) => item.slug === roomSlug)?.name ?? roomSlug;
}

export function formatBookingStatus(status: Booking["status"]) {
  const labels: Record<Booking["status"], string> = {
    pending: "Menunggu kelulusan",
    approved: "Diluluskan",
    rejected: "Ditolak",
    cancelled: "Dibatalkan"
  };

  return labels[status];
}

export function slugifyRoomName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
