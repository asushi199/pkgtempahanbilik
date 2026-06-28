"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyApprovalToken } from "../../../lib/approval-token";
import { requiredText } from "../../../lib/form";
import { verifyAdminPassword } from "../../../lib/pkg";
import { approveBooking, getBooking, rejectBooking } from "../../../lib/repository";

export async function approveByTokenAction(formData: FormData) {
  const pkgId = requiredText(formData, "pkg");
  const bookingId = requiredText(formData, "bookingId");
  const token = requiredText(formData, "token");
  const decision = requiredText(formData, "decision");
  const adminPassword = requiredText(formData, "adminPassword");

  const resultBase = `/${pkgId}/approve/result`;
  const booking = bookingId ? await getBooking(pkgId, bookingId) : null;

  if (!booking || !(await verifyApprovalToken(booking.id, token, booking.approval_token_hash))) {
    redirect(`${resultBase}?status=invalid`);
  }

  if (!verifyAdminPassword(adminPassword)) {
    redirect(`${resultBase}?status=unauthorized`);
  }

  if (booking.status !== "pending") {
    redirect(`${resultBase}?status=processed`);
  }

  if (decision === "approve") {
    await approveBooking(pkgId, booking.id);
    revalidatePath(`/${pkgId}`);
    revalidatePath(`/${pkgId}/admin`);
    redirect(`${resultBase}?status=approved`);
  }

  if (decision === "reject") {
    await rejectBooking(pkgId, booking.id);
    revalidatePath(`/${pkgId}`);
    revalidatePath(`/${pkgId}/admin`);
    redirect(`${resultBase}?status=rejected`);
  }

  redirect(`${resultBase}?status=invalid`);
}
