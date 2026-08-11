create extension if not exists pgcrypto;

create table if not exists public.controle_parts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  type text not null check (type in ('processador', 'placa_mae', 'kits', 'memoria', 'ssd_hdd', 'gabinete', 'cooler', 'outros')),
  status text not null default 'disponivel' check (status in ('disponivel', 'retirada')),
  full_name text not null,
  serial_number text not null unique,
  purchase_order_reference text not null,
  photo_url text not null,
  notes text null,
  withdrawn_at timestamptz null,
  withdrawn_customer_name text null,
  withdrawn_os_number text null,
  withdrawn_sale_price numeric(12,2) null,
  withdrawn_technician_name text null,
  withdrawn_authorization_code text null
);

create table if not exists public.controle_part_withdrawals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  part_id uuid not null references public.controle_parts(id) on delete restrict,
  customer_name text not null,
  os_number text not null,
  sale_price numeric(12,2) not null,
  technician_name text not null,
  authorization_code text not null,
  approved_password_code text not null,
  part_snapshot_name text not null,
  part_snapshot_serial text not null,
  part_snapshot_type text not null check (part_snapshot_type in ('processador', 'placa_mae', 'kits', 'memoria', 'ssd_hdd', 'gabinete', 'cooler', 'outros')),
  part_snapshot_photo_url text null,
  purchase_order_reference text not null
);

create index if not exists idx_controle_parts_status_type
  on public.controle_parts (status, type, created_at desc);

create index if not exists idx_controle_withdrawals_created_at
  on public.controle_part_withdrawals (created_at desc);

create or replace function public.set_updated_at_controle_parts()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at_controle_parts on public.controle_parts;

create trigger trg_set_updated_at_controle_parts
before update on public.controle_parts
for each row
execute function public.set_updated_at_controle_parts();

alter table public.controle_parts enable row level security;
alter table public.controle_part_withdrawals enable row level security;

drop policy if exists "controle_parts_public_read" on public.controle_parts;
create policy "controle_parts_public_read"
on public.controle_parts
for select
to anon, authenticated
using (status = 'disponivel');

drop policy if exists "controle_parts_service_all" on public.controle_parts;
create policy "controle_parts_service_all"
on public.controle_parts
for all
to service_role
using (true)
with check (true);

drop policy if exists "controle_withdrawals_service_all" on public.controle_part_withdrawals;
create policy "controle_withdrawals_service_all"
on public.controle_part_withdrawals
for all
to service_role
using (true)
with check (true);
