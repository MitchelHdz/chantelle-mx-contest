# Modelo de datos

## Tablas

### `campaigns`

Configura estado y vigencia. El boilerplate crea el slug técnico `chantelle-vive-paris` con el nombre comercial “Chantelle te lleva a París”, en estado borrador para impedir una apertura accidental.

### `upload_intents`

Guarda una intención temporal, huella del ticket, vencimiento y clave de UploadThing. No contiene la imagen. Un intent consumido no puede reutilizarse.

### `participations`

Contiene datos de contacto, ticket, fecha, tienda, clave privada del comprobante, estado y folio. Las huellas HMAC permiten comparar datos sin usarlos en consultas o logs.

La unicidad `(campaign_slug, ticket_fingerprint)` evita registrar el mismo ticket dos veces dentro de una campaña. Correo y teléfono no son únicos porque una persona puede tener más de una compra válida.

### `integration_outbox`

Desacopla registro de correo y Sheets. Un worker toma eventos pendientes, reintenta y marca el procesamiento. Los adaptadores deben ser idempotentes por `participation_id` y `event_type`.

### `audit_events`

Registra acciones administrativas. `metadata` no debe contener correo, teléfono, ticket completo ni enlaces de comprobante.

### `private.rate_limit_buckets`

Guarda el contador temporal de solicitudes por alcance y huella HMAC del origen. No conserva IPs en claro, no se expone por la API pública y los buckets vencidos se eliminan al recibir nuevas solicitudes. Esta tabla permite limitar registros sin Redis ni una integración adicional.

## Permisos

Las tablas de campaña y `private.rate_limit_buckets` tienen RLS habilitada y forzada. No existen políticas públicas y se revocan permisos a `anon` y `authenticated`. La aplicación pública opera mediante un cliente server-only con secret key.

El panel administrativo se implementará con Supabase Auth, MFA para operadores y rutas server-side. No se debe abrir `select` directo al navegador para resolver el panel rápidamente.

## Retención

`retention_until` propone 180 días. Antes de producción, legal debe aprobar finalidad y plazo. Una tarea programada debe borrar:

1. El archivo privado en UploadThing.
2. La participación o sus campos personales.
3. Copias operativas en Sheets.
4. Mensajes o exports temporales.

El evento de borrado sí puede conservarse sin datos personales para auditoría.
