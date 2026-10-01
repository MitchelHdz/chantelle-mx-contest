import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso de privacidad integral",
  alternates: { canonical: "/privacidad" },
  robots: { index: true, follow: true },
};

export default async function PrivacyPage() {
  const optedOut = (await cookies()).get("tracking_opt_out")?.value === "1";

  return (
    <main className="legal-page">
      <Link href="/" className="wordmark">CHANTELLE</Link>
      <p className="eyebrow">Chantelle te lleva a París</p>
      <h1>Aviso de privacidad integral</h1>
      <article className="legal-document">
        <section>
          <h2>1. Responsable del Tratamiento de Datos Personales</h2>
          <p>Groupe Chantelle (en adelante &quot;Chantelle&quot;), con domicilio para efectos de la presente promoción en Paris, es el responsable del tratamiento y protección de sus datos personales recolectados a través del sitio web chantelletellevaaparis.com.</p>
        </section>
        <section>
          <h2>2. Datos Personales Recabados</h2>
          <p>Para participar en la promoción &quot;Chantelle te lleva a París&quot;, recabamos los siguientes datos personales: nombre completo, correo electrónico, número telefónico y fotografía de ticket de compra.</p>
        </section>
        <section>
          <h2>3. Finalidades del Tratamiento</h2>
          <p>Sus datos serán utilizados para las siguientes finalidades necesarias:</p>
          <ul>
            <li>Validar su participación en la promoción y la autenticidad del ticket de compra.</li>
            <li>Contactar a la persona ganadora y coordinar la entrega de los premios con la agencia ejecutora y Viajes Palacio.</li>
          </ul>
          <p>Finalidades secundarias (opcionales):</p>
          <p>Si otorgó su consentimiento mediante la casilla correspondiente (opt-in), sus datos podrán ser utilizados para el envío de comunicaciones publicitarias, promociones, boletines y novedades comerciales relativas a Chantelle y El Palacio de Hierro.</p>
        </section>
        <section>
          <h2>4. Transferencia de Datos</h2>
          <p>Sus datos podrán ser compartidos con El Palacio de Hierro y proveedores de servicios (agencias publicitarias y de viajes) exclusivamente para el cumplimiento de las finalidades de esta promoción y la entrega de premios.</p>
          <p>Los datos personales recabados serán conservados por un periodo de 1 (un) año a partir de su recopilación y puesta a disposición, únicamente para el cumplimiento de las finalidades descritas en el presente aviso y la gestión de la promoción</p>
        </section>
        <section>
          <h2>5. Derechos ARCO y Revocación del Consentimiento</h2>
          <p>Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse (Derechos ARCO) al tratamiento de sus datos personales, o revocar el consentimiento otorgado para fines secundarios. Para ejercer estos derechos, puede enviar una solicitud al correo electrónico: chantelle.mexico@groupechantelle.com.</p>
        </section>
        <section>
          <h2>6. Cambios al Aviso de Privacidad</h2>
          <p>Cualquier modificación a este aviso estará disponible para su consulta en este mismo sitio web.</p>
        </section>
      </article>
      <p><a href="/documentos/aviso-de-privacidad-integral.pdf" target="_blank" rel="noopener noreferrer">Consultar el aviso aprobado en PDF (abre en una pestaña nueva)</a></p>
      <section className="legal-preferences" aria-labelledby="tracking-preferences-title">
        <h2 id="tracking-preferences-title">Preferencias de medición</h2>
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
