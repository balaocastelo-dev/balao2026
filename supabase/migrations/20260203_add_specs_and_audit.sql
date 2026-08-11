
-- Adiciona campo JSONB para especificações técnicas
ALTER TABLE products ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}';

-- Cria tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'product', 'category', etc
    entity_id TEXT,
    details JSONB, -- Mudanças realizadas
    performed_by TEXT, -- Email ou ID do usuário (opcional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para audit_logs (Permissiva para facilitar admin, idealmente seria restrita a admins)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (ou restrita a autenticados em produção real)
CREATE POLICY "Public read access for audit_logs" ON audit_logs
    FOR SELECT USING (true);

-- Permitir inserção (pelo backend/service role)
CREATE POLICY "Public insert access for audit_logs" ON audit_logs
    FOR INSERT WITH CHECK (true);
