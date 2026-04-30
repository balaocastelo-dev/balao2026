-- Adiciona colunas para múltiplas imagens e URL original do produto
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS product_url TEXT;

-- Comentário para documentação
COMMENT ON COLUMN products.image_urls IS 'Lista de URLs de imagens em alta resolução extraídas';
COMMENT ON COLUMN products.product_url IS 'URL original do produto para referência ou re-scraping';
