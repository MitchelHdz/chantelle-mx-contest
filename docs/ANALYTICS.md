# Analítica

## Objetivo

Medir dónde se pierde una participación y si el flujo funciona en dispositivos reales, sin enviar datos personales a GA4.

## Eventos

| Evento | Momento | Parámetros permitidos |
|---|---|---|
| `landing_view` | Vista inicial | `campaign` |
| `registration_started` | Primer foco dentro del formulario | `campaign` |
| `receipt_upload_started` | Inicia la carga | `campaign` |
| `receipt_upload_completed` | UploadThing confirma | `campaign` |
| `registration_submitted` | Se solicita el intent | `campaign`, `store` |
| `registration_succeeded` | Se genera el folio | `campaign`, `store` |
| `registration_failed` | Error recuperable o técnico | `campaign`, `stage`, `error_code` |
| `privacy_opened` | Se consulta privacidad | `campaign` |

No se permiten nombre, apellido, email, teléfono, ticket, folio, file key, URL, texto libre ni identificadores que puedan unirse a una persona. `sanitizeAnalyticsProperties` elimina claves sospechosas como una segunda barrera.

## Consentimiento

- GA4 no se carga hasta que la persona acepta medición.
- La decisión se guarda localmente y debe poder cambiarse desde un control de privacidad antes de producción.
- Rechazar analítica no afecta el registro.
- Los logs técnicos deben usar códigos y `participation_id`, no PII.

## Embudo

```text
landing_view
  → registration_started
  → receipt_upload_started
  → receipt_upload_completed
  → registration_succeeded
```

Antes del lanzamiento se valida con Tag Assistant y GA4 DebugView. Ver eventos en código o en el build no demuestra que estén llegando a la propiedad correcta.
