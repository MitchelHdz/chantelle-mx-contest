-- A receipt image is now the sole ticket identifier. Its UploadThing file hash
-- is HMACed server-side before being stored as the ticket fingerprint.
drop function public.finalize_participation(text, uuid, text, text, text, text, text, text, text, text, text, date, boolean, timestamptz);

alter table public.participations
  drop column ticket_number;

create function public.finalize_participation(
  p_campaign_slug text,
  p_intent_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_email_fingerprint text,
  p_phone text,
  p_phone_fingerprint text,
  p_store_code text,
  p_purchase_date date,
  p_marketing_opt_in boolean,
  p_consented_at timestamptz
)
returns table (participation_id bigint, folio text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ticket_fingerprint text;
  v_receipt_file_key text;
  v_receipt_file_url text;
  v_receipt_file_name text;
  v_receipt_file_hash text;
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

  select ticket_fingerprint, uploadthing_file_key, uploadthing_file_url, uploadthing_file_name, uploadthing_file_hash
  into v_ticket_fingerprint, v_receipt_file_key, v_receipt_file_url, v_receipt_file_name, v_receipt_file_hash
  from public.upload_intents
  where id = p_intent_id
    and campaign_slug = p_campaign_slug
    and consumed_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'EXPIRED_UPLOAD_INTENT';
  end if;

  if v_receipt_file_key is null or v_receipt_file_url is null or v_receipt_file_hash is null then
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
    ticket_fingerprint,
    purchase_date,
    receipt_file_key,
    receipt_file_url,
    receipt_file_name,
    receipt_file_hash,
    consented_at,
    marketing_opt_in,
    marketing_opted_in_at
  ) values (
    p_campaign_slug,
    p_first_name,
    p_last_name,
    p_email,
    p_email_fingerprint,
    p_phone,
    p_phone_fingerprint,
    p_store_code,
    v_ticket_fingerprint,
    p_purchase_date,
    v_receipt_file_key,
    v_receipt_file_url,
    v_receipt_file_name,
    v_receipt_file_hash,
    p_consented_at,
    p_marketing_opt_in,
    case when p_marketing_opt_in then p_consented_at else null end
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

revoke all on function public.finalize_participation(text, uuid, text, text, text, text, text, text, text, date, boolean, timestamptz) from public, anon, authenticated;
grant execute on function public.finalize_participation(text, uuid, text, text, text, text, text, text, text, date, boolean, timestamptz) to service_role;
