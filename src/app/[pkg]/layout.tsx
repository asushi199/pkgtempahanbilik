import { notFound } from "next/navigation";
import { loadPkg } from "../../lib/pkg";

export default async function PkgLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { pkg: string };
}) {
  const pkg = await loadPkg(params.pkg);
  if (!pkg) notFound();

  return <>{children}</>;
}
