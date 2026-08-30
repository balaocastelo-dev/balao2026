-- ============================================================
-- ESQUEMA MARIADB/MYSQL DA LOJA BALAO 2026
-- Convertido de supabase/turso_generated_schema.sql +
-- supabase/turso_manual_tables.sql (30 tabelas)
-- Charset utf8mb4 (suporta emojis)
-- ============================================================

CREATE TABLE IF NOT EXISTS arena_config (
  id INT PRIMARY KEY DEFAULT 1,
  ativo INT DEFAULT 0,
  titulo TEXT,
  atualizado_em TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS arena_eventos_midia (
  id VARCHAR(255) PRIMARY KEY,
  evento_tipo VARCHAR(255) NOT NULL,
  gif_url TEXT NOT NULL,
  titulo TEXT,
  mensagem_template TEXT,
  ativo INT DEFAULT 1,
  created_at TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS arena_vendas (
  id VARCHAR(255) PRIMARY KEY,
  vendedor_id VARCHAR(255),
  valor DOUBLE NOT NULL,
  created_at TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS arena_vendedores (
  id VARCHAR(255) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  veiculo_emoji TEXT,
  meta_valor DOUBLE DEFAULT 0,
  vendas_atual DOUBLE DEFAULT 0,
  criado_em TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  entity TEXT,
  entity_id TEXT,
  details TEXT,
  created_by TEXT,
  created_at TEXT,
  entity_type TEXT,
  new_values TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_posts (
  id VARCHAR(255) PRIMARY KEY,
  title TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content_html TEXT NOT NULL,
  cover_image_url TEXT,
  cover_image_alt TEXT,
  source_url VARCHAR(700),
  source_site TEXT,
  source_title TEXT,
  source_published_at TEXT,
  language TEXT,
  tags TEXT,
  keywords TEXT,
  status VARCHAR(32),
  published_at TEXT,
  created_at TEXT,
  updated_at TEXT,
  category TEXT,
  cover_image TEXT,
  source_type VARCHAR(32),
  product_id VARCHAR(255),
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  json_ld TEXT,
  reading_time_minutes INT,
  internal_links TEXT,
  UNIQUE (slug),
  UNIQUE (source_url)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_source_items (
  id VARCHAR(255) PRIMARY KEY,
  source_type VARCHAR(64) NOT NULL,
  source_url TEXT NOT NULL,
  source_hash VARCHAR(255) NOT NULL,
  source_title TEXT,
  source_published_at TEXT,
  created_at TEXT,
  UNIQUE (source_type),
  UNIQUE (source_hash)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS carousel_images (
  id VARCHAR(255) PRIMARY KEY,
  created_at TEXT,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  link TEXT,
  display_order INT DEFAULT 0,
  active INT DEFAULT 1,
  metadata TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(255) PRIMARY KEY,
  created_at TEXT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  parent_id VARCHAR(255),
  display_order INT DEFAULT 0,
  icon TEXT,
  active INT DEFAULT 1,
  full_path TEXT,
  UNIQUE (slug)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS controle_part_withdrawals (
  id VARCHAR(255) PRIMARY KEY,
  created_at TEXT,
  part_id VARCHAR(255) NOT NULL,
  customer_name TEXT NOT NULL,
  os_number TEXT NOT NULL,
  sale_price DOUBLE NOT NULL,
  technician_name TEXT NOT NULL,
  authorization_code TEXT NOT NULL,
  approved_password_code TEXT NOT NULL,
  part_snapshot_name TEXT NOT NULL,
  part_snapshot_serial TEXT NOT NULL,
  part_snapshot_type TEXT NOT NULL,
  part_snapshot_photo_url TEXT,
  purchase_order_reference TEXT NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS controle_parts (
  id VARCHAR(255) PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  type TEXT NOT NULL,
  status TEXT,
  full_name TEXT NOT NULL,
  serial_number VARCHAR(255) NOT NULL,
  purchase_order_reference TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  notes TEXT,
  withdrawn_at TEXT,
  withdrawn_customer_name TEXT,
  withdrawn_os_number TEXT,
  withdrawn_sale_price DOUBLE,
  withdrawn_technician_name TEXT,
  withdrawn_authorization_code TEXT,
  UNIQUE (serial_number)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(64) NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value DOUBLE NOT NULL,
  expiration_date TEXT,
  max_uses INT,
  current_uses INT DEFAULT 0,
  status TEXT,
  min_purchase_value DOUBLE DEFAULT 0,
  applicable_products TEXT,
  applicable_categories TEXT,
  created_at TEXT,
  updated_at TEXT,
  UNIQUE (code)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS home_blocks (
  id VARCHAR(255) PRIMARY KEY,
  category_id VARCHAR(255) NOT NULL,
  title TEXT,
  display_order INT DEFAULT 0,
  active INT DEFAULT 1,
  created_at TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INT NOT NULL,
  price DOUBLE NOT NULL,
  product_id VARCHAR(255)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  created_at TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  address TEXT NOT NULL,
  total DOUBLE NOT NULL,
  status VARCHAR(32),
  user_id VARCHAR(255),
  coupon_code VARCHAR(64),
  discount_value DOUBLE DEFAULT 0,
  payment_method TEXT,
  transaction_id TEXT,
  installments INT DEFAULT 1,
  nsu TEXT,
  authorization_code TEXT,
  card_brand TEXT,
  risk_score DOUBLE,
  payment_details TEXT,
  cpf_cnpj TEXT,
  seller_id TEXT,
  origin TEXT,
  payment_status TEXT,
  notes TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name TEXT NOT NULL,
  price VARCHAR(64) NOT NULL,
  image TEXT NOT NULL,
  category TEXT,
  slug VARCHAR(700),
  created_at TEXT,
  cost DOUBLE,
  supplier TEXT,
  video_url TEXT,
  description TEXT,
  original_image TEXT,
  migration_status TEXT,
  migration_error TEXT,
  migrated_at TEXT,
  stock INT DEFAULT 0,
  brand TEXT,
  rating TEXT,
  installment TEXT,
  discount_pix TEXT,
  price_card TEXT,
  availability TEXT,
  source_url TEXT,
  name_description TEXT,
  image_urls TEXT,
  product_url TEXT,
  specs TEXT,
  kabum_url TEXT,
  kabum_last_price DOUBLE,
  kabum_last_stock TEXT,
  kabum_last_checked_at TEXT,
  kabum_sync_enabled INT DEFAULT 0,
  kabum_sync_status TEXT,
  kabum_sync_error TEXT,
  cost_price DOUBLE,
  sale_price DOUBLE,
  stock_quantity INT DEFAULT 0,
  status TEXT,
  photos TEXT,
  notes TEXT,
  updated_at TEXT,
  KEY idx_products_category (category(255)),
  KEY idx_products_slug (slug(500)),
  KEY idx_products_name (name(255))
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_conversion_events (
  id VARCHAR(255) PRIMARY KEY,
  created_at TEXT,
  event_name TEXT NOT NULL,
  event_category TEXT,
  channel TEXT,
  page_path TEXT,
  page_query TEXT,
  source TEXT,
  label TEXT,
  city TEXT,
  service TEXT,
  product_name TEXT,
  destination TEXT,
  visitor_id TEXT,
  metadata TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_visits (
  id VARCHAR(255) PRIMARY KEY,
  created_at TEXT,
  page TEXT,
  visitor_id TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS topbar_messages (
  id VARCHAR(255) PRIMARY KEY,
  text TEXT NOT NULL,
  active INT DEFAULT 1,
  display_order INT DEFAULT 0,
  created_at TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vitrine_pages (
  id VARCHAR(255) PRIMARY KEY,
  nome_pc TEXT NOT NULL,
  slug VARCHAR(700) NOT NULL,
  categoria TEXT NOT NULL,
  descricao_original TEXT,
  processador TEXT,
  placa_video TEXT,
  memoria_ram TEXT,
  armazenamento TEXT,
  sistema_operacional TEXT,
  resfriamento TEXT,
  aplicacoes TEXT,
  status TEXT,
  data_criacao TEXT,
  data_publicacao TEXT,
  source_url TEXT,
  extras TEXT,
  images TEXT,
  image_prompts TEXT,
  UNIQUE (slug)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS weekly_expenses (
  id VARCHAR(255) PRIMARY KEY,
  description TEXT,
  value DOUBLE DEFAULT 0,
  category TEXT,
  date TEXT,
  created_at TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS weekly_orders (
  id VARCHAR(255) PRIMARY KEY,
  os_number TEXT,
  status TEXT,
  date TEXT,
  labor_income DOUBLE DEFAULT 0,
  parts_income DOUBLE DEFAULT 0,
  labor_expense DOUBLE DEFAULT 0,
  parts_expense DOUBLE DEFAULT 0,
  payment_method TEXT,
  created_at TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS unsubscribed_emails (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(512) NOT NULL,
  created_at TEXT,
  UNIQUE (email)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS import_history (
  id VARCHAR(255) PRIMARY KEY,
  created_at TEXT,
  product_count INT DEFAULT 0,
  price_percentage DOUBLE,
  applied_category TEXT,
  applied_scope TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS used_notebooks (
  id VARCHAR(255) PRIMARY KEY,
  name TEXT,
  model TEXT,
  processor TEXT,
  ram TEXT,
  storage TEXT,
  gpu TEXT,
  battery TEXT,
  price DOUBLE DEFAULT 0,
  cart_url TEXT,
  image_urls TEXT,
  video_url TEXT,
  highlight INT DEFAULT 0,
  created_at TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_logs (
  id VARCHAR(255) PRIMARY KEY,
  event TEXT,
  recipient TEXT,
  status TEXT,
  error_message TEXT,
  metadata TEXT,
  created_at TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;