import { NextResponse } from "next/server";

const publicMessages: Record<string, { status: number; message: string }> = {
  RATE_LIMITED: { status: 429, message: "Recibimos demasiados intentos. Espera unos minutos." },
  DUPLICATE_TICKET: { status: 409, message: "Este ticket ya está registrado." },
  EXPIRED_UPLOAD_INTENT: { status: 410, message: "La sesión de carga venció. Vuelve a seleccionar la foto." },
  INVALID_UPLOAD_INTENT: { status: 400, message: "No pudimos validar la foto del ticket." },
  UPLOAD_NOT_READY: { status: 409, message: "La foto todavía se está procesando." },
  INVALID_ORIGIN: { status: 403, message: "Solicitud no permitida." },
  MISSING_ORIGIN: { status: 403, message: "Solicitud no permitida." },
  CAMPAIGN_CLOSED: { status: 403, message: "El registro no está disponible en este momento." },
  INVALID_CONTENT_TYPE: { status: 415, message: "Formato de solicitud no compatible." },
  PAYLOAD_TOO_LARGE: { status: 413, message: "La solicitud supera el tamaño permitido." },
};

export function apiError(error: unknown) {
  const code =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error && typeof error.message === "string"
        ? error.message
        : "UNKNOWN_ERROR";
  const known = publicMessages[code];

  if (known) {
    return NextResponse.json({ ok: false, code, message: known.message }, { status: known.status });
  }

  console.error("[api] unexpected error", error);
  return NextResponse.json(
    { ok: false, code: "UNEXPECTED_ERROR", message: "Ocurrió un error. Inténtalo nuevamente." },
    { status: 500 },
  );
}
