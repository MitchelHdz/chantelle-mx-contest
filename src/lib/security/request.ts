import "server-only";

import { NextRequest } from "next/server";

import { getServerEnv } from "@/lib/config/env";

export function assertSameOrigin(request: NextRequest): void {
  const origin = request.headers.get("origin");
  if (!origin) throw new Error("MISSING_ORIGIN");

  const env = getServerEnv();
  const allowedOrigins = new Set([new URL(env.NEXT_PUBLIC_APP_URL).origin]);

  if (env.VERCEL_URL) allowedOrigins.add(`https://${env.VERCEL_URL}`);

  if (!allowedOrigins.has(new URL(origin).origin)) throw new Error("INVALID_ORIGIN");
}

export function assertJsonRequest(request: NextRequest): void {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) throw new Error("INVALID_CONTENT_TYPE");

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 12_000) throw new Error("PAYLOAD_TOO_LARGE");
}

export function getClientAddress(request: NextRequest): string {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
