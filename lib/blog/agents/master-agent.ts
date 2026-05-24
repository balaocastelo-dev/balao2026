import { BLOG_CATEGORIES } from '@/lib/blog/constants';
import {
  adminCountPostsTodayBySource,
  adminFindPostBySourceUrl,
  adminInsertAgentLog,
  adminInsertMedia,
  adminInsertPost,
  adminListFeeds,
  adminMarkFeedChecked,
  adminUpsertFeed,
  adminUpdatePost
} from '@/lib/blog/admin-store';
import { fetchAndExtractArticle } from '@/lib/blog/article';
import { fetchRssFeed } from '@/lib/blog/rss';
import { ingestFeaturedImage } from '@/lib/blog/media';
import type { BlogPostStatus } from '@/lib/blog/types';
import {
  buildExcerptFromText,
  computeIsCampinas,
  ensureFeaturedImageUrl,
  guessVideoProvider,
  normalizeCategory,
  sanitizeHtmlBasic,
  slugify,
  stripTags
} from '@/lib/blog/utils';
import { llamaChatJson } from '@/lib/blog/agents/llama';
import { DEFAULT_BLOG_RSS_FEEDS } from '@/lib/blog/constants';

type RewriteJson = {
  title: string;
  excerpt: string;
  content_html: string;
  tags: string[];
  category: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  geo_score: number;
  seo_score: number;
};

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9áàâãéèêíìîóòôõúùûç]+/gi, ' ')
    .split(/\s+/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 2000);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function estimatePlagiarismScore(sourceText: string, newText: string): number {
  const a = new Set(tokenize(sourceText));
  const b = new Set(tokenize(newText));
  const sim = jaccard(a, b);
  return Math.max(0, Math.min(100, Math.round(sim * 100)));
}

async function ensureDefaultFeeds() {
  const feeds = await adminListFeeds();
  if (feeds.length > 0) return;

  for (const f of DEFAULT_BLOG_RSS_FEEDS) {
    try {
      await adminUpsertFeed({
        name: f.name,
        url: f.url,
        category: f.category,
        language: f.language || 'pt-BR',
        active: true,
        priority: f.priority,
        fetch_interval: f.fetch_interval,
        daily_limit: f.daily_limit,
        campinas_rule: Boolean(f.campinas_rule)
      });
    } catch (e: any) {
      await adminInsertAgentLog({
        agent_name: 'Agente Mestre',
        action: 'seed_default_feeds',
        status: 'warn',
        message: 'Falha ao cadastrar feed padrão',
        metadata: { name: f.name, url: f.url, error: String(e?.message || e) }
      });
    }
  }

  await adminInsertAgentLog({
    agent_name: 'Agente Mestre',
    action: 'seed_default_feeds',
    status: 'ok',
    message: 'Feeds padrão cadastrados',
    metadata: { count: DEFAULT_BLOG_RSS_FEEDS.length }
  });
}

async function generateAltText(params: { title: string; category: string }): Promise<string> {
  const title = params.title.trim();
  const category = params.category.trim();
  const prompt = [
    'Crie um ALT text em pt-BR para uma imagem de capa de notícia.',
    'Regras:',
    '- Máximo 110 caracteres',
    '- Descritivo, sem emojis, sem exagero',
    '- Não cite "imagem" nem "foto"',
    '',
    `Categoria: ${JSON.stringify(category)}`,
    `Título: ${JSON.stringify(title)}`,
    '',
    'Retorne SOMENTE JSON: {"alt_text":"..."}'
  ].join('\n');
  const r = await llamaChatJson<{ alt_text: string }>({
    system: 'Você é um editor de acessibilidade e SEO. Responda apenas com JSON puro.',
    user: prompt,
    temperature: 0.2,
    timeoutMs: 15000
  });
  const v = r.ok ? String(r.data?.alt_text || '').trim() : '';
  if (v) return v.slice(0, 110);
  const fallback = `${title} — ${category}`.trim();
  return fallback.length > 110 ? fallback.slice(0, 109) : fallback;
}

