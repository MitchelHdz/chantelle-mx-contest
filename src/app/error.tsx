"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ui] render failure", error.digest ?? "unknown");
  }, [error]);

  return (
    <main className="legal-page error-page">
      <p className="eyebrow">No pudimos mostrar esta página</p>
      <h1>Intentémoslo de nuevo</h1>
      <p>Tu información no se perdió por este mensaje. Recarga la experiencia y vuelve a intentarlo.</p>
      <button type="button" className="button" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}
