import { createClient } from '@/lib/supabase/server';
import type { BlogPost } from '@/lib/blog/types';

export async function getPublishedPosts(params?: {
  limit?: number;
  offset?: number;
  category?: string;
  query?: string;
  videosOnly?: boolean;
}): Promise<BlogPost[]> {
  const supabase = await createClient();
  const limit = Math.max(1, Math.min(50, params?.limit ?? 18));
  const offset = Math.max(0, params?.offset ?? 0);

  let q = supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  const category = (params?.category || '').trim();
  if (category) q = q.eq('category', category);

  if (params?.videosOnly) q = q.not('video_embed_url', 'is', null);

  const query = (params?.query || '').trim();
  if (query) {
    const escaped = query.replace(/,/g, ' ');
    q = q.or(`title.ilike.%${escaped}%,excerpt.ilike.%${escaped}%`);
  }

  const { data, error } = await q;
  if (error || !data) return [];
  return data as BlogPost[];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error || !data) return null;
  return data as BlogPost;
}

export async function getRelatedPosts(params: {
  postId: string;
  category: string;
  limit?: number;
}): Promise<BlogPost[]> {
  const supabase = await createClient();
  const limit = Math.max(1, Math.min(12, params.limit ?? 6));
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('category', params.category)
    .neq('id', params.postId)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error || !data) return [];
  return data as BlogPost[];
}

export async function getPopularPosts(limit = 8): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(Math.max(1, Math.min(20, limit)));
  if (error || !data) return [];
  return data as BlogPost[];
}
