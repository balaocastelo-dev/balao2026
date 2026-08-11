-- ============================================================================
-- SCRIPT DE CONFIGURAÇÃO COMPLETA DO BANCO DE DADOS - BALÃO 2026 (SUPABASE)
-- ============================================================================
-- Execute este script no SQL Editor do seu projeto no Supabase (https://supabase.com/dashboard)
-- Este script é idempotente (pode ser executado várias vezes sem causar erros).

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. TABELA DE PERFIS (PROFILES) & AUTH
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. CATEGORIAS (CATEGORIES)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    icon TEXT,
    active BOOLEAN DEFAULT true
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;
CREATE POLICY "Authenticated users can manage categories" ON public.categories FOR ALL USING (true);


-- 4. PRODUTOS (PRODUCTS)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  image TEXT NOT NULL,
  category TEXT,
  slug TEXT,
  description TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  image_urls TEXT[] DEFAULT '{}',
  kabum_url TEXT,
  kabum_last_price NUMERIC,
  kabum_last_stock TEXT,
  kabum_last_checked_at TIMESTAMPTZ,
  kabum_sync_enabled BOOLEAN DEFAULT false,
  kabum_sync_status TEXT,
  kabum_sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public product read access" ON public.products;
CREATE POLICY "Public product read access" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public product insert/update access" ON public.products;
CREATE POLICY "Public product insert/update access" ON public.products FOR ALL USING (true);


-- FTS (Busca Textual em Produtos)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'fts') THEN
    ALTER TABLE products
    ADD COLUMN fts tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('portuguese', unaccent(coalesce(name, ''))), 'A') ||
      setweight(to_tsvector('portuguese', unaccent(coalesce(description, ''))), 'B') ||
      setweight(to_tsvector('portuguese', unaccent(coalesce(category, ''))), 'C')
    ) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS products_fts_idx ON products USING gin (fts);
CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON products USING gin (name gin_trgm_ops);


-- 5. ARENA DE VENDAS & VENDEDORES
CREATE TABLE IF NOT EXISTS public.arena_vendedores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  avatar_url TEXT,
  veiculo_emoji TEXT DEFAULT '🚗',
  meta_valor NUMERIC DEFAULT 0,
  vendas_atual NUMERIC DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.arena_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  ativo BOOLEAN DEFAULT false,
  titulo TEXT DEFAULT 'Corrida de Vendas',
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.arena_config (id, ativo, titulo)
VALUES (1, false, 'Grande Prêmio de Vendas')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.arena_vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública de vendedores" ON public.arena_vendedores;
CREATE POLICY "Leitura pública de vendedores" ON public.arena_vendedores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura pública de config" ON public.arena_config;
CREATE POLICY "Leitura pública de config" ON public.arena_config FOR SELECT USING (true);


-- 6. PEDIDOS (ORDERS & ORDER_ITEMS) & PDV
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    customer_whatsapp TEXT,
    address JSONB,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    user_id UUID REFERENCES auth.users(id),
    cpf_cnpj TEXT,
    seller_id UUID REFERENCES public.arena_vendedores(id),
    origin TEXT DEFAULT 'site',
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    notes TEXT,
    coupon_code TEXT,
    discount_value NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access orders" ON public.orders;
CREATE POLICY "Public access orders" ON public.orders FOR ALL USING (true);

DROP POLICY IF EXISTS "Public access order_items" ON public.order_items;
CREATE POLICY "Public access order_items" ON public.order_items FOR ALL USING (true);


-- 7. CUPONS DE DESCONTO (COUPONS)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    min_purchase_value NUMERIC DEFAULT 0,
    applicable_products JSONB DEFAULT '[]',
    applicable_categories JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for coupons" ON public.coupons;
CREATE POLICY "Public read access for coupons" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full access coupons" ON public.coupons;
CREATE POLICY "Full access coupons" ON public.coupons FOR ALL USING (true);


-- 8. CARROSSEL (CAROUSEL_IMAGES)
CREATE TABLE IF NOT EXISTS public.carousel_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    link TEXT,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active carousel images" ON public.carousel_images;
CREATE POLICY "Public can view active carousel images" ON public.carousel_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "All operations carousel images" ON public.carousel_images;
CREATE POLICY "All operations carousel images" ON public.carousel_images FOR ALL USING (true);


-- 9. HISTÓRICO DE IMPORTAÇÃO (IMPORT_HISTORY)
CREATE TABLE IF NOT EXISTS public.import_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    product_count INTEGER DEFAULT 0,
    price_percentage NUMERIC,
    applied_category TEXT,
    applied_scope TEXT
);

ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All operations import history" ON public.import_history;
CREATE POLICY "All operations import history" ON public.import_history FOR ALL USING (true);


