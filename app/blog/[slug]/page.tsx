import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd, { generateBreadcrumbSchema, generateOrganizationSchema } from "@/components/JsonLd";
import { getBlogPostBySlug } from "@/lib/db";
import { sanitizeHtmlBasic } from "@/lib/blog-sanitize";
import SafeImage from "@/components/SafeImage";

export const runtime = "nodejs";
export const revalidate = 300;

function getSourceDomain(sourceUrl: string | null | undefined): string | null {
  if (!sourceUrl) return null;
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
}

function ogFallbackUrl(post: { slug: string; title: string; category: string; sourceDomain: string | null }) {
  const t = post.title.slice(0, 140);
  const c = post.category.slice(0, 32);
  const s = (post.sourceDomain ?? "").slice(0, 48);
  return `/blog/api/og?title=${encodeURIComponent(t)}&category=${encodeURIComponent(c)}&source=${encodeURIComponent(s)}&seed=${encodeURIComponent(post.slug)}`;
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return {
      title: "Post não encontrado",
      robots: { index: false, follow: false },
    };
  }

  const sourceDomain = getSourceDomain(post.source_url);
  const category = (post.category || "Tecnologia").trim() || "Tecnologia";
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || "Notícias e análises de tecnologia.";
  const imageUrl = post.cover_image || ogFallbackUrl({ slug: post.slug, title: post.title, category, sourceDomain });

  return {
    title,
    description,
    alternates: { canonical: post.canonical_url || `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      locale: "pt_BR",
      url: `/blog/${post.slug}`,
      title,
      description,
      siteName: "BalãoNews",
      images: [{ url: imageUrl }],
    },
  };
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const sourceDomain = getSourceDomain(post.source_url);
  const category = (post.category || "Tecnologia").trim() || "Tecnologia";
  const published = post.published_at ? new Date(post.published_at) : new Date();
  const createdAt = post.created_at ? new Date(post.created_at) : new Date();
  const safeHtml = sanitizeHtmlBasic(post.content_html || "");
  const fallbackImageUrl = ogFallbackUrl({
    slug: post.slug,
    title: post.title,
    category,
    sourceDomain,
  });
  const imageUrl = post.cover_image || fallbackImageUrl;
  const url = `https://www.balao.info/blog/${post.slug}`;

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Início", item: "https://www.balao.info" },
    { name: "Blog", item: "https://www.balao.info/blog" },
    { name: post.title, item: url },
  ]);

  const org = generateOrganizationSchema();
  const article = post.json_ld || {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.published_at,
    dateModified: post.published_at,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Balão da Informática", url: "https://www.balao.info" },
    publisher: { "@type": "Organization", name: "Balão da Informática", url: "https://www.balao.info" },
  };

  const jsonLd = post.json_ld || {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.seo_description || "",
    datePublished: (Number.isFinite(published.getTime()) ? published : createdAt).toISOString(),
    dateModified: (Number.isFinite(published.getTime()) ? published : createdAt).toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: [imageUrl],
    author: { "@type": "Organization", name: "Balão da Informática", url: "https://www.balao.info" },
    publisher: {
      "@type": "Organization",
      name: "Balão da Informática",
      logo: { "@type": "ImageObject", url: "https://www.balao.info/logo.png" },
    },
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <JsonLd data={[org, breadcrumbs, jsonLd]} />

      <article className="overflow-hidden rounded-md border border-neutral-200 bg-white">
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-600">
            <Link href={{ pathname: "/blog", query: { cat: category } }} className="uppercase tracking-wide text-[#e41e26] hover:underline">
              {category}
            </Link>
            {post.reading_time_minutes ? <span>{post.reading_time_minutes} min</span> : null}
            {sourceDomain ? <span>{sourceDomain}</span> : null}
            <span>{new Date(post.published_at ?? post.created_at).toLocaleDateString("pt-BR")}</span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{post.title}</h1>
          {post.excerpt ? <p className="mt-3 text-neutral-700">{post.excerpt}</p> : null}
        </div>

        <div className="relative aspect-[16/9] w-full">
          <SafeImage
            src={imageUrl}
            fallbackSrc={fallbackImageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-contain"
          />
        </div>

        <div className="p-6">
          <div className="prose prose-neutral max-w-none">
            <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
          </div>

          <div className="mt-8 rounded-md border border-[#e41e26]/20 bg-neutral-50 p-4">
            <div className="text-sm font-extrabold">Quer ajuda para escolher?</div>
            <div className="mt-1 text-sm text-neutral-700">
              Fale com um especialista e receba recomendação direta para o seu uso.
            </div>
            <a
              href="https://wa.me/5519987510267"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-[#e41e26] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#c81920]"
            >
              Chamar no WhatsApp 19 98751-0267
            </a>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/notebooks" className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-50">
                Notebooks
              </Link>
              <Link href="/pcgamer" className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-50">
                PC Gamer
              </Link>
            </div>
          </div>

          {post.source_url ? (
            <footer className="mt-10 border-t border-neutral-200 pt-4 text-sm text-neutral-600">
              Fonte:{" "}
              <a className="underline hover:no-underline" href={post.source_url} target="_blank" rel="noreferrer">
                {post.source_url}
              </a>
            </footer>
          ) : null}
        </div>
      </article>
    </main>
  );
}
