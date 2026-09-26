# Operación de participaciones en Google Sheets

## Objetivo

Mantener una vista editable y fácil de exportar de las participaciones, sin convertir Google Sheets en la fuente oficial. La hoja incluye un acceso seguro a cada fotografía privada para revisión operativa.

## Flujo operativo

1. El registro público guarda la participación en Supabase y genera un evento en `integration_outbox`.
2. Al responder al usuario, Next.js intenta procesar hasta cinco eventos pendientes en segundo plano.
3. Un job diario en Vercel vuelve a intentar cualquier evento que no se haya sincronizado.
4. El receptor de Google Apps Script valida una firma HMAC y hace upsert por folio.
5. Las columnas automáticas se actualizan desde Supabase; `Revisión` y `Comentarios` se conservan para el equipo.

## Responsabilidades de la hoja

- Automáticas: folio, fechas, datos de contacto, tienda, estado, consentimiento, última sincronización y enlace seguro a la foto del ticket.
- Manuales: `Revisión` y `Comentarios`.
- Excluidas: claves internas, URL directa del proveedor y huellas de datos.

## Seguridad y confiabilidad

- Supabase permanece como fuente oficial.
- `Foto del ticket` contiene un enlace firmado por participación. Al abrirlo, la aplicación valida el enlace y genera acceso temporal al archivo privado.
- Cualquier persona con acceso al enlace puede ver esa foto; la hoja debe compartirse únicamente con el equipo autorizado.
- El webhook usa un secreto distinto al resto de las credenciales.
- Los eventos tienen estado independiente para Google Sheets, hasta 20 intentos y backoff exponencial.
- El job diario funciona como respaldo; el registro público no falla si Sheets no está disponible.
- El receptor neutraliza valores que pudieran interpretarse como fórmulas.

## Operación

- Para revisar: hacer clic en `Abrir foto`, validar el ticket y completar `Revisión`/`Comentarios`.
- Para exportar: `Archivo > Descargar > Valores separados por comas (.csv)`.
- Para diagnosticar: consultar `sheets_attempts`, `sheets_last_error` y `sheets_processed_at` en `integration_outbox`.
- Si cambia la estructura de columnas, actualizar juntos el libro y `integrations/google-apps-script/Code.gs`.
