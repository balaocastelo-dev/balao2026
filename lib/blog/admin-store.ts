import { supabaseAdmin } from '@/lib/supabase-admin';
import type { BlogPost, BlogRssFeed, BlogAgentLog, BlogMedia } from '@/lib/blog/types';

export async function adminListFeeds(): Promise<BlogRssFeed[]> {
  const { data, error } = await supabaseAdmin
    .from('blog_rss_feeds')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as BlogRssFeed[];
}

export async function adminUpsertFeed(input: Partial<BlogRssFeed> & Pick<BlogRssFeed, 'name' | 'url' | 'category'>) {
  const payload: any = {
    id: input.id,
    name: input.name,
    url: input.url,
    category: input.category,
    language: input.language ?? 'pt-BR',
    active: input.active ?? true,
    priority: input.priority ?? 0,
    fetch_interval: input.fetch_interval ?? 15,
    campinas_rule: input.campinas_rule ?? false,
    niche_rule: input.niche_rule ?? null,
    daily_limit: input.daily_limit ?? 10
  };

  const { data, error } = await supabaseAdmin
    .from('blog_rss_feeds')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) throw error;
  return data as BlogRssFeed;
}

export async function adminToggleFeed(id: string, active: boolean) {
  const { data, error } = await supabaseAdmin
    .from('blog_rss_feeds')
    .update({ active })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as BlogRssFeed;
}

export async function adminMarkFeedChecked(id: string) {
  await supabaseAdmin.from('blog_rss_feeds').update({ last_checked_at: new Date().toISOString() }).eq('id', id);
}

export async function adminListPosts(params?: { status?: string; limit?: number }): Promise<BlogPost[]> {
  const limit = Math.max(1, Math.min(200, params?.limit ?? 50));
  let q = supabaseAdmin
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (params?.status) q = q.eq('status', params.status);
  const { data, error } = await q;
  if (error || !data) return [];
  return data as BlogPost[];
}

export async function adminGetPost(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabaseAdmin.from('blog_posts').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return data as BlogPost;
}

export async function adminFindPostBySourceUrl(sourceUrl: string): Promise<BlogPost | null> {
  const url = (sourceUrl || '').trim();
  if (!url) return null;
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('source_url', url)
    .maybeSingle();
  if (error || !data) return null;
  return data as BlogPost;
}

export async function adminInsertPost(input: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> {
  const { data, error } = await supabaseAdmin.from('blog_posts').insert(input as any).select('*').single();
  if (error) throw error;
  return data as BlogPost;
}

export async function adminUpdatePost(id: string, patch: Partial<BlogPost>): Promise<BlogPost> {
  const { data, error } = await supabaseAdmin.from('blog_posts').update(patch as any).eq('id', id).select('*').single();
  if (error) throw error;
  return data as BlogPost;
}

export async function adminInsertMedia(input: Omit<BlogMedia, 'id' | 'created_at'>) {
  const { data, error } = await supabaseAdmin.from('blog_media').insert(input as any).select('*').single();
  if (error) throw error;
  return data as BlogMedia;
}

export async function adminInsertAgentLog(input: Omit<BlogAgentLog, 'id' | 'created_at'>) {
  const { data, error } = await supabaseAdmin.from('blog_agent_logs').insert(input as any).select('*').single();
  if (error) throw error;
  return data as BlogAgentLog;
}

export async function adminListAgentLogs(limit = 100): Promise<BlogAgentLog[]> {
  const { data, error } = await supabaseAdmin
    .from('blog_agent_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(500, limit)));
  if (error || !data) return [];
  return data as BlogAgentLog[];
}
