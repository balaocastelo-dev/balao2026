-- Adiciona colunas para descrição detalhada e especificações técnicas
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::jsonb;

-- Comentários para documentação
COMMENT ON COLUMN products.description IS 'Descrição completa do produto extraída ou inserida manualmente';
COMMENT ON COLUMN products.specs IS 'Especificações técnicas do produto em formato JSON';
