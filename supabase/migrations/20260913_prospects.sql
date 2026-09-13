-- Base de prospecção do Beto (funcionário digital prospector).
--
-- Telefone de cliente é o ativo mais sensível que a loja tem. A tabela nasce
-- com RLS ligado, SEM nenhuma policy, e com o privilégio revogado do papel
-- público: só a service_role (rotas de API no servidor) enxerga. A chave
-- anon fica exposta no JS do site — foi assim que as senhas de vendedor
-- vazaram hoje cedo, e não se repete aqui.

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),

  -- Sempre 55 + DDD + número. UNIQUE porque a mesma pessoa numa agenda
  -- aparece várias vezes, às vezes com nomes diferentes.
  whatsapp text not null unique,
  nome text,
  email text,
  empresa text,

  -- De onde veio. Sem isso não há resposta para "por que vocês me
  -- escreveram?", que é a primeira pergunta de qualquer questionamento LGPD.
  origem text not null,
  segmento text check (segmento in ('b2b','b2c')),

  status text not null default 'novo'
    check (status in ('novo','fila','contatado','respondeu','convertido','descartado','optout')),

  atribuido_a text,
  tentativas integer not null default 0,
  ultimo_contato_em timestamptz,

  -- Pedido de não contato. Vive na própria linha, e não numa lista à parte
  -- que alguém esquece de cruzar antes de disparar.
  optout_em timestamptz,
  optout_motivo text,

  observacoes text,
  metadata jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.prospects enable row level security;
revoke all on public.prospects from anon, authenticated;

create index if not exists prospects_status_idx on public.prospects (status);
create index if not exists prospects_segmento_idx on public.prospects (segmento);
create index if not exists prospects_origem_idx on public.prospects (origem);
-- Fila de trabalho: quem ainda não foi contatado, mais antigo primeiro,
-- nunca quem pediu para não ser incomodado.
create index if not exists prospects_fila_idx
  on public.prospects (status, ultimo_contato_em nulls first)
  where optout_em is null;

create or replace function public.prospects_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.atualizado_em = now();
  return new;
end $$;

drop trigger if exists prospects_touch_trg on public.prospects;
create trigger prospects_touch_trg
  before update on public.prospects
  for each row execute function public.prospects_touch();
