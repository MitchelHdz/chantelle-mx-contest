import { describe, expect, it } from "vitest";

import { sanitizeAnalyticsProperties } from "@/lib/analytics/events";

describe("sanitizeAnalyticsProperties", () => {
  it("elimina identificadores y conserva dimensiones permitidas", () => {
    expect(
      sanitizeAnalyticsProperties({
        campaign: "chantelle-vive-paris",
        store: "polanco",
        email: "ana@example.com",
        ticketNumber: "82394",
        receiptUrl: "https://example.com/private",
        folio: "CHA-2026-000124",
      }),
    ).toEqual({ campaign: "chantelle-vive-paris", store: "polanco" });
  });
});
