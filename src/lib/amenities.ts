// Senarai kemudahan pratetap (sumber tunggal untuk borang admin & paparan awam).
// Nilai disimpan dalam rooms.amenities (text[]): item pratetap simpan `key`,
// item tersuai simpan teks asal. Ikon dipadankan dari `key` melalui komponen
// AmenityIcon (borang admin & paparan awam guna ikon yang sama).

export type AmenityDef = { key: string; label: string };

export const PRESET_AMENITIES: AmenityDef[] = [
  { key: "aircond", label: "Penyaman udara" },
  { key: "projector", label: "Projektor" },
  { key: "smartboard", label: "Smartboard" },
  { key: "whiteboard", label: "Papan putih" },
  { key: "wifi", label: "Wi-Fi" },
  { key: "audio", label: "Sistem audio" },
  { key: "microphone", label: "Mikrofon" },
  { key: "chairs", label: "Kerusi" },
  { key: "tables", label: "Meja" },
  { key: "tv", label: "TV / Skrin" },
  { key: "green_screen", label: "Skrin hijau (kroma)" },
  { key: "studio_light", label: "Lampu studio" },
  { key: "camera", label: "Kamera" },
  { key: "teleprompter", label: "Teleprompter" }
];

const PRESET_BY_KEY = new Map(PRESET_AMENITIES.map((item) => [item.key, item]));
const PRESET_KEYS = new Set(PRESET_AMENITIES.map((item) => item.key));

export type ResolvedAmenity = { key: string; label: string };

// Tukar nilai tersimpan -> senarai paparan {key, label}. Item tersuai
// mempunyai key "" (paparan guna ikon umum).
export function resolveAmenities(values: string[]): ResolvedAmenity[] {
  return values.map((value) => {
    const preset = PRESET_BY_KEY.get(value);
    if (preset) return { key: preset.key, label: preset.label };
    return { key: "", label: value };
  });
}

// Asingkan nilai tersuai (bukan pratetap) untuk dipaparkan semula dalam borang edit.
export function customAmenities(values: string[]): string[] {
  return values.filter((value) => !PRESET_KEYS.has(value));
}

export function isPresetAmenity(value: string): boolean {
  return PRESET_KEYS.has(value);
}
