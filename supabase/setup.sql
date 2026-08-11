-- Tabela para imagens do carrossel
create table if not exists public.carousel_images (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    image_url text not null,
    title text,
    description text,
    link text,
    display_order integer default 0,
    active boolean default true,
    metadata jsonb default '{}'::jsonb
);

-- Habilitar RLS (Row Level Security)
alter table public.carousel_images enable row level security;

-- Políticas de acesso
-- Permitir leitura pública (necessário para o frontend exibir as imagens)
create policy "Public can view active carousel images"
    on public.carousel_images
    for select
    using (true);

-- Permitir que usuários autenticados gerenciem imagens
create policy "Authenticated users can manage carousel images"
    on public.carousel_images
    for all
    using (auth.role() = 'authenticated');


-- Tabela para histórico de importação (caso não exista)
create table if not exists public.import_history (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    product_count integer default 0,
    price_percentage numeric,
    applied_category text,
    applied_scope text
);

alter table public.import_history enable row level security;

create policy "Authenticated users can view import history"
    on public.import_history
    for select
    using (auth.role() = 'authenticated');

create policy "Authenticated users can insert import history"
    on public.import_history
    for insert
    with check (auth.role() = 'authenticated');

create table if not exists public.vendedores (
    id uuid default gen_random_uuid() primary key,
    nome text not null,
    avatar_url text,
    meta_valor numeric,
    criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.vendas (
    id uuid default gen_random_uuid() primary key,
    vendedor_id uuid references public.vendedores(id) on delete cascade,
    valor numeric not null,
    is_google_bonus boolean default false,
    criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.arena_desafios (
    id uuid default gen_random_uuid() primary key,
    premio_semana text not null,
    meta_global numeric not null,
    premio_top1 text,
    premio_top2 text,
    premio_top3 text,
    premio_google text,
    premio_ultrapassagem text,
    criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table if exists public.arena_desafios
    add column if not exists premio_top1 text,
    add column if not exists premio_top2 text,
    add column if not exists premio_top3 text,
    add column if not exists premio_google text,
    add column if not exists premio_ultrapassagem text;

create or replace view public.ranking_vendedores as
select
    v.id,
    v.nome,
    v.avatar_url,
    v.meta_valor,
    coalesce(sum(va.valor + case when va.is_google_bonus then 100 else 0 end), 0) as total_vendas
from public.vendedores v
left join public.vendas va on va.vendedor_id = v.id
group by v.id, v.nome, v.avatar_url, v.meta_valor;

alter table public.vendedores enable row level security;
alter table public.vendas enable row level security;
alter table public.arena_desafios enable row level security;

create policy "public read vendedores" on public.vendedores for select using (true);
create policy "public read vendas" on public.vendas for select using (true);
create policy "public read desafios" on public.arena_desafios for select using (true);
