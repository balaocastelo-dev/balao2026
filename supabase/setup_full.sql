-- Script completo para criar tabelas de pedidos no Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Tabela de Pedidos (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    address JSONB NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    user_id UUID REFERENCES auth.users(id)
);

-- 2. Tabela de Itens do Pedido (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL
);

-- 3. Habilitar RLS (Segurança a Nível de Linha)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 4. Criar Policies (Permissões)

-- Permitir que a Service Role (usada pela API) faça tudo (bypass automático, mas explícito ajuda a documentar)
-- Nota: Service Role key sempre tem acesso total, então policies não bloqueiam ela.

-- Permitir leitura pública apenas para o dono do pedido (se logado)
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Permitir leitura dos itens para o dono do pedido
CREATE POLICY "Users can view their own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Se precisar permitir inserts anônimos via CLIENTE (não recomendado se usar API Route, mas útil para debug):
-- CREATE POLICY "Enable insert for anon" ON public.orders FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable insert for anon items" ON public.order_items FOR INSERT WITH CHECK (true);
