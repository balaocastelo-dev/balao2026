-- Tabela para Ordens de Serviço do Fechamento Semanal
CREATE TABLE IF NOT EXISTS public.weekly_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    os_number TEXT,
    status TEXT,
    date DATE,
    labor_income NUMERIC DEFAULT 0,
    parts_income NUMERIC DEFAULT 0,
    labor_expense NUMERIC DEFAULT 0,
    parts_expense NUMERIC DEFAULT 0,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela para Despesas Operacionais do Fechamento Semanal
CREATE TABLE IF NOT EXISTS public.weekly_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT,
    value NUMERIC DEFAULT 0,
    category TEXT,
    date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (opcional, mas recomendado)
ALTER TABLE public.weekly_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_expenses ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (Aberto para leitura/escrita pública por enquanto, ou restrito a autenticados)
-- Como o sistema tem uma senha própria na página, podemos deixar permissivo no banco se o acesso for via API (Service Role)
-- ou criar policy para anon se for direto do client.
-- Vamos permitir acesso publico para simplificar a migração, já que a proteção está na rota/página.

CREATE POLICY "Enable all access for all users" ON public.weekly_orders
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for all users" ON public.weekly_expenses
FOR ALL USING (true) WITH CHECK (true);
