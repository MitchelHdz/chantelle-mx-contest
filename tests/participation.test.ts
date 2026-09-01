import { describe, expect, it } from "vitest";

import { participationSchema, uploadIntentSchema } from "@/lib/validation/participation";

const validParticipation = {
  firstName: "Ana",
  lastName: "Martínez",
  email: "ANA@EXAMPLE.COM",
  phone: "+52 55 1234 5678",
  store: "polanco",
  ticketNumber: "TICKET-82394",
  purchaseDate: "2026-08-22",
  uploadIntent: "a".repeat(80),
  consent: true,
  website: "",
};

describe("participationSchema", () => {
  it("normaliza el correo y conserva un registro válido", () => {
    const parsed = participationSchema.parse(validParticipation);
    expect(parsed.email).toBe("ana@example.com");
    expect(parsed.ticketNumber).toBe("TICKET-82394");
  });

  it("rechaza tienda, consentimiento y ticket inválidos", () => {
    const parsed = participationSchema.safeParse({
      ...validParticipation,
      store: "otra-tienda",
      consent: false,
      ticketNumber: "<script>",
    });
    expect(parsed.success).toBe(false);
  });

  it("rechaza una compra con fecha futura", () => {
    const parsed = participationSchema.safeParse({
      ...validParticipation,
      purchaseDate: "2099-01-01",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("uploadIntentSchema", () => {
  it("rechaza el honeypot cuando un bot lo completa", () => {
    const parsed = uploadIntentSchema.safeParse({
      ticketNumber: "82394",
      store: "polanco",
      website: "https://spam.example",
    });
    expect(parsed.success).toBe(false);
  });
});
