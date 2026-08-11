-- ============================================================================
-- SCRIPT DE CONFIGURAÇÃO BANCO TURSO (SQLITE / LIBSQL) - BALÃO 2026
-- ============================================================================
-- Execute este script via Turso CLI (`turso db shell balao2026 < supabase/turso_schema.sql`)
-- ou através do Painel Web do Turso (https://app.turso.tech).

-- 1. TABELA DE PERFIS (PROFILES)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  updated_at TEXT DEFAULT (datetime('now')),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT
);

-- 2. CATEGORIAS (CATEGORIES)
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    icon TEXT,
    active INTEGER DEFAULT 1
);

-- 3. PRODUTOS (PRODUCTS)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  image TEXT NOT NULL,
  category TEXT,
  slug TEXT,
  description TEXT,
  specs TEXT DEFAULT '{}',
  image_urls TEXT DEFAULT '[]',
  kabum_url TEXT,
  kabum_last_price REAL,
  kabum_last_stock TEXT,
  kabum_last_checked_at TEXT,
  kabum_sync_enabled INTEGER DEFAULT 0,
  kabum_sync_status TEXT,
  kabum_sync_error TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- 4. ARENA DE VENDAS & VENDEDORES
CREATE TABLE IF NOT EXISTS arena_vendedores (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  avatar_url TEXT,
  veiculo_emoji TEXT DEFAULT '🚗',
  meta_valor REAL DEFAULT 0,
  vendas_atual REAL DEFAULT 0,
  criado_em TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS arena_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  ativo INTEGER DEFAULT 0,
  titulo TEXT DEFAULT 'Corrida de Vendas',
  atualizado_em TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO arena_config (id, ativo, titulo)
VALUES (1, 0, 'Grande Prêmio de Vendas');

-- 5. PEDIDOS (ORDERS & ORDER_ITEMS) & PDV
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    customer_name TEXT,
    customer_email TEXT,
    customer_whatsapp TEXT,
    address TEXT, -- JSON string
    total REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    user_id TEXT REFERENCES profiles(id),
    cpf_cnpj TEXT,
    seller_id TEXT REFERENCES arena_vendedores(id),
    origin TEXT DEFAULT 'site',
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    notes TEXT,
    coupon_code TEXT,
    discount_value REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 6. CUPONS DE DESCONTO (COUPONS)
CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    expiration_date TEXT,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    min_purchase_value REAL DEFAULT 0,
    applicable_products TEXT DEFAULT '[]',
    applicable_categories TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- 7. CARROSSEL (CAROUSEL_IMAGES)
CREATE TABLE IF NOT EXISTS carousel_images (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    link TEXT,
    display_order INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    metadata TEXT DEFAULT '{}'
);

-- 8. HISTÓRICO DE IMPORTAÇÃO (IMPORT_HISTORY)
CREATE TABLE IF NOT EXISTS import_history (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    product_count INTEGER DEFAULT 0,
    price_percentage REAL,
    applied_category TEXT,
    applied_scope TEXT
);

-- 9. FECHAMENTO SEMANAL (WEEKLY_ORDERS & WEEKLY_EXPENSES)
CREATE TABLE IF NOT EXISTS weekly_orders (
    id TEXT PRIMARY KEY,
    os_number TEXT,
    status TEXT,
    date TEXT,
    labor_income REAL DEFAULT 0,
    parts_income REAL DEFAULT 0,
    labor_expense REAL DEFAULT 0,
    parts_expense REAL DEFAULT 0,
    payment_method TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS weekly_expenses (
    id TEXT PRIMARY KEY,
    description TEXT,
    value REAL DEFAULT 0,
    category TEXT,
    date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 10. DASHBOARD DE MÉTRICAS & VISITAS (SITE_VISITS)
CREATE TABLE IF NOT EXISTS site_visits (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    page TEXT,
    visitor_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at);

-- 11. BARRA SUPERIOR & NOTIFICAÇÕES (TOPBAR_MESSAGES)
CREATE TABLE IF NOT EXISTS topbar_messages (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    link TEXT,
    icon TEXT DEFAULT 'Sparkles',
    active INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 12. BLOG AUTOMÁTICO (BLOG_POSTS & BLOG_SOURCE_ITEMS)
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_html TEXT NOT NULL,
  cover_image TEXT,
  category TEXT,
  tags TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'published',
  published_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  source_type TEXT NOT NULL DEFAULT 'manual',
  source_url TEXT,
  source_title TEXT,
  product_id TEXT,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  json_ld TEXT,
  reading_time_minutes INTEGER,
  internal_links TEXT
);

CREATE TABLE IF NOT EXISTS blog_source_items (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  source_title TEXT,
  source_published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (source_type, source_hash)
);

-- 13. VITRINE DE PÁGINAS (VITRINE_PAGES)
CREATE TABLE IF NOT EXISTS vitrine_pages (
  id TEXT PRIMARY KEY,
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
  aplicacoes TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho',
  data_criacao TEXT DEFAULT (datetime('now')),
  data_publicacao TEXT
);

-- 14. UNSUBSCRIBED
CREATE TABLE IF NOT EXISTS unsubscribed (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 15. SEED INICIAL DE CATEGORIAS
INSERT OR IGNORE INTO categories (id, name, slug, icon, display_order) VALUES
  ('cat-1', 'Todos os Produtos', 'todos-os-produtos', 'List', 0),
  ('cat-2', 'Hardware & Componentes', 'hardware-componentes', 'Cpu', 1),
  ('cat-3', 'Processadores (CPU)', 'processadores-cpu', 'Cpu', 2),
  ('cat-4', 'Placas de Vídeo (GPU)', 'placas-de-video-gpu', 'Monitor', 3),
  ('cat-5', 'Placas-Mãe', 'placas-mae', 'CircuitBoard', 4),
  ('cat-6', 'Memória RAM', 'memoria-ram', 'Memory', 5),
  ('cat-7', 'Armazenamento (SSD & HD)', 'armazenamento-ssd-hd', 'HardDrive', 6),
  ('cat-8', 'Computadores & Monitores', 'computadores-monitores', 'Monitor', 7),
  ('cat-9', 'Monitores Gamer & Office', 'monitores-gamer-office', 'Monitor', 8),
  ('cat-10', 'PCs Gamer Montados', 'pcs-gamer-montados', 'Cpu', 9),
  ('cat-11', 'Periféricos & Acessórios', 'perifericos-acessorios', 'Keyboard', 10),
  ('cat-12', 'Linha Apple', 'linha-apple', 'Apple', 11);

-- ============================================================================
-- TABELAS ADICIONAIS (MÓDULOS ARENA, CONTROLE DE PEÇAS, EVENTOS DE MÍDIA)
-- ============================================================================

-- 16. HISTÓRICO DE VENDAS DA ARENA (arena_vendas)
CREATE TABLE IF NOT EXISTS arena_vendas (
    id TEXT PRIMARY KEY,
    vendedor_id TEXT REFERENCES arena_vendedores(id) ON DELETE CASCADE,
    order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
    valor REAL NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_arena_vendas_vendedor ON arena_vendas(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_arena_vendas_created ON arena_vendas(created_at);

-- 17. EVENTOS DE MÍDIA DA ARENA (arena_eventos_midia)
CREATE TABLE IF NOT EXISTS arena_eventos_midia (
    id TEXT PRIMARY KEY,
    evento_tipo TEXT NOT NULL,
    gif_url TEXT,
    titulo TEXT,
    mensagem_template TEXT,
    ativo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 18. CONTROLE DE PEÇAS (controle_parts)
CREATE TABLE IF NOT EXISTS controle_parts (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'disponivel',
    full_name TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    purchase_order_reference TEXT,
    photo_url TEXT,
    notes TEXT,
    withdrawn_at TEXT,
    withdrawn_customer_name TEXT,
    withdrawn_os_number TEXT,
    withdrawn_sale_price REAL,
    withdrawn_technician_name TEXT,
    withdrawn_authorization_code TEXT
);

CREATE INDEX IF NOT EXISTS idx_controle_parts_status ON controle_parts(status);
CREATE INDEX IF NOT EXISTS idx_controle_parts_type ON controle_parts(type);
CREATE INDEX IF NOT EXISTS idx_controle_parts_serial ON controle_parts(serial_number);

-- 19. CONTROLE DE RETIRADAS DE PEÇAS (controle_part_withdrawals)
CREATE TABLE IF NOT EXISTS controle_part_withdrawals (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    part_id TEXT REFERENCES controle_parts(id) ON DELETE CASCADE NOT NULL,
    customer_name TEXT NOT NULL,
    os_number TEXT NOT NULL,
    sale_price REAL NOT NULL DEFAULT 0,
    technician_name TEXT NOT NULL,
    authorization_code TEXT NOT NULL,
    approved_password_code TEXT,
    part_snapshot_name TEXT,
    part_snapshot_serial TEXT,
    part_snapshot_type TEXT,
    part_snapshot_photo_url TEXT,
    purchase_order_reference TEXT
);

CREATE INDEX IF NOT EXISTS idx_controle_withdrawals_part ON controle_part_withdrawals(part_id);
CREATE INDEX IF NOT EXISTS idx_controle_withdrawals_os ON controle_part_withdrawals(os_number);
