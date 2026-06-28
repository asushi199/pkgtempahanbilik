import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminTopNav } from "../../../../components/AdminTopNav";
import { isAdminSession } from "../../../../lib/admin-session";
import { loadPkg } from "../../../../lib/pkg";
import { getPkg } from "../../../../lib/repository";
import { updateSettingsAction } from "./actions";

export default async function AdminSettingsPage({
  params,
  searchParams
}: {
  params: { pkg: string };
  searchParams: { status?: string };
}) {
  const pkgId = params.pkg;
  const base = `/${pkgId}`;

  if (!isAdminSession()) {
    redirect("/admin");
  }

  const pkg = (await loadPkg(pkgId))!;
  const full = await getPkg(pkgId);
  const saved = searchParams.status === "saved";
  const logoError = searchParams.status === "logo_error";

  return (
    <main className="shell">
      <AdminTopNav pkg={pkg} pkgId={pkgId} />
      <section className="adminTop">
        <div>
          <p className="eyebrow">Tetapan · {pkg.name}</p>
          <h1>Tetapan PKG</h1>
          <p>Tetapkan nombor WhatsApp penanggungjawab yang menerima permohonan tempahan.</p>
        </div>
        <div className="heroActions">
          <Link className="ghostButton" href={`${base}/admin`}>
            Tempahan
          </Link>
          <Link className="ghostButton" href={`${base}/admin/rooms`}>
            Urus Bilik
          </Link>
        </div>
      </section>

      {saved ? <div className="notice success">Tetapan berjaya disimpan.</div> : null}
      {logoError ? (
        <div className="notice error">
          Muat naik logo gagal. Semak format (JPG/PNG/WEBP) dan saiz (≤5MB).
        </div>
      ) : null}

      <section className="bookingCard lookupCard" style={{ maxWidth: "100%" }}>
        <p className="eyebrow">Tetapan PKG</p>
        <h2>WhatsApp & Logo</h2>
        <p>
          Apabila pengguna menghantar tempahan, butang WhatsApp akan menghantar mesej kelulusan
          kepada nombor ini. Guna format antarabangsa tanpa simbol — contoh: <code>60123456789</code>.
        </p>

        {full?.logo_src ? (
          <div style={{ margin: "14px 0 4px" }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>
              Logo semasa
            </p>
            <img
              alt={`Logo ${pkg.name}`}
              src={full.logo_src}
              style={{
                width: 72,
                height: 72,
                objectFit: "contain",
                background: "#fff",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: 6
              }}
            />
          </div>
        ) : null}

        <form action={updateSettingsAction} className="stackForm">
          <input name="pkg" type="hidden" value={pkgId} />
          <label>
            Nombor WhatsApp penanggungjawab
            <input
              defaultValue={full?.whatsapp_admin_phone ?? ""}
              inputMode="numeric"
              name="whatsapp_admin_phone"
              placeholder="Contoh: 60123456789"
            />
          </label>
          <label>
            Logo PKG (pilihan — JPG / PNG / WEBP)
            <input accept="image/jpeg,image/png,image/webp" name="logo" type="file" />
          </label>
          <button className="primaryButton fullWidth" type="submit">
            Simpan tetapan
          </button>
        </form>
      </section>
    </main>
  );
}
