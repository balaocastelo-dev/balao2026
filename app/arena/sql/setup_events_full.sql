-- Script completo para configurar a tabela de eventos de mídia da Arena
-- Execute este script no Editor SQL do Supabase

-- 1. Cria a tabela se não existir
CREATE TABLE IF NOT EXISTS arena_eventos_midia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_tipo TEXT NOT NULL,
  gif_url TEXT NOT NULL,
  titulo TEXT,
  mensagem_template TEXT, -- Ex: "{vendedor} acabou de vender {valor}!"
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garante que apenas tipos válidos sejam inseridos
  CONSTRAINT arena_eventos_midia_evento_tipo_check 
  CHECK (evento_tipo IN ('nova_venda', 'meta_batida', 'meta_global', 'ultrapassagem', 'lideranca', 'venda_alta', 'combo_vendas'))
);

-- 2. Habilita Row Level Security (RLS)
ALTER TABLE arena_eventos_midia ENABLE ROW LEVEL SECURITY;

-- 3. Cria políticas de acesso (se não existirem, dropamos antes para evitar erros de duplicidade)
DROP POLICY IF EXISTS "Leitura pública para todos" ON arena_eventos_midia;
CREATE POLICY "Leitura pública para todos" ON arena_eventos_midia FOR SELECT USING (true);

DROP POLICY IF EXISTS "Escrita total para authenticated e service_role" ON arena_eventos_midia;
CREATE POLICY "Escrita total para authenticated e service_role" ON arena_eventos_midia 
FOR ALL 
USING (auth.role() IN ('authenticated', 'service_role'))
WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

-- 4. Insere dados iniciais apenas se a tabela estiver vazia
INSERT INTO arena_eventos_midia (evento_tipo, gif_url, titulo, mensagem_template)
SELECT 'nova_venda', 'https://media.giphy.com/media/l0Ex6kAKAoFRsFh6M/giphy.gif', 'NOVA VENDA!', '{vendedor} mandou ver!'
WHERE NOT EXISTS (SELECT 1 FROM arena_eventos_midia LIMIT 1);

INSERT INTO arena_eventos_midia (evento_tipo, gif_url, titulo, mensagem_template)
SELECT 'meta_batida', 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif', 'META BATIDA!', '{vendedor} atingiu a meta!'
WHERE NOT EXISTS (SELECT 1 FROM arena_eventos_midia WHERE evento_tipo = 'meta_batida');

INSERT INTO arena_eventos_midia (evento_tipo, gif_url, titulo, mensagem_template)
SELECT 'lideranca', 'https://media.giphy.com/media/l2Je0oOcT4cioSIfu/giphy.gif', 'NOVO LÍDER!', '{vendedor} assumiu a ponta!'
WHERE NOT EXISTS (SELECT 1 FROM arena_eventos_midia WHERE evento_tipo = 'lideranca');

INSERT INTO arena_eventos_midia (evento_tipo, gif_url, titulo, mensagem_template)
SELECT 'ultrapassagem', 'https://media.giphy.com/media/3o7TKsAd53hIuI9E8o/giphy.gif', 'ULTRAPASSAGEM!', '{vendedor} subiu no ranking!'
WHERE NOT EXISTS (SELECT 1 FROM arena_eventos_midia WHERE evento_tipo = 'ultrapassagem');

INSERT INTO arena_eventos_midia (evento_tipo, gif_url, titulo, mensagem_template)
SELECT 'meta_global', 'https://media.giphy.com/media/Is1O1TWV0LEJi/giphy.gif', 'META GLOBAL BATIDA!', 'A EQUIPE DESTRUIU TUDO!'
WHERE NOT EXISTS (SELECT 1 FROM arena_eventos_midia WHERE evento_tipo = 'meta_global');
