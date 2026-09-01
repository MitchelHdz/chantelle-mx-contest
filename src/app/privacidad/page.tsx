import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link href="/" className="wordmark">CHANTELLE</Link>
      <p className="eyebrow">Documento pendiente de aprobación legal</p>
      <h1>Aviso de privacidad</h1>
      <p>Esta ruta está preparada para incorporar el aviso de privacidad aprobado, incluyendo finalidad, retención y derechos ARCO. Este sitio no utiliza cookies ni herramientas de analítica.</p>
      <Link href="/">Volver al registro</Link>
    </main>
  );
}
