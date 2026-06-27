import Link from "next/link";

const messages: Record<string, { title: string; body: string; tone: "success" | "error" }> = {
  approved: {
    title: "Tempahan Diluluskan",
    body: "Tempahan ini kini rasmi dan dipaparkan sebagai telah ditempah.",
    tone: "success"
  },
  rejected: {
    title: "Tempahan Ditolak",
    body: "Slot ini telah dilepaskan semula untuk permohonan lain.",
    tone: "success"
  },
  invalid: {
    title: "Pautan Tidak Sah",
    body: "Token kelulusan tidak sah. Sila gunakan pautan asal daripada WhatsApp.",
    tone: "error"
  },
  unauthorized: {
    title: "Kata Laluan Tidak Sah",
    body: "Kelulusan hanya boleh dibuat selepas kata laluan admin yang betul dimasukkan.",
    tone: "error"
  },
  processed: {
    title: "Telah Diproses",
    body: "Permohonan ini telah diproses sebelum ini.",
    tone: "success"
  }
};

export default function ApprovalResultPage({
  params,
  searchParams
}: {
  params: { pkg: string };
  searchParams: { status?: string };
}) {
  const message = messages[searchParams.status || "invalid"] || messages.invalid;

  return (
    <main className="authShell">
      <section className="authCard">
        <p className="eyebrow">Kelulusan Tempahan</p>
        <h1>{message.title}</h1>
        <div className={`notice ${message.tone}`}>{message.body}</div>
        <Link className="primaryButton fullWidth" href={`/${params.pkg}`}>
          Lihat jadual
        </Link>
      </section>
    </main>
  );
}
