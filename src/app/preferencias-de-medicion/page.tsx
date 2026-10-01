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
        <p>Este sitio utiliza Meta Pixel, la API de conversiones de Meta y Google Tag Manager, cuando están configurados, para medir visitas y registros. Estas herramientas pueden usar cookies o tecnologías similares. Al continuar navegando en el sitio, aceptas este uso. Para los eventos de Meta se pueden enviar dirección IP, navegador e identificadores de cookies; cuando el registro se completa, también se envían el correo y teléfono normalizados y transformados mediante hash SHA-256 para ayudar a asociar el evento. No se envían a Meta la foto del ticket ni los demás campos del formulario.</p>
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