-- 10. FECHAMENTO SEMANAL (WEEKLY_ORDERS & WEEKLY_EXPENSES)
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

CREATE TABLE IF NOT EXISTS public.weekly_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT,
    value NUMERIC DEFAULT 0,
    category TEXT,
    date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.weekly_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for weekly_orders" ON public.weekly_orders;
CREATE POLICY "Enable all access for weekly_orders" ON public.weekly_orders FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for weekly_expenses" ON public.weekly_expenses;
CREATE POLICY "Enable all access for weekly_expenses" ON public.weekly_expenses FOR ALL USING (true);


-- 11. DASHBOARD DE MÉTRICAS & VISITAS (SITE_VISITS)
CREATE TABLE IF NOT EXISTS public.site_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    page TEXT,
    visitor_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON public.site_visits(created_at);

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
    SELECT COUNT(*), COALESCE(SUM(total), 0) INTO total_orders, total_revenue FROM orders WHERE status = 'paid';
    SELECT COUNT(*), COALESCE(SUM(total), 0) INTO orders_24h, revenue_24h FROM orders WHERE status = 'paid' AND created_at > (now() - interval '24 hours');
    SELECT COUNT(*) INTO total_visits FROM site_visits;
    SELECT COUNT(*) INTO visits_24h FROM site_visits WHERE created_at > (now() - interval '24 hours');

    SELECT jsonb_agg(t) INTO top_products FROM (
        SELECT product_name, SUM(quantity) as qtd 
        FROM order_items 
        GROUP BY product_name 
        ORDER BY qtd DESC 
        LIMIT 5
    ) t;

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


-- 12. BARRA SUPERIOR & NOTIFICAÇÕES (TOPBAR_MESSAGES)
CREATE TABLE IF NOT EXISTS public.topbar_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    link TEXT,
    icon TEXT DEFAULT 'Sparkles',
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.topbar_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view topbar_messages" ON public.topbar_messages;
CREATE POLICY "Public view topbar_messages" ON public.topbar_messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "All operations topbar_messages" ON public.topbar_messages;
CREATE POLICY "All operations topbar_messages" ON public.topbar_messages FOR ALL USING (true);


-- 13. BLOG AUTOMÁTICO (BLOG_POSTS & BLOG_SOURCE_ITEMS)
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_html TEXT NOT NULL,
  cover_image TEXT,
  category TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'rss', 'product')),
  source_url TEXT,
  source_title TEXT,
  product_id TEXT,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  json_ld JSONB,
  reading_time_minutes INT,
  internal_links JSONB
);

CREATE TABLE IF NOT EXISTS public.blog_source_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('rss', 'product')),
  source_url TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  source_title TEXT,
  source_published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_hash)
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_source_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public blog posts" ON public.blog_posts;
CREATE POLICY "Public blog posts" ON public.blog_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "All blog posts access" ON public.blog_posts;
CREATE POLICY "All blog posts access" ON public.blog_posts FOR ALL USING (true);


-- 14. VITRINE DE PÁGINAS (VITRINE_PAGES)
CREATE TABLE IF NOT EXISTS public.vitrine_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_pc TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  categoria TEXT NOT NULL,
  descricao_original TEXT,
  processador TEXT,
  placa_video TEXT,
  memoria_ram TEXT,
  armazenamento TEXT,
  sistema_operacional TEXT,
  resfriamento TEXT,
  aplicacoes JSONB,
  status TEXT NOT NULL DEFAULT 'rascunho',
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_publicacao TIMESTAMPTZ
);

ALTER TABLE public.vitrine_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public vitrine pages" ON public.vitrine_pages;
CREATE POLICY "Public vitrine pages" ON public.vitrine_pages FOR SELECT USING (true);
DROP POLICY IF EXISTS "All vitrine pages access" ON public.vitrine_pages;
CREATE POLICY "All vitrine pages access" ON public.vitrine_pages FOR ALL USING (true);


-- 15. UNSUBSCRIBED & NEWSLETTER
CREATE TABLE IF NOT EXISTS public.unsubscribed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.unsubscribed ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public unsubscribed read" ON public.unsubscribed;
CREATE POLICY "Public unsubscribed read" ON public.unsubscribed FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public unsubscribed insert" ON public.unsubscribed;
CREATE POLICY "Public unsubscribed insert" ON public.unsubscribed FOR INSERT WITH CHECK (true);


-- 16. BUCKETS DE STORAGE (AVATARS, CAROUSEL, PRODUCTS)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('carousel', 'carousel', true),
  ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read avatars storage" ON storage.objects;
