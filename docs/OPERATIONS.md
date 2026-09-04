# Operación y lanzamiento

## Ambientes

- Local: credenciales de desarrollo y campaña ficticia.
- Preview: Supabase y UploadThing separados de producción, acceso restringido.
- Production: dominio final, credenciales exclusivas, alertas y respaldos.

Una preview nunca debe escribir en la base productiva.

## Variables en Vercel

Clasificar cada valor por ambiente. Solo `NEXT_PUBLIC_*` puede entrar al bundle. Después de cargar secrets, desplegar de nuevo y comprobar que ningún valor aparece en HTML, JavaScript, source maps o logs.

## Checklist de salida

1. Confirmar campaña activa, fechas y tiendas.
2. Incorporar textos legales aprobados.
3. Ejecutar migración primero con `--dry-run` y conservar respaldo.
4. Verificar registro, duplicado, carga privada, folio, correo y Sheets.
5. Probar 390, 768, 1280 y 1440 px, teclado y lector de pantalla básico.
6. Confirmar que no se cargan cookies ni analítica y que no aparecen datos personales.
7. Validar el límite de solicitudes en Supabase y la respuesta bajo falla de Supabase, UploadThing y correo.
8. Publicar, hacer smoke test y revisar logs sin imprimir payloads.

## Monitoreo

Alertas mínimas:

- Tasa de errores 5xx por encima de 2% durante 5 minutos.
- Más de 10 fallos de UploadThing en 10 minutos.
- Outbox pendiente por más de 15 minutos.
- Capacidad de almacenamiento por encima de 75%.
- Aumento anormal de intentos o bloqueos por IP hash.

## Recuperación

- Error visual: rollback de Vercel al deployment anterior.
- Migración defectuosa: aplicar migración correctiva; no editar una migración ya aplicada.
- Proveedor de correo caído: conservar outbox y reintentar con backoff.
- Sheets caído: el registro continúa en Supabase y se sincroniza después.
- UploadThing caído: bloquear nuevas participaciones con un mensaje claro; no aceptar registros sin comprobante.
- Posible fuga: pausar campaña, rotar secrets, preservar evidencia sin PII y seguir el proceso legal de incidente.

## Límite de solicitudes

No se usa Redis ni otro proveedor. La función privada `public.consume_rate_limit` escribe contadores por ventana en `private.rate_limit_buckets`; solo el servidor, usando la secret key de Supabase, puede invocarla. Los identificadores se guardan como huellas HMAC y los buckets vencidos se eliminan durante solicitudes posteriores.

Si Supabase no responde, el registro se rechaza temporalmente con HTTP 503. Después de cualquier cambio de migración, comprobar en Preview que el tercer intento de una prueba con máximo dos solicitudes devuelve HTTP 429.

## Responsables por definir

Antes de publicar deben existir nombres para operación de campaña, soporte al participante, legal/privacidad, infraestructura y aprobación de ganadores.
