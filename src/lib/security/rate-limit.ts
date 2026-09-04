import "server-only";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { fingerprint } from "@/lib/security/crypto";

type Limit = {
  scope: "upload-intent" | "participation";
  identifier: string;
  maxRequests: number;
  windowSeconds: number;
};

export async function enforceRateLimit(limit: Limit): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_scope: limit.scope,
    p_identifier_fingerprint: fingerprint(limit.identifier),
    p_max_requests: limit.maxRequests,
    p_window_seconds: limit.windowSeconds,
  });

  if (error) throw new Error("RATE_LIMIT_UNAVAILABLE");
  if (data !== true) {
    throw new Error("RATE_LIMITED");
  }
}
