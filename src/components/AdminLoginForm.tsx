"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "../app/[pkg]/admin/actions";
import { initialLoginState } from "../lib/action-states";

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button className="primaryButton fullWidth" disabled={pending} type="submit">
      {pending ? "Menyemak..." : "Log masuk"}
    </button>
  );
}

export function AdminLoginForm({ pkgId }: { pkgId: string }) {
  const [state, formAction] = useFormState(loginAction, initialLoginState);

  return (
    <form action={formAction} className="stackForm">
      <input name="pkg" type="hidden" value={pkgId} />
      <label>
        Kata laluan
        <input autoComplete="current-password" name="password" required type="password" />
      </label>
      {state.message ? <div className="notice error">{state.message}</div> : null}
      <LoginButton />
    </form>
  );
}
