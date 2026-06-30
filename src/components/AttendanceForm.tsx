"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerAttendanceAction } from "../app/[pkg]/hadir/actions";
import { initialAttendanceState } from "../lib/action-states";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="primaryButton fullWidth" disabled={pending} type="submit">
      {pending ? "Merekod..." : "Rekod kehadiran"}
    </button>
  );
}

export function AttendanceForm({ pkgId, token }: { pkgId: string; token: string }) {
  const [state, formAction] = useFormState(registerAttendanceAction, initialAttendanceState);

  if (state.ok) {
    return (
      <div className="notice success">
        <p>{state.message}</p>
        {typeof state.count === "number" ? (
          <p>Jumlah kehadiran direkod setakat ini: {state.count} orang.</p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="stackForm">
      <input name="pkg" type="hidden" value={pkgId} />
      <input name="token" type="hidden" value={token} />
      <label>
        Nama penuh
        <input name="name" placeholder="Nama anda" required />
      </label>
      <label>
        Telefon / Emel
        <input name="contact" placeholder="Contoh: 0123456789" required />
      </label>

      {state.message ? <div className="notice error">{state.message}</div> : null}

      <SubmitButton />
    </form>
  );
}
