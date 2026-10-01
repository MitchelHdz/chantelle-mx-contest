import Link from "next/link";
import type { Metadata } from "next";

import { legalPages } from "./legal-text";

const pdfUrl = "/documentos/bases-chantelle-te-lleva-a-paris.pdf";

export const metadata: Metadata = {
  title: "Bases de participación y términos y condiciones",
  alternates: { canonical: "/bases" },
  robots: { index: true, follow: true },
};

export default function RulesPage() {
  return (
    <main className="legal-page">
      <Link href="/" className="wordmark">CHANTELLE</Link>
      <p className="eyebrow">Chantelle te lleva a París</p>
      <h1>Bases de participación</h1>
      <p>Consulta los términos y condiciones aprobados de la promoción.</p>
      <p><a href={pdfUrl} target="_blank" rel="noopener noreferrer">Abrir el documento original en PDF (nueva pestaña)</a></p>
      <iframe className="legal-pdf" src={pdfUrl} title="Términos y condiciones de Chantelle te lleva a París" />
      <article className="legal-document" aria-label="Texto de los términos y condiciones">
        <h2>Términos y condiciones: “Chantelle te lleva a París”</h2>
        {legalPages.map((page, index) => (
          <section className="legal-document__page" key={index}>
            <h2>Página {index + 1} de {legalPages.length}</h2>
            <div className="legal-document__text">{page}</div>
          </section>
        ))}
      </article>
      <Link href="/">Volver al registro</Link>
    </main>
  );
}