async function rewriteWithLlama(params: {
  titleHint: string;
  sourceName: string | null;
  sourceUrl: string;
  categoryHint: string;
  articleText: string;
  campinas: boolean;
}): Promise<RewriteJson | null> {
  const allowedCats = BLOG_CATEGORIES.join(' | ');
  const prompt = [
    'Reescreva a matéria para publicação automática no blog do Balão da Informática.',
    'Premissas obrigatórias:',
    '- Texto 100% original (não copie frases do original)',
    '- Fidelidade aos fatos, sem inventar dados',
    '- Estilo jornalístico, claro, objetivo',
    '- Otimizar para SEO + GEO + mecanismos generativos (ChatGPT/Gemini)',
    '- Evitar qualquer menção promocional direta a concorrentes',
    '- Não inclua a imagem de capa nem embed de vídeo no corpo do HTML',
    '',
    'Formato do conteúdo:',
    '- Use HTML simples: <p>, <h2>, <h3>, <ul>, <li>, <strong>, <a>',
    '- Intercale parágrafos curtos (máx. 3 frases)',
    '- Inclua pelo menos 3 subtítulos',
    '',
    'Local (se fizer sentido):',
    params.campinas
      ? '- Inclua 1 parágrafo curto conectando o tema a Campinas/RMC com termos locais relevantes'
      : '- Não force contexto regional',
    '',
    `Categorias permitidas: ${allowedCats}`,
    '',
    `Dica de categoria: ${JSON.stringify(params.categoryHint)}`,
    `Fonte: ${JSON.stringify(params.sourceName || '')}`,
    `URL: ${JSON.stringify(params.sourceUrl)}`,
    `Título original (pista): ${JSON.stringify(params.titleHint)}`,
    '',
    'Texto extraído (referência factual; não copie):',
    JSON.stringify(params.articleText.slice(0, 9000)),
    '',
    'Retorne SOMENTE JSON no formato:',
    '{"title":"...","excerpt":"...","content_html":"...","tags":["..."],"category":"...","seo_title":"...","seo_description":"...","seo_keywords":["..."],"geo_score":0,"seo_score":0}'
  ].join('\n');

  const r = await llamaChatJson<RewriteJson>({
    system:
      'Você é um redator jornalístico e editor SEO/GEO. Responda apenas com JSON puro e válido. Não use markdown.',
    user: prompt,
    temperature: 0.35,
    timeoutMs: 25000
  });
  if (!r.ok || !r.data) return null;

  const data = r.data;
  const title = String(data.title || '').trim();
  const excerpt = String(data.excerpt || '').trim();
  const content_html = String(data.content_html || '').trim();
  const category = String(data.category || '').trim();
  const seo_title = String(data.seo_title || '').trim();
  const seo_description = String(data.seo_description || '').trim();
  const tags = Array.isArray(data.tags) ? data.tags.map(t => String(t || '').trim()).filter(Boolean).slice(0, 12) : [];
  const seo_keywords = Array.isArray(data.seo_keywords)
    ? data.seo_keywords.map(t => String(t || '').trim()).filter(Boolean).slice(0, 16)
    : [];

  if (!title || !content_html) return null;

  return {
    title,
    excerpt: excerpt || buildExcerptFromText(stripTags(content_html)),
    content_html: sanitizeHtmlBasic(content_html),
    tags,
    category: normalizeCategory(category || params.categoryHint),
    seo_title: seo_title || title.slice(0, 60),
    seo_description: seo_description || buildExcerptFromText(excerpt || stripTags(content_html), 160),
    seo_keywords,
    geo_score: Number.isFinite(Number(data.geo_score)) ? Number(data.geo_score) : 0,
    seo_score: Number.isFinite(Number(data.seo_score)) ? Number(data.seo_score) : 0
  };
}

function fallbackRewrite(params: { titleHint: string; categoryHint: string; articleText: string; campinas: boolean }): RewriteJson {
  const title = params.titleHint.trim() || 'Notícia';
  const plain = params.articleText.trim();
  const excerpt = buildExcerptFromText(plain, 180);
  const local = params.campinas
    ? `<p><strong>Contexto local:</strong> O tema também é relevante para Campinas e Região Metropolitana, onde tecnologia e serviços digitais impactam empresas e consumidores.</p>`
    : '';
  const content_html = sanitizeHtmlBasic(
    [
      `<p>${excerpt}</p>`,
      '<h2>O que aconteceu</h2>',
      `<p>${buildExcerptFromText(plain, 380)}</p>`,
      '<h2>Por que isso importa</h2>',
      `<p>${buildExcerptFromText(plain.slice(200), 420)}</p>`,
      '<h2>O que observar</h2>',
      `<ul><li>Impacto prático para usuários e empresas</li><li>Prazos, mudanças e próximos passos</li><li>Boas práticas e recomendações oficiais</li></ul>`,
      local
    ].join('\n')
  );

  return {
    title,
    excerpt,
    content_html,
    tags: [],
    category: normalizeCategory(params.categoryHint),
    seo_title: title.slice(0, 60),
    seo_description: buildExcerptFromText(excerpt, 160),
    seo_keywords: [],
    geo_score: params.campinas ? 50 : 0,
    seo_score: 40
  };
}

