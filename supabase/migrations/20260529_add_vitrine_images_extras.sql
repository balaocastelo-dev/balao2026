alter table public.vitrine_pages
  add column if not exists source_url text,
  add column if not exists extras jsonb not null default '{}'::jsonb,
  add column if not exists images jsonb not null default '{}'::jsonb,
  add column if not exists image_prompts jsonb not null default '{}'::jsonb;

create index if not exists vitrine_pages_source_url_idx on public.vitrine_pages (source_url);
