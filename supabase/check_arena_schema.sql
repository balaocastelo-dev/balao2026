
-- Verifica se a coluna order_id existe em arena_vendas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'arena_vendas'
        AND column_name = 'order_id'
    ) THEN
        ALTER TABLE arena_vendas ADD COLUMN order_id UUID REFERENCES orders(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Garante que a tabela orders tem as colunas necessárias
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'seller_id') THEN
        ALTER TABLE orders ADD COLUMN seller_id UUID REFERENCES arena_vendedores(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'origin') THEN
        ALTER TABLE orders ADD COLUMN origin TEXT DEFAULT 'site';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
        ALTER TABLE orders ADD COLUMN payment_method TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'cpf_cnpj') THEN
        ALTER TABLE orders ADD COLUMN cpf_cnpj TEXT;
    END IF;
END $$;

-- Atualiza permissões
GRANT ALL ON arena_vendas TO authenticated;
GRANT ALL ON arena_vendas TO service_role;
