"use server";

import { redirect } from "next/navigation";
import { clearAdminSession, setAdminSession } from "../../lib/admin-session";
import { requiredText } from "../../lib/form";
import { verifyAdminPassword } from "../../lib/pkg";
import type { LoginState } from "../../lib/types";

export async function loginAction(_previousState: LoginState, formData: FormData) {
  const password = requiredText(formData, "password");

  if (!verifyAdminPassword(password)) {
    return { ok: false, message: "Kata laluan tidak tepat atau belum ditetapkan." };
  }

  setAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  clearAdminSession();
  redirect("/");
}
