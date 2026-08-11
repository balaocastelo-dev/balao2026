-- Tabela para configuração de eventos e mídia
CREATE TABLE arena_eventos_midia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_tipo TEXT NOT NULL CHECK (evento_tipo IN ('nova_venda', 'meta_batida', 'ultrapassagem', 'lideranca', 'venda_alta', 'combo_vendas')),
  gif_url TEXT NOT NULL,
  titulo TEXT,
  mensagem_template TEXT, -- Ex: "{vendedor} acabou de vender {valor}!"
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir alguns padrões
INSERT INTO arena_eventos_midia (evento_tipo, gif_url, titulo, mensagem_template) VALUES
('nova_venda', 'https://media.giphy.com/media/l0Ex6kAKAoFRsFh6M/giphy.gif', 'NOVA VENDA!', '{vendedor} mandou ver!'),
('meta_batida', 'https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif', 'META BATIDA!', '{vendedor} atingiu a meta!'),
('lideranca', 'https://media.giphy.com/media/l2Je0oOcT4cioSIfu/giphy.gif', 'NOVO LÍDER!', '{vendedor} assumiu a ponta!'),
('ultrapassagem', 'https://media.giphy.com/media/3o7TKsAd53hIuI9E8o/giphy.gif', 'ULTRAPASSAGEM!', '{vendedor} subiu no ranking!');

-- Políticas de acesso (RLS) se necessário
ALTER TABLE arena_eventos_midia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública" ON arena_eventos_midia FOR SELECT USING (true);
CREATE POLICY "Escrita admin" ON arena_eventos_midia FOR ALL USING (auth.role() = 'service_role'); -- Ajustar conforme auth
