-- Tabela de Vendedores
create table if not exists public.arena_vendedores (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  avatar_url text, -- URL da imagem do rosto
  veiculo_emoji text default '🚗', -- Emoji do carro
  meta_valor numeric default 0,
  vendas_atual numeric default 0,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Configuração (Singleton)
create table if not exists public.arena_config (
  id integer primary key default 1,
  ativo boolean default false,
  titulo text default 'Corrida de Vendas',
  atualizado_em timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint single_row check (id = 1)
);

-- Inserir configuração inicial se não existir
insert into public.arena_config (id, ativo, titulo)
values (1, false, 'Grande Prêmio de Vendas')
on conflict (id) do nothing;

-- Habilitar Realtime para as tabelas
alter publication supabase_realtime add table public.arena_vendedores;
alter publication supabase_realtime add table public.arena_config;

-- Políticas de Segurança (RLS) - Opcional, mas recomendado
-- Permitir leitura pública (para o dashboard)
alter table public.arena_vendedores enable row level security;
create policy "Leitura pública de vendedores"
  on public.arena_vendedores for select
  using (true);

alter table public.arena_config enable row level security;
create policy "Leitura pública de config"
  on public.arena_config for select
  using (true);

-- Permitir modificação apenas via Service Role (ou autenticado se configurado)
-- Por simplificação neste setup, as Server Actions usarão a chave de Admin, que bypassa RLS.
