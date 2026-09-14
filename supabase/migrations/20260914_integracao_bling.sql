-- Guarda o token do Bling.
--
-- Por que no banco e não numa env var: o access_token do Bling expira em
-- algumas horas e o refresh_token em 30 dias, e cada refresh devolve um
-- refresh_token NOVO — o anterior morre. Guardado em env var, qualquer
-- refresh exigiria um redeploy, e dois processos (o site e o worker da VPS)
-- girando o token ao mesmo tempo perderiam um o token do outro.
--
-- Uma linha só, id fixo em 1. Não é elegante, é o que impede duas conexões
-- concorrentes de existirem sem ninguém perceber.
create table if not exists public.integracao_bling (
  id smallint primary key default 1 check (id = 1),
  access_token text,
  refresh_token text,
  expira_em timestamptz,
  escopo text,
  conectado_em timestamptz,
  atualizado_em timestamptz not null default now(),
  ultimo_erro text
);

-- RLS ligada e SEM policy: nem o papel anon nem o authenticated enxergam esta
-- tabela pelo PostgREST. Só a service_role (que ignora RLS) chega aqui, e ela
-- só existe no servidor. Um token de ERP numa tabela legível pela chave que
-- vai no JS do site seria acesso de escrita ao faturamento da loja.
alter table public.integracao_bling enable row level security;
revoke all on public.integracao_bling from anon, authenticated;

comment on table public.integracao_bling is
  'Token OAuth do Bling. Uma linha (id=1). Só service_role.';
