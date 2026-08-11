-- Adiciona colunas para gerenciamento avançado de produtos
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost NUMERIC,
ADD COLUMN IF NOT EXISTS supplier TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Opcional: Adicionar coluna numérica para preço para facilitar ordenação/filtro no futuro
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS price_value NUMERIC;
