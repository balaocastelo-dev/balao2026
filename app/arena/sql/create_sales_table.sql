
-- Tabela para histórico de vendas individualizadas
CREATE TABLE IF NOT EXISTS arena_vendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendedor_id UUID REFERENCES arena_vendedores(id) ON DELETE CASCADE,
  valor NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas de Segurança (RLS)
ALTER TABLE arena_vendas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública para todos" ON arena_vendas;
CREATE POLICY "Leitura pública para todos" ON arena_vendas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Escrita total para authenticated e service_role" ON arena_vendas;
CREATE POLICY "Escrita total para authenticated e service_role" ON arena_vendas 
FOR ALL 
USING (auth.role() IN ('authenticated', 'service_role'))
WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

-- Adicionar ao Realtime (ignorar erro se já estiver)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'arena_vendas'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE arena_vendas;
  END IF;
END $$;
