import { describe, expect, it } from "vitest";

import { buildSheetRow } from "@/lib/integrations/google-sheets-row";

describe("buildSheetRow", () => {
  it("convierte códigos técnicos a etiquetas legibles sin incluir el ticket", () => {
    const row = buildSheetRow(
      {
        id: 12,
        folio: "CHA-2026-000012",
        first_name: "Ana",
        last_name: "Martínez",
        email: "ana@example.com",
        phone: "+52 55 1234 5678",
        store_code: "santa-fe",
        purchase_date: "2026-09-17",
        status: "received",
        marketing_opt_in: true,
        created_at: "2026-09-17T20:00:00.000Z",
      },
      "2026-09-17T20:01:00.000Z",
    );

    expect(row.store).toBe("Palacio Santa Fe");
    expect(row.participationStatus).toBe("Recibida");
    expect(row.marketingOptIn).toBe(true);
    expect(row).not.toHaveProperty("receiptFileUrl");
    expect(row).not.toHaveProperty("ticketFingerprint");
  });
});
