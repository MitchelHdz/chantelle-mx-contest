import "server-only";

import { createHmac } from "node:crypto";

import { getServerEnv } from "@/lib/config/env";

type SheetRow = {
  folio: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  store: string;
  ticketNumber: string;
  purchaseDate: string;
  registeredAt: string;
};

export async function appendOperationalRow(row: SheetRow): Promise<void> {
  const env = getServerEnv();
  if (!env.GOOGLE_SHEETS_WEBHOOK_URL || !env.GOOGLE_SHEETS_WEBHOOK_SECRET) return;

  const body = JSON.stringify(row);
  const signature = createHmac("sha256", env.GOOGLE_SHEETS_WEBHOOK_SECRET).update(body).digest("hex");
  const response = await fetch(env.GOOGLE_SHEETS_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Chantelle-Signature": signature,
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) throw new Error("SHEETS_SYNC_FAILED");
}
