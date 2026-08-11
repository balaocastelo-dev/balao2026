-- Tabela de Visitas
CREATE TABLE IF NOT EXISTS public.site_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    page TEXT,
    visitor_id TEXT -- Pode ser um hash do IP ou cookie ID
);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON public.site_visits(created_at);

-- Função RPC para métricas rápidas (opcional, mas melhor que contar tudo no client)
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    total_orders INTEGER;
    orders_24h INTEGER;
    total_revenue NUMERIC;
    revenue_24h NUMERIC;
    total_visits INTEGER;
    visits_24h INTEGER;
    top_products JSONB;
    sales_by_seller JSONB;
BEGIN
    -- Pedidos
    SELECT COUNT(*), COALESCE(SUM(total), 0) INTO total_orders, total_revenue FROM orders WHERE status = 'paid';
    SELECT COUNT(*), COALESCE(SUM(total), 0) INTO orders_24h, revenue_24h FROM orders WHERE status = 'paid' AND created_at > (now() - interval '24 hours');

    -- Visitas
    SELECT COUNT(*) INTO total_visits FROM site_visits;
    SELECT COUNT(*) INTO visits_24h FROM site_visits WHERE created_at > (now() - interval '24 hours');

    -- Top Produtos
    SELECT jsonb_agg(t) INTO top_products FROM (
        SELECT product_name, SUM(quantity) as qtd 
        FROM order_items 
        GROUP BY product_name 
        ORDER BY qtd DESC 
        LIMIT 5
    ) t;

    -- Vendas por Vendedor
    SELECT jsonb_agg(t) INTO sales_by_seller FROM (
        SELECT v.nome, v.vendas_atual, v.meta_valor 
        FROM arena_vendedores v
        ORDER BY v.vendas_atual DESC
    ) t;

    RETURN jsonb_build_object(
        'total_orders', total_orders,
        'orders_24h', orders_24h,
        'total_revenue', total_revenue,
        'revenue_24h', revenue_24h,
        'total_visits', total_visits,
        'visits_24h', visits_24h,
        'top_products', top_products,
        'sales_by_seller', sales_by_seller
    );
END;
$$;
