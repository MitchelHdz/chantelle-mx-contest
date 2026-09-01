# Arquitectura

## Decisión principal

Supabase es la fuente de verdad. UploadThing almacena comprobantes y Google Sheets recibe una copia operativa eventual. Esta separación permite volver a generar la Sheet, auditar cambios y evitar que una edición manual se convierta en el registro oficial.

## Flujo de registro

```text
Navegador
   │ 1. solicita intent firmado
   ▼
Next.js /api/upload-intents ───────► Supabase: upload_intents
   │ token HMAC de 15 minutos
   ▼
Navegador ── 2. imagen directa ───► UploadThing privado
                                         │ callback verificado
                                         ▼
                                   Next.js /api/uploadthing
                                         │ file key
                                         ▼
                                   Supabase: upload_intents
   │
   │ 3. datos + token
   ▼
Next.js /api/participations ──────► Supabase: participations + outbox
   │                                      │
   │ folio                                ├─► Google Sheets
   ▼                                      └─► Resend
Confirmación
```

El archivo no atraviesa el servidor de la aplicación. El servidor solo firma la intención, recibe el callback de UploadThing y guarda la clave privada del archivo.

## Límites de confianza

- Navegador: no confiable. Nunca recibe `SUPABASE_SECRET_KEY`, secretos HMAC ni token de rate limiting.
- Next.js: valida formato, origen, frecuencia, vigencia e identidad del intent.
- UploadThing: acepta un archivo solo con intent firmado. Su callback debe ser validado por el SDK.
- Supabase: RLS forzada, sin grants a `anon` o `authenticated` para las tablas de campaña.
- Integraciones: leen eventos del outbox, no forman parte de la transacción visible para la persona.

## Estructura

```text
src/app/                 páginas y Route Handlers
src/components/          interfaz de registro y datos estructurados
src/lib/config/          campaña y variables
src/lib/data/            acceso server-only a Supabase
src/lib/security/        HMAC, origen y rate limiting
src/lib/integrations/    Sheets y correo
src/app/robots.ts        reglas de rastreo
src/app/sitemap.ts       URLs públicas indexables
supabase/migrations/     contrato versionado de base de datos
docs/                    decisiones, operación y seguridad
```

## Ejecución

- Node.js runtime para rutas con crypto, Supabase y UploadThing.
- Server Components por defecto; el formulario es Client Component.
- Sin estado en memoria para controles de producción.
- Vercel Preview para QA y Production solo después del checklist.
- Render dinámico de páginas para emitir un nonce CSP distinto en cada solicitud. Los recursos estáticos siguen cacheados por Next.js y Vercel.
- La página principal incluye datos estructurados JSON-LD. Las rutas legales pendientes se marcan `noindex` hasta recibir aprobación.

## Decisiones pendientes

- URL final y si vive en subdominio o ruta de `chantelle.mx`.
- Lista definitiva de tiendas y vigencia de compra.
- Política exacta para tickets repetidos o con múltiples artículos.
- Periodo legal de retención. El esquema propone 180 días como marcador, no como decisión legal.
- Plan de UploadThing que permita ACL privada. Si no está disponible, usar Supabase Storage privado o Vercel Blob privado.
