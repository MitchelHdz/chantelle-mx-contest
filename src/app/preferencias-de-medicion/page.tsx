import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preferencias de medición",
  alternates: { canonical: "/preferencias-de-medicion" },
  robots: { index: false, follow: true },
};

export default async function TrackingPreferencesPage() {
  const optedOut = (await cookies()).get("tracking_opt_out")?.value === "1";

  return (
    <main className="legal-page">
      <Link href="/" className="wordmark">CHANTELLE</Link>
      <p className="eyebrow">Chantelle te lleva a París</p>
      <h1>Preferencias de medición</h1>
      <section className="legal-preferences">
        <h2>Controla la medición en este navegador</h2>
        <p>Este sitio utiliza Meta Pixel y Google Tag Manager, cuando están configurados, para medir visitas y campañas. Estas herramientas pueden usar cookies o tecnologías similares. Al continuar navegando en el sitio, aceptas este uso. Esta implementación no envía explícitamente a esas herramientas los datos capturados en el formulario de registro.</p>
        <form action="/api/tracking-preferences" method="post">
          <button type="submit" name="tracking" value={optedOut ? "on" : "off"}>
            {optedOut ? "Reactivar medición" : "Desactivar medición"}
          </button>
        </form>
      </section>
      <Link href="/">Volver al registro</Link>
    </main>
  );
}
