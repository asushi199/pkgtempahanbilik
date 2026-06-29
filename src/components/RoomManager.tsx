import {
  createRoomAction,
  deactivateRoomAction,
  reactivateRoomAction,
  updateRoomAction
} from "../app/[pkg]/admin/rooms/actions";
import { PRESET_AMENITIES, customAmenities } from "../lib/amenities";
import type { Room } from "../lib/types";
import { AmenityIcon } from "./AmenityIcon";

function AmenityFields({ selected }: { selected?: string[] }) {
  const chosen = new Set(selected ?? []);
  return (
    <fieldset className="amenityPicker">
      <legend>Kemudahan dalam bilik</legend>
      <div className="amenityCheckGrid">
        {PRESET_AMENITIES.map((item) => (
          <label className="amenityCheck" key={item.key}>
            <input
              defaultChecked={chosen.has(item.key)}
              name="amenities"
              type="checkbox"
              value={item.key}
            />
            <AmenityIcon name={item.key} />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
      <label>
        Kemudahan lain (satu baris satu / pisah dengan koma)
        <textarea
          defaultValue={customAmenities(selected ?? []).join("\n")}
          name="amenities_custom"
          placeholder="Contoh: Pemanas air, Pantri, Surau berdekatan"
          rows={3}
        />
      </label>
    </fieldset>
  );
}

export function RoomManager({ pkgId, rooms }: { pkgId: string; rooms: Room[] }) {
  return (
    <>
      <section className="bookingCard lookupCard" style={{ maxWidth: "100%", marginBottom: 20 }}>
        <p className="eyebrow">Tambah bilik</p>
        <h2>Bilik Baharu</h2>
        <p>Isi maklumat bilik dan muat naik gambar (JPG / PNG / WEBP, maksimum 5MB).</p>

        <form action={createRoomAction} className="stackForm">
          <input name="pkg" type="hidden" value={pkgId} />
          <div className="twoColumn">
            <label>
              Nama bilik
              <input name="name" placeholder="Contoh: Bilik Mesyuarat Utama" required />
            </label>
            <label>
              Nama ringkas
              <input name="short_name" placeholder="Contoh: Mesyuarat" />
            </label>
          </div>
          <div className="twoColumn">
            <label>
              Kategori
              <input name="category" placeholder="Contoh: Bilik Mesyuarat" />
            </label>
            <label>
              Susunan (kecil dahulu)
              <input defaultValue={0} min={0} name="sort_order" type="number" />
            </label>
          </div>
          <label>
            Gambar bilik
            <input accept="image/jpeg,image/png,image/webp" name="photo" type="file" />
          </label>
          <AmenityFields />
          <button className="primaryButton fullWidth" type="submit">
            Tambah bilik
          </button>
        </form>
      </section>

      {rooms.length === 0 ? (
        <section className="emptyState">
          <h2>Belum ada bilik</h2>
          <p>Tambah bilik pertama menggunakan borang di atas.</p>
        </section>
      ) : (
        <div className="roomManagerGrid">
          {rooms.map((room) => (
            <article className={`roomManageCard${room.active ? "" : " inactive"}`} key={room.id}>
              {room.image_src ? (
                <img alt={room.name} className="roomManageThumb" src={room.image_src} />
              ) : (
                <div className="roomManageThumb placeholder">Tiada gambar</div>
              )}
              <div className="roomManageBody">
                <div>
                  <h3>{room.name}</h3>
                  <p>
                    {room.category} · {room.active ? "Aktif" : "Dinyahaktif"}
                  </p>
                </div>

                <details className="editPanel">
                  <summary>Kemaskini bilik</summary>
                  <form action={updateRoomAction} className="stackForm">
                    <input name="pkg" type="hidden" value={pkgId} />
                    <input name="id" type="hidden" value={room.id} />
                    <label>
                      Nama bilik
                      <input defaultValue={room.name} name="name" required />
                    </label>
                    <label>
                      Nama ringkas
                      <input defaultValue={room.short_name} name="short_name" />
                    </label>
                    <label>
                      Kategori
                      <input defaultValue={room.category} name="category" />
                    </label>
                    <label>
                      Susunan
                      <input defaultValue={room.sort_order} min={0} name="sort_order" type="number" />
                    </label>
                    <label>
                      Tukar gambar (pilihan)
                      <input accept="image/jpeg,image/png,image/webp" name="photo" type="file" />
                    </label>
                    <AmenityFields selected={room.amenities} />
                    <button className="primaryButton fullWidth" type="submit">
                      Simpan perubahan
                    </button>
                  </form>
                </details>

                {room.active ? (
                  <form action={deactivateRoomAction}>
                    <input name="pkg" type="hidden" value={pkgId} />
                    <input name="id" type="hidden" value={room.id} />
                    <button className="dangerButton fullWidth" type="submit">
                      Nyahaktif (sembunyi)
                    </button>
                  </form>
                ) : (
                  <form action={reactivateRoomAction}>
                    <input name="pkg" type="hidden" value={pkgId} />
                    <input name="id" type="hidden" value={room.id} />
                    <button className="ghostButton fullWidth" type="submit">
                      Aktifkan semula
                    </button>
                  </form>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
