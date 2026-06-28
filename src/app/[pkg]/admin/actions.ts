"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, isAdminSession } from "../../../lib/admin-session";
import { getConflictingBooking } from "../../../lib/booking-rules";
import { parseSlot, requiredText } from "../../../lib/form";
import {
  approveBooking,
  cancelBooking,
  listActiveBookings,
  listRooms,
  rejectBooking,
  updateBooking
} from "../../../lib/repository";

export async function logoutAction() {
  clearAdminSession();
  redirect("/");
}

export async function cancelBookingAction(formData: FormData) {
  if (!isAdminSession()) redirect("/admin");
  const pkgId = requiredText(formData, "pkg");
  const id = requiredText(formData, "id");

  if (id) {
    await cancelBooking(pkgId, id);
    revalidatePath(`/${pkgId}`);
    revalidatePath(`/${pkgId}/admin`);
  }

  redirect(`/${pkgId}/admin?status=cancelled`);
}

export async function approveBookingAction(formData: FormData) {
  if (!isAdminSession()) redirect("/admin");
  const pkgId = requiredText(formData, "pkg");
  const id = requiredText(formData, "id");

  if (id) {
    await approveBooking(pkgId, id);
    revalidatePath(`/${pkgId}`);
    revalidatePath(`/${pkgId}/admin`);
  }

  redirect(`/${pkgId}/admin?status=approved`);
}

export async function rejectBookingAction(formData: FormData) {
  if (!isAdminSession()) redirect("/admin");
  const pkgId = requiredText(formData, "pkg");
  const id = requiredText(formData, "id");

  if (id) {
    await rejectBooking(pkgId, id);
    revalidatePath(`/${pkgId}`);
    revalidatePath(`/${pkgId}/admin`);
  }

  redirect(`/${pkgId}/admin?status=rejected`);
}

export async function updateBookingAction(formData: FormData) {
  if (!isAdminSession()) redirect("/admin");
  const pkgId = requiredText(formData, "pkg");
  const id = requiredText(formData, "id");

  const roomSlug = requiredText(formData, "room");
  const slot = parseSlot(formData.get("slot"));
  const date = requiredText(formData, "date");
  const name = requiredText(formData, "name");
  const schoolOrUnit = requiredText(formData, "school_or_unit");
  const purpose = requiredText(formData, "purpose");
  const contact = requiredText(formData, "contact");

  if (!id || !roomSlug || !slot || !date || !name || !schoolOrUnit || !purpose || !contact) {
    redirect(`/${pkgId}/admin?status=missing`);
  }

  const rooms = await listRooms(pkgId, true);
  if (!rooms.some((room) => room.slug === roomSlug)) {
    redirect(`/${pkgId}/admin?status=missing`);
  }

  const activeBookings = (await listActiveBookings(pkgId)).filter((booking) => booking.id !== id);
  const conflict = getConflictingBooking(activeBookings, roomSlug, date, slot);

  if (conflict) {
    redirect(`/${pkgId}/admin?status=conflict`);
  }

  await updateBooking(pkgId, id, {
    room_slug: roomSlug,
    slot,
    date,
    name,
    school_or_unit: schoolOrUnit,
    purpose,
    contact
  });

  revalidatePath(`/${pkgId}`);
  revalidatePath(`/${pkgId}/admin`);
  redirect(`/${pkgId}/admin?status=updated`);
}
