import "server-only";

import { createHmac } from "node:crypto";

import { getServerEnv } from "@/lib/config/env";

const WEBHOOK_TIMEOUT_MS = 15_000;

export type SheetRow = {
  folio: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  store: string;
  purchaseDate: string;
  registeredAt: string;
  participationStatus: string;
  marketingOptIn: boolean;
  lastSyncedAt: string;
};

export async function appendOperationalRow(row: SheetRow): Promise<void> {
  const env = getServerEnv();
  if (!env.GOOGLE_SHEETS_WEBHOOK_URL || !env.GOOGLE_SHEETS_WEBHOOK_SECRET) {
    throw new Error("SHEETS_NOT_CONFIGURED");
  }

  const payload = JSON.stringify(row);
  const signature = createHmac("sha256", env.GOOGLE_SHEETS_WEBHOOK_SECRET).update(payload).digest("hex");
  const response = await fetch(env.GOOGLE_SHEETS_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload, signature }),
    cache: "no-store",
    signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error("SHEETS_SYNC_FAILED");

  const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!result?.ok) {
    const reason = result?.error?.slice(0, 200) || "UNKNOWN";
    throw new Error(`SHEETS_SYNC_REJECTED:${reason}`);
  }
}
