import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import JsonLd, { generateBreadcrumbSchema, generateOrganizationSchema } from "@/components/JsonLd";
import { getBlogPostBySlug } from "@/lib/db";
import { sanitizeHtmlBasic } from "@/lib/blog-sanitize";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return {
      title: "Post não encontrado",
      robots: { index: false, follow: false },
    };
  }

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || "Blog do Balão da Informática.";
  const url = `https://www.balao.info/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical: post.canonical_url || url },
    openGraph: {
      type: "article",
      locale: "pt_BR",
      url,
      title,
      description,
      siteName: "Balão da Informática",
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
  };
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const url = `https://www.balao.info/blog/${post.slug}`;
  const published = new Date(post.published_at);
  const safeHtml = sanitizeHtmlBasic(post.content_html || "");

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

  return (
    <main className="container mx-auto px-4 py-10">
      <JsonLd data={[org, breadcrumbs, article]} />

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <Link href="/blog" className="text-sm font-bold text-[#E60012] hover:underline">
            ← Voltar ao blog
          </Link>
          <ShareButton title={post.title} text={post.title} />
        </div>

        <header className="mt-6">
          {post.category ? (
            <Link
              href={`/blog?category=${encodeURIComponent(post.category)}`}
              className="inline-flex items-center rounded-full bg-red-50 text-[#E60012] px-3 py-1 text-xs font-black"
            >
              {post.category}
            </Link>
          ) : null}

          <h1 className="mt-3 text-3xl md:text-5xl font-black tracking-tight text-gray-900">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <time dateTime={post.published_at}>
              {Number.isFinite(published.getTime())
                ? published.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
                : post.published_at}
            </time>
            {post.reading_time_minutes ? <span>• {post.reading_time_minutes} min de leitura</span> : null}
            <span className="text-gray-400">•</span>
            <a className="font-bold text-[#E60012] hover:underline" href="https://wa.me/5519987510267" target="_blank" rel="noopener noreferrer">
              WhatsApp 19 98751-0267
            </a>
          </div>
        </header>

        <article
          className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 md:p-10 shadow-sm space-y-4
          [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-black [&_h2]:text-gray-900 [&_h2]:mt-8
          [&_h3]:text-lg [&_h3]:font-black [&_h3]:text-gray-900 [&_h3]:mt-6
          [&_p]:text-gray-800 [&_p]:leading-relaxed
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-gray-800
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-gray-800
          [&_a]:text-[#E60012] [&_a]:font-bold [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />

        <section className="mt-8 rounded-2xl border border-[#E60012]/20 bg-gradient-to-br from-red-50 to-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-gray-900">Fale com a Balão da Informática</h2>
          <p className="mt-2 text-gray-700">
            Quer recomendação personalizada para o seu caso? Envie sua dúvida e receba uma indicação objetiva.
          </p>
          <a
            href="https://wa.me/5519987510267"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#E60012] px-5 py-3 font-black text-white hover:bg-red-700"
          >
            Chamar no WhatsApp
          </a>
        </section>
      </div>
    </main>
  );
}

