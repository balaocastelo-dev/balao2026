-- Índices para as duas leituras que travaram o banco em 13/09/2026.
--
-- Naquele dia um `select` de 1.288 linhas com TODOS os buffers já em memória
-- passou a levar 68 segundos (planner sozinho: 4,2 s), o PostgREST começou a
-- devolver 503 e três builds da Vercel falharam por timeout. A causa estava no
-- volume de chamadas, não no plano — mas com o volume corrigido no código,
-- estes índices tiram o custo que sobrava de cada leitura.
--
-- 1) getCategories() faz `select category from products where is_curated`
--    para saber quais categorias têm produto. Sem índice parcial isso lia as
--    1.288 linhas do heap (689 buffers). Com ele vira index-only scan.
--
-- 2) Toda listagem do site ordena por created_at desc dentro dos curados. O
--    índice parcial já ordenado evita o sort a cada leitura.
--
-- Os dois são parciais (`where is_curated = true`) porque nenhuma leitura do
-- site olha produto não curado: o índice fica pequeno e cabe na memória.

create index if not exists idx_products_curados_categoria
  on public.products (category)
  where is_curated = true;

create index if not exists idx_products_curados_recentes
  on public.products (created_at desc)
  where is_curated = true;
