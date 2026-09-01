# Seguridad

## Modelo de amenazas

| Riesgo | Control actual | Trabajo previo a producción |
|---|---|---|
| Secreto expuesto al navegador | Módulos `server-only` y variables sin `NEXT_PUBLIC_` | Escaneo de bundle y secretos en CI |
| Registro automatizado | Honeypot, rate limit distribuido y límites de archivo | Añadir protección anti-bot administrada si el abuso lo exige |
| Reutilización de carga | Token HMAC con vencimiento, intent en DB y `consumed_at` | Prueba concurrente e idempotencia transaccional |
| Ticket duplicado | Huella HMAC y restricción única por campaña | Aprobar regla de negocio y manejo manual |
| Exposición de comprobante | ACL privada, `attachment`, file key server-only | Verificar plan, URLs firmadas y permisos del panel |
| Acceso directo a datos | RLS forzada, sin grants a roles de navegador | Probar con anon key y revisar advisors |
| CSRF o petición cruzada | Verificación exacta de `Origin` en POST | Probar dominios preview y producción |
| Inyección y XSS | Zod, React escaping, CSP con nonce por solicitud y sin HTML libre | DAST en preview y revisión de dependencias |
| PII en logs | No registrar payloads completos ni datos de formulario | Auditoría de Vercel Logs y errores |
| Dependencia vulnerable | Versiones fijadas, lockfile y override de `effect` | Dependabot/Renovate y `npm audit` en CI |
| Datos retenidos de más | `retention_until` | Job de purga y aprobación legal |

## Reglas obligatorias

- Nunca guardar secrets en Git, capturas, tickets o documentación compartida.
- Usar proyectos separados para preview y producción.
- Rotar `SUPABASE_SECRET_KEY`, `UPLOADTHING_TOKEN` y secretos HMAC por incidente o cambio de proveedor.
- No registrar payloads completos. Los errores públicos usan códigos y mensajes controlados.
- El sitio no incorpora cookies ni analítica de comportamiento. El aviso de privacidad aprobado debe conservar esta declaración y describir el tratamiento del registro.
- No aceptar MIME o extensión como prueba suficiente. Antes de producción se debe inspeccionar firma mágica y recomprimir imágenes en un proceso aislado.
- El panel administrativo requiere MFA, sesión corta, roles y auditoría.
- Toda exportación debe expirar y quedar limitada a personal autorizado.
- El bucket o app de comprobantes no debe permitir listados públicos.

## Limitaciones conocidas del boilerplate

- La finalización usa una función RPC para crear la participación, generar el folio, escribir el outbox y consumir el intent de forma atómica. Falta probar carreras y reintentos contra los servicios reales.
- Falta un proceso de limpieza para archivos cargados cuyo registro no terminó.
- El adaptador de rate limiting asume una API compatible con comandos Redis REST. Debe probarse con el proveedor elegido.
- Las páginas legales son marcadores y bloquean la salida a producción.
- El formulario permite HEIC en el selector; se debe confirmar compatibilidad real de UploadThing y navegadores objetivo.

## Checklist de revisión

- [ ] `npm audit --audit-level=high` sin vulnerabilidades.
- [ ] Secret scanning sin hallazgos.
- [ ] RLS activada y grants verificados desde anon y authenticated.
- [ ] Archivo inaccesible sin URL firmada.
- [ ] Rate limit falla cerrado en producción.
- [ ] CSP con nonce único y sin `unsafe-eval` en producción.
- [ ] Datos personales ausentes de logs, Sentry y URLs.
- [ ] Prueba de duplicado y doble clic concurrente.
- [ ] Borrado de registro elimina también archivo y copia de Sheets.
- [ ] Respaldo, restauración y rotación de secretos probados.
