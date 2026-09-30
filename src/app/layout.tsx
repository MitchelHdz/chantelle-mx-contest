import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import { connection } from "next/server";
import { cookies } from "next/headers";
import Script from "next/script";
import { TrackingPageView } from "@/components/tracking-page-view";

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
    default: "Chantelle te lleva a París | Chantelle x El Palacio de Hierro",
    template: "%s | Chantelle te lleva a París",
  },
  description: "Registra tu compra Chantelle en El Palacio de Hierro y participa por una experiencia en París.",
  applicationName: "Chantelle te lleva a París",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: "Chantelle te lleva a París",
    title: "Chantelle te lleva a París | Chantelle x El Palacio de Hierro",
    description: "Registra tu compra Chantelle en El Palacio de Hierro y participa por una experiencia en París.",
    images: [{ url: "/images/paris-alexandre-iii.jpg", width: 5520, height: 3905, alt: "Chantelle te lleva a París, promoción de Chantelle" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chantelle te lleva a París | Chantelle x El Palacio de Hierro",
    description: "Registra tu compra y participa por una experiencia en París.",
    images: ["/images/paris-alexandre-iii.jpg"],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();

  const optedOut = (await cookies()).get("tracking_opt_out")?.value === "1";
  const metaPixelId = optedOut ? undefined : process.env.META_PIXEL_ID?.trim();
  const gtmId = optedOut ? undefined : process.env.GTM_CONTAINER_ID?.trim();
  if (metaPixelId && !/^\d+$/.test(metaPixelId)) throw new Error("META_PIXEL_ID debe contener solo dígitos.");
  if (gtmId && !/^GTM-[A-Z0-9]+$/.test(gtmId)) throw new Error("GTM_CONTAINER_ID debe tener formato GTM-XXXX.");

  return (
    <html lang="es-MX" className={`${display.variable} ${sans.variable}`}>
      <head>
        {gtmId ? (
          <Script id="google-tag-manager" strategy="beforeInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`}
          </Script>
        ) : null}
        {metaPixelId ? (
          <Script id="meta-pixel" strategy="beforeInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(metaPixelId)});fbq('track','PageView');`}
          </Script>
        ) : null}
      </head>
      <body>
        {gtmId ? (
          <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="Google Tag Manager" /></noscript>
        ) : null}
        {metaPixelId ? (
          // Meta requires an unoptimized 1×1 image when JavaScript is disabled.
          // eslint-disable-next-line @next/next/no-img-element
          <noscript><img src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`} height="1" width="1" style={{ display: "none" }} alt="" /></noscript>
        ) : null}
        {children}
        <TrackingPageView metaEnabled={Boolean(metaPixelId)} gtmEnabled={Boolean(gtmId)} />
      </body>
    </html>
  );
}
