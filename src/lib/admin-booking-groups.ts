import { fromIsoDate } from "./date";
import type { Booking } from "./types";

export type AdminMonthGroup = {
  key: string;
  label: string;
  total: number;
  bookings: Booking[];
};

export type AdminYearGroup = {
  year: string;
  total: number;
  months: AdminMonthGroup[];
};

export function groupAdminBookings(bookings: Booking[]): AdminYearGroup[] {
  const yearMap = new Map<string, Map<string, Booking[]>>();

  for (const booking of bookings) {
    const year = booking.date.slice(0, 4);
    const monthKey = booking.date.slice(0, 7);

    if (!yearMap.has(year)) {
      yearMap.set(year, new Map());
    }

    const monthMap = yearMap.get(year)!;
    monthMap.set(monthKey, [...(monthMap.get(monthKey) ?? []), booking]);
  }

  return Array.from(yearMap.entries())
    .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
    .map(([year, monthMap]) => {
      const months = Array.from(monthMap.entries())
        .sort(([monthA], [monthB]) => monthB.localeCompare(monthA))
        .map(([key, monthBookings]) => {
          const sortedBookings = [...monthBookings].sort((bookingA, bookingB) => {
            const dateOrder = bookingA.date.localeCompare(bookingB.date);
            if (dateOrder !== 0) return dateOrder;
            return bookingA.created_at.localeCompare(bookingB.created_at);
          });

          return {
            key,
            label: fromIsoDate(`${key}-01`).toLocaleDateString("ms-MY", { month: "long" }),
            total: sortedBookings.length,
            bookings: sortedBookings
          };
        });

      return {
        year,
        total: months.reduce((sum, month) => sum + month.total, 0),
        months
      };
    });
}
