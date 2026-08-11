-- Garante que a tabela arena_vendas esteja na publicação do Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'arena_vendas'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE arena_vendas;
  END IF;
END $$;

-- Garante que as políticas de leitura permitam acesso público
DROP POLICY IF EXISTS "Leitura pública para todos" ON arena_vendas;
CREATE POLICY "Leitura pública para todos" ON arena_vendas FOR SELECT USING (true);
