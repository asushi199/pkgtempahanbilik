// Paparkan nama dalam bentuk "Setiap Perkataan Bermula Huruf Besar".
// Hanya untuk paparan — data asal (cth. nama bilik) tidak diubah.
export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/(\s+)/)
    .map((part) => (part.trim() ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join("");
}
