# Sistema de diseño

## Dirección

La landing es una invitación de marca, no una pantalla de software. El tono combina la herencia de Chantelle con una mecánica sencilla: una persona debe entender qué hacer, registrar su compra y conservar su folio sin enfrentarse a lenguaje técnico ni a una interfaz recargada.

La composición parte de texto amplio, fotografía editorial y separadores finos. No usa tarjetas decorativas, gradientes de moda ni métricas de campaña. El formulario conserva una superficie propia para que se lea con claridad, pero no se presenta como un producto separado de la landing.

## Principios

- La primera lectura responde qué es la promoción y qué acción se espera.
- El lenguaje es directo, cercano y legible para personas adultas y mayores.
- Los logos de Chantelle y El Palacio de Hierro aparecen juntos en el encabezado como firma de la colaboración.
- La fotografía acompaña al contenido; no lleva texto importante ni sustituye instrucciones.
- El rojo se reserva para acciones, foco y acentos puntuales.
- Solo hay transiciones cortas de interacción. No hay animación automática ni efectos decorativos.

## Tokens

Los tokens viven en `src/app/globals.css`.

| Rol | Claro | Oscuro | Uso |
|---|---:|---:|---|
| Canvas | `#f6f6f3` | `#191918` | Fondo general |
| Surface | `#ecece7` | `#252522` | Área del formulario |
| Ink | `#20201e` | `#f1f0eb` | Texto y acción principal |
| Muted | `#5f5f59` | `#c4c3ba` | Texto secundario |
| Accent | `#a51f36` | `#e15c70` | Acción y énfasis |
| Line | `#c7c7bf` | `#575750` | Separadores y campos |

La escala espacial usa 4, 8, 12, 16, 24, 32, 48, 72 y 112 px. Los bordes son rectos para mantener una sensación editorial y sobria.

## Tipografía

- `Bodoni Moda`: títulos. Su alto contraste se justifica por la campaña de moda y su uso se limita a momentos de jerarquía.
- `Manrope`: navegación, texto, formulario y estados. Prioriza claridad en tamaños normales.
- H1: `clamp(70px, 17vw, 160px)`.
- H2: `clamp(42px, 6vw, 85px)`.
- Cuerpo: 16 a 20 px según contexto.
- Etiquetas: mínimo 14 px; las instrucciones y mensajes de ayuda nunca dependen solo del color.

## Componentes

### Firma de marca

El encabezado combina el SVG oficial de Chantelle, el signo de colaboración y el archivo de El Palacio de Hierro. Tiene texto alternativo útil y sigue siendo un enlace claro hacia el inicio.

### Acción principal

El botón principal es rectangular, con alto mínimo de 55 px, contraste alto y foco visible. Cambia al rojo únicamente al interactuar. No hay iconos superfluos ni llamados competidores.

### Mecánica

Tres instrucciones en lenguaje cotidiano, separadas por líneas. No se numeran porque el orden ya se entiende al leerlas y se evita ruido visual innecesario.

### Formulario

Las etiquetas están sobre cada control y la foto del ticket pide requisitos concretos: formato, peso y legibilidad. Los errores se muestran con texto y no solo con color. La confirmación prioriza el folio y evita confeti o celebraciones automáticas.

### Cierre editorial

La frase final aprobada es: `Celebrando 150 años`. Se superpone sobre una imagen únicamente como cierre de marca y mantiene contraste mediante una capa discreta.

## Responsive y preferencias

- Móvil, 320 a 767 px: el mensaje y la acción se ven antes de la fotografía; controles a una columna y zonas táctiles cómodas.
- Tablet, 768 a 1023 px: hero dividido y formulario en dos columnas cuando el espacio lo permite.
- Desktop, 1024 px en adelante: explicación y formulario quedan lado a lado para reducir desplazamiento.
- Modo oscuro: usa los mismos pesos visuales, ajusta contraste y conserva la legibilidad de los logos.
- `prefers-reduced-motion`: elimina el desplazamiento suave y reduce las transiciones.

## Accesibilidad

- Todos los campos tienen etiqueta nativa.
- El foco visible usa un contorno de 3 px.
- Errores usan `role="alert"` y la confirmación usa `aria-live`.
- Las imágenes llevan texto alternativo descriptivo; la imagen de marca no es decorativa.
- El contenido, controles y estados deben comprobarse a 390, 768, 1280 y 1440 px antes de publicar.
