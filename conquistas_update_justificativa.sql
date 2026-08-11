-- Adiciona colunas para justificativa e evidência na tabela vendedor_conquistas
ALTER TABLE vendedor_conquistas
ADD COLUMN IF NOT EXISTS justificativa TEXT,
ADD COLUMN IF NOT EXISTS evidencia_url TEXT;
