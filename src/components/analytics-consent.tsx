"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import { track } from "@/lib/analytics/events";
import { campaign } from "@/lib/config/campaign";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function AnalyticsConsent() {
  const [consent, setConsent] = useState<"pending" | "granted" | "denied">("pending");
  const landingSentRef = useRef(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("chantelle_analytics_consent");
    if (saved !== "granted" && saved !== "denied") return;

    const frame = window.requestAnimationFrame(() => {
      setConsent(saved);
      if (saved === "granted" && !landingSentRef.current) {
        landingSentRef.current = true;
        track("landing_view", { campaign: campaign.slug });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function decide(value: "granted" | "denied") {
    window.localStorage.setItem("chantelle_analytics_consent", value);
    setConsent(value);
    if (value === "granted" && !landingSentRef.current) {
      landingSentRef.current = true;
      track("landing_view", { campaign: campaign.slug });
    }
  }

  return (
    <>
      {consent === "granted" && measurementId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
          <Script id="ga4-consent-config" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true,allow_google_signals:false});`}
          </Script>
        </>
      ) : null}

      {consent === "pending" ? (
        <aside className="consent" aria-label="Preferencias de medición">
          <p>
            Usamos medición anónima para mejorar el registro. No enviamos nombre, contacto, ticket ni foto a analítica.
          </p>
          <div className="consent__actions">
            <button type="button" className="text-button" onClick={() => decide("denied")}>
              Solo esenciales
            </button>
            <button type="button" className="button button--small" onClick={() => decide("granted")}>
              Aceptar medición
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
