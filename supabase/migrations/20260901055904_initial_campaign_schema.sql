-- Chantelle campaign foundation
-- Public forms never access these tables directly. The Next.js server uses a
-- Supabase secret key and every browser-facing role remains denied by default.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.campaigns (
  slug text primary key,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'closed')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaigns_valid_dates check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.upload_intents (
  id uuid primary key default extensions.gen_random_uuid(),
  campaign_slug text not null references public.campaigns(slug) on update cascade on delete restrict,
  ticket_fingerprint text not null check (length(ticket_fingerprint) = 64),
  uploadthing_file_key text unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint upload_intents_expiry_after_creation check (expires_at > created_at)
);

create table public.participations (
  id bigint generated always as identity primary key,
  campaign_slug text not null references public.campaigns(slug) on update cascade on delete restrict,
  folio text unique,
  first_name text not null check (char_length(first_name) between 2 and 80),
  last_name text not null check (char_length(last_name) between 2 and 100),
  email text not null check (char_length(email) <= 254),
  email_fingerprint text not null check (length(email_fingerprint) = 64),
  phone text not null check (char_length(phone) between 10 and 20),
  phone_fingerprint text not null check (length(phone_fingerprint) = 64),
  store_code text not null check (store_code in ('polanco', 'santa-fe', 'coyoacan', 'perisur')),
  ticket_number text not null check (char_length(ticket_number) between 4 and 40),
  ticket_fingerprint text not null check (length(ticket_fingerprint) = 64),
  purchase_date date not null,
  receipt_file_key text not null unique,
  status text not null default 'received' check (status in ('received', 'valid', 'invalid', 'winner', 'deleted')),
  consented_at timestamptz not null,
  retention_until timestamptz not null default (now() + interval '180 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_slug, ticket_fingerprint)
);

create table public.integration_outbox (
  id bigint generated always as identity primary key,
  participation_id bigint not null references public.participations(id) on delete cascade,
  event_type text not null check (event_type in ('participation.created', 'participation.updated', 'participation.deleted')),
  attempts smallint not null default 0 check (attempts between 0 and 20),
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  participation_id bigint references public.participations(id) on delete set null,
  action text not null check (char_length(action) between 3 and 80),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index participations_campaign_created_idx
  on public.participations (campaign_slug, created_at desc);

create index participations_status_created_idx
  on public.participations (status, created_at desc);

create index upload_intents_pending_expiry_idx
  on public.upload_intents (expires_at)
  where consumed_at is null;

create index integration_outbox_pending_idx
  on public.integration_outbox (available_at, id)
  where processed_at is null;

create index audit_events_participation_created_idx
  on public.audit_events (participation_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

create trigger campaigns_set_updated_at
before update on public.campaigns
for each row execute function private.set_updated_at();

create trigger participations_set_updated_at
before update on public.participations
for each row execute function private.set_updated_at();

create or replace function public.finalize_participation(
  p_campaign_slug text,
  p_intent_id uuid,
  p_ticket_fingerprint text,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_email_fingerprint text,
  p_phone text,
  p_phone_fingerprint text,
  p_store_code text,
  p_ticket_number text,
  p_purchase_date date,
  p_consented_at timestamptz
)
returns table (participation_id bigint, folio text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_receipt_file_key text;
  v_created_at timestamptz;
  v_folio text;
begin
  if not exists (
    select 1
    from public.campaigns
    where slug = p_campaign_slug
      and status = 'active'
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
  ) then
    raise exception 'CAMPAIGN_CLOSED';
  end if;

  select uploadthing_file_key
  into v_receipt_file_key
  from public.upload_intents
  where id = p_intent_id
    and campaign_slug = p_campaign_slug
    and ticket_fingerprint = p_ticket_fingerprint
    and consumed_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'EXPIRED_UPLOAD_INTENT';
  end if;

  if v_receipt_file_key is null then
    raise exception 'UPLOAD_NOT_READY';
  end if;

  insert into public.participations (
    campaign_slug,
    first_name,
    last_name,
    email,
    email_fingerprint,
    phone,
    phone_fingerprint,
    store_code,
    ticket_number,
    ticket_fingerprint,
    purchase_date,
    receipt_file_key,
    consented_at
  ) values (
    p_campaign_slug,
    p_first_name,
    p_last_name,
    p_email,
    p_email_fingerprint,
    p_phone,
    p_phone_fingerprint,
    p_store_code,
    p_ticket_number,
    p_ticket_fingerprint,
    p_purchase_date,
    v_receipt_file_key,
    p_consented_at
  ) returning id, created_at into participation_id, v_created_at;

  v_folio := format('CHA-%s-%s', extract(year from v_created_at at time zone 'UTC')::text, lpad(participation_id::text, 6, '0'));

  update public.participations
  set folio = v_folio
  where id = participation_id;

  insert into public.integration_outbox (participation_id, event_type)
  values (participation_id, 'participation.created');

  update public.upload_intents
  set consumed_at = now()
  where id = p_intent_id;

  folio := v_folio;
  return next;
end;
$$;

revoke all on function public.finalize_participation(text, uuid, text, text, text, text, text, text, text, text, text, date, timestamptz) from public, anon, authenticated;
grant execute on function public.finalize_participation(text, uuid, text, text, text, text, text, text, text, text, text, date, timestamptz) to service_role;

alter table public.campaigns enable row level security;
alter table public.campaigns force row level security;
alter table public.upload_intents enable row level security;
alter table public.upload_intents force row level security;
alter table public.participations enable row level security;
alter table public.participations force row level security;
alter table public.integration_outbox enable row level security;
alter table public.integration_outbox force row level security;
alter table public.audit_events enable row level security;
alter table public.audit_events force row level security;

revoke all on table public.campaigns from anon, authenticated;
revoke all on table public.upload_intents from anon, authenticated;
revoke all on table public.participations from anon, authenticated;
revoke all on table public.integration_outbox from anon, authenticated;
revoke all on table public.audit_events from anon, authenticated;
revoke all on sequence public.participations_id_seq from anon, authenticated;
revoke all on sequence public.integration_outbox_id_seq from anon, authenticated;
revoke all on sequence public.audit_events_id_seq from anon, authenticated;

insert into public.campaigns (slug, name, status)
values ('chantelle-vive-paris', 'Vive París', 'draft')
on conflict (slug) do nothing;
