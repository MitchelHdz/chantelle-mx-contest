const PARTICIPATIONS_SHEET = "Participaciones";

function doPost(event) {
  try {
    const envelope = JSON.parse(event.postData.contents);
    const payloadText = String(envelope.payload || "");
    const providedSignature = String(envelope.signature || "");
    const secret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");

    if (!secret || !payloadText || !isValidSignature(payloadText, providedSignature, secret)) {
      return jsonResponse({ ok: false, error: "UNAUTHORIZED" });
    }

    const payload = JSON.parse(payloadText);
    validatePayload(payload);

    const lock = LockService.getDocumentLock();
    lock.waitLock(10000);
    try {
      upsertParticipation(payload);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error(error);
    const message = String(error && error.message ? error.message : error || "INVALID_REQUEST");
    return jsonResponse({ ok: false, error: message.slice(0, 200) });
  }
}

function upsertParticipation(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PARTICIPATIONS_SHEET);
  if (!sheet) throw new Error("SHEET_NOT_FOUND");

  const lastRow = sheet.getLastRow();
  let targetRow = lastRow + 1;
  if (lastRow >= 2) {
    const folios = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
    const index = folios.findIndex((row) => row[0] === payload.folio);
    if (index >= 0) targetRow = index + 2;
  }

  const manualReview = targetRow <= lastRow
    ? sheet.getRange(targetRow, 11, 1, 2).getValues()[0]
    : ["Pendiente", ""];

  const values = [[
    safeText(payload.folio),
    new Date(payload.registeredAt),
    safeText(payload.firstName),
    safeText(payload.lastName),
    safeText(payload.email),
    safeText(payload.phone),
    safeText(payload.store),
    new Date(payload.purchaseDate + "T12:00:00"),
    safeText(payload.participationStatus),
    payload.marketingOptIn ? "Sí" : "No",
    manualReview[0] || "Pendiente",
    manualReview[1] || "",
    new Date(payload.lastSyncedAt),
  ]];

  sheet.getRange(targetRow, 1, 1, values[0].length).setValues(values);
}

function validatePayload(payload) {
  const required = [
    "folio", "registeredAt", "firstName", "lastName", "email", "phone", "store",
    "purchaseDate", "participationStatus", "lastSyncedAt",
  ];
  required.forEach((key) => {
    if (!payload[key]) throw new Error("MISSING_" + key.toUpperCase());
  });
}

function safeText(value) {
  const text = String(value == null ? "" : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function isValidSignature(payload, provided, secret) {
  const bytes = Utilities.computeHmacSha256Signature(payload, secret, Utilities.Charset.UTF_8);
  const expected = bytes.map((byte) => ((byte < 0 ? byte + 256 : byte).toString(16).padStart(2, "0"))).join("");
  if (expected.length !== provided.length) return false;

  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ provided.charCodeAt(index);
  }
  return difference === 0;
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
