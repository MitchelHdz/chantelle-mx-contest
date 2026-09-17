export const campaign = {
  slug: process.env.NEXT_PUBLIC_CAMPAIGN_SLUG ?? "chantelle-te-lleva-a-paris",
  name: "Chantelle te lleva a París",
  brand: "Chantelle",
  partner: "El Palacio de Hierro",
  currency: "MXN",
  allowedStores: [
    { value: "centro", label: "Palacio Centro" },
    { value: "coyoacan", label: "Palacio Coyoacán" },
    { value: "durango", label: "Palacio Durango" },
    { value: "guadalajara", label: "Palacio Guadalajara" },
    { value: "interlomas", label: "Palacio Interlomas" },
    { value: "leon", label: "Palacio León" },
    { value: "monterrey", label: "Palacio Monterrey" },
    { value: "nuevo-coyoacan", label: "Palacio Nuevo Coyoacán" },
    { value: "perisur", label: "Palacio Perisur" },
    { value: "polanco", label: "Palacio Polanco" },
    { value: "puebla", label: "Palacio Puebla" },
    { value: "queretaro", label: "Palacio Querétaro" },
    { value: "santa-fe", label: "Palacio Santa Fe" },
    { value: "satelite", label: "Palacio Satélite" },
    { value: "veracruz", label: "Palacio Veracruz" },
    { value: "villahermosa", label: "Palacio Villahermosa" },
  ],
  rulesUrl: "/bases",
  privacyUrl: "/privacidad",
} as const;

export type StoreCode = (typeof campaign.allowedStores)[number]["value"];
