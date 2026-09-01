import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  VERCEL_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().min(20),
  UPLOADTHING_TOKEN: z.string().min(20),
  PII_HASH_SECRET: z.string().min(32),
  UPLOAD_INTENT_SECRET: z.string().min(32),
  RATE_LIMIT_REST_URL: z.url().optional(),
  RATE_LIMIT_REST_TOKEN: z.string().min(8).optional(),
  GOOGLE_SHEETS_WEBHOOK_URL: z.url().optional(),
  GOOGLE_SHEETS_WEBHOOK_SECRET: z.string().min(16).optional(),
  RESEND_API_KEY: z.string().min(8).optional(),
  CONFIRMATION_FROM_EMAIL: z.email().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Configuración de servidor incompleta: ${fields}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
