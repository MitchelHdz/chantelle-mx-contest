"use client";

import { ChangeEvent, DragEvent, FormEvent, useEffect, useRef, useState } from "react";

import { campaign } from "@/lib/config/campaign";
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
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const receiptPreviewRef = useRef("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [folio, setFolio] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const [isDraggingReceipt, setIsDraggingReceipt] = useState(false);

  const { startUpload } = useUploadThing("receipt", {
    onUploadProgress: setProgress,
  });

  useEffect(() => () => {
    if (receiptPreviewRef.current) URL.revokeObjectURL(receiptPreviewRef.current);
  }, []);

  function updateReceipt(file: File | null) {
    if (receiptPreviewRef.current) URL.revokeObjectURL(receiptPreviewRef.current);
    const previewUrl = file ? URL.createObjectURL(file) : "";
    receiptPreviewRef.current = previewUrl;
    setReceiptPreview(previewUrl);
    setReceipt(file);
  }

  function setReceiptInput(file: File) {
    if (!receiptInputRef.current) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    receiptInputRef.current.files = transfer.files;
  }

  function selectReceipt(file: File | null, syncInput = false) {
    setReceiptError("");
    setMessage("");

    if (!file) {
      updateReceipt(null);
      return;
    }

    const acceptedTypes = ["image/jpeg", "image/png", "image/heic", "image/heif"];
    const hasAcceptedExtension = /\.(jpe?g|png|heic|heif)$/i.test(file.name);
    if (!acceptedTypes.includes(file.type) && !hasAcceptedExtension) {
      updateReceipt(null);
      setReceiptError("Elige una imagen JPG, PNG o HEIC.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      updateReceipt(null);
      setReceiptError("La imagen debe pesar menos de 4 MB.");
      return;
    }

    if (syncInput) setReceiptInput(file);
    updateReceipt(file);
    setProgress(0);
    if (status === "error") setStatus("idle");
  }

  function handleReceiptChange(event: ChangeEvent<HTMLInputElement>) {
    selectReceipt(event.currentTarget.files?.[0] ?? null);
  }

  function handleReceiptDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDraggingReceipt(true);
  }

  function handleReceiptDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setIsDraggingReceipt(false);
    }
  }

  function handleReceiptDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDraggingReceipt(false);
    selectReceipt(event.dataTransfer.files?.[0] ?? null, true);
  }

  function removeReceipt() {
    updateReceipt(null);
    setReceiptError("");
    setProgress(0);
    if (receiptInputRef.current) receiptInputRef.current.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const receiptFile = receipt ?? data.get("receipt");

    if (!(receiptFile instanceof File) || receiptFile.size === 0) {
      setStatus("error");
      setReceiptError("Agrega una foto legible de tu ticket.");
      return;
    }

    if (receiptFile.size > 4 * 1024 * 1024) {
      setStatus("error");
      setReceiptError("La imagen debe pesar menos de 4 MB.");
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

    try {
      setMessage("");
      setStatus("preparing");

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
      const uploaded = await startUpload([receiptFile], { uploadIntent: intent.uploadIntent });
      if (!uploaded?.length) throw new Error("No pudimos subir la foto del ticket.");

      setStatus("submitting");
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
      updateReceipt(null);
      setProgress(0);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Ocurrió un error. Inténtalo nuevamente.");
    }
  }

  const isBusy = ["preparing", "uploading", "submitting"].includes(status);

  if (status === "success") {
    return (
      <section className="success-panel" aria-live="polite">
        <h2>Tu folio es {folio}</h2>
        <p>Guárdalo para cualquier consulta sobre tu participación.</p>
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

        <div className="field field--wide upload-field">
          <span id="receipt-label">Foto de tu ticket</span>
          <small id="receipt-help">JPG, PNG o HEIC. Máximo 4 MB. El número debe verse claro.</small>
          <input
            ref={receiptInputRef}
            className="upload-picker__input"
            id="receipt"
            name="receipt"
            type="file"
            accept="image/jpeg,image/png,image/heic,image/heif"
            required
            aria-labelledby="receipt-label"
            aria-describedby={`receipt-help${receiptError ? " receipt-error" : ""}`}
            aria-invalid={receiptError ? "true" : undefined}
            onChange={handleReceiptChange}
          />
          <div
            className={`upload-picker ${receipt ? "upload-picker--selected" : ""} ${isDraggingReceipt ? "upload-picker--dragging" : ""} ${receiptError ? "upload-picker--error" : ""}`}
            onDragEnter={handleReceiptDragEnter}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={handleReceiptDragLeave}
            onDrop={handleReceiptDrop}
          >
            {receipt && receiptPreview ? (
              <div className="upload-picker__selected">
                <div
                  className="upload-picker__preview"
                  role="img"
                  aria-label="Vista previa de la foto del ticket"
                  style={{ backgroundImage: `url("${receiptPreview}")` }}
                />
                <div className="upload-picker__details">
                  <p>Foto lista para enviar</p>
                  <span>{receipt.name}</span>
                  <small>{formatFileSize(receipt.size)} · {receipt.type.replace("image/", "").toUpperCase()}</small>
                  <div className="upload-picker__actions">
                    <button type="button" className="text-button" onClick={() => receiptInputRef.current?.click()} disabled={isBusy}>
                      Cambiar imagen
                    </button>
                    <button type="button" className="text-button text-button--quiet" onClick={removeReceipt} disabled={isBusy}>
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button type="button" className="upload-picker__empty" onClick={() => receiptInputRef.current?.click()} disabled={isBusy}>
                <strong>{isDraggingReceipt ? "Suelta la foto aquí" : "Selecciona la foto de tu ticket"}</strong>
                <span>También puedes arrastrarla a este espacio.</span>
                <small>Una imagen por registro · hasta 4 MB</small>
              </button>
            )}
          </div>
          {receiptError ? <p id="receipt-error" className="field-error" role="alert">{receiptError}</p> : null}
        </div>
      </div>

      <label className="honeypot" aria-hidden="true">
        Sitio web
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <label className="checkbox">
        <input name="consent" type="checkbox" required />
        <span>
          Acepto las <a href={campaign.rulesUrl}>bases de participación</a> y el{" "}
          <a href={campaign.privacyUrl}>aviso de privacidad</a>
          .
        </span>
      </label>

      {isBusy ? (
        <div className="upload-status" aria-live="polite">
          <div className="upload-status__steps" aria-label="Estado de tu registro">
            <span className={status === "preparing" ? "is-active" : "is-complete"}>Preparar</span>
            <span className={status === "uploading" ? "is-active" : status === "submitting" ? "is-complete" : ""}>Subir foto</span>
            <span className={status === "submitting" ? "is-active" : ""}>Generar folio</span>
          </div>
          {status === "uploading" ? (
            <div className="progress" role="progressbar" aria-label="Subiendo foto del ticket" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
              <span style={{ width: `${progress}%` }} />
              <small>Subiendo foto: {progress}%</small>
            </div>
          ) : (
            <p>{status === "preparing" ? "Revisando los datos de tu ticket." : "Estamos generando tu folio."}</p>
          )}
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

function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  return megabytes >= 1 ? `${megabytes.toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}
