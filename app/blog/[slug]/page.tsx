import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BlogSidebar from '@/components/blog/BlogSidebar';
import BlogPostCard from '@/components/blog/BlogPostCard';
import BlogGallery from '@/components/blog/BlogGallery';
import VideoEmbed from '@/components/blog/VideoEmbed';
import JsonLd, { generateBreadcrumbSchema } from '@/components/JsonLd';
import { getPopularPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog/store';
import { ensureFeaturedImageUrl, sanitizeHtmlBasic } from '@/lib/blog/utils';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || '';
  const image = ensureFeaturedImageUrl(post.featured_image, post.category);
  const url = `https://www.balao.info/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      images: [{ url: image }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image]
    }
  };
}

export default async function BlogPostPage(props: { params: Params }) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [popular, related] = await Promise.all([
    getPopularPosts(8),
    getRelatedPosts({ postId: post.id, category: post.category, limit: 6 })
  ]);

  const featuredImage = ensureFeaturedImageUrl(post.featured_image, post.category);
  const gallery = (post.gallery_images || []).filter(u => u && u !== featuredImage).slice(0, 12);
  const contentHtml = sanitizeHtmlBasic(post.content);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.created_at,
    image: [featuredImage],
    mainEntityOfPage: `https://www.balao.info/blog/${post.slug}`,
    author: [{ '@type': 'Organization', name: 'Balão da Informática' }],
    publisher: {
      '@type': 'Organization',
      name: 'Balão da Informática',
      logo: { '@type': 'ImageObject', url: 'https://www.balao.info/logo.png' }
    }
  };

  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Início', item: 'https://www.balao.info' },
    { name: 'Blog', item: 'https://www.balao.info/blog' },
    { name: post.category, item: `https://www.balao.info/blog/categoria/${encodeURIComponent(post.category)}` },
    { name: post.title, item: `https://www.balao.info/blog/${post.slug}` }
  ]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <JsonLd data={[articleJsonLd, breadcrumb]} />
      <div className="flex flex-col lg:flex-row gap-8">
        <article className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="relative w-full aspect-[16/9] bg-gray-100">
              <Image
                src={featuredImage}
                alt={post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-cover"
                priority
              />
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                <span className="font-semibold text-[#E60012]">{post.category}</span>
                {post.published_at ? (
                  <span className="text-gray-500">
                    {new Date(post.published_at).toLocaleDateString('pt-BR')}
                  </span>
                ) : null}
                {post.source_name ? <span className="text-gray-500">Fonte: {post.source_name}</span> : null}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {post.title}
              </h1>

              {post.excerpt ? (
                <p className="mt-3 text-base text-gray-700 leading-relaxed">{post.excerpt}</p>
              ) : null}

              {post.video_embed_url ? (
                <div className="mt-6">
                  <VideoEmbed url={post.video_embed_url} provider={post.video_provider} />
                </div>
              ) : null}

              <div
                className="prose max-w-none prose-headings:scroll-mt-24 prose-a:text-[#E60012] prose-a:font-semibold prose-strong:text-gray-900 mt-6"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />

              <BlogGallery images={gallery} title={post.title} />

              {post.tags && post.tags.length ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {post.tags.slice(0, 12).map(t => (
                    <span key={t} className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {related.length ? (
            <section className="mt-8">
              <h2 className="text-base font-bold text-gray-900">Matérias relacionadas</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {related.map(p => (
                  <BlogPostCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          ) : null}
        </article>

        <div className="w-full lg:w-80 flex-shrink-0">
          <BlogSidebar popular={popular} />
        </div>
      </div>
    </main>
  );
}

