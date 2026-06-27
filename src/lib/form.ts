import type { Slot } from "./types";

export function parseSlot(value: FormDataEntryValue | null): Slot | null {
  if (value === "am" || value === "pm" || value === "full_day") return value;
  return null;
}

export function requiredText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
