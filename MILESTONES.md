# Hitos de desarrollo

La secuencia conserva el alcance de la cotización y añade un colchón explícito para revisión. Las duraciones son días hábiles y pueden solaparse cuando las cuentas externas estén listas.

## Hito 0. Alineación y accesos

Duración estimada: 1 día.

Entregables:

- Formulario, tiendas, vigencia, regla de duplicados y folio aprobados.
- Bases y aviso de privacidad entregados por cliente o legal.
- Proyectos dedicados de Supabase, UploadThing y Vercel.
- Cuenta de correo y propiedad de GA4 confirmadas.

Criterio de salida: no quedan decisiones abiertas que cambien datos, consentimiento o mecánica.

## Hito 1. Fundación visual y técnica

Duración estimada: 1 a 2 días. Estado: implementado y validado localmente en 390, 768, 1280 y 1440 px.

Entregables:

- Next.js, TypeScript, lint, pruebas y headers de seguridad.
- Tokens, tipografía, composición responsive y componentes base.
- Landing, formulario, estados de progreso, error y confirmación.

Criterio de salida: revisión visual aprobada en 390, 768, 1280 y 1440 px, con navegación por teclado.

## Hito 2. Registro y comprobante

Duración estimada: 2 días. Estado: flujo y contrato transaccional implementados; falta conexión real a Supabase, UploadThing y rate limiting para la validación E2E en Preview.

Entregables:

- Intent de carga firmado y válido durante 15 minutos.
- Carga directa a UploadThing, archivo privado y límite de 4 MB.
- Registro en Supabase, ticket único por campaña y folio.
- Respuestas de error comprensibles y limpieza de archivos huérfanos.

Criterio de salida: registro E2E en preview, duplicado rechazado y comprobante inaccesible sin autorización.

## Hito 3. Operación e integraciones

Duración estimada: 2 a 3 días.

Entregables:

- Panel protegido con Supabase Auth y roles administrativos.
- Búsqueda, filtros, validación de comprobantes y estado del participante.
- Exportación CSV y sincronización opcional a Google Sheets desde el outbox.
- Correo de confirmación con reintentos e idempotencia.

Criterio de salida: operación puede localizar, validar y exportar registros sin acceso a credenciales técnicas.

## Hito 4. Analítica y calidad

Duración estimada: 1 a 2 días.

Entregables:

- Consentimiento, eventos GA4 y tablero de conversión.
- Pruebas unitarias, integración y E2E.
- Revisión de accesibilidad, dispositivos reales, carga lenta y archivos inválidos.
- Verificación de que no aparecen datos personales en analítica, logs o URLs.

Criterio de salida: evidencia de eventos en DebugView y recorrido completo sin defectos bloqueantes.

## Hito 5. Revisión del cliente

Duración reservada: 2 a 3 días.

Incluye una ronda consolidada de comentarios sobre contenido, visuales, correo y operación, más una ronda corta de comprobación. Cambios de mecánica, campos o bases después de este punto se reestiman.

Criterio de salida: aprobación por escrito de diseño, legal, operación y marketing.

## Hito 6. Lanzamiento y estabilización

Duración estimada: 1 día de publicación y 2 días de observación.

Entregables:

- Variables de producción y dominio configurados.
- Migraciones aplicadas con respaldo y plan de reversión.
- Smoke test posterior a publicación.
- Monitoreo de errores, colas, capacidad y registros durante la apertura.

Criterio de salida: flujo estable, responsable operativo asignado y alertas activas.

## Estimación general

Construcción: 10 a 12 días hábiles. Revisión: 2 a 3 días hábiles reservados. La fecha de inicio depende de tener accesos, mecánica y documentos legales completos.
