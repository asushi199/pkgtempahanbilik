import { getSupabaseAdmin } from "./supabase";
import { normalizePhoneNumber } from "./phone";
import type { Booking, BookingStatus, Pkg, Room, Slot } from "./types";

const notConfiguredMessage =
  "Supabase belum dikonfigurasi. Sila isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.";

// ---------- PKG ----------

export async function listPkgs(): Promise<Pkg[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("pkgs")
    .select("id, name, whatsapp_admin_phone, logo_src, active")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Pkg[]) ?? [];
}

export async function getPkg(pkgId: string): Promise<Pkg | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("pkgs")
    .select("id, name, whatsapp_admin_phone, logo_src, active")
    .eq("id", pkgId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Pkg) ?? null;
}

export async function getPkgAdminHash(pkgId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("pkgs")
    .select("admin_password_hash")
    .eq("id", pkgId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data?.admin_password_hash as string | null) ?? null;
}

export async function updatePkgWhatsapp(pkgId: string, whatsappAdminPhone: string | null) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(notConfiguredMessage);

  const { error } = await supabase
    .from("pkgs")
    .update({ whatsapp_admin_phone: whatsappAdminPhone })
    .eq("id", pkgId);

  if (error) throw new Error(error.message);
}

export async function updatePkgLogo(pkgId: string, logoSrc: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(notConfiguredMessage);

  const { error } = await supabase.from("pkgs").update({ logo_src: logoSrc }).eq("id", pkgId);

  if (error) throw new Error(error.message);
}

// ---------- Rooms ----------

export type RoomInput = {
  name: string;
  short_name: string;
  category: string;
  sort_order?: number;
  image_src?: string | null;
  amenities?: string[];
};

export async function listRooms(pkgId: string, includeInactive = false): Promise<Room[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase.from("rooms").select("*").eq("pkg_id", pkgId);
  if (!includeInactive) query = query.eq("active", true);

  const { data, error } = await query
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Room[]) ?? [];
}

export async function getRoom(pkgId: string, roomId: string): Promise<Room | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("pkg_id", pkgId)
    .eq("id", roomId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Room) ?? null;
}

export async function getRoomBySlug(pkgId: string, slug: string): Promise<Room | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("pkg_id", pkgId)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Room) ?? null;
}

export async function createRoom(pkgId: string, slug: string, input: RoomInput) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(notConfiguredMessage);

  const { error } = await supabase.from("rooms").insert({
    pkg_id: pkgId,
    slug,
    name: input.name,
    short_name: input.short_name,
    category: input.category,
    image_src: input.image_src ?? null,
    amenities: input.amenities ?? [],
    sort_order: input.sort_order ?? 0
  });

  if (error) throw new Error(error.message);
}

export async function updateRoom(pkgId: string, roomId: string, input: Partial<RoomInput>) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(notConfiguredMessage);

  const { error } = await supabase
    .from("rooms")
    .update(input)
    .eq("pkg_id", pkgId)
    .eq("id", roomId);

  if (error) throw new Error(error.message);
}

export async function setRoomActive(pkgId: string, roomId: string, active: boolean) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(notConfiguredMessage);

  const { error } = await supabase
    .from("rooms")
    .update({ active })
    .eq("pkg_id", pkgId)
    .eq("id", roomId);

  if (error) throw new Error(error.message);
}

// ---------- Bookings ----------

export type BookingInput = {
  room_slug: string;
  date: string;
  slot: Slot;
  name: string;
  school_or_unit: string;
  purpose: string;
  contact: string;
};

export type CreateBookingInput = BookingInput & {
  id?: string;
  status?: BookingStatus;
  approval_token_hash?: string | null;
};

export async function listActiveBookings(pkgId: string): Promise<Booking[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("pkg_id", pkgId)
    .in("status", ["pending", "approved"])
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Booking[]) ?? [];
}

export async function listAllBookings(pkgId: string): Promise<Booking[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("pkg_id", pkgId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Booking[]) ?? [];
}

export async function createBooking(pkgId: string, input: CreateBookingInput) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(notConfiguredMessage);

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      ...input,
      pkg_id: pkgId,
      contact: normalizePhoneNumber(input.contact),
      contact_normalized: normalizePhoneNumber(input.contact)
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Booking;
}

export async function updateBooking(pkgId: string, id: string, input: BookingInput) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(notConfiguredMessage);

  const { error } = await supabase
    .from("bookings")
    .update({
      ...input,
      contact: normalizePhoneNumber(input.contact),
      contact_normalized: normalizePhoneNumber(input.contact)
    })
    .eq("pkg_id", pkgId)
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function cancelBooking(pkgId: string, id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(notConfiguredMessage);

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("pkg_id", pkgId)
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function approveBooking(pkgId: string, id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(notConfiguredMessage);

  const { error } = await supabase
    .from("bookings")
    .update({ status: "approved", approved_at: new Date().toISOString(), rejected_at: null })
    .eq("pkg_id", pkgId)
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function rejectBooking(pkgId: string, id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(notConfiguredMessage);

  const { error } = await supabase
    .from("bookings")
    .update({ status: "rejected", rejected_at: new Date().toISOString() })
    .eq("pkg_id", pkgId)
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function getBooking(pkgId: string, id: string): Promise<Booking | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("pkg_id", pkgId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Booking) ?? null;
}

export async function listPendingBookingsByContact(
  pkgId: string,
  contact: string
): Promise<Booking[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("pkg_id", pkgId)
    .eq("status", "pending")
    .eq("contact_normalized", normalizePhoneNumber(contact))
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Booking[]) ?? [];
}

export async function updateApprovalTokenHash(
  pkgId: string,
  id: string,
  approvalTokenHash: string
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(notConfiguredMessage);

  const { error } = await supabase
    .from("bookings")
    .update({ approval_token_hash: approvalTokenHash })
    .eq("pkg_id", pkgId)
    .eq("id", id)
    .eq("status", "pending");

  if (error) throw new Error(error.message);
}

export async function recordNotificationResult(pkgId: string, id: string, errorMessage?: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(notConfiguredMessage);

  const { error } = await supabase
    .from("bookings")
    .update({
      notified_at: errorMessage ? null : new Date().toISOString(),
      notification_error: errorMessage ?? null
    })
    .eq("pkg_id", pkgId)
    .eq("id", id);

  if (error) throw new Error(error.message);
}
