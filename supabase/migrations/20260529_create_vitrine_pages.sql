create table if not exists public.vitrine_pages (
  id uuid primary key default gen_random_uuid(),
  nome_pc text not null,
  slug text not null unique,
  categoria text not null,
  descricao_original text,
  processador text,
  placa_video text,
  memoria_ram text,
  armazenamento text,
  sistema_operacional text,
  resfriamento text,
  aplicacoes jsonb,
  status text not null default 'rascunho',
  data_criacao timestamptz not null default now(),
  data_publicacao timestamptz
);

create index if not exists vitrine_pages_status_idx on public.vitrine_pages (status);
create index if not exists vitrine_pages_slug_idx on public.vitrine_pages (slug);
