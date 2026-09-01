const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Vive París",
  description: "Registro de compra de Chantelle en El Palacio de Hierro para participar por una experiencia en París.",
  inLanguage: "es-MX",
  isPartOf: { "@type": "WebSite", name: "Vive París" },
  about: [
    { "@type": "Organization", name: "Chantelle" },
    { "@type": "Organization", name: "El Palacio de Hierro" },
  ],
  mainEntity: {
    "@type": "HowTo",
    name: "Cómo participar",
    step: [
      { "@type": "HowToStep", name: "Completa tus datos", text: "Escribe los datos que usaste al hacer tu compra." },
      { "@type": "HowToStep", name: "Sube tu ticket", text: "Comparte una foto clara de tu ticket." },
      { "@type": "HowToStep", name: "Guarda tu folio", text: "Al terminar, conserva el número de tu participación." },
    ],
  },
};

export function StructuredData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />;
}
