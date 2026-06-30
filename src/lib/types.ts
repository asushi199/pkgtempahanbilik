export type Slot = "am" | "pm" | "full_day";

export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled";

export type Pkg = {
  id: string;
  name: string;
  whatsapp_admin_phone: string | null;
  logo_src: string | null;
  active: boolean;
};

export type Room = {
  id: string;
  pkg_id: string;
  slug: string;
  name: string;
  short_name: string;
  category: string;
  image_src: string | null;
  amenities: string[];
  active: boolean;
  sort_order: number;
};

export type Booking = {
  id: string;
  pkg_id: string;
  room_slug: string;
  date: string;
  slot: Slot;
  name: string;
  school_or_unit: string;
  purpose: string;
  contact: string;
  contact_normalized: string;
  created_at: string;
  status: BookingStatus;
  approval_token_hash: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  notified_at: string | null;
  notification_error: string | null;
  cancelled_at: string | null;
  attendance_token: string | null;
  attendance_manage_token: string | null;
};

export type Attendee = {
  id: string;
  pkg_id: string;
  booking_id: string;
  name: string;
  contact: string;
  created_at: string;
};

export type AttendanceFormState = {
  ok: boolean;
  message: string;
  count?: number;
};

export type BookingFormState = {
  ok: boolean;
  message: string;
  whatsappUrl?: string;
};

export type LoginState = {
  ok: boolean;
  message: string;
};

export type RoomFormState = {
  ok: boolean;
  message: string;
};

export type CheckBookingResult = {
  id: string;
  date: string;
  room: string;
  slot: string;
  purpose: string;
  status: string;
  whatsappUrl: string;
  manageUrl?: string;
};

export type CheckBookingState = {
  ok: boolean;
  message: string;
  bookings: CheckBookingResult[];
};
