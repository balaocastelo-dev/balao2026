-- Atualizar constraint para incluir novos tipos de eventos (meta_global)
ALTER TABLE arena_eventos_midia DROP CONSTRAINT IF EXISTS arena_eventos_midia_evento_tipo_check;

ALTER TABLE arena_eventos_midia 
ADD CONSTRAINT arena_eventos_midia_evento_tipo_check 
CHECK (evento_tipo IN ('nova_venda', 'meta_batida', 'meta_global', 'ultrapassagem', 'lideranca', 'venda_alta', 'combo_vendas'));
