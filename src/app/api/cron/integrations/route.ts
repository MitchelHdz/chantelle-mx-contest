import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { getServerEnv } from "@/lib/config/env";
import { processGoogleSheetsOutbox } from "@/lib/integrations/google-sheets-outbox";

export const runtime = "nodejs";
export const maxDuration = 60;

function secretsMatch(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function GET(request: Request) {
  const cronSecret = getServerEnv().CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ ok: false, code: "CRON_NOT_CONFIGURED" }, { status: 503 });
  }

  const received = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secretsMatch(received, cronSecret)) {
    return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  }

  const summary = await processGoogleSheetsOutbox();
  return NextResponse.json({ ok: true, ...summary });
}
