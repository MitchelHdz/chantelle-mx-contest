export const campaign = {
  slug: process.env.NEXT_PUBLIC_CAMPAIGN_SLUG ?? "chantelle-vive-paris",
  name: "Chantelle te lleva a París",
  brand: "Chantelle",
  partner: "El Palacio de Hierro",
  currency: "MXN",
  allowedStores: [
    { value: "polanco", label: "Palacio Polanco" },
    { value: "santa-fe", label: "Palacio Santa Fe" },
    { value: "coyoacan", label: "Palacio Coyoacán" },
    { value: "perisur", label: "Palacio Perisur" },
  ],
  rulesUrl: "/bases",
  privacyUrl: "/privacidad",
} as const;

export type StoreCode = (typeof campaign.allowedStores)[number]["value"];
