-- Script de Correção para Tabelas de Pedidos
-- Execute este script no SQL Editor do seu projeto Supabase para garantir que todas as colunas necessárias existam.

-- 1. Garantir que a tabela orders existe com todas as colunas
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    address JSONB NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    user_id UUID REFERENCES auth.users(id),
    coupon_code TEXT,
    discount_value DECIMAL(10,2) DEFAULT 0,
    seller_id UUID, -- Referência opcional se a tabela arena_vendedores existir
    origin TEXT DEFAULT 'site',
    payment_method TEXT,
    cpf_cnpj TEXT
);

-- 2. Garantir que a tabela order_items existe
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL
);

-- 3. Adicionar colunas caso as tabelas já existam mas estejam incompletas
DO $$ 
BEGIN 
    -- Colunas para orders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='coupon_code') THEN
        ALTER TABLE public.orders ADD COLUMN coupon_code TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='discount_value') THEN
        ALTER TABLE public.orders ADD COLUMN discount_value DECIMAL(10,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_method') THEN
        ALTER TABLE public.orders ADD COLUMN payment_method TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='origin') THEN
        ALTER TABLE public.orders ADD COLUMN origin TEXT DEFAULT 'site';
    END IF;

    -- Colunas para order_items
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='product_id') THEN
        ALTER TABLE public.order_items ADD COLUMN product_id TEXT;
    END IF;
END $$;

-- 4. Habilitar RLS (Segurança)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 5. Criar Políticas de Acesso (se não existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Service Role Full Access') THEN
        CREATE POLICY "Service Role Full Access" ON public.orders FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Service Role Full Access') THEN
        CREATE POLICY "Service Role Full Access" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
