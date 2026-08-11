-- Enable extensions for advanced search
create extension if not exists unaccent;
create extension if not exists pg_trgm;

-- Add FTS column to products if not exists
-- We use 'generated always' to keep it in sync automatically
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'fts') then
    alter table products
    add column fts tsvector
    generated always as (
      setweight(to_tsvector('portuguese', unaccent(coalesce(name, ''))), 'A') ||
      setweight(to_tsvector('portuguese', unaccent(coalesce(description, ''))), 'B') ||
      setweight(to_tsvector('portuguese', unaccent(coalesce(category, ''))), 'C')
    ) stored;
  end if;
end $$;

-- Create GIN index for FTS (Fast Text Search)
create index if not exists products_fts_idx on products using gin (fts);

-- Create GIN index for Trigram (Fuzzy Search) on name
-- This helps with typos like "monitro" -> "monitor"
create index if not exists products_name_trgm_idx on products using gin (name gin_trgm_ops);

-- Create Search Function
create or replace function search_products_fts(
  query_text text,
  limit_count int default 20
)
returns setof products
language plpgsql
security definer -- Runs with privileges of the creator (allows searching public data)
as $$
declare
  search_query tsquery;
  clean_query text;
begin
  -- Remove extra spaces and unaccent
  clean_query := trim(unaccent(query_text));
  
  -- Convert user input to a websearch query (handles "Monitor LG", "da", "de", etc.)
  -- websearch_to_tsquery handles stopwords and syntax like "Monitor -LG"
  search_query := websearch_to_tsquery('portuguese', clean_query);

  return query (
    select *
    from products
    where
      -- 1. Exact/Stemmed match (FTS) - High Precision
      (fts @@ search_query)
      OR
      -- 2. Fuzzy match (Trigram) for typos - High Recall
      -- Only checking name for performance, threshold 0.1 is very loose, 0.3 is better usually
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
