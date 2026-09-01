"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="es-MX">
      <body>
        <main className="legal-page error-page">
          <p className="eyebrow">El sitio necesita recargarse</p>
          <h1>Volvamos al inicio</h1>
          <p>Espera un momento e inténtalo nuevamente.</p>
          <button type="button" className="button" onClick={reset}>
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
