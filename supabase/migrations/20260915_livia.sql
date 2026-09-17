-- LIV.IA — a caixa de entrada da loja (balaocastelo@gmail.com).
--
-- Três tabelas, cada uma existindo por um erro concreto que ela evita.

-- 1) Todo e-mail que a LIV.IA já olhou.
--
-- A chave é o Message-ID do próprio e-mail, não um id nosso: o worker relê a
-- caixa a cada poucos minutos e um IMAP reentrega a mesma mensagem por
-- qualquer motivo (reconexão, flag que não gravou, reindexação do Gmail).
-- Sem esta tabela, o cliente recebe a mesma resposta de orçamento três vezes.
create table if not exists public.livia_emails (
  message_id text primary key,
  remetente text not null,
  assunto text,
  recebido_em timestamptz,
  classificacao text,
  acao text,
  -- Quando a resposta foi só rascunho, o texto fica aqui para o Thiago ver
  -- no painel antes de soltar.
  rascunho text,
  lead_para text,
  erro text,
  visto_em timestamptz not null default now()
);

create index if not exists livia_emails_visto_idx
  on public.livia_emails (visto_em desc);
create index if not exists livia_emails_classificacao_idx
  on public.livia_emails (classificacao, visto_em desc);

-- 2) Quem pediu para não receber mais.
--
-- Separada dos e-mails de propósito: a supressão tem que sobreviver à
-- limpeza do histórico. Apagar registro de e-mail é manutenção; apagar
-- pedido de descadastro é mandar mensagem para quem disse não.
create table if not exists public.livia_supressao (
  email text primary key,
  motivo text not null,
  origem text,
  criado_em timestamptz not null default now()
);

-- 3) Cada envio frio.
--
-- Existe para a rampa de aquecimento poder ser MEDIDA, não estimada: quantos
-- saíram hoje, quantos voltaram como erro. Caixa nova disparando volume alto
-- é o caminho curto para a caixa da loja cair no spam — e junto com ela a
-- resposta de orçamento de cliente de verdade.
create table if not exists public.livia_prospeccao (
  id bigint generated always as identity primary key,
  email text not null,
  empresa text,
  assunto text,
  enviado_em timestamptz not null default now(),
  status text not null default 'enviado',
  erro text
);

create index if not exists livia_prospeccao_dia_idx
  on public.livia_prospeccao (enviado_em desc);
create unique index if not exists livia_prospeccao_email_idx
  on public.livia_prospeccao (email);

-- RLS ligada e SEM policy nas três: o conteúdo é e-mail de cliente. A chave
-- publicável vai no JavaScript do site por definição; qualquer policy de
-- leitura aqui seria a caixa de entrada da loja aberta na internet.
alter table public.livia_emails enable row level security;
alter table public.livia_supressao enable row level security;
alter table public.livia_prospeccao enable row level security;
revoke all on public.livia_emails from anon, authenticated;
revoke all on public.livia_supressao from anon, authenticated;
revoke all on public.livia_prospeccao from anon, authenticated;

comment on table public.livia_emails is
  'E-mails que a LIV.IA já tratou. PK = Message-ID, para não responder duas vezes.';
comment on table public.livia_supressao is
  'Quem pediu para não receber. Nunca limpar junto com o histórico.';
comment on table public.livia_prospeccao is
  'Envios frios, para medir a rampa de aquecimento e as rejeições.';
