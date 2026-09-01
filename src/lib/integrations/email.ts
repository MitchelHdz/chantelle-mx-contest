import "server-only";

import { getServerEnv } from "@/lib/config/env";

type Confirmation = {
  to: string;
  name: string;
  folio: string;
};

export async function sendConfirmationEmail(message: Confirmation): Promise<void> {
  const env = getServerEnv();
  if (!env.RESEND_API_KEY || !env.CONFIRMATION_FROM_EMAIL) return;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONFIRMATION_FROM_EMAIL,
      to: [message.to],
      subject: `Tu registro ${message.folio}`,
      html: `<p>Hola ${escapeHtml(message.name)},</p><p>Tu registro fue recibido. Tu folio es <strong>${escapeHtml(message.folio)}</strong>.</p>`,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("EMAIL_DELIVERY_FAILED");
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character] ?? character;
  });
}
