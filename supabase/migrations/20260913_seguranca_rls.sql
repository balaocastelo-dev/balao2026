-- Correções de segurança aplicadas em 13/09/2026
-- Contexto: a chave publishable do Supabase fica exposta no JS do site.
-- Tudo que o papel `anon` pode fazer, qualquer visitante pode fazer.

-- 1) Senha (e e-mail) de vendedor eram legíveis por qualquer visitante.
--    Revogar a coluna não basta enquanto existe SELECT na tabela inteira:
--    é preciso tirar o SELECT da tabela e devolver coluna a coluna.
revoke select on public.sellers from anon, authenticated;
grant select (id, name, photo, hired_at, created_at, slug, ativo, cargo)
  on public.sellers to anon, authenticated;

-- 2) Políticas de leitura totalmente abertas em sellers (redundantes com a
--    policy sellers_public_read_ativo, que já filtra por ativo = true).
drop policy if exists "read_all_public_tables" on public.sellers;
drop policy if exists "sellers_anon_select"    on public.sellers;

-- 3) Escrita anônima. `anon_delete_products` tinha USING true: qualquer
--    visitante conseguia apagar o catálogo inteiro com um curl.
drop policy if exists "anon_delete_products" on public.products;
drop policy if exists "anon_update_products" on public.products;
drop policy if exists "anon_insert_products" on public.products;
drop policy if exists "sellers_anon_insert"  on public.sellers;
drop policy if exists "sellers_anon_update"  on public.sellers;

-- 4) weekly_* tinham "Enable all access for all users" (ALL com true).
--    Os dados reais dessas tabelas vivem no Turso; no Supabase estavam só expostas.
drop policy if exists "Enable all access for all users" on public.weekly_orders;
drop policy if exists "Enable all access for all users" on public.weekly_expenses;

-- A escrita passa a ser exclusivamente pelas rotas de API com a chave
-- service_role (SUPABASE_SERVICE_ROLE_KEY), que ignora RLS.
