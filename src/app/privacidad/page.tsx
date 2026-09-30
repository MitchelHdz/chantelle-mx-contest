import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PrivacyPage() {
  const optedOut = (await cookies()).get("tracking_opt_out")?.value === "1";
  return (
    <main className="legal-page">
      <Link href="/" className="wordmark">CHANTELLE</Link>
      <p className="eyebrow">Documento pendiente de aprobación legal</p>
      <h1>Aviso de privacidad</h1>
      <p>Esta ruta está preparada para incorporar el aviso de privacidad aprobado, incluyendo finalidad, retención y derechos ARCO. El sitio utiliza Meta Pixel y Google Tag Manager, cuando están configurados, para medir visitas y campañas. Estas herramientas pueden usar cookies o tecnologías similares. Al continuar navegando en el sitio, aceptas este uso. Esta implementación no envía explícitamente a esas herramientas los datos capturados en el formulario de registro. Puedes desactivar o reactivar esta medición en tu navegador aquí:</p>
      <form action="/api/tracking-preferences" method="post">
        <button type="submit" name="tracking" value={optedOut ? "on" : "off"}>
          {optedOut ? "Reactivar medición" : "Desactivar medición"}
        </button>
      </form>
      <Link href="/">Volver al registro</Link>
    </main>
  );
}
