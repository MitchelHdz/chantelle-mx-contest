import { z } from "zod";

import { campaign } from "@/lib/config/campaign";

const storeCodes = campaign.allowedStores.map((store) => store.value) as [string, ...string[]];

export const uploadIntentSchema = z.object({
  website: z.literal("").default(""),
});

export const participationSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(100),
  email: z.email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(10).max(20).regex(/^\+?[0-9 ()-]+$/),
  store: z.enum(storeCodes),
  purchaseDate: z.iso.date().refine((value) => value <= new Date().toISOString().slice(0, 10), {
    message: "La fecha de compra no puede estar en el futuro.",
  }),
  uploadIntent: z.string().min(40).max(2048),
  consent: z.literal(true),
  marketingOptIn: z.boolean().default(false),
  website: z.literal("").default(""),
});

export type ParticipationInput = z.infer<typeof participationSchema>;
