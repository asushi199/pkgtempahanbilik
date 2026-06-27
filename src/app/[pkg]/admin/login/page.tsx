import Link from "next/link";
import { AdminLoginForm } from "../../../../components/AdminLoginForm";
import { loadPkg } from "../../../../lib/pkg";

export default async function AdminLoginPage({ params }: { params: { pkg: string } }) {
  const pkg = (await loadPkg(params.pkg))!;
  const base = `/${params.pkg}`;

  return (
    <main className="authShell">
      <section className="authCard">
        <p className="eyebrow">Admin {pkg.name}</p>
        <h1>Log Masuk Admin</h1>
        <p>Masukkan kata laluan admin untuk mengurus tempahan bilik {pkg.name}.</p>
        <AdminLoginForm pkgId={params.pkg} />
        <Link className="textLink" href={base}>
          Kembali ke jadual
        </Link>
      </section>
    </main>
  );
}
