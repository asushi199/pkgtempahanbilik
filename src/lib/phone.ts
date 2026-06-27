export function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}
