create or replace function search_products_fts(
  query_text text,
  limit_count int default 20
)
returns setof products
language plpgsql
security definer
as $$
declare
  search_query tsquery;
  clean_query text;
begin
  -- Remove extra spaces and unaccent
  clean_query := trim(unaccent(query_text));
  
  -- Use plainto_tsquery to enforce AND logic for all terms (Desktop 2025 -> Desktop & 2025)
  -- This replaces websearch_to_tsquery which might be less strict about ANDing all terms in some configurations
  search_query := plainto_tsquery('portuguese', clean_query);

  return query (
    select *
    from products
    where
      -- 1. Exact/Stemmed match (FTS) - High Precision (ALL terms must be present)
      (fts @@ search_query)
      OR
      -- 2. Fuzzy match (Trigram) for typos - High Recall
      -- Only checking name for performance. 
      -- We keep this for cases where FTS might miss due to severe typos, 
      -- but FTS is the primary "smart" search.
      (similarity(unaccent(name), clean_query) > 0.1)
    order by
      -- Rank by FTS relevance first
      ts_rank(fts, search_query) desc,
      -- Then by similarity score
      similarity(unaccent(name), clean_query) desc
    limit limit_count
  );
end;
$$;
