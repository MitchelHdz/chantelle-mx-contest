"use client";

import { FormEvent, useRef, useState } from "react";

import { campaign } from "@/lib/config/campaign";
import { track } from "@/lib/analytics/events";
import { useUploadThing } from "@/lib/uploadthing";

type FormStatus = "idle" | "preparing" | "uploading" | "submitting" | "success" | "error";

type ApiResult = {
  ok: boolean;
  uploadIntent?: string;
  folio?: string;
  code?: string;
  message?: string;
};

export function RegistrationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [folio, setFolio] = useState("");

  const { startUpload } = useUploadThing("receipt", {
    onUploadProgress: setProgress,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const receipt = data.get("receipt");

    if (!(receipt instanceof File) || receipt.size === 0) {
      setStatus("error");
      setMessage("Agrega una foto legible de tu ticket.");
      return;
    }

    if (receipt.size > 4 * 1024 * 1024) {
      setStatus("error");
      setMessage("La imagen debe pesar menos de 4 MB.");
      return;
    }

    const payload = {
      firstName: String(data.get("firstName") ?? ""),
      lastName: String(data.get("lastName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      store: String(data.get("store") ?? ""),
      ticketNumber: String(data.get("ticketNumber") ?? ""),
      purchaseDate: String(data.get("purchaseDate") ?? ""),
      consent: data.get("consent") === "on",
      website: String(data.get("website") ?? ""),
    };

    let activeStage: FormStatus = "preparing";

    try {
      setMessage("");
      setStatus("preparing");
      track("registration_submitted", { campaign: campaign.slug, store: payload.store });

      const intentResponse = await fetch("/api/upload-intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketNumber: payload.ticketNumber,
          store: payload.store,
          website: payload.website,
        }),
      });
      const intent = (await intentResponse.json()) as ApiResult;
      if (!intentResponse.ok || !intent.uploadIntent) {
        throw new Error(intent.message ?? "No pudimos preparar la carga.");
      }

      setStatus("uploading");
      activeStage = "uploading";
      track("receipt_upload_started", { campaign: campaign.slug });
      const uploaded = await startUpload([receipt], { uploadIntent: intent.uploadIntent });
      if (!uploaded?.length) throw new Error("No pudimos subir la foto del ticket.");
      track("receipt_upload_completed", { campaign: campaign.slug });

      setStatus("submitting");
      activeStage = "submitting";
      const response = await fetch("/api/participations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, uploadIntent: intent.uploadIntent }),
      });
      const result = (await response.json()) as ApiResult;
      if (!response.ok || !result.folio) {
        const submissionError = new Error(result.message ?? "No pudimos completar el registro.");
        submissionError.name = result.code ?? "SUBMISSION_ERROR";
        throw submissionError;
      }

      setFolio(result.folio);
      setStatus("success");
      formRef.current?.reset();
      track("registration_succeeded", { campaign: campaign.slug, store: payload.store });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Ocurrió un error. Inténtalo nuevamente.");
      track("registration_failed", {
        campaign: campaign.slug,
        stage: activeStage,
        error_code: error instanceof Error ? error.name : "UNKNOWN_ERROR",
      });
    }
  }

  const isBusy = ["preparing", "uploading", "submitting"].includes(status);

  if (status === "success") {
    return (
      <section className="success-panel" aria-live="polite">
        <p className="eyebrow">Registro confirmado</p>
        <h2>Tu folio es {folio}</h2>
        <p>Guárdalo. También enviaremos la confirmación al correo registrado cuando el servicio de correo esté activo.</p>
        <button type="button" className="text-button" onClick={() => setStatus("idle")}>
          Registrar otro ticket
        </button>
      </section>
    );
  }

  return (
    <form
      ref={formRef}
      className="registration-form"
      onSubmit={handleSubmit}
      onFocus={() => {
        if (!startedRef.current) {
          startedRef.current = true;
          track("registration_started", { campaign: campaign.slug });
        }
      }}
    >
      <div className="form-grid">
        <Field label="Nombre" name="firstName" autoComplete="given-name" minLength={2} maxLength={80} />
        <Field label="Apellido" name="lastName" autoComplete="family-name" minLength={2} maxLength={100} />
        <Field label="Correo electrónico" name="email" type="email" autoComplete="email" />
        <Field label="Teléfono" name="phone" type="tel" inputMode="tel" autoComplete="tel" minLength={10} maxLength={20} />

        <label className="field">
          <span>Tienda</span>
          <select name="store" required defaultValue="">
            <option value="" disabled>
              Selecciona una tienda
            </option>
            {campaign.allowedStores.map((store) => (
              <option key={store.value} value={store.value}>
                {store.label}
              </option>
            ))}
          </select>
        </label>

        <Field label="Número de ticket" name="ticketNumber" autoComplete="off" minLength={4} maxLength={40} />
        <Field label="Fecha de compra" name="purchaseDate" type="date" max={new Date().toISOString().slice(0, 10)} />

        <label className="field field--wide upload-field">
          <span>Foto de tu ticket</span>
          <small>JPG, PNG o HEIC. Máximo 4 MB. Asegúrate de que el número sea legible.</small>
          <input name="receipt" type="file" accept="image/jpeg,image/png,image/heic,image/heif" required />
        </label>
      </div>

      <label className="honeypot" aria-hidden="true">
        Sitio web
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <label className="checkbox">
        <input name="consent" type="checkbox" required />
        <span>
          Acepto las <a href={campaign.rulesUrl}>bases de participación</a> y el{" "}
          <a href={campaign.privacyUrl} onClick={() => track("privacy_opened", { campaign: campaign.slug })}>
            aviso de privacidad
          </a>
          .
        </span>
      </label>

      {status === "uploading" ? (
        <div className="progress" aria-live="polite">
          <span style={{ width: `${progress}%` }} />
          <small>Subiendo foto: {progress}%</small>
        </div>
      ) : null}

      {message ? <p className="form-error" role="alert">{message}</p> : null}

      <button className="button button--submit" type="submit" disabled={isBusy}>
        {status === "preparing" && "Preparando carga"}
        {status === "uploading" && "Subiendo ticket"}
        {status === "submitting" && "Generando folio"}
        {!isBusy && "Registrar mi participación"}
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  inputMode?: "tel";
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
  max?: string;
};

function Field({ label, name, type = "text", inputMode, autoComplete, minLength, maxLength, max }: FieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        max={max}
        required
      />
    </label>
  );
}
