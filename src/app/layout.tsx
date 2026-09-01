import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import { connection } from "next/server";

import { AnalyticsConsent } from "@/components/analytics-consent";

import "./globals.css";

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
  title: "Vive París | Chantelle",
  description: "Registra tu compra Chantelle y participa por una experiencia en París.",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();

  return (
    <html lang="es-MX" className={`${display.variable} ${sans.variable}`}>
      <body>
        {children}
        <AnalyticsConsent />
      </body>
    </html>
  );
}
