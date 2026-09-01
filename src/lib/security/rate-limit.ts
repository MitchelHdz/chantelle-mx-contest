import "server-only";

import { getServerEnv } from "@/lib/config/env";
import { fingerprint } from "@/lib/security/crypto";

type Limit = {
  scope: "upload-intent" | "participation";
  identifier: string;
  maxRequests: number;
  windowSeconds: number;
};

export async function enforceRateLimit(limit: Limit): Promise<void> {
  const env = getServerEnv();
  const key = `chantelle:${limit.scope}:${fingerprint(limit.identifier)}`;

  if (!env.RATE_LIMIT_REST_URL || !env.RATE_LIMIT_REST_TOKEN) {
    if (env.NODE_ENV === "production") throw new Error("RATE_LIMIT_NOT_CONFIGURED");
    return;
  }

  const response = await fetch(`${env.RATE_LIMIT_REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RATE_LIMIT_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, limit.windowSeconds, "NX"],
      ["TTL", key],
    ]),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("RATE_LIMIT_UNAVAILABLE");
  const result = (await response.json()) as Array<{ result: number }>;

  if ((result[0]?.result ?? limit.maxRequests + 1) > limit.maxRequests) {
    throw new Error("RATE_LIMITED");
  }
}
