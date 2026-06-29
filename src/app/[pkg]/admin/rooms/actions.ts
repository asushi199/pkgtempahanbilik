"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminSession } from "../../../../lib/admin-session";
import { slugifyRoomName } from "../../../../lib/booking-rules";
import { requiredText } from "../../../../lib/form";
import { createRoom, getRoom, listRooms, setRoomActive, updateRoom } from "../../../../lib/repository";
import { uploadRoomPhoto } from "../../../../lib/storage";

function parseSortOrder(value: FormDataEntryValue | null) {
  const n = typeof value === "string" ? parseInt(value, 10) : NaN;
  return Number.isFinite(n) ? n : 0;
}

function photoFile(formData: FormData): File | null {
  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) return file;
  return null;
}

function parseAmenities(formData: FormData): string[] {
  const preset = formData.getAll("amenities").map(String);
  const custom = String(formData.get("amenities_custom") ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set([...preset, ...custom]));
}

async function ensureUniqueSlug(pkgId: string, base: string) {
  const existing = await listRooms(pkgId, true);
  const used = new Set(existing.map((room) => room.slug));
  let slug = base || "bilik";
  let i = 2;
  while (used.has(slug)) {
    slug = `${base}_${i}`;
    i += 1;
  }
  return slug;
}

export async function createRoomAction(formData: FormData) {
  const pkgId = requiredText(formData, "pkg");
  if (!isAdminSession()) redirect("/admin");

  const name = requiredText(formData, "name");
  const shortName = requiredText(formData, "short_name") || name;
  const category = requiredText(formData, "category") || "Bilik";
  const sortOrder = parseSortOrder(formData.get("sort_order"));

  const base = `/${pkgId}/admin/rooms`;
  if (!name) redirect(`${base}?status=missing`);

  const slug = await ensureUniqueSlug(pkgId, slugifyRoomName(name));

  let imageSrc: string | null = null;
  const file = photoFile(formData);
  if (file) {
    const upload = await uploadRoomPhoto(pkgId, slug, file);
    if (!upload.ok) redirect(`${base}?status=upload_error`);
    imageSrc = upload.url;
  }

  await createRoom(pkgId, slug, {
    name,
    short_name: shortName,
    category,
    sort_order: sortOrder,
    image_src: imageSrc,
    amenities: parseAmenities(formData)
  });

  revalidatePath(base);
  revalidatePath(`/${pkgId}`);
  revalidatePath(`/${pkgId}/bilik/${slug}`);
  redirect(`${base}?status=created`);
}

export async function updateRoomAction(formData: FormData) {
  const pkgId = requiredText(formData, "pkg");
  if (!isAdminSession()) redirect("/admin");

  const roomId = requiredText(formData, "id");
  const name = requiredText(formData, "name");
  const shortName = requiredText(formData, "short_name") || name;
  const category = requiredText(formData, "category") || "Bilik";
  const sortOrder = parseSortOrder(formData.get("sort_order"));

  const base = `/${pkgId}/admin/rooms`;
  const room = roomId ? await getRoom(pkgId, roomId) : null;
  if (!room || !name) redirect(`${base}?status=missing`);

  let imageSrc = room.image_src;
  const file = photoFile(formData);
  if (file) {
    const upload = await uploadRoomPhoto(pkgId, room.slug, file);
    if (!upload.ok) redirect(`${base}?status=upload_error`);
    imageSrc = upload.url;
  }

  await updateRoom(pkgId, roomId, {
    name,
    short_name: shortName,
    category,
    sort_order: sortOrder,
    image_src: imageSrc,
    amenities: parseAmenities(formData)
  });

  revalidatePath(base);
  revalidatePath(`/${pkgId}`);
  revalidatePath(`/${pkgId}/bilik/${room.slug}`);
  redirect(`${base}?status=updated`);
}

export async function deactivateRoomAction(formData: FormData) {
  const pkgId = requiredText(formData, "pkg");
  if (!isAdminSession()) redirect("/admin");

  const roomId = requiredText(formData, "id");
  const base = `/${pkgId}/admin/rooms`;
  if (roomId) {
    await setRoomActive(pkgId, roomId, false);
    revalidatePath(base);
    revalidatePath(`/${pkgId}`);
  }

  redirect(`${base}?status=deactivated`);
}

export async function reactivateRoomAction(formData: FormData) {
  const pkgId = requiredText(formData, "pkg");
  if (!isAdminSession()) redirect("/admin");

  const roomId = requiredText(formData, "id");
  const base = `/${pkgId}/admin/rooms`;
  if (roomId) {
    await setRoomActive(pkgId, roomId, true);
    revalidatePath(base);
    revalidatePath(`/${pkgId}`);
  }

  redirect(`${base}?status=reactivated`);
}
