# SEO y presencia en buscadores

## Alcance

La página principal está preparada para que buscadores y asistentes puedan identificar claramente la promoción, las marcas participantes y los pasos para registrarse. No se configura publicidad, analítica ni rastreo de comportamiento.

## Implementación

- `src/app/layout.tsx` define título, descripción, canonical, Open Graph, Twitter Card, idioma `es-MX` y `metadataBase`.
- `src/app/icon.png` es el favicon de la aplicación mediante la convención de archivos de Next.js.
- `src/app/robots.ts` permite rastrear el sitio público y declara `sitemap.xml`.
- `src/app/sitemap.ts` publica solo la página principal. Bases y privacidad permanecen fuera hasta que legal entregue las versiones definitivas.
- `src/components/structured-data.tsx` añade JSON-LD `WebPage` con las organizaciones participantes y los pasos de participación. El contenido coincide con la página visible.
- Las imágenes sociales usan la pieza editorial existente. Antes de lanzamiento debe revisarse su recorte en WhatsApp, LinkedIn y X.

## Criterios de contenido

- Usar el nombre de la promoción, Chantelle y El Palacio de Hierro de forma consistente.
- Explicar la mecánica con frases breves y concretas.
- No inventar fechas, premios, cobertura, restricciones o condiciones legales en metadatos ni datos estructurados.
- Mantener el aviso de privacidad y las bases fuera del índice mientras sean marcadores.

## Antes de publicar

1. Cambiar `NEXT_PUBLIC_APP_URL` por el dominio final con `https`.
2. Revisar título, descripción, canonical y previews sociales contra la URL de producción.
3. Incorporar las bases y el aviso aprobados. Solo entonces evaluar su indexación.
4. Solicitar la indexación de la URL principal desde la cuenta de Search Console del dominio, si el equipo de marketing decide hacerlo.
