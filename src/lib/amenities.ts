// Senarai kemudahan pratetap (sumber tunggal untuk borang admin & paparan awam).
// Nilai disimpan dalam rooms.amenities (text[]): item pratetap simpan `key`,
// item tersuai simpan teks asal. Paparan padankan key -> ikon; jika tiada padanan
// ia dianggap kemudahan tersuai dan menggunakan ikon umum.

export type AmenityDef = { key: string; label: string; icon: string };

export const PRESET_AMENITIES: AmenityDef[] = [
  { key: "aircond", label: "Penyaman udara", icon: "❄️" },
  { key: "projector", label: "Projektor", icon: "📽️" },
  { key: "smartboard", label: "Smartboard", icon: "🖥️" },
  { key: "whiteboard", label: "Papan putih", icon: "📝" },
  { key: "wifi", label: "Wi-Fi", icon: "📶" },
  { key: "audio", label: "Sistem audio", icon: "🔊" },
  { key: "microphone", label: "Mikrofon", icon: "🎤" },
  { key: "chairs", label: "Kerusi", icon: "🪑" },
  { key: "tables", label: "Meja", icon: "🟫" },
  { key: "tv", label: "TV / Skrin", icon: "📺" }
];

const PRESET_BY_KEY = new Map(PRESET_AMENITIES.map((item) => [item.key, item]));
const PRESET_KEYS = new Set(PRESET_AMENITIES.map((item) => item.key));

const CUSTOM_ICON = "✅";

export type ResolvedAmenity = { label: string; icon: string };

// Tukar nilai tersimpan -> senarai paparan {label, icon}.
export function resolveAmenities(values: string[]): ResolvedAmenity[] {
  return values.map((value) => {
    const preset = PRESET_BY_KEY.get(value);
    if (preset) return { label: preset.label, icon: preset.icon };
    return { label: value, icon: CUSTOM_ICON };
  });
}

// Asingkan nilai tersuai (bukan pratetap) untuk dipaparkan semula dalam borang edit.
export function customAmenities(values: string[]): string[] {
  return values.filter((value) => !PRESET_KEYS.has(value));
}

export function isPresetAmenity(value: string): boolean {
  return PRESET_KEYS.has(value);
}
