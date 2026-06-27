"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createBookingAction } from "../app/[pkg]/actions";
import { initialBookingState } from "../lib/action-states";
import { formatRoom, formatSlot, getConflictingBooking, slots } from "../lib/booking-rules";
import type { Booking, Room, Slot } from "../lib/types";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className="primaryButton fullWidth" disabled={disabled || pending} type="submit">
      {pending ? "Menghantar..." : "Hantar Permohonan"}
    </button>
  );
}

export function BookingForm({
  bookings,
  configured,
  pkgId,
  rooms
}: {
  bookings: Booking[];
  configured: boolean;
  pkgId: string;
  rooms: Room[];
}) {
  const [state, formAction] = useFormState(createBookingAction, initialBookingState);
  const [room, setRoom] = useState<string>(rooms[0]?.slug ?? "");
  const [slot, setSlot] = useState<Slot>("am");
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(false);

  // Open as a bottom-sheet on mobile when the URL hash is #tempah.
  useEffect(() => {
    const sync = () => setOpen(window.location.hash === "#tempah");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 720px)").matches;
    document.body.style.overflow = open && mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function close() {
    history.replaceState(null, "", window.location.pathname + window.location.search);
    setOpen(false);
  }

  const conflict = useMemo(() => {
    if (!date) return undefined;
    return getConflictingBooking(bookings, room, date, slot);
  }, [bookings, date, room, slot]);

  return (
    <>
      <div aria-hidden className={`bookingOverlay${open ? " open" : ""}`} onClick={close} />
      <section className={`bookingCard${open ? " open" : ""}`} id="tempah">
        <button aria-label="Tutup" className="bookingClose" onClick={close} type="button">
          ×
        </button>
        <div className="formTitleRow">
          <div>
            <p className="eyebrow">Tempahan baharu</p>
            <h2>Permohonan Baharu</h2>
          </div>
          <span className="miniBadge">Perlu kelulusan</span>
        </div>
        <p className="formHint">
          Selepas permohonan dihantar, klik butang WhatsApp untuk maklumkan admin.
        </p>

        <form action={formAction} className="stackForm">
          <input name="pkg" type="hidden" value={pkgId} />
          <div className="twoColumn">
            <label>
              Nama
              <input name="name" placeholder="Nama pemohon" required />
            </label>
            <label>
              Sekolah / Unit
              <input name="school_or_unit" placeholder="Contoh: SK Sitiawan" required />
            </label>
          </div>

          <label>
            Tujuan
            <input name="purpose" placeholder="Contoh: Mesyuarat kurikulum" required />
          </label>

          <label>
            Nombor telefon
            <input inputMode="numeric" name="contact" placeholder="Contoh: 0123456789" required />
          </label>

          <div className="twoColumn">
            <label>
              Tarikh
              <input name="date" onChange={(event) => setDate(event.target.value)} required type="date" />
            </label>
            <label>
              Bilik
              <select name="room" onChange={(event) => setRoom(event.target.value)} value={room}>
                {rooms.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Slot
            <select name="slot" onChange={(event) => setSlot(event.target.value as Slot)} value={slot}>
              {slots.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          {conflict ? (
            <div className="notice error">
              {formatRoom(rooms, room)} pada {date} untuk slot {formatSlot(slot)} sedang ditempah /
              menunggu kelulusan oleh <strong>{conflict.name}</strong>.
            </div>
          ) : null}

          {state.message ? (
            <div className={state.ok ? "notice success" : "notice error"}>{state.message}</div>
          ) : null}

          {state.ok && state.whatsappUrl ? (
            <a className="whatsappButton fullWidth" href={state.whatsappUrl} rel="noreferrer" target="_blank">
              Hantar ke WhatsApp
            </a>
          ) : null}

          <SubmitButton disabled={!configured || Boolean(conflict)} />
        </form>
      </section>
    </>
  );
}
