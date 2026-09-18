import "server-only";

import { appendOperationalRow } from "@/lib/integrations/google-sheets";
import {
  buildSheetRow,
  type ParticipationForSheet,
} from "@/lib/integrations/google-sheets-row";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const MAX_ATTEMPTS = 20;
const MAX_BATCH_SIZE = 25;
const MAX_CONCURRENCY = 5;

type OutboxRecord = {
  id: number;
  participation_id: number;
  event_type: string;
  sheets_attempts: number;
};

export type GoogleSheetsSyncSummary = {
  selected: number;
  processed: number;
  failed: number;
};

function retryAt(attempt: number): string {
  const minutes = Math.min(6 * 60, 5 * 2 ** Math.max(0, attempt - 1));
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function errorMessage(error: unknown): string {
  return (error instanceof Error ? error.message : "UNKNOWN_SHEETS_ERROR").slice(0, 500);
}

export async function processGoogleSheetsOutbox(
  options: { limit?: number } = {},
): Promise<GoogleSheetsSyncSummary> {
  const supabase = createSupabaseAdmin();
  const limit = Math.max(1, Math.min(options.limit ?? MAX_BATCH_SIZE, MAX_BATCH_SIZE));
  const now = new Date().toISOString();

  const { data: pending, error: pendingError } = await supabase
    .from("integration_outbox")
    .select("id, participation_id, event_type, sheets_attempts")
    .is("sheets_processed_at", null)
    .lte("sheets_available_at", now)
    .lt("sheets_attempts", MAX_ATTEMPTS)
    .in("event_type", ["participation.created", "participation.updated"])
    .order("id", { ascending: true })
    .limit(limit);

  if (pendingError) throw pendingError;
  const outboxRecords = (pending ?? []) as OutboxRecord[];
  if (outboxRecords.length === 0) return { selected: 0, processed: 0, failed: 0 };

  const participationIds = [...new Set(outboxRecords.map((record) => record.participation_id))];
  const { data: participations, error: participationsError } = await supabase
    .from("participations")
    .select(
      "id, folio, first_name, last_name, email, phone, store_code, purchase_date, status, marketing_opt_in, created_at",
    )
    .in("id", participationIds);

  if (participationsError) throw participationsError;
  const participationById = new Map(
    ((participations ?? []) as ParticipationForSheet[]).map((participation) => [participation.id, participation]),
  );

  let processed = 0;
  let failed = 0;

  for (let index = 0; index < outboxRecords.length; index += MAX_CONCURRENCY) {
    const chunk = outboxRecords.slice(index, index + MAX_CONCURRENCY);
    const outcomes = await Promise.all(
      chunk.map(async (record) => {
        const attempt = record.sheets_attempts + 1;
        try {
          const participation = participationById.get(record.participation_id);
          if (!participation?.folio) throw new Error("PARTICIPATION_NOT_FOUND");

          const syncedAt = new Date().toISOString();
          await appendOperationalRow(buildSheetRow(participation, syncedAt));

          const { error } = await supabase
            .from("integration_outbox")
            .update({
              sheets_attempts: attempt,
              sheets_processed_at: syncedAt,
              sheets_last_error: null,
            })
            .eq("id", record.id)
            .is("sheets_processed_at", null);

          if (error) throw error;
          return true;
        } catch (error) {
          const { error: updateError } = await supabase
            .from("integration_outbox")
            .update({
              sheets_attempts: attempt,
              sheets_available_at: retryAt(attempt),
              sheets_last_error: errorMessage(error),
            })
            .eq("id", record.id)
            .is("sheets_processed_at", null);

          if (updateError) console.error("No se pudo registrar el reintento de Google Sheets", updateError);
          return false;
        }
      }),
    );

    processed += outcomes.filter(Boolean).length;
    failed += outcomes.filter((outcome) => !outcome).length;
  }

  return { selected: outboxRecords.length, processed, failed };
}
