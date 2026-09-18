-- Track Google Sheets independently from other consumers of the shared outbox.
-- Existing participation.created events are intentionally backfilled as pending.
alter table public.integration_outbox
  add column sheets_attempts smallint not null default 0
    check (sheets_attempts between 0 and 20),
  add column sheets_available_at timestamptz not null default now(),
  add column sheets_processed_at timestamptz,
  add column sheets_last_error text;

create index integration_outbox_sheets_pending_idx
  on public.integration_outbox (sheets_available_at, id)
  where sheets_processed_at is null and event_type in ('participation.created', 'participation.updated');

comment on column public.integration_outbox.sheets_processed_at is
  'Completion marker for the idempotent Google Sheets operational view.';
