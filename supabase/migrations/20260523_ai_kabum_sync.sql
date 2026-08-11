create table if not exists public.ai_kabum_sync_settings (
  id uuid primary key default gen_random_uuid(),
  percentage numeric default 15,
  mode text default 'kabum_plus_percentage',
  min_margin numeric default 0,
  sync_interval_seconds integer default 300,
  max_parallel_agents integer default 10,
  is_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ai_kabum_sync_logs (
  id uuid primary key default gen_random_uuid(),
  product_id text,
  kabum_url text,
  old_balao_price numeric,
  new_balao_price numeric,
  kabum_price numeric,
  kabum_stock text,
  status text,
  error_message text,
  created_at timestamptz default now()
);

alter table public.products add column if not exists kabum_url text;
alter table public.products add column if not exists kabum_last_price numeric;
alter table public.products add column if not exists kabum_last_stock text;
alter table public.products add column if not exists kabum_last_checked_at timestamptz;
alter table public.products add column if not exists kabum_sync_enabled boolean default false;
alter table public.products add column if not exists kabum_sync_status text;
alter table public.products add column if not exists kabum_sync_error text;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_ai_kabum_sync_settings_updated_at on public.ai_kabum_sync_settings;
create trigger trg_ai_kabum_sync_settings_updated_at
before update on public.ai_kabum_sync_settings
for each row execute function public.set_updated_at();

alter table public.ai_kabum_sync_settings enable row level security;
alter table public.ai_kabum_sync_logs enable row level security;

drop policy if exists "Public read" on public.ai_kabum_sync_settings;
create policy "Public read" on public.ai_kabum_sync_settings
  for select
  using (true);

drop policy if exists "Service role full access" on public.ai_kabum_sync_settings;
create policy "Service role full access" on public.ai_kabum_sync_settings
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Public read" on public.ai_kabum_sync_logs;
create policy "Public read" on public.ai_kabum_sync_logs
  for select
  using (true);

drop policy if exists "Service role insert" on public.ai_kabum_sync_logs;
create policy "Service role insert" on public.ai_kabum_sync_logs
  for insert
  with check (auth.role() = 'service_role');

do $$
begin
  alter publication supabase_realtime add table public.ai_kabum_sync_settings;
exception
  when duplicate_object then null;
  when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.ai_kabum_sync_logs;
exception
  when duplicate_object then null;
  when others then null;
end $$;

