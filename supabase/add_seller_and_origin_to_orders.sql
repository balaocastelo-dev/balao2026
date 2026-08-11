-- Adicionar colunas seller_id e origin à tabela orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.arena_vendedores(id),
ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'site',
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;

-- Adicionar order_id à tabela arena_vendas para rastreabilidade
ALTER TABLE public.arena_vendas
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;
