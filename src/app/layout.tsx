import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import { connection } from "next/server";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://chantelle-mx-contest.vercel.app";

const display = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vive París | Chantelle x El Palacio de Hierro",
    template: "%s | Vive París",
  },
  description: "Registra tu compra Chantelle en El Palacio de Hierro y participa por una experiencia en París.",
  applicationName: "Vive París",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: "Vive París",
    title: "Vive París | Chantelle x El Palacio de Hierro",
    description: "Registra tu compra Chantelle en El Palacio de Hierro y participa por una experiencia en París.",
    images: [{ url: "/images/paris-editorial.jpg", width: 1122, height: 1402, alt: "Vive París, promoción de Chantelle" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vive París | Chantelle x El Palacio de Hierro",
    description: "Registra tu compra y participa por una experiencia en París.",
    images: ["/images/paris-editorial.jpg"],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();

  return (
    <html lang="es-MX" className={`${display.variable} ${sans.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
