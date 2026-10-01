# Meta Conversions API

La campaña usa el dataset/píxel indicado por `META_PIXEL_ID`. El servidor lee `META_CAPI_ACCESS_TOKEN` y envía a `POST /v25.0/{META_PIXEL_ID}/events`. El token nunca se envía al navegador ni se guarda en este repositorio. `META_TEST_EVENT_CODE` permite ver los envíos del sitio en **Events Manager → Test Events**; retíralo al terminar la prueba.

| Acción | Evento estándar | Momento |
| --- | --- | --- |
| Visita a una página | `PageView` | Al abrir el sitio o navegar a otra ruta |
| Participación completada | `CompleteRegistration` | Después de guardar el registro con éxito |

Cada pareja de eventos Pixel/API comparte `event_id` para que Meta pueda deduplicarla. `PageView` incluye URL sin parámetros, hora, identificador, agente de usuario, IP y cookies `_fbp`/`_fbc` si existen. `CompleteRegistration` añade los hashes SHA-256 de correo normalizado y teléfono con prefijo `52`. El sitio no envía a Meta el ticket, folio, tienda, fecha de compra ni otros campos. El opt-out de `/preferencias-de-medicion` impide ambos envíos.

## Prueba en Graph API Explorer

1. Abre [Graph API Explorer](https://developers.facebook.com/tools/explorer/) y selecciona un token con acceso al dataset. Usa método `POST`, versión `v25.0` y ruta `/{PIXEL_ID}/events`.
2. Agrega `test_event_code` con el valor de **Events Manager → Test Events**.
3. Agrega el parámetro `data` como JSON con el arreglo de abajo. Sustituye `EVENT_TIME_UNIX` por la hora Unix actual en segundos y usa identificadores nuevos en cada prueba. No uses datos reales de participantes para esta prueba.

También puedes generar un payload con hora e identificadores actuales ejecutando `node scripts/meta-capi-test-payload.mjs`. Si `META_TEST_EVENT_CODE` está definido en tu entorno local, el script lo incluirá sin imprimir ningún token de acceso.

```json
[
  {
    "event_name": "PageView",
    "event_time": EVENT_TIME_UNIX,
    "event_id": "test-page-view-001",
    "event_source_url": "https://chantelletellevaaparis.com/",
    "action_source": "website",
    "user_data": {
      "client_ip_address": "192.0.2.1",
      "client_user_agent": "Meta-CAPI-test/1.0"
    }
  },
  {
    "event_name": "CompleteRegistration",
    "event_time": EVENT_TIME_UNIX,
    "event_id": "test-registration-001",
    "event_source_url": "https://chantelletellevaaparis.com/",
    "action_source": "website",
    "user_data": {
      "client_ip_address": "192.0.2.1",
      "client_user_agent": "Meta-CAPI-test/1.0",
      "em": "973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b",
      "ph": "8f9d0944329b5338c6fb86f293ceb39385b596254748dd3628ec62f55c334811"
    }
  }
]
```

Estos ejemplos prueban el formato y la recepción sin datos personales. Para comprobar la deduplicación, usa el mismo `event_id` en un evento Pixel del navegador y en el evento correspondiente de la API, y revisa la pestaña **Test Events**. Una respuesta de Graph API con `events_received: 2` confirma recepción del lote de prueba, no la atribución ni la deduplicación final.
