-- ============================================================
-- TABELAS MANUAIS — usadas pelo código mas inexistentes no Supabase
-- (por isso estes recursos falhavam silenciosamente na produção!)
-- ============================================================

-- Blacklist de descadastro de e-mails (app/api/unsubscribe)
CREATE TABLE IF NOT EXISTS "unsubscribed_emails" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "created_at" TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de importações em massa do painel admin (lib/db.ts)
CREATE TABLE IF NOT EXISTS "import_history" (
  "id" TEXT PRIMARY KEY,
  "created_at" TEXT DEFAULT CURRENT_TIMESTAMP,
  "product_count" INTEGER DEFAULT 0,
  "price_percentage" REAL,
  "applied_category" TEXT,
  "applied_scope" TEXT
);

-- Notebooks usados (lib/db.ts CRUD completo)
CREATE TABLE IF NOT EXISTS "used_notebooks" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "model" TEXT,
  "processor" TEXT,
  "ram" TEXT,
  "storage" TEXT,
  "gpu" TEXT,
  "battery" TEXT,
  "price" REAL DEFAULT 0,
  "cart_url" TEXT,
  "image_urls" TEXT DEFAULT '[]',
  "video_url" TEXT,
  "highlight" INTEGER DEFAULT 0,
  "created_at" TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Log de e-mails enviados (lib/mail.ts — hoje é no-op, tabela pronta p/ futuro)
CREATE TABLE IF NOT EXISTS "email_logs" (
  "id" TEXT PRIMARY KEY,
  "event" TEXT,
  "recipient" TEXT,
  "status" TEXT,
  "error_message" TEXT,
  "metadata" TEXT DEFAULT '{}',
  "created_at" TEXT DEFAULT CURRENT_TIMESTAMP
);
