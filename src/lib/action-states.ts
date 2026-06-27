import type { BookingFormState, CheckBookingState, LoginState, RoomFormState } from "./types";

export const initialBookingState: BookingFormState = {
  ok: false,
  message: "",
  whatsappUrl: ""
};

export const initialLoginState: LoginState = {
  ok: false,
  message: ""
};

export const initialRoomState: RoomFormState = {
  ok: false,
  message: ""
};

export const initialCheckBookingState: CheckBookingState = {
  ok: false,
  message: "",
  bookings: []
};
