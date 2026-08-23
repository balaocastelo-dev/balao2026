-- ============================================================
-- ESQUEMA SQLITE/LIBSQL GERADO DO BACKUP SUPABASE
-- Gerado por scripts/generate-schema.mjs — NÃO editar à mão
-- Tabelas: 26 em uso pelo código
-- ============================================================

-- arena_config
CREATE TABLE IF NOT EXISTS "arena_config" (
  "id" INTEGER DEFAULT 1,
  "ativo" INTEGER DEFAULT 0,
  "titulo" TEXT,
  "atualizado_em" TEXT,
  PRIMARY KEY ("id")
);

-- arena_eventos_midia
CREATE TABLE IF NOT EXISTS "arena_eventos_midia" (
  "id" TEXT,
  "evento_tipo" TEXT NOT NULL,
  "gif_url" TEXT NOT NULL,
  "titulo" TEXT,
  "mensagem_template" TEXT,
  "ativo" INTEGER DEFAULT 1,
  "created_at" TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- arena_vendas
CREATE TABLE IF NOT EXISTS "arena_vendas" (
  "id" TEXT,
  "vendedor_id" TEXT,
  "valor" REAL NOT NULL,
  "created_at" TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- arena_vendedores
CREATE TABLE IF NOT EXISTS "arena_vendedores" (
  "id" TEXT,
  "nome" TEXT NOT NULL,
  "avatar_url" TEXT,
  "veiculo_emoji" TEXT,
  "meta_valor" REAL DEFAULT 0,
  "vendas_atual" REAL DEFAULT 0,
  "criado_em" TEXT,
  PRIMARY KEY ("id")
);

-- audit_logs
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT,
  "entity_id" TEXT,
  "details" TEXT,
  "created_by" TEXT,
  "created_at" TEXT DEFAULT CURRENT_TIMESTAMP,
  "entity_type" TEXT,
  "new_values" TEXT,
  PRIMARY KEY ("id")
);

-- blog_posts
CREATE TABLE IF NOT EXISTS "blog_posts" (
  "id" TEXT,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT,
  "content_html" TEXT NOT NULL,
  "cover_image_url" TEXT,
  "cover_image_alt" TEXT,
  "source_url" TEXT,
  "source_site" TEXT,
  "source_title" TEXT,
  "source_published_at" TEXT,
  "language" TEXT,
  "tags" TEXT,
  "keywords" TEXT,
  "status" TEXT,
  "published_at" TEXT,
  "created_at" TEXT,
  "updated_at" TEXT,
  "category" TEXT,
  "cover_image" TEXT,
  "source_type" TEXT,
  "product_id" TEXT,
  "seo_title" TEXT,
  "seo_description" TEXT,
  "canonical_url" TEXT,
  "json_ld" TEXT,
  "reading_time_minutes" INTEGER,
  "internal_links" TEXT,
  PRIMARY KEY ("id"),
  UNIQUE ("slug"),
  UNIQUE ("source_url")
);

-- blog_source_items
CREATE TABLE IF NOT EXISTS "blog_source_items" (
  "id" TEXT,
  "source_type" TEXT NOT NULL,
  "source_url" TEXT NOT NULL,
  "source_hash" TEXT NOT NULL,
  "source_title" TEXT,
  "source_published_at" TEXT,
  "created_at" TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE ("source_type"),
  UNIQUE ("source_hash")
);

-- carousel_images
CREATE TABLE IF NOT EXISTS "carousel_images" (
  "id" TEXT,
  "created_at" TEXT,
  "image_url" TEXT NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "link" TEXT,
  "display_order" INTEGER DEFAULT 0,
  "active" INTEGER DEFAULT 1,
  "metadata" TEXT,
  PRIMARY KEY ("id")
);

-- categories
CREATE TABLE IF NOT EXISTS "categories" (
  "id" TEXT,
  "created_at" TEXT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "parent_id" TEXT,
  "display_order" INTEGER DEFAULT 0,
  "icon" TEXT,
  "active" INTEGER DEFAULT 1,
  PRIMARY KEY ("id"),
  UNIQUE ("slug")
);

-- controle_part_withdrawals
CREATE TABLE IF NOT EXISTS "controle_part_withdrawals" (
  "id" TEXT,
  "created_at" TEXT,
  "part_id" TEXT NOT NULL,
  "customer_name" TEXT NOT NULL,
  "os_number" TEXT NOT NULL,
  "sale_price" REAL NOT NULL,
  "technician_name" TEXT NOT NULL,
  "authorization_code" TEXT NOT NULL,
  "approved_password_code" TEXT NOT NULL,
  "part_snapshot_name" TEXT NOT NULL,
  "part_snapshot_serial" TEXT NOT NULL,
  "part_snapshot_type" TEXT NOT NULL,
  "part_snapshot_photo_url" TEXT,
  "purchase_order_reference" TEXT NOT NULL,
  PRIMARY KEY ("id")
);

-- controle_parts
CREATE TABLE IF NOT EXISTS "controle_parts" (
  "id" TEXT,
  "created_at" TEXT,
  "updated_at" TEXT,
  "type" TEXT NOT NULL,
  "status" TEXT,
  "full_name" TEXT NOT NULL,
  "serial_number" TEXT NOT NULL,
  "purchase_order_reference" TEXT NOT NULL,
  "photo_url" TEXT NOT NULL,
  "notes" TEXT,
  "withdrawn_at" TEXT,
  "withdrawn_customer_name" TEXT,
  "withdrawn_os_number" TEXT,
  "withdrawn_sale_price" REAL,
  "withdrawn_technician_name" TEXT,
  "withdrawn_authorization_code" TEXT,
  PRIMARY KEY ("id"),
  UNIQUE ("serial_number")
);

-- coupons
CREATE TABLE IF NOT EXISTS "coupons" (
  "id" TEXT,
  "code" TEXT NOT NULL,
  "discount_type" TEXT NOT NULL,
  "discount_value" REAL NOT NULL,
  "expiration_date" TEXT,
  "max_uses" INTEGER,
  "current_uses" INTEGER DEFAULT 0,
  "status" TEXT,
  "min_purchase_value" REAL DEFAULT 0,
  "applicable_products" TEXT,
  "applicable_categories" TEXT,
  "created_at" TEXT DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE ("code")
);

-- home_blocks
CREATE TABLE IF NOT EXISTS "home_blocks" (
  "id" TEXT,
  "category_id" TEXT NOT NULL,
  "title" TEXT,
  "display_order" INTEGER DEFAULT 0,
  "active" INTEGER DEFAULT 1,
  "created_at" TEXT,
  PRIMARY KEY ("id")
);

-- order_items
CREATE TABLE IF NOT EXISTS "order_items" (
  "id" TEXT,
  "order_id" TEXT NOT NULL,
  "product_name" TEXT NOT NULL,
  "product_image" TEXT,
  "quantity" INTEGER NOT NULL,
  "price" REAL NOT NULL,
  "product_id" TEXT,
  PRIMARY KEY ("id")
);

-- orders
CREATE TABLE IF NOT EXISTS "orders" (
  "id" TEXT,
  "created_at" TEXT,
  "customer_name" TEXT NOT NULL,
  "customer_email" TEXT NOT NULL,
  "customer_whatsapp" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "total" REAL NOT NULL,
  "status" TEXT,
  "user_id" TEXT,
  "coupon_code" TEXT,
  "discount_value" REAL DEFAULT 0,
  "payment_method" TEXT,
  "transaction_id" TEXT,
  "installments" INTEGER DEFAULT 1,
  "nsu" TEXT,
  "authorization_code" TEXT,
  "card_brand" TEXT,
  "risk_score" REAL,
  "payment_details" TEXT,
  "cpf_cnpj" TEXT,
  "seller_id" TEXT,
  "origin" TEXT,
  "payment_status" TEXT,
  "notes" TEXT,
  PRIMARY KEY ("id")
);

-- products
CREATE TABLE IF NOT EXISTS "products" (
  "id" TEXT,
  "name" TEXT NOT NULL,
  "price" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "category" TEXT,
  "slug" TEXT,
  "created_at" TEXT,
  "cost" REAL,
  "supplier" TEXT,
  "video_url" TEXT,
  "description" TEXT,
  "original_image" TEXT,
  "migration_status" TEXT,
  "migration_error" TEXT,
  "migrated_at" TEXT,
  "stock" INTEGER DEFAULT 0,
  "name_description" TEXT,
  "image_urls" TEXT,
  "product_url" TEXT,
  "specs" TEXT,
  "kabum_url" TEXT,
  "kabum_last_price" REAL,
  "kabum_last_stock" TEXT,
  "kabum_last_checked_at" TEXT,
  "kabum_sync_enabled" INTEGER DEFAULT 0,
  "kabum_sync_status" TEXT,
  "kabum_sync_error" TEXT,
  "cost_price" REAL,
  "sale_price" REAL,
  "stock_quantity" INTEGER DEFAULT 0,
  "status" TEXT,
  "photos" TEXT,
  "notes" TEXT,
  "updated_at" TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- site_conversion_events
CREATE TABLE IF NOT EXISTS "site_conversion_events" (
  "id" TEXT,
  "created_at" TEXT,
  "event_name" TEXT NOT NULL,
  "event_category" TEXT,
  "channel" TEXT,
  "page_path" TEXT,
  "page_query" TEXT,
  "source" TEXT,
  "label" TEXT,
  "city" TEXT,
  "service" TEXT,
  "product_name" TEXT,
  "destination" TEXT,
  "visitor_id" TEXT,
  "metadata" TEXT,
  PRIMARY KEY ("id")
);

-- site_visits
CREATE TABLE IF NOT EXISTS "site_visits" (
  "id" TEXT,
  "created_at" TEXT,
  "page" TEXT,
  "visitor_id" TEXT,
  PRIMARY KEY ("id")
);

-- topbar_messages
CREATE TABLE IF NOT EXISTS "topbar_messages" (
  "id" TEXT,
  "text" TEXT NOT NULL,
  "active" INTEGER DEFAULT 1,
  "display_order" INTEGER DEFAULT 0,
  "created_at" TEXT,
  PRIMARY KEY ("id")
);

-- vitrine_pages
CREATE TABLE IF NOT EXISTS "vitrine_pages" (
  "id" TEXT,
  "nome_pc" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "categoria" TEXT NOT NULL,
  "descricao_original" TEXT,
  "processador" TEXT,
  "placa_video" TEXT,
  "memoria_ram" TEXT,
  "armazenamento" TEXT,
  "sistema_operacional" TEXT,
  "resfriamento" TEXT,
  "aplicacoes" TEXT,
  "status" TEXT,
  "data_criacao" TEXT DEFAULT CURRENT_TIMESTAMP,
  "data_publicacao" TEXT,
  "source_url" TEXT,
  "extras" TEXT,
  "images" TEXT,
  "image_prompts" TEXT,
  PRIMARY KEY ("id"),
  UNIQUE ("slug")
);

-- weekly_expenses
CREATE TABLE IF NOT EXISTS "weekly_expenses" (
  "id" TEXT,
  "description" TEXT,
  "value" REAL DEFAULT 0,
  "category" TEXT,
  "date" TEXT,
  "created_at" TEXT,
  PRIMARY KEY ("id")
);

-- weekly_orders
CREATE TABLE IF NOT EXISTS "weekly_orders" (
  "id" TEXT,
  "os_number" TEXT,
  "status" TEXT,
  "date" TEXT,
  "labor_income" REAL DEFAULT 0,
  "parts_income" REAL DEFAULT 0,
  "labor_expense" REAL DEFAULT 0,
  "parts_expense" REAL DEFAULT 0,
  "payment_method" TEXT,
  "created_at" TEXT,
  PRIMARY KEY ("id")
);