CREATE POLICY "Public read avatars storage" ON storage.objects FOR SELECT USING (bucket_id IN ('avatars', 'carousel', 'products'));

DROP POLICY IF EXISTS "Public insert avatars storage" ON storage.objects;
CREATE POLICY "Public insert avatars storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('avatars', 'carousel', 'products'));

DROP POLICY IF EXISTS "Public update avatars storage" ON storage.objects;
CREATE POLICY "Public update avatars storage" ON storage.objects FOR UPDATE USING (bucket_id IN ('avatars', 'carousel', 'products'));


-- 17. INSERÇÃO INICIAL DE CATEGORIAS PADRÃO
CREATE OR REPLACE FUNCTION insert_category(cat_name text, cat_slug text, parent_slug text default null, cat_icon text default null, cat_order integer default 0)
RETURNS uuid AS $$
DECLARE
    pid uuid;
    cid uuid;
BEGIN
    IF parent_slug IS NOT NULL THEN
        SELECT id INTO pid FROM public.categories WHERE slug = parent_slug LIMIT 1;
    END IF;

    INSERT INTO public.categories (name, slug, parent_id, icon, display_order)
    VALUES (cat_name, cat_slug, pid, cat_icon, cat_order)
    ON CONFLICT (slug) DO UPDATE SET 
        name = EXCLUDED.name,
        parent_id = EXCLUDED.parent_id,
        icon = EXCLUDED.icon,
        display_order = EXCLUDED.display_order
    RETURNING id INTO cid;

    RETURN cid;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    PERFORM insert_category('Todos os Produtos', 'todos-os-produtos', null, 'List', 0);
    PERFORM insert_category('Hardware & Componentes', 'hardware-componentes', null, 'Cpu', 1);
    PERFORM insert_category('Processadores (CPU)', 'processadores-cpu', 'hardware-componentes', 'Cpu', 1);
    PERFORM insert_category('Placas de Vídeo (GPU)', 'placas-de-video-gpu', 'hardware-componentes', 'Monitor', 2);
    PERFORM insert_category('Placas-Mãe', 'placas-mae', 'hardware-componentes', 'CircuitBoard', 3);
    PERFORM insert_category('Memória RAM', 'memoria-ram', 'hardware-componentes', 'Memory', 4);
    PERFORM insert_category('Armazenamento (SSD & HD)', 'armazenamento-ssd-hd', 'hardware-componentes', 'HardDrive', 5);
    PERFORM insert_category('Fontes de Alimentação', 'fontes-de-alimentacao', 'hardware-componentes', 'Zap', 6);
    PERFORM insert_category('Gabinetes Gamer', 'gabinetes-gamer', 'hardware-componentes', 'Box', 7);
    PERFORM insert_category('Refrigeração & Cooled', 'refrigeracao-cooled', 'hardware-componentes', 'Fan', 8);

    PERFORM insert_category('Computadores & Monitores', 'computadores-monitores', null, 'Monitor', 2);
    PERFORM insert_category('Monitores Gamer & Office', 'monitores-gamer-office', 'computadores-monitores', 'Monitor', 1);
    PERFORM insert_category('PCs Gamer Montados', 'pcs-gamer-montados', 'computadores-monitores', 'Cpu', 2);
    PERFORM insert_category('Computadores de Escritório', 'computadores-de-escritorio', 'computadores-monitores', 'Laptop', 3);

    PERFORM insert_category('Periféricos & Acessórios', 'perifericos-acessorios', null, 'Keyboard', 3);
    PERFORM insert_category('Teclados Mecânicos', 'teclados-mecanicos', 'perifericos-acessorios', 'Keyboard', 1);
    PERFORM insert_category('Mouses Gamer', 'mouses-gamer', 'perifericos-acessorios', 'Mouse', 2);
    PERFORM insert_category('Headsets & Fones', 'headsets-fones', 'perifericos-acessorios', 'Headphones', 3);
    PERFORM insert_category('Mousepads', 'mousepads', 'perifericos-acessorios', 'Square', 4);
    PERFORM insert_category('Cadeiras Gamer & Ergonômicas', 'cadeiras-gamer-ergonomicas', 'perifericos-acessorios', 'Armchair', 5);

    PERFORM insert_category('Linha Apple', 'linha-apple', null, 'Apple', 4);
    PERFORM insert_category('iPhones', 'iphones', 'linha-apple', 'Smartphone', 1);
    PERFORM insert_category('MacBooks & iMacs', 'macbooks-imacs', 'linha-apple', 'Laptop', 2);
    PERFORM insert_category('iPads & Acessórios', 'ipads-acessorios', 'linha-apple', 'Tablet', 3);
END $$;
