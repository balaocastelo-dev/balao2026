export type BlogPostStatus = 'draft' | 'published' | 'archived';

export type BlogMediaType = 'image' | 'video' | 'og' | 'social' | 'thumb';

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  tags: string[] | null;
  status: BlogPostStatus;
  source_url: string | null;
  source_name: string | null;
  original_title: string | null;
  featured_image: string;
  gallery_images: string[] | null;
  video_embed_url: string | null;
  video_provider: string | null;
  author: string | null;
  ai_generated: boolean | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  geo_score: number | null;
  seo_score: number | null;
  plagiarism_score: number | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type BlogRssFeed = {
  id: string;
  name: string;
  url: string;
  category: string;
  language: string | null;
  active: boolean | null;
  priority: number | null;
  fetch_interval: number | null;
  last_checked_at: string | null;
  campinas_rule: boolean | null;
  niche_rule: string | null;
  daily_limit: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type BlogMedia = {
  id: string;
  post_id: string;
  type: BlogMediaType;
  url: string;
  alt_text: string | null;
  caption: string | null;
  provider: string | null;
  created_at: string | null;
};

export type BlogAgentLogStatus = 'ok' | 'error' | 'warn' | 'info';

export type BlogAgentLog = {
  id: string;
  agent_name: string;
  action: string;
  status: BlogAgentLogStatus;
  message: string | null;
  metadata: Record<string, any> | null;
  created_at: string | null;
};
