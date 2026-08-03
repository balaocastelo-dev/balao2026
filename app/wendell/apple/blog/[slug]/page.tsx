import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import JsonLd, { generateBreadcrumbSchema, generateFAQSchema, generateOrganizationSchema } from "@/components/JsonLd";
import SafeImage from "@/components/SafeImage";
import { SITE_CONFIG } from "@/lib/config";
import { getAppleRadarPostBySlug } from "@/lib/apple-news";
import { sanitizeHtmlBasic } from "@/lib/blog-sanitize";

export const runtime = "nodejs";
export const revalidate = 1800;

const fallbackImage = "/images/apple/hub-hero-real.png";

function formatDate(input: string) {
  return new Date(input).toLocaleDateString("pt-BR");
}

function getRelatedLinks(category: string) {
  switch (category) {
    case "iPhone":
      return [
        { href: "/wendell/apple/iphone", label: "Assistência iPhone" },
        { href: "/wendell/apple", label: "Especialista Apple" },
        { href: "/wendell/apple/blog", label: "Blog Apple" },
      ];
    case "Mac":
      return [
        { href: "/wendell/apple/macbook", label: "Assistência MacBook" },
        { href: "/wendell/apple/imac", label: "Assistência iMac" },
        { href: "/wendell/apple/mac-mini", label: "Assistência Mac Mini" },
      ];
    case "iPad":
      return [
        { href: "/wendell/apple/ipad", label: "Assistência iPad" },
        { href: "/wendell/apple", label: "Especialista Apple" },
        { href: "/wendell/apple/blog", label: "Blog Apple" },
      ];
    case "Apple Watch":
      return [
        { href: "/wendell/apple/apple-watch", label: "Assistência Apple Watch" },
        { href: "/wendell/apple", label: "Especialista Apple" },
        { href: "/wendell/apple/blog", label: "Blog Apple" },
      ];
    default:
      return [
        { href: "/wendell/apple", label: "Especialista Apple" },
        { href: "/wendell/apple/blog", label: "Blog Apple" },
        { href: "/wendell/apple/iphone", label: "Assistência iPhone" },
      ];
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getAppleRadarPostBySlug(slug);

  if (!post) {
    return {
      title: "Notícia Apple não encontrada",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: post.seo_title,
    description: post.seo_description,
    alternates: { canonical: post.canonical_url },
    openGraph: {
      type: "article",
      locale: "pt_BR",
      url: post.canonical_url,
      title: post.seo_title,
      description: post.seo_description,
      siteName: SITE_CONFIG.name,
      images: [{ url: post.cover_image || fallbackImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo_title,
      description: post.seo_description,
      images: [post.cover_image || fallbackImage],
    },
    robots: { index: false, follow: false },
  };
}

export default async function AppleBlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await getAppleRadarPostBySlug(slug);
  if (!post) notFound();

  const safeHtml = sanitizeHtmlBasic(post.content_html || "");
  const relatedLinks = getRelatedLinks(post.category);
  const url = post.canonical_url;

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Início", item: "https://www.balao.info" },
    { name: "Especialista Apple", item: "https://www.balao.info/wendell/apple" },
    { name: "Blog Apple", item: "https://www.balao.info/wendell/apple/blog" },
    { name: post.title, item: url },
  ]);

  const faq = generateFAQSchema([
    {
      question: "Posso pedir orçamento direto desta notícia Apple?",
      answer: `Sim. Use o WhatsApp ${SITE_CONFIG.whatsapp.display} para falar com a equipe e tirar dúvidas sobre assistência Apple em Campinas.`,
    },
    {
      question: "Vocês atendem MacBook, iMac, iPad e Apple Watch?",
      answer:
        "Sim. A Balão da Informática atende iPhone, MacBook, iMac, iPad, Apple Watch e Mac Mini em Campinas.",
    },
  ]);

  const org = generateOrganizationSchema();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo_description,
    datePublished: post.published_at,
    dateModified: post.published_at,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: [post.cover_image || fallbackImage],
    author: { "@type": "Organization", name: "Balão da Informática" },
    publisher: {
      "@type": "Organization",
      name: "Balão da Informática",
      logo: { "@type": "ImageObject", url: "https://www.balao.info/logo.png" },
    },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <JsonLd data={[org, breadcrumbs, faq, jsonLd]} />

        <article className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="p-6 md:p-8">
            <Link href="/wendell/apple/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
              <span aria-hidden="true">←</span>
              Voltar para o Blog Apple
            </Link>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-600">
              <span className="rounded-full bg-red-50 px-3 py-1 uppercase tracking-wide text-red-600">{post.category}</span>
              {post.source_domain ? <span>{post.source_domain}</span> : null}
              <span>{formatDate(post.published_at)}</span>
              <span>{post.reading_time_minutes} min</span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-5xl">{post.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">{post.excerpt}</p>
          </div>

          <div className="relative aspect-[16/9] w-full">
            <SafeImage
              src={post.cover_image || fallbackImage}
              fallbackSrc={fallbackImage}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
            />
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-[1fr_300px] md:p-8">
            <div>
              <div className="prose prose-neutral max-w-none">
                <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-red-100 bg-red-50 p-6">
                <div className="text-sm font-extrabold uppercase tracking-wide text-red-700">Atendimento Apple</div>
                <h2 className="mt-2 text-2xl font-black text-gray-900">
                  Quer ajuda prática com seu equipamento Apple?
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  Se a notícia despertou dúvida sobre atualização, troca, manutenção ou reparo, fale agora com a
                  equipe da Balão da Informática. Você pode pedir orçamento sem compromisso, retirada e entrega por
                  motoboy grátis, assistência em 1 hora para muitos reparos e parcelamento em até 12x sem juros.
                </p>
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=Olá! Quero ajuda com um equipamento Apple.`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-red-700"
                >
                  Falar agora no WhatsApp
                </a>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-gray-900">Atalhos estratégicos</h2>
                <div className="mt-4 grid gap-2">
                  {relatedLinks.map((item) => (
                    <Link key={item.href} href={item.href} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-100">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-gray-900 p-5 text-white">
                <div className="text-sm font-extrabold uppercase tracking-wide text-white/75">Campinas e região</div>
                <h2 className="mt-2 text-2xl font-black">Atendimento Apple com foco em Cambuí</h2>
                <p className="mt-3 text-sm leading-6 text-white/85">
                  Atendemos clientes de Cambuí, Nova Campinas, Guanabara, Taquaral, Bosque, Centro e bairros próximos.
                </p>
                <div className="mt-4 grid gap-2 text-xs font-bold text-white/95">
                  <div className="rounded-xl bg-white/10 px-3 py-2">Assistência Apple em 1 hora</div>
                  <div className="rounded-xl bg-white/10 px-3 py-2">Motoboy grátis para retirada e entrega</div>
                  <div className="rounded-xl bg-white/10 px-3 py-2">Orçamento sem compromisso e 12x sem juros</div>
                </div>
                <Link href="/wendell/apple" className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-extrabold text-gray-900">
                  Ver especialista Apple
                </Link>
              </div>

              {post.source_url ? (
                <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 text-sm text-neutral-700">
                  <div className="font-extrabold text-gray-900">Fonte da notícia</div>
                  <div className="mt-3 break-all text-gray-600">
                    {post.source_domain || post.source_url}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    A leitura continua aqui no blog, sem redirecionamento externo.
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </article>
      </main>
    </div>
  );
}
