import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { getServerEnv } from "@/lib/config/env";

type UploadIntentPayload = {
  intentId: string;
  ticketFingerprint: string;
  expiresAt: number;
};

function base64url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function signature(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function fingerprint(value: string): string {
  const normalized = value.trim().toLocaleLowerCase("es-MX");
  return createHmac("sha256", getServerEnv().PII_HASH_SECRET).update(normalized).digest("hex");
}

export function createUploadIntentToken(payload: UploadIntentPayload): string {
  const encoded = base64url(JSON.stringify(payload));
  return `${encoded}.${signature(encoded, getServerEnv().UPLOAD_INTENT_SECRET)}`;
}

export function verifyUploadIntentToken(token: string): UploadIntentPayload {
  const [encoded, receivedSignature] = token.split(".");
  if (!encoded || !receivedSignature) throw new Error("INVALID_UPLOAD_INTENT");

  const expectedSignature = signature(encoded, getServerEnv().UPLOAD_INTENT_SECRET);
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(receivedSignature);

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    throw new Error("INVALID_UPLOAD_INTENT");
  }

  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as UploadIntentPayload;
  if (payload.expiresAt <= Date.now()) throw new Error("EXPIRED_UPLOAD_INTENT");

  return payload;
}
