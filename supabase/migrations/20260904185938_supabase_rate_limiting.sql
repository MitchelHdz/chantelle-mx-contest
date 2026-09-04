-- Persistent, server-only rate limiting backed by the existing Supabase project.
-- No browser role can read or invoke this function.

create table private.rate_limit_buckets (
  scope text not null check (scope in ('upload-intent', 'participation')),
  identifier_fingerprint text not null check (identifier_fingerprint ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  expires_at timestamptz not null,
  primary key (scope, identifier_fingerprint, window_started_at),
  constraint rate_limit_buckets_expiry_after_window check (expires_at > window_started_at)
);

create index rate_limit_buckets_expiry_idx
  on private.rate_limit_buckets (expires_at);

alter table private.rate_limit_buckets enable row level security;
alter table private.rate_limit_buckets force row level security;

revoke all on table private.rate_limit_buckets from public, anon, authenticated;
grant usage on schema private to service_role;
grant select, insert, update, delete on table private.rate_limit_buckets to service_role;

create or replace function public.consume_rate_limit(
  p_scope text,
  p_identifier_fingerprint text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_window_started_at timestamptz;
  v_request_count integer;
begin
  if p_scope not in ('upload-intent', 'participation')
    or p_identifier_fingerprint !~ '^[0-9a-f]{64}$'
    or p_max_requests < 1
    or p_window_seconds < 1 then
    raise exception 'INVALID_RATE_LIMIT_ARGUMENT';
  end if;

  v_window_started_at := date_bin(
    make_interval(secs => p_window_seconds),
    now(),
    '2000-01-01 00:00:00+00'::timestamptz
  );

  -- Buckets contain HMAC fingerprints only. Removing expired buckets on the
  -- request path keeps storage bounded without a separate scheduler.
  delete from private.rate_limit_buckets
  where expires_at <= now();

  insert into private.rate_limit_buckets as buckets (
    scope,
    identifier_fingerprint,
    window_started_at,
    request_count,
    expires_at
  ) values (
    p_scope,
    p_identifier_fingerprint,
    v_window_started_at,
    1,
    v_window_started_at + make_interval(secs => p_window_seconds)
  )
  on conflict (scope, identifier_fingerprint, window_started_at)
  do update set request_count = buckets.request_count + 1
  returning request_count into v_request_count;

  return v_request_count <= p_max_requests;
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;
