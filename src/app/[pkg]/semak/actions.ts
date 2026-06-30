"use server";

import { headers } from "next/headers";
import { createApprovalToken } from "../../../lib/approval-token";
import { resolveAppBaseUrl } from "../../../lib/app-url";
import { formatRoom, formatSlot } from "../../../lib/booking-rules";
import { formatMalayDate } from "../../../lib/date";
import { requiredText } from "../../../lib/form";
import { loadPkg } from "../../../lib/pkg";
import { normalizePhoneNumber } from "../../../lib/phone";
import {
  listApprovedBookingsByContact,
  listPendingBookingsByContact,
  listRooms,
  updateApprovalTokenHash
} from "../../../lib/repository";
import type { CheckBookingState } from "../../../lib/types";
import { buildWhatsAppShareUrl } from "../../../lib/whatsapp";

export async function checkBookingAction(
  _previousState: CheckBookingState,
  formData: FormData
): Promise<CheckBookingState> {
  const pkgId = requiredText(formData, "pkg");
  const contact = normalizePhoneNumber(requiredText(formData, "contact"));

  const pkg = pkgId ? await loadPkg(pkgId) : null;
  if (!pkg) {
    return { ok: false, message: "PKG tidak sah.", bookings: [] };
  }

  if (!contact) {
    return { ok: false, message: "Sila masukkan nombor telefon.", bookings: [] };
  }

  try {
    const [pendingBookings, approvedBookings, rooms] = await Promise.all([
      listPendingBookingsByContact(pkgId, contact),
      listApprovedBookingsByContact(pkgId, contact),
      listRooms(pkgId, true)
    ]);
    const adminPhone = pkg.whatsapp_admin_phone?.trim() || "";

    if (pendingBookings.length === 0 && approvedBookings.length === 0) {
      return {
        ok: true,
        message: "Tiada permohonan yang ditemui untuk nombor ini.",
        bookings: []
      };
    }

    const baseUrl = resolveAppBaseUrl(process.env.APP_BASE_URL, headers());

    const pendingResults = await Promise.all(
      pendingBookings.map(async (booking) => {
        const { token, hash } = await createApprovalToken(booking.id);
        await updateApprovalTokenHash(pkgId, booking.id, hash);
        const approvalUrl = `${baseUrl}/${pkgId}/approve/${booking.id}?token=${encodeURIComponent(token)}`;

        return {
          id: booking.id,
          date: formatMalayDate(booking.date),
          room: formatRoom(rooms, booking.room_slug),
          slot: formatSlot(booking.slot),
          purpose: booking.purpose,
          status: "Menunggu kelulusan",
          whatsappUrl: adminPhone
            ? buildWhatsAppShareUrl(adminPhone, {
                name: booking.name,
                room: formatRoom(rooms, booking.room_slug),
                date: formatMalayDate(booking.date),
                slot: formatSlot(booking.slot),
                purpose: booking.purpose,
                approvalUrl
              })
            : ""
        };
      })
    );

    const approvedResults = approvedBookings.map((booking) => ({
      id: booking.id,
      date: formatMalayDate(booking.date),
      room: formatRoom(rooms, booking.room_slug),
      slot: formatSlot(booking.slot),
      purpose: booking.purpose,
      status: "Diluluskan",
      whatsappUrl: "",
      manageUrl: booking.attendance_manage_token
        ? `${baseUrl}/${pkgId}/urus-hadir/${booking.attendance_manage_token}`
        : undefined
    }));

    return {
      ok: true,
      message: "Permohonan dijumpai. Untuk mesyuarat yang diluluskan, klik 'Urus kehadiran'.",
      bookings: [...pendingResults, ...approvedResults]
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Permohonan tidak dapat disemak.",
      bookings: []
    };
  }
}
