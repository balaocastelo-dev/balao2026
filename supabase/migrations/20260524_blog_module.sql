create table if not exists public.blog_rss_feeds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  category text not null,
  language text default 'pt-BR',
  active boolean default true,
  priority integer default 0,
  fetch_interval integer default 15,
  last_checked_at timestamptz,
  campinas_rule boolean default false,
  niche_rule text,
  daily_limit integer default 10,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists blog_rss_feeds_url_unique on public.blog_rss_feeds (url);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  excerpt text,
  content text not null,
  category text not null,
  tags text[] default '{}'::text[],
  status text not null default 'draft',
  source_url text,
  source_name text,
  original_title text,
  featured_image text not null,
  gallery_images text[] default '{}'::text[],
  video_embed_url text,
  video_provider text,
  author text,
  ai_generated boolean default true,
  seo_title text,
  seo_description text,
  seo_keywords text[] default '{}'::text[],
  geo_score numeric default 0,
  seo_score numeric default 0,
  plagiarism_score numeric default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint blog_posts_slug_unique unique (slug),
  constraint blog_posts_status_check check (status in ('draft', 'published', 'archived')),
  constraint blog_posts_featured_image_not_empty check (char_length(featured_image) > 0)
);

create index if not exists blog_posts_published_at_idx on public.blog_posts (published_at desc nulls last);
create index if not exists blog_posts_category_idx on public.blog_posts (category);
create index if not exists blog_posts_status_idx on public.blog_posts (status);

create table if not exists public.blog_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  type text not null,
  url text not null,
  alt_text text,
  caption text,
  provider text,
  created_at timestamptz default now(),
  constraint blog_media_type_check check (type in ('image', 'video', 'og', 'social', 'thumb'))
);

create index if not exists blog_media_post_id_idx on public.blog_media (post_id);
create index if not exists blog_media_type_idx on public.blog_media (type);

create table if not exists public.blog_agent_logs (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null,
  action text not null,
  status text not null,
  message text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  constraint blog_agent_logs_status_check check (status in ('ok', 'error', 'warn', 'info'))
);

create index if not exists blog_agent_logs_created_at_idx on public.blog_agent_logs (created_at desc);
create index if not exists blog_agent_logs_agent_name_idx on public.blog_agent_logs (agent_name);

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

drop trigger if exists trg_blog_rss_feeds_updated_at on public.blog_rss_feeds;
create trigger trg_blog_rss_feeds_updated_at
before update on public.blog_rss_feeds
for each row execute function public.set_updated_at();

alter table public.blog_rss_feeds enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_media enable row level security;
alter table public.blog_agent_logs enable row level security;

drop policy if exists "Public read published posts" on public.blog_posts;
create policy "Public read published posts" on public.blog_posts
  for select
  using (status = 'published');

drop policy if exists "Service role full access" on public.blog_posts;
create policy "Service role full access" on public.blog_posts
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Public read media for published posts" on public.blog_media;
create policy "Public read media for published posts" on public.blog_media
  for select
  using (exists (
    select 1
    from public.blog_posts p
    where p.id = blog_media.post_id and p.status = 'published'
  ));

drop policy if exists "Service role full access" on public.blog_media;
create policy "Service role full access" on public.blog_media
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role full access" on public.blog_rss_feeds;
create policy "Service role full access" on public.blog_rss_feeds
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role full access" on public.blog_agent_logs;
create policy "Service role full access" on public.blog_agent_logs
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

insert into storage.buckets (id, name, public)
values ('blog', 'blog', true)
on conflict (id) do nothing;

drop policy if exists "Blog media is publicly accessible." on storage.objects;
create policy "Blog media is publicly accessible." on storage.objects
  for select using (bucket_id = 'blog');

drop policy if exists "Service role blog media write" on storage.objects;
create policy "Service role blog media write" on storage.objects
  for all
  using (auth.role() = 'service_role' and bucket_id = 'blog')
  with check (auth.role() = 'service_role' and bucket_id = 'blog');
