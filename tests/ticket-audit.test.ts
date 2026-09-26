import { describe, expect, it } from "vitest";

import {
  createTicketAuditToken,
  createTicketAuditUrl,
  verifyTicketAuditToken,
} from "@/lib/security/ticket-audit";

const reference = { participationId: 12, fileKey: "private-ticket-key" };
const secret = "a-secure-test-secret-with-more-than-32-characters";

describe("ticket audit links", () => {
  it("firma y valida una referencia privada sin revelar el file key en la URL", () => {
    const token = createTicketAuditToken(reference, secret);
    const url = createTicketAuditUrl(reference, {
      appUrl: "https://chantelletellevaaparis.com",
      secret,
    });

    expect(verifyTicketAuditToken(reference, token, secret)).toBe(true);
    expect(url).toContain("/api/tickets/12?token=");
    expect(url).not.toContain(reference.fileKey);
  });

  it("rechaza tokens alterados y referencias distintas", () => {
    const token = createTicketAuditToken(reference, secret);
    const alteredToken = `${token[0] === "0" ? "1" : "0"}${token.slice(1)}`;

    expect(verifyTicketAuditToken(reference, alteredToken, secret)).toBe(false);
    expect(
      verifyTicketAuditToken({ ...reference, participationId: 13 }, token, secret),
    ).toBe(false);
  });
});
