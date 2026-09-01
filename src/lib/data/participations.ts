import "server-only";

import { randomUUID } from "node:crypto";

import { campaign } from "@/lib/config/campaign";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { ParticipationInput } from "@/lib/validation/participation";
import { fingerprint } from "@/lib/security/crypto";

const INTENT_TTL_MINUTES = 15;

async function assertCampaignActive(): Promise<void> {
  const supabase = createSupabaseAdmin();
  const now = Date.now();
  const { data, error } = await supabase
    .from("campaigns")
    .select("status, starts_at, ends_at")
    .eq("slug", campaign.slug)
    .maybeSingle();

  if (error) throw error;
  if (
    !data ||
    data.status !== "active" ||
    (data.starts_at && Date.parse(data.starts_at) > now) ||
    (data.ends_at && Date.parse(data.ends_at) < now)
  ) {
    throw new Error("CAMPAIGN_CLOSED");
  }
}

export async function createUploadIntent(ticketNumber: string, store: string) {
  await assertCampaignActive();
  const supabase = createSupabaseAdmin();
  const intentId = randomUUID();
  const ticketFingerprint = fingerprint(`${campaign.slug}:${store}:${ticketNumber}`);
  const expiresAt = new Date(Date.now() + INTENT_TTL_MINUTES * 60_000);

  const { error } = await supabase.from("upload_intents").insert({
    id: intentId,
    campaign_slug: campaign.slug,
    ticket_fingerprint: ticketFingerprint,
    expires_at: expiresAt.toISOString(),
  });

  if (error) throw error;

  return { intentId, ticketFingerprint, expiresAt: expiresAt.getTime() };
}

export async function attachReceiptToIntent(intentId: string, fileKey: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("upload_intents")
    .update({ uploadthing_file_key: fileKey })
    .eq("id", intentId)
    .is("consumed_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("EXPIRED_UPLOAD_INTENT");
}

export async function finalizeParticipation(
  input: ParticipationInput,
  verifiedIntent: { intentId: string; ticketFingerprint: string },
) {
  const supabase = createSupabaseAdmin();
  const ticketFingerprint = fingerprint(`${campaign.slug}:${input.store}:${input.ticketNumber}`);
  const emailFingerprint = fingerprint(input.email);
  const phoneFingerprint = fingerprint(input.phone.replace(/\D/g, ""));

  if (verifiedIntent.ticketFingerprint !== ticketFingerprint) {
    throw new Error("INVALID_UPLOAD_INTENT");
  }

  const { data, error } = await supabase
    .rpc("finalize_participation", {
      p_campaign_slug: campaign.slug,
      p_intent_id: verifiedIntent.intentId,
      p_ticket_fingerprint: ticketFingerprint,
      p_first_name: input.firstName,
      p_last_name: input.lastName,
      p_email: input.email,
      p_email_fingerprint: emailFingerprint,
      p_phone: input.phone,
      p_phone_fingerprint: phoneFingerprint,
      p_store_code: input.store,
      p_ticket_number: input.ticketNumber,
      p_purchase_date: input.purchaseDate,
      p_consented_at: new Date().toISOString(),
    })
    .single();

  if (error?.code === "23505") throw new Error("DUPLICATE_TICKET");
  if (error) throw error;
  if (!data) throw new Error("UNEXPECTED_ERROR");

  const participation = data as { folio: string; participation_id: number };
  return { folio: participation.folio, participationId: participation.participation_id };
}