async function insertWithUniqueSlug(params: {
  baseSlug: string;
  payload: any;
}): Promise<{ id: string; slug: string }> {
  let attempt = 0;
  while (attempt < 5) {
    const slug = attempt === 0 ? params.baseSlug : `${params.baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      const post = await adminInsertPost({ ...params.payload, slug });
      return { id: post.id, slug: post.slug };
    } catch (e: any) {
      attempt++;
      const msg = String(e?.message || '');
      if (!msg.toLowerCase().includes('duplicate') && !msg.toLowerCase().includes('unique')) throw e;
    }
  }
  throw new Error('Falha ao gerar slug único');
}

export async function runBlogIngestionCycle(params?: { maxNewPosts?: number; force?: boolean }) {
  const maxNewPosts = Math.max(1, Math.min(50, params?.maxNewPosts ?? 8));
  await ensureDefaultFeeds();
  const feeds = (await adminListFeeds()).filter(f => Boolean(f.active));
  const sorted = feeds.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const feed of sorted) {
    if (created >= maxNewPosts) break;

    try {
      const intervalMin = Math.max(1, feed.fetch_interval || 15);
      const last = feed.last_checked_at ? new Date(feed.last_checked_at).getTime() : 0;
      const due = params?.force ? true : !last || Date.now() - last >= intervalMin * 60_000;
      if (!due) continue;

      const sourceName = feed.name || '';
      const dailyLimit = Math.max(1, feed.daily_limit || 10);
      const alreadyToday = sourceName ? await adminCountPostsTodayBySource(sourceName) : 0;
      const remaining = Math.max(0, dailyLimit - alreadyToday);
      if (remaining <= 0) {
        await adminMarkFeedChecked(feed.id);
        continue;
      }

      const parsed = await fetchRssFeed(feed.url);
      const items = parsed.items.slice(0, Math.max(1, remaining));
      await adminInsertAgentLog({
        agent_name: 'Agente Coletor RSS',
        action: 'fetch_feed',
        status: 'ok',
        message: 'Feed lido com sucesso',
        metadata: { feed_id: feed.id, url: feed.url, items: items.length }
      });

      for (const item of items) {
        if (created >= maxNewPosts) break;
        const exists = await adminFindPostBySourceUrl(item.link);
        if (exists) {
          skipped++;
          continue;
        }

        const article = await fetchAndExtractArticle(item.link);
        await adminInsertAgentLog({
          agent_name: 'Agente Leitor de Matéria',
          action: 'extract_article',
          status: 'ok',
          message: 'Conteúdo extraído',
          metadata: {
            source_url: item.link,
            has_text: Boolean(article.text),
            images_found: article.images.length,
            has_video: Boolean(article.videoEmbedUrl)
          }
        });

        const minTextLen = 400;
        const articleText = (article.text || item.summary || '').trim();
        if (articleText.length < minTextLen) {
          skipped++;
          await adminInsertAgentLog({
            agent_name: 'Agente Mestre',
            action: 'skip_low_content',
            status: 'warn',
            message: 'Matéria ignorada por pouco conteúdo extraído',
            metadata: { source_url: item.link, length: articleText.length }
          });
          continue;
        }

        const campinas = Boolean(feed.campinas_rule) || computeIsCampinas(`${item.title} ${item.summary} ${article.text}`);

        const category = campinas ? 'Campinas e Região' : normalizeCategory(feed.category);
        const imageSource = article.ogImage || item.imageUrl;
        const featured = ensureFeaturedImageUrl(imageSource, category);
        const videoEmbedUrl = article.videoEmbedUrl;
        const videoProvider = guessVideoProvider(videoEmbedUrl);

        const rewritten =
          (await rewriteWithLlama({
            titleHint: item.title,
            sourceName: feed.name || parsed.sourceName,
            sourceUrl: item.link,
            categoryHint: category,
            articleText,
            campinas
          })) || fallbackRewrite({ titleHint: item.title, categoryHint: category, articleText, campinas });

        const plagiarism = estimatePlagiarismScore(articleText, stripTags(rewritten.content_html));
        const hasLlama = Boolean(process.env.LLAMA_API_URL && process.env.LLAMA_MODEL);
        await adminInsertAgentLog({
          agent_name: 'Agente Jornalístico',
          action: 'rewrite',
          status: 'ok',
          message: hasLlama ? 'Reescrita por Llama' : 'Reescrita fallback (rascunho)',
          metadata: { source_url: item.link, plagiarism_score: plagiarism, campinas, category }
        });
        await adminInsertAgentLog({
          agent_name: 'Agente SEO/GEO',
          action: 'seo_generate',
          status: 'ok',
          message: 'Metadados SEO/GEO gerados',
          metadata: { seo_score: rewritten.seo_score, geo_score: rewritten.geo_score }
        });

        const plagiarismMax = 55;
        if (plagiarism > plagiarismMax) {
          skipped++;
          await adminInsertAgentLog({
            agent_name: 'Agente Mestre',
            action: 'skip_high_plagiarism',
            status: 'warn',
            message: 'Matéria ignorada por similaridade alta (estimativa)',
            metadata: { source_url: item.link, plagiarism_score: plagiarism, max: plagiarismMax }
          });
          continue;
        }

        const status: BlogPostStatus = 'published';

        const baseSlug = slugify(rewritten.title);
        const nowIso = new Date().toISOString();

        const insertPayload = {
          title: rewritten.title,
          excerpt: rewritten.excerpt,
          content: rewritten.content_html,
          category,
          tags: rewritten.tags,
          status,
          source_url: item.link,
          source_name: feed.name || parsed.sourceName,
          original_title: item.title,
          featured_image: featured,
          gallery_images: [],
          video_embed_url: videoEmbedUrl,
          video_provider: videoProvider,
          author: article.author || item.author,
          ai_generated: hasLlama ? true : false,
          seo_title: rewritten.seo_title,
          seo_description: rewritten.seo_description,
          seo_keywords: rewritten.seo_keywords,
          geo_score: rewritten.geo_score,
          seo_score: rewritten.seo_score,
          plagiarism_score: plagiarism,
          published_at: article.publishedAt || item.publishedAt || nowIso
        };

        const inserted = await insertWithUniqueSlug({ baseSlug, payload: insertPayload });

        try {
          if (featured.startsWith('http')) {
            const variants = await ingestFeaturedImage({ postId: inserted.id, imageUrl: featured });
            const altText = await generateAltText({ title: rewritten.title, category });
            await adminUpdatePost(inserted.id, { featured_image: variants.coverUrl });
            await adminInsertMedia({ post_id: inserted.id, type: 'image', url: variants.coverUrl, alt_text: altText, caption: null, provider: 'supabase' });
            await adminInsertMedia({ post_id: inserted.id, type: 'thumb', url: variants.thumbUrl, alt_text: altText, caption: null, provider: 'supabase' });
            await adminInsertMedia({ post_id: inserted.id, type: 'social', url: variants.socialUrl, alt_text: altText, caption: null, provider: 'supabase' });
            await adminInsertMedia({ post_id: inserted.id, type: 'og', url: variants.ogUrl, alt_text: altText, caption: null, provider: 'supabase' });
          }
        } catch (e: any) {
          await adminInsertAgentLog({
            agent_name: 'Agente de Imagens',
            action: 'ingest_featured_image',
            status: 'warn',
            message: 'Falha ao otimizar/upload imagem',
            metadata: { post_id: inserted.id, error: String(e?.message || e) }
          });
        }

        await adminInsertAgentLog({
          agent_name: 'Agente Mestre',
          action: 'publish_or_draft',
          status: 'ok',
          message: status === 'published' ? 'Publicado automaticamente' : 'Salvo como rascunho',
          metadata: {
            post_id: inserted.id,
            slug: inserted.slug,
            category,
            plagiarism_score: plagiarism,
            has_llama: hasLlama
          }
        });

        if (!hasLlama) {
          await adminInsertAgentLog({
            agent_name: 'Agente Mestre',
            action: 'llama_not_configured',
            status: 'warn',
            message: 'Publicado com fallback sem Llama (recomendado configurar LLAMA_API_URL/LLAMA_MODEL)',
            metadata: { post_id: inserted.id, slug: inserted.slug }
          });
        }

        created++;
      }

      await adminMarkFeedChecked(feed.id);
    } catch (e: any) {
      errors++;
      await adminInsertAgentLog({
        agent_name: 'Agente Mestre',
        action: 'feed_cycle',
        status: 'error',
        message: 'Falha no ciclo do feed',
        metadata: { feed_id: feed.id, url: feed.url, error: String(e?.message || e) }
      });
    }
  }

  return { created, skipped, errors, feeds: feeds.length };
}
