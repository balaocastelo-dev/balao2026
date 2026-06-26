-- Tabela de mensagens do TopBar
CREATE TABLE IF NOT EXISTS public.topbar_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.topbar_messages ENABLE ROW LEVEL SECURITY;

-- Leitura pública (o TopBar pode ser lido sem autenticação)
DROP POLICY IF EXISTS "Public read topbar messages" ON public.topbar_messages;
CREATE POLICY "Public read topbar messages"
  ON public.topbar_messages
  FOR SELECT
  USING ( true );

-- Escrita via Service Role (API do admin)
DROP POLICY IF EXISTS "Service role write topbar messages" ON public.topbar_messages;
CREATE POLICY "Service role write topbar messages"
  ON public.topbar_messages
  FOR ALL
  USING ( auth.role() = 'service_role' )
  WITH CHECK ( auth.role() = 'service_role' );

-- Dados iniciais (opcionais)
INSERT INTO public.topbar_messages (text, display_order) VALUES
('Telefone: (19) 3255-1661', 0),
('WhatsApp: (19) 98751-0267 — Atendimento 24h', 1),
('E-mail: balaocastelo@gmail.com', 2),
('Atendimento: Seg–Sex 08h–18h | Sáb 08h–13h | WhatsApp 24h com IA + humano', 3),
('Endereço: Av. Anchieta, 789 – Cambuí, Campinas – SP | CEP: 13012-100', 4)
ON CONFLICT DO NOTHING;
