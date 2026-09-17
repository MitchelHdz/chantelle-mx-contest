import { describe, expect, it } from "vitest";

import { campaign } from "@/lib/config/campaign";
import { participationSchema, uploadIntentSchema } from "@/lib/validation/participation";

const validParticipation = {
  firstName: "Ana",
  lastName: "Martínez",
  email: "ANA@EXAMPLE.COM",
  phone: "+52 55 1234 5678",
  store: "polanco",
  purchaseDate: "2026-08-22",
  uploadIntent: "a".repeat(80),
  consent: true,
  website: "",
};

describe("participationSchema", () => {
  it("normaliza el correo y conserva un registro válido", () => {
    const parsed = participationSchema.parse({ ...validParticipation, ticketNumber: "NO-DEBE-GUARDARSE" });
    expect(parsed.email).toBe("ana@example.com");
    expect(parsed).not.toHaveProperty("ticketNumber");
    expect(parsed.marketingOptIn).toBe(false);
  });

  it("acepta el opt-in publicitario cuando se selecciona", () => {
    const parsed = participationSchema.parse({ ...validParticipation, marketingOptIn: true });
    expect(parsed.marketingOptIn).toBe(true);
  });

  it("acepta las 16 tiendas nacionales de El Palacio de Hierro", () => {
    expect(campaign.allowedStores).toHaveLength(16);
    for (const store of campaign.allowedStores) {
      expect(participationSchema.safeParse({ ...validParticipation, store: store.value }).success).toBe(true);
    }
  });

  it("rechaza tienda y consentimiento inválidos", () => {
    const parsed = participationSchema.safeParse({
      ...validParticipation,
      store: "otra-tienda",
      consent: false,
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
  it("no solicita datos del ticket antes de cargar su foto", () => {
    expect(uploadIntentSchema.parse({ website: "" })).toEqual({ website: "" });
  });

  it("rechaza el honeypot cuando un bot lo completa", () => {
    const parsed = uploadIntentSchema.safeParse({
      website: "https://spam.example",
    });
    expect(parsed.success).toBe(false);
  });
});
