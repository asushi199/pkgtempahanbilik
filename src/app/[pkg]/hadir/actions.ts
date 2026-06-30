"use server";

import { revalidatePath } from "next/cache";
import { requiredText } from "../../../lib/form";
import { loadPkg } from "../../../lib/pkg";
import { addAttendee, getBookingByAttendanceToken, listAttendees } from "../../../lib/repository";
import type { AttendanceFormState } from "../../../lib/types";

export async function registerAttendanceAction(
  _previousState: AttendanceFormState,
  formData: FormData
): Promise<AttendanceFormState> {
  const pkgId = requiredText(formData, "pkg");
  const token = requiredText(formData, "token");
  const name = requiredText(formData, "name");
  const contact = requiredText(formData, "contact");

  const pkg = pkgId ? await loadPkg(pkgId) : null;
  if (!pkg) {
    return { ok: false, message: "PKG tidak sah." };
  }

  if (!name || !contact) {
    return { ok: false, message: "Sila isi nama dan telefon/emel." };
  }

  try {
    const booking = await getBookingByAttendanceToken(pkgId, token);
    if (!booking || booking.status !== "approved") {
      return { ok: false, message: "Pautan kehadiran tidak sah atau mesyuarat belum diluluskan." };
    }

    await addAttendee(pkgId, booking.id, { name, contact });
    const attendees = await listAttendees(pkgId, booking.id);
    revalidatePath(`/${pkgId}/urus-hadir/${booking.attendance_manage_token}`);

    return {
      ok: true,
      message: "Kehadiran anda telah direkodkan. Terima kasih!",
      count: attendees.length
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Kehadiran tidak dapat direkodkan."
    };
  }
}
