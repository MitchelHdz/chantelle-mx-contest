# Sistema de diseño

## Dirección

El micrositio debe sentirse como una pieza editorial de Chantelle que también resuelve una tarea práctica. La referencia es París contemporáneo: precisa, segura y sofisticada, sin ornamentos románticos ni efectos que resten confianza al formulario.

La jerarquía tiene tres niveles claros:

1. Tipografía display para campaña y mensajes emocionales.
2. Sans serif para orientación, campos y acciones.
3. Microtexto solo para ayuda, estados y aspectos legales.

## Principios

- El registro es la acción principal. Ningún recurso visual debe competir con él.
- El espacio en blanco organiza; no se usan tarjetas flotantes como solución automática.
- Las fotografías se recortan con intención y nunca se estiran.
- El rojo aparece como señal de marca y énfasis, no como fondo permanente.
- Las animaciones duran entre 180 y 250 ms y explican un cambio de estado.
- Todo contenido importante mantiene contraste AA y un tamaño legible en móvil.

## Tokens

Los tokens viven en `src/app/globals.css`.

| Rol | Claro | Oscuro | Uso |
|---|---:|---:|---|
| Canvas | `#f4f0e9` | `#171513` | Fondo general |
| Surface | `#ebe4da` | `#211e1b` | Zona de formulario |
| Ink | `#171513` | `#efe9e0` | Texto y acción principal |
| Muted | `#665f58` | `#b9afa5` | Texto secundario |
| Accent | `#a92532` | `#e65b68` | Marca y estados destacados |
| Line | `#c9beb1` | `#4a433d` | Separadores y campos |

La escala espacial parte de 4 px y usa 8, 12, 16, 24, 32, 48, 72 y 112 px. El radio máximo habitual es 2 px.

## Tipografía

- `Bodoni Moda`: H1 y H2. Su alto contraste se justifica por el carácter editorial y de moda de la campaña.
- `Manrope`: navegación, texto, formulario y estados.
- H1: `clamp(72px, 17vw, 160px)`.
- H2: `clamp(43px, 7vw, 90px)`.
- Cuerpo: 16 a 20 px según contexto.
- Etiquetas: 13 px, peso 700, sin reducir el contenido de ayuda por debajo de 13 px.

## Componentes

### Botón principal

Rectangular, fondo tinta y etiqueta en mayúsculas. En hover adopta el rojo de marca. Tiene una altura mínima de 56 px y conserva foco visible.

### Campo

Etiqueta encima, altura mínima de 54 px, fondo del canvas y borde de 1 px. Los errores se explican con texto; el color nunca es la única señal.

### Carga de ticket

Área de borde discontinuo, instrucciones de peso y legibilidad, progreso numérico y estado persistente. No muestra una URL pública.

### Confirmación

Reemplaza el formulario, presenta el folio como información principal y ofrece registrar otro ticket. No usa confeti ni animaciones decorativas.

## Responsive

- Móvil, 320 a 767 px: una columna, imagen antes del mensaje y controles de ancho completo.
- Tablet, 768 a 1023 px: dos columnas donde el contenido lo permite.
- Desktop, 1024 px en adelante: hero dividido y formulario junto a la explicación.
- El modo oscuro se activa con la preferencia del sistema y conserva el carácter de marca.

## Accesibilidad

- Etiquetas nativas en todos los campos.
- Foco de 3 px y contraste independiente del color de marca.
- Mensajes de error con `role="alert"` y confirmación con `aria-live`.
- Respeto a `prefers-reduced-motion`.
- Imágenes editoriales con texto alternativo; elementos decorativos deben usar alt vacío.
