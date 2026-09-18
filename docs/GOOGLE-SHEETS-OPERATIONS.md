# Operación de participaciones en Google Sheets

## Objetivo

Mantener una vista editable y fácil de exportar de las participaciones, sin convertir Google Sheets en la fuente oficial ni exponer la fotografía privada del ticket.

## Flujo operativo

1. El registro público guarda la participación en Supabase y genera un evento en `integration_outbox`.
2. Al responder al usuario, Next.js intenta procesar hasta cinco eventos pendientes en segundo plano.
3. Un job diario en Vercel vuelve a intentar cualquier evento que no se haya sincronizado.
4. El receptor de Google Apps Script valida una firma HMAC y hace upsert por folio.
5. Las columnas automáticas se actualizan desde Supabase; `Revisión` y `Comentarios` se conservan para el equipo.

## Responsabilidades de la hoja

- Automáticas: folio, fechas, datos de contacto, tienda, estado, consentimiento y última sincronización.
- Manuales: `Revisión` y `Comentarios`.
- Excluidas: foto del ticket, URL del archivo, claves internas y huellas de datos.

## Seguridad y confiabilidad

- Supabase permanece como fuente oficial.
- El webhook usa un secreto distinto al resto de las credenciales.
- Los eventos tienen estado independiente para Google Sheets, hasta 20 intentos y backoff exponencial.
- El job diario funciona como respaldo; el registro público no falla si Sheets no está disponible.
- El receptor neutraliza valores que pudieran interpretarse como fórmulas.

## Operación

- Para revisar: filtrar por tienda, fecha o estado y completar `Revisión`/`Comentarios`.
- Para exportar: `Archivo > Descargar > Valores separados por comas (.csv)`.
- Para diagnosticar: consultar `sheets_attempts`, `sheets_last_error` y `sheets_processed_at` en `integration_outbox`.
- Si cambia la estructura de columnas, actualizar juntos el libro y `integrations/google-apps-script/Code.gs`.
