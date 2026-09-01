# Chantelle Vive París

Boilerplate del micrositio de registro para la promoción Chantelle. Vive en una carpeta independiente para conservar la cotización estática sin cambios y permitir que Vercel trate esta aplicación como un proyecto separado.

## Qué incluye

- Landing y formulario mobile-first con un sistema visual editorial Chantelle x El Palacio de Hierro.
- Flujo de registro con validación en cliente y servidor.
- UploadThing con carga directa, archivos privados, límite de 4 MB e intentos firmados con vencimiento.
- Supabase como fuente de verdad, tablas con RLS forzada y sin acceso directo desde el navegador.
- Folio único, detección de ticket duplicado y outbox para sincronizaciones.
- Adaptadores opcionales para Google Sheets y correo de confirmación.
- Sin cookies ni analítica de comportamiento; el aviso de privacidad debe reflejarlo al aprobarse.
- SEO técnico, sitemap, robots, metadatos sociales y datos estructurados para explicar la promoción de forma clara.
- Encabezados de seguridad, control de origen, honeypot y rate limiting distribuido.
- Migración SQL inicial, pruebas unitarias y documentación de arquitectura, operación y seguridad.

## Estado real

Es una base ejecutable, no una campaña lista para abrir al público. Antes de producción deben conectarse cuentas reales, aplicar la migración, configurar rate limiting, incorporar textos legales aprobados y completar el panel operativo. Consulta [MILESTONES.md](./MILESTONES.md).

## Requisitos

- Node.js 22 o superior.
- Un proyecto Supabase dedicado.
- Una app UploadThing con archivos privados habilitados.
- Un servicio compatible con la API REST de Upstash para rate limiting.
- Vercel para previews y producción.

## Arranque local

```bash
cp .env.example .env.local
npm install
npm run dev
```

La interfaz puede compilar sin credenciales. Las rutas de registro responderán con error hasta completar `.env.local` y aplicar la migración.

En Vercel, importa este repositorio como un proyecto independiente y deja **Root Directory** en `.`. Usa Node.js 22. Configura las variables de [`.env.example`](./.env.example) por ambiente; en Preview, `NEXT_PUBLIC_APP_URL` debe resolver a la URL del deployment y en Production al dominio final. Así la validación de origen funciona en ambos ambientes.

El archivo [`vercel.json`](./vercel.json) usa instalación reproducible con `npm ci` y el build estándar de Next.js. Antes de crear el deployment, configura la integración de Supabase, UploadThing y rate limiting: en producción las rutas de registro fallan cerradas cuando falta rate limiting.

## Supabase

```bash
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
```

El `--dry-run` es obligatorio en ambientes compartidos. La migración no concede acceso a `anon` ni `authenticated`; las operaciones públicas pasan por el servidor Next.js usando `SUPABASE_SECRET_KEY`.

## Validación

```bash
npm run check
```

También conviene ejecutar un registro E2E en preview con un ticket de prueba y comprobar Supabase, UploadThing, correo y exportación.

## Documentación

- [Arquitectura](./docs/ARCHITECTURE.md)
- [Sistema de diseño](./DESIGN_SYSTEM.md)
- [SEO y presencia en buscadores](./docs/DISCOVERABILITY.md)
- [Hitos de desarrollo](./MILESTONES.md)
- [Modelo de datos](./docs/DATA_MODEL.md)
- [Integraciones](./docs/INTEGRATIONS.md)
- [Seguridad](./docs/SECURITY.md)
- [Operación y lanzamiento](./docs/OPERATIONS.md)
