import { getSupabaseAdmin } from "./supabase";

const BUCKET = "room-photos";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

/**
 * Uploads a room photo to the public `room-photos` bucket.
 * Path: {pkgId}/{roomSlug}-{timestamp}.{ext}. Returns the public URL.
 */
export async function uploadRoomPhoto(
  pkgId: string,
  roomSlug: string,
  file: File
): Promise<UploadResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, message: "Supabase belum dikonfigurasi." };
  }

  const ext = allowedTypes[file.type];
  if (!ext) {
    return { ok: false, message: "Format gambar tidak disokong. Guna JPG, PNG atau WEBP." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "Saiz gambar melebihi 5MB." };
  }

  return uploadToBucket(`${pkgId}/${roomSlug}-${Date.now()}.${ext}`, file);
}

/**
 * Uploads a PKG logo to the public `room-photos` bucket under `logos/`.
 * Returns the public URL.
 */
export async function uploadPkgLogo(pkgId: string, file: File): Promise<UploadResult> {
  const ext = allowedTypes[file.type];
  if (!ext) {
    return { ok: false, message: "Format gambar tidak disokong. Guna JPG, PNG atau WEBP." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "Saiz gambar melebihi 5MB." };
  }

  return uploadToBucket(`logos/${pkgId}-${Date.now()}.${ext}`, file);
}

async function uploadToBucket(path: string, file: File): Promise<UploadResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, message: "Supabase belum dikonfigurasi." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: true
  });

  if (error) {
    return { ok: false, message: `Muat naik gagal: ${error.message}` };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
