import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { buildMetaEvent } from "./meta-events";

describe("Meta Conversions API events", () => {
  it("builds a PageView with browser matching data and no raw identifiers", () => {
    const event = buildMetaEvent({
      name: "PageView",
      eventId: "page-1",
      sourceUrl: "https://chantelletellevaaparis.com/",
      userAgent: "Test Browser",
      clientIp: "192.0.2.1",
      fbp: "fb.1.123456789.test",
      now: 1_780_000_000_000,
    });

    expect(event).toMatchObject({
      event_name: "PageView",
      event_time: 1_780_000_000,
      event_id: "page-1",
      action_source: "website",
      user_data: { client_ip_address: "192.0.2.1", client_user_agent: "Test Browser", fbp: "fb.1.123456789.test" },
    });
    expect(event.user_data).not.toHaveProperty("em");
  });

  it("hashes the registration email and Mexican phone number", () => {
    const event = buildMetaEvent({
      name: "CompleteRegistration",
      eventId: "registration-1",
      sourceUrl: "https://chantelletellevaaparis.com/",
      email: " TEST@Example.com ",
      phone: "55 1234 5678",
    });

    const hash = (value: string) => createHash("sha256").update(value).digest("hex");
    expect(event.user_data.em).toBe(hash("test@example.com"));
    expect(event.user_data.ph).toBe(hash("525512345678"));
    expect(JSON.stringify(event)).not.toContain("TEST@Example.com");
    expect(JSON.stringify(event)).not.toContain("55 1234 5678");
  });
});
