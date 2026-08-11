-- Migration para adicionar suporte a PDV na tabela orders

-- Adicionar colunas necessárias
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cpf_cnpj text,
ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES arena_vendedores(id),
ADD COLUMN IF NOT EXISTS origin text DEFAULT 'site', -- 'site' ou 'pdv'
ADD COLUMN IF NOT EXISTS payment_method text, -- 'pix', 'credit_card', 'debit_card', 'cash'
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending', -- 'pending', 'paid', 'failed'
ADD COLUMN IF NOT EXISTS notes text;

-- Criar índices para melhorar performance de busca
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_cpf_cnpj ON orders(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_origin ON orders(origin);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Função para busca fuzzy/abrangente em pedidos
CREATE OR REPLACE FUNCTION search_orders(
  search_term text,
  p_status text default null,
  p_seller_id uuid default null,
  p_start_date timestamptz default null,
  p_end_date timestamptz default null,
  p_limit integer default 50,
  p_offset integer default 0
)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  customer_name text,
  total numeric,
  status text,
  origin text,
  seller_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.created_at,
    o.customer_name,
    o.total,
    o.status,
    o.origin,
    v.nome as seller_name
  FROM orders o
  LEFT JOIN arena_vendedores v ON o.seller_id = v.id
  WHERE 
    (
      search_term IS NULL OR search_term = '' OR
      o.customer_name ILIKE '%' || search_term || '%' OR
      o.cpf_cnpj ILIKE '%' || search_term || '%' OR
      o.customer_email ILIKE '%' || search_term || '%' OR
      o.id::text ILIKE '%' || search_term || '%'
    )
    AND (p_status IS NULL OR o.status = p_status)
    AND (p_seller_id IS NULL OR o.seller_id = p_seller_id)
    AND (p_start_date IS NULL OR o.created_at >= p_start_date)
    AND (p_end_date IS NULL OR o.created_at <= p_end_date)
  ORDER BY o.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
