import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Tempahan Bilik PKG Daerah Manjung",
  description: "Sistem tempahan bilik untuk pusat-pusat kegiatan guru (PKG) Daerah Manjung."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
