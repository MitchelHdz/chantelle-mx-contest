import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RulesPage() {
  return (
    <main className="legal-page">
      <Link href="/" className="wordmark">CHANTELLE</Link>
      <p className="eyebrow">Documento pendiente de aprobación legal</p>
      <h1>Bases de participación</h1>
      <p>Esta ruta está preparada para incorporar la versión aprobada de las bases antes de publicar la campaña.</p>
      <Link href="/">Volver al registro</Link>
    </main>
  );
}
