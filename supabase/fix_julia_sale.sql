
-- Script cirúrgico para remover a última venda da vendedora Julia
-- Copie e cole este código no SQL Editor do Supabase (https://supabase.com/dashboard/project/_/sql)

DO $$
DECLARE
    v_vendedor_id UUID;
    v_venda_id UUID;
    v_valor DECIMAL;
    v_order_id UUID;
    v_vendedor_nome TEXT;
BEGIN
    -- 1. Encontrar a vendedora (pega a primeira que der match com 'Julia')
    SELECT id, nome INTO v_vendedor_id, v_vendedor_nome
    FROM arena_vendedores
    WHERE nome ILIKE '%Julia%'
    LIMIT 1;

    IF v_vendedor_id IS NULL THEN
        RAISE EXCEPTION 'Vendedora Julia não encontrada.';
    END IF;

    RAISE NOTICE 'Vendedora encontrada: % (ID: %)', v_vendedor_nome, v_vendedor_id;

    -- 2. Encontrar a última venda
    SELECT id, valor, order_id INTO v_venda_id, v_valor, v_order_id
    FROM arena_vendas
    WHERE vendedor_id = v_vendedor_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_venda_id IS NULL THEN
        RAISE EXCEPTION 'Nenhuma venda encontrada para Julia.';
    END IF;

    RAISE NOTICE 'Removendo venda % de valor % (Order ID: %)', v_venda_id, v_valor, v_order_id;

    -- 3. Atualizar saldo do vendedor
    UPDATE arena_vendedores
    SET vendas_atual = GREATEST(0, COALESCE(vendas_atual, 0) - v_valor)
    WHERE id = v_vendedor_id;

    -- 4. Remover a venda
    DELETE FROM arena_vendas WHERE id = v_venda_id;

    -- 5. Cancelar pedido associado (para manter consistência)
    IF v_order_id IS NOT NULL THEN
        UPDATE orders SET status = 'cancelled' WHERE id = v_order_id;
        RAISE NOTICE 'Pedido % cancelado.', v_order_id;
    END IF;
    
    RAISE NOTICE '✅ Operação concluída com sucesso! Venda removida e saldo atualizado.';
END $$;
