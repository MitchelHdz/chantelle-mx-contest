const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Chantelle te lleva a París",
  description: "Registro de compra de Chantelle en El Palacio de Hierro para participar por una experiencia en París.",
  inLanguage: "es-MX",
  isPartOf: { "@type": "WebSite", name: "Chantelle te lleva a París" },
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
      { "@type": "HowToStep", name: "Espera los resultados", text: "Conserva tu ticket; nos pondremos en contacto contigo." },
    ],
  },
};

export function StructuredData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />;
}
