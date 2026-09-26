import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_CONTEXT = "chantelle-ticket-audit:v1";

type TicketReference = {
  participationId: number;
  fileKey: string;
};

function tokenPayload(reference: TicketReference): string {
  return `${TOKEN_CONTEXT}:${reference.participationId}:${reference.fileKey}`;
}

export function createTicketAuditToken(reference: TicketReference, secret: string): string {
  return createHmac("sha256", secret).update(tokenPayload(reference)).digest("hex");
}

export function verifyTicketAuditToken(
  reference: TicketReference,
  providedToken: string,
  secret: string,
): boolean {
  const expected = Buffer.from(createTicketAuditToken(reference, secret), "hex");
  const provided = Buffer.from(providedToken, "hex");

  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export function createTicketAuditUrl(
  reference: TicketReference,
  options: { appUrl: string; secret: string },
): string {
  const url = new URL(`/api/tickets/${reference.participationId}`, options.appUrl);
  url.searchParams.set("token", createTicketAuditToken(reference, options.secret));
  return url.toString();
}
