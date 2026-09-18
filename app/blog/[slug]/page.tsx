import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import JsonLd, { generateBreadcrumbSchema, generateFAQSchema, generateOrganizationSchema } from "@/components/JsonLd";
import { sanitizeHtmlBasic } from "@/lib/blog-sanitize";
import SafeImage from "@/components/SafeImage";
import { getBlogPostForPage } from "@/lib/blog-store";
import { SITE_CONFIG } from "@/lib/config";

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

function normalizeImageUrlForCompare(input: string): string {
  const raw = String(input || "").trim();
  if (!raw) return "";
  try {
    const u = new URL(raw);
    return `${u.origin}${u.pathname}`.toLowerCase();
  } catch {
    return raw.replace(/[?#].*$/, "").trim().toLowerCase();
  }
}

function stripFirstCoverImageFromHtml(inputHtml: string, coverImageUrl: string | null | undefined): string {
  const cover = String(coverImageUrl || "").trim();
  if (!cover) return inputHtml;
  const coverKey = normalizeImageUrlForCompare(cover);
  if (!coverKey) return inputHtml;

  const imgRe = /<img\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(inputHtml)) !== null) {
    const src = String(m[1] || m[2] || m[3] || "").trim();
    if (!src) continue;
    if (normalizeImageUrlForCompare(src) !== coverKey) continue;

    const start = m.index;
    const end = start + m[0].length;
    const out = `${inputHtml.slice(0, start)}${inputHtml.slice(end)}`.replace(/<p\b[^>]*>\s*<\/p>/gi, "");
    return out;
  }

  return inputHtml;
}

function isAllowedHref(href: string): boolean {
  const h = String(href || "").trim();
  if (!h) return false;
  if (h.startsWith("#")) return true;
  if (h.startsWith("/")) return true;
  try {
    const u = new URL(h);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    return host === "balao.info";
  } catch {
    return false;
  }
}

function preventExternalNavigationInHtml(inputHtml: string): string {
  const html = String(inputHtml || "");
  if (!html) return html;

  return html.replace(/<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi, (m, h1, h2) => {
    const href = String(h1 || h2 || "").trim();
    if (isAllowedHref(href)) return m;
    return m
      .replace(/\s*\bhref\s*=\s*(?:"[^"]*"|'[^']*')/i, "")
      .replace(/\s*\btarget\s*=\s*(?:"[^"]*"|'[^']*')/i, "")
      .replace(/\s*\brel\s*=\s*(?:"[^"]*"|'[^']*')/i, "");
  });
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getBlogPostForPage(slug);
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
      siteName: SITE_CONFIG.name,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    keywords: [
      "loja de informática",
      "hardware",
      "notebook",
      "pc gamer",
      "placa de vídeo",
      "ssd",
      "memória ram",
      "periféricos",
      category,
    ],
    robots: { index: true, follow: true },
  };
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await getBlogPostForPage(slug);
  if (!post) notFound();

  const sourceDomain = getSourceDomain(post.source_url);
  const category = (post.category || "Tecnologia").trim() || "Tecnologia";
  const published = post.published_at ? new Date(post.published_at) : new Date();
  const createdAt = post.created_at ? new Date(post.created_at) : new Date();
  const safeHtml = preventExternalNavigationInHtml(stripFirstCoverImageFromHtml(sanitizeHtmlBasic(post.content_html || ""), post.cover_image));
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

  const faq = generateFAQSchema([
    {
      question: "Como escolher o melhor setup para meu uso?",
      answer: `Chame no WhatsApp ${SITE_CONFIG.whatsapp.display} e diga seu objetivo (trabalho, games, estudo, criação). A Balão da Informática recomenda a melhor combinação de custo-benefício.`,
    },
    {
      question: "Vocês ajudam a comparar modelos e indicar alternativa mais barata?",
      answer: `Sim. Envie o link do produto e seu orçamento no WhatsApp ${SITE_CONFIG.whatsapp.display}. Você recebe opções equivalentes com foco em desempenho e compatibilidade.`,
    },
  ]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-neutral-900">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">
        <JsonLd data={[org, breadcrumbs, jsonLd, faq]} />

        <article className="overflow-hidden rounded-md border border-neutral-200 bg-white text-neutral-900">
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-600">
              <span className="uppercase tracking-wide text-[#e41e26]">{category}</span>
              {post.reading_time_minutes ? <span>{post.reading_time_minutes} min</span> : null}
              {sourceDomain ? <span>{sourceDomain}</span> : null}
              <span>{new Date(post.published_at ?? post.created_at).toLocaleDateString("pt-BR")}</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900">{post.title}</h1>
            {post.excerpt ? <p className="mt-3 text-neutral-700">{post.excerpt}</p> : null}
          </div>

          <div className="relative aspect-[16/9] w-full bg-neutral-100">
            <SafeImage
              src={imageUrl}
              fallbackSrc={fallbackImageUrl}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-contain"
            />
          </div>

          <div className="p-6 text-neutral-900">
            <div className="prose prose-neutral max-w-none text-neutral-900 [&_*]:text-neutral-900">
              <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
            </div>

            <div className="mt-8 rounded-md border border-[#e41e26]/20 bg-neutral-50 p-4 text-neutral-900">
              <div className="text-sm font-extrabold text-neutral-900">Quer ajuda para escolher?</div>
              <div className="mt-1 text-sm text-neutral-700">
                Fale com um especialista e receba recomendação direta para o seu uso.
              </div>
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex w-full items-center justify-center rounded-md bg-[#e41e26] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#c81920]"
              >
                WhatsApp {SITE_CONFIG.whatsapp.display}
              </a>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link href="/notebooks" className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-50 text-center">
                  Notebooks
                </Link>
                <Link href="/pcgamer" className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-50 text-center">
                  PC Gamer
                </Link>
              </div>
            </div>

            {post.source_url ? (
              <footer className="mt-10 border-t border-neutral-200 pt-4 text-sm text-neutral-600">
                Fonte: <a href={post.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">{post.source_url}</a>
              </footer>
            ) : null}
          </div>
        </article>
      </main>
    </div>
  );
}
