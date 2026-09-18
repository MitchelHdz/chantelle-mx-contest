# Integraciones

## Supabase

Supabase recibe todos los registros y estados. El cliente público no se conecta a las tablas. La secret key solo existe en Vercel y el cliente de `src/lib/supabase/admin.ts` se crea por solicitud.

Configuración:

1. Crear un proyecto dedicado y seleccionar una región cercana a México.
2. Aplicar la migración con dry run.
3. Copiar URL y secret key a Vercel.
4. Rotar cualquier credencial que haya aparecido en correo, chat o commits.
5. Activar alertas de base de datos y revisar límites del plan.

La publishable key está reservada para el futuro login administrativo. No es un sustituto de RLS.

## UploadThing

La ruta `receipt` admite una imagen de hasta 4 MB, una sola por intent, con ACL privada, disposición `attachment` y URL prefirmada de 15 minutos.

Flujo:

1. Next.js crea el intent en Supabase y firma su ID temporal.
2. El navegador solicita una URL prefirmada a UploadThing.
3. UploadThing recibe el archivo directamente.
4. El callback guarda los metadatos privados del archivo y deriva la huella HMAC del ticket a partir de su hash.

El plan contratado debe soportar archivos privados. Para revisar un ticket, el panel solicitará una URL firmada de corta duración. Nunca se guardará una URL pública en Sheets.

## Google Sheets

Sheets es una vista operativa, no la fuente oficial. El worker del outbox envía filas con un webhook firmado. El receptor:

- valida una firma HMAC incluida en el cuerpo con comparación de tiempo constante;
- usa el folio como clave de upsert;
- conserva `Revisión` y `Comentarios` cuando actualiza datos automáticos;
- no incluye file keys ni enlaces permanentes;
- registra la última sincronización y devuelve una respuesta JSON verificable.

Cada registro intenta procesar el outbox después de responder al navegador. El cron diario de Vercel procesa pendientes como respaldo y aplica backoff exponencial hasta 20 intentos. La operación y el contrato de columnas se documentan en `docs/GOOGLE-SHEETS-OPERATIONS.md`.

## Correo

El adaptador usa Resend por REST. Producción requiere dominio autenticado con SPF, DKIM y DMARC. El envío se procesa desde el outbox para que un error del proveedor no invalide un registro ya creado.

El email confirma folio y reglas básicas. No adjunta el ticket ni expone enlaces privados.
