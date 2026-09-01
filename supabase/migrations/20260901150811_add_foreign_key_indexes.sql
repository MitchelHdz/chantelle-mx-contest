-- Support foreign-key checks and the operations console without weakening RLS.
create index upload_intents_campaign_slug_idx
  on public.upload_intents (campaign_slug);

create index integration_outbox_participation_id_idx
  on public.integration_outbox (participation_id);

create index audit_events_actor_user_id_idx
  on public.audit_events (actor_user_id)
  where actor_user_id is not null;
