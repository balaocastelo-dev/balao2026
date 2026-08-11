-- Adiciona colunas para controle de migração de imagens
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS original_image TEXT,
ADD COLUMN IF NOT EXISTS migration_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS migration_error TEXT,
ADD COLUMN IF NOT EXISTS migrated_at TIMESTAMP WITH TIME ZONE;

-- Cria índice para facilitar busca de produtos não migrados
CREATE INDEX IF NOT EXISTS idx_products_migration_status ON products(migration_status);
