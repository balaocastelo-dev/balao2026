create extension if not exists pgcrypto;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content_html text not null,
  cover_image text,
  category text,
  tags text[] not null default '{}',
  status text not null default 'published' check (status in ('draft', 'published')),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source_type text not null default 'manual' check (source_type in ('manual', 'rss', 'product')),
  source_url text,
  source_title text,
  product_id text,
  seo_title text,
  seo_description text,
  canonical_url text,
  json_ld jsonb,
  reading_time_minutes int,
  internal_links jsonb
);

create index if not exists blog_posts_published_at_idx on public.blog_posts (published_at desc);
create index if not exists blog_posts_status_idx on public.blog_posts (status);
create index if not exists blog_posts_category_idx on public.blog_posts (category);

create table if not exists public.blog_source_items (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('rss', 'product')),
  source_url text not null,
  source_hash text not null,
  source_title text,
  source_published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (source_type, source_hash)
);

create index if not exists blog_source_items_created_at_idx on public.blog_source_items (created_at desc);

alter table public.blog_posts enable row level security;
alter table public.blog_source_items enable row level security;

drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts"
on public.blog_posts
for select
using (status = 'published');

