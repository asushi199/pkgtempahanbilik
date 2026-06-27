"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminSession } from "../../../../lib/admin-session";
import { requiredText } from "../../../../lib/form";
import { normalizePhoneNumber } from "../../../../lib/phone";
import { updatePkgLogo, updatePkgWhatsapp } from "../../../../lib/repository";
import { uploadPkgLogo } from "../../../../lib/storage";

export async function updateSettingsAction(formData: FormData) {
  const pkgId = requiredText(formData, "pkg");
  if (!isAdminSession(pkgId)) redirect(`/${pkgId}/admin/login`);

  const phone = normalizePhoneNumber(requiredText(formData, "whatsapp_admin_phone"));
  const base = `/${pkgId}/admin/settings`;

  await updatePkgWhatsapp(pkgId, phone || null);

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const upload = await uploadPkgLogo(pkgId, logo);
    if (!upload.ok) redirect(`${base}?status=logo_error`);
    await updatePkgLogo(pkgId, upload.url);
  }

  revalidatePath(base);
  revalidatePath(`/${pkgId}`);
  revalidatePath("/");
  redirect(`${base}?status=saved`);
}
