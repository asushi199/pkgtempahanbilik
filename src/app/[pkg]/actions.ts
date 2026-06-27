"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createApprovalToken } from "../../lib/approval-token";
import { resolveAppBaseUrl } from "../../lib/app-url";
import { formatRoom, formatSlot, getConflictingBooking } from "../../lib/booking-rules";
import { formatMalayDate } from "../../lib/date";
import { parseSlot, requiredText } from "../../lib/form";
import { loadPkg } from "../../lib/pkg";
import { normalizePhoneNumber } from "../../lib/phone";
import { createBooking, listActiveBookings, listRooms } from "../../lib/repository";
import type { BookingFormState } from "../../lib/types";
import { buildWhatsAppShareUrl } from "../../lib/whatsapp";

export async function createBookingAction(
  _previousState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const pkgId = requiredText(formData, "pkg");
  const roomSlug = requiredText(formData, "room");
  const slot = parseSlot(formData.get("slot"));
  const date = requiredText(formData, "date");
  const name = requiredText(formData, "name");
  const schoolOrUnit = requiredText(formData, "school_or_unit");
  const purpose = requiredText(formData, "purpose");
  const contact = requiredText(formData, "contact");
  const normalizedContact = normalizePhoneNumber(contact);

  const pkg = pkgId ? await loadPkg(pkgId) : null;
  if (!pkg) {
    return { ok: false, message: "PKG tidak sah." };
  }

  if (!roomSlug || !slot || !date || !name || !schoolOrUnit || !purpose || !normalizedContact) {
    return { ok: false, message: "Sila lengkapkan semua maklumat tempahan." };
  }

  try {
    const rooms = await listRooms(pkgId);
    const room = rooms.find((item) => item.slug === roomSlug);
    if (!room) {
      return { ok: false, message: "Bilik tidak sah." };
    }

    const activeBookings = await listActiveBookings(pkgId);
    const conflict = getConflictingBooking(activeBookings, roomSlug, date, slot);

    if (conflict) {
      return {
        ok: false,
        message: `Slot ini telah ditempah atau menunggu kelulusan oleh ${conflict.name} untuk ${conflict.purpose}. Sila pilih masa lain.`
      };
    }

    const bookingId = randomUUID();
    const { token, hash } = await createApprovalToken(bookingId);
    const booking = await createBooking(pkgId, {
      id: bookingId,
      room_slug: roomSlug,
      slot,
      date,
      name,
      school_or_unit: schoolOrUnit,
      purpose,
      contact: normalizedContact,
      status: "pending",
      approval_token_hash: hash
    });

    const baseUrl = resolveAppBaseUrl(process.env.APP_BASE_URL, headers());
    const approvalUrl = `${baseUrl}/${pkgId}/approve/${booking.id}?token=${encodeURIComponent(token)}`;
    const adminPhone = pkg.whatsapp_admin_phone?.trim() || "";
    const whatsappUrl = adminPhone
      ? buildWhatsAppShareUrl(adminPhone, {
          name,
          room: formatRoom(rooms, roomSlug),
          date: formatMalayDate(date),
          slot: formatSlot(slot),
          purpose,
          approvalUrl
        })
      : "";

    revalidatePath(`/${pkgId}`);
    revalidatePath(`/${pkgId}/admin`);

    return {
      ok: true,
      message: adminPhone
        ? "Permohonan diterima. Sila hantar mesej WhatsApp kepada admin untuk kelulusan."
        : "Permohonan diterima. Nombor WhatsApp admin belum ditetapkan.",
      whatsappUrl
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Tempahan tidak berjaya dihantar."
    };
  }
}
