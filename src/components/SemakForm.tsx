"use client";

import { useFormState, useFormStatus } from "react-dom";
import { checkBookingAction } from "../app/[pkg]/semak/actions";
import { initialCheckBookingState } from "../lib/action-states";

function CheckButton() {
  const { pending } = useFormStatus();

  return (
    <button className="primaryButton fullWidth" disabled={pending} type="submit">
      {pending ? "Menyemak..." : "Semak permohonan"}
    </button>
  );
}

export function SemakForm({ pkgId }: { pkgId: string }) {
  const [state, formAction] = useFormState(checkBookingAction, initialCheckBookingState);

  return (
    <section className="bookingCard lookupCard">
      <p className="eyebrow">Cari semula</p>
      <h2>Semak Permohonan Saya</h2>
      <p>
        Masukkan nombor telefon yang digunakan semasa membuat tempahan. Simbol seperti &quot;-&quot;
        akan diabaikan.
      </p>

      <form action={formAction} className="stackForm">
        <input name="pkg" type="hidden" value={pkgId} />
        <label>
          Nombor telefon
          <input inputMode="numeric" name="contact" placeholder="Contoh: 0123456789" required />
        </label>
        <CheckButton />
      </form>

      {state.message ? (
        <div className={state.ok ? "notice success lookupNotice" : "notice error lookupNotice"}>
          {state.message}
        </div>
      ) : null}

      {state.bookings.length > 0 ? (
        <div className="lookupResults">
          {state.bookings.map((booking) => (
            <article className="lookupResult" key={booking.id}>
              <span className="statusBadge pendingBadge">{booking.status}</span>
              <h3>{booking.purpose}</h3>
              <p>
                {booking.date} - {booking.room} - {booking.slot}
              </p>
              {booking.whatsappUrl ? (
                <a className="whatsappButton fullWidth" href={booking.whatsappUrl} rel="noreferrer" target="_blank">
                  Hantar WhatsApp kepada admin
                </a>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
