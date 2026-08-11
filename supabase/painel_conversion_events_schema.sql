create extension if not exists pgcrypto;

create table if not exists public.site_conversion_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  event_name text not null,
  event_category text,
  channel text,
  page_path text,
  page_query text,
  source text,
  label text,
  city text,
  service text,
  product_name text,
  destination text,
  visitor_id text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_site_conversion_events_created_at
  on public.site_conversion_events (created_at desc);

create index if not exists idx_site_conversion_events_event_name
  on public.site_conversion_events (event_name);

create index if not exists idx_site_conversion_events_page_path
  on public.site_conversion_events (page_path);

create index if not exists idx_site_conversion_events_source
  on public.site_conversion_events (source);

create index if not exists idx_site_conversion_events_channel
  on public.site_conversion_events (channel);

create index if not exists idx_site_conversion_events_visitor_id
  on public.site_conversion_events (visitor_id);
