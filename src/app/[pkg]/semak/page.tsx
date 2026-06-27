import Link from "next/link";
import { MobileTabBar } from "../../../components/MobileTabBar";
import { SemakForm } from "../../../components/SemakForm";
import { loadPkg } from "../../../lib/pkg";

export default async function SemakPage({ params }: { params: { pkg: string } }) {
  const pkg = (await loadPkg(params.pkg))!;
  const base = `/${params.pkg}`;

  return (
    <main className="shell compactShell">
      <nav className="topNav">
        <Link className="brandMark" href={base}>
          <img alt={pkg.name} className="brandLogo" src={pkg.logo_src ?? "/ustp-manjung.png"} />
          <strong>{pkg.name}</strong>
        </Link>
        <div className="topNavLinks">
          <Link href={base}>Jadual</Link>
        </div>
      </nav>

      <section className="hero compactHero">
        <div>
          <p className="eyebrow">Tempahan {pkg.name}</p>
          <h1>Semak Permohonan</h1>
          <p className="heroText">
            Cari semula permohonan yang masih menunggu kelulusan dan hantar semula mesej WhatsApp
            kepada admin.
          </p>
        </div>
        <div className="heroActions">
          <Link className="ghostButton" href={base}>
            Kembali ke jadual
          </Link>
        </div>
      </section>

      <div className="lookupShell">
        <SemakForm pkgId={params.pkg} />
      </div>

      <MobileTabBar active="semak" pkgId={params.pkg} />
    </main>
  );
}
