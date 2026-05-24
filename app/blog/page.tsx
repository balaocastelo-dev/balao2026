import Link from "next/link";
import type { Metadata } from "next";
import SafeImage from "@/components/SafeImage";
import JsonLd, { generateBreadcrumbSchema, generateFAQSchema, generateOrganizationSchema } from "@/components/JsonLd";
import { listBlogPostsForPage } from "@/lib/blog-store";
import { SITE_CONFIG } from "@/lib/config";

export const runtime = "nodejs";
export const revalidate = 60;

type SearchParams = Promise<{ cat?: string; category?: string }>;

type BlogCardPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  ogImageUrl: string | null;
  sourceDomain: string | null;
  sourceUrl: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  readingTimeMin: number | null;
};

function getSourceDomain(sourceUrl: string | null | undefined): string | null {
  if (!sourceUrl) return null;
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
}

function ogHomeFallbackUrl(seed: string) {
  const t = "Blog Balão da Informática";
  const c = "Tecnologia";
  return `/blog/api/og?title=${encodeURIComponent(t)}&category=${encodeURIComponent(c)}&source=${encodeURIComponent("balao.info")}&seed=${encodeURIComponent(seed)}`;
}

function extractPriceText(input: string): string | null {
  const s = String(input || "");
  const m = s.match(/R\$\s*[\d.\s]+(?:,\d{2})?/i);
  const v = (m?.[0] || "").replace(/\s+/g, " ").trim();
  return v ? v : null;
}

function isBalaoProductPromo(post: { category: string; sourceUrl: string | null; sourceDomain: string | null }): boolean {
  if (post.sourceDomain !== "balao.info") return false;
  const c = (post.category || "").toLowerCase();
  if (c.includes("ofertas")) return true;
  const u = String(post.sourceUrl || "").toLowerCase();
  return u.includes("/product/");
}

export async function generateMetadata(props: { searchParams?: SearchParams }): Promise<Metadata> {
  const title = "Blog Balão da Informática — Notícias, Guias e Ofertas";
  const description = `Notícias de tecnologia, guias de compra e ofertas de informática. Compare opções e chame no WhatsApp ${SITE_CONFIG.whatsapp.display} para escolher o melhor setup.`;
  const canonical = "/blog";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: canonical,
      title,
      description,
      siteName: SITE_CONFIG.name,
      images: [{ url: ogHomeFallbackUrl("home") }],
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPage(props: { searchParams?: SearchParams }) {
  await props.searchParams;
  const rawPosts = await listBlogPostsForPage({ take: 50 });

  const posts: BlogCardPost[] = rawPosts.map((p) => {
    const createdAt = p.created_at ? new Date(p.created_at) : new Date();
    const publishedAt = p.published_at ? new Date(p.published_at) : null;
    const category = (p.category || "Tecnologia").trim() || "Tecnologia";
    const excerpt = (p.excerpt || p.seo_description || "").trim();
    const ogImageUrl = p.cover_image ? String(p.cover_image) : null;
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt,
      category,
      ogImageUrl,
      sourceDomain: getSourceDomain(p.source_url),
      sourceUrl: p.source_url ? String(p.source_url) : null,
      publishedAt: Number.isFinite(publishedAt?.getTime()) ? publishedAt : null,
      createdAt: Number.isFinite(createdAt.getTime()) ? createdAt : new Date(),
      readingTimeMin: p.reading_time_minutes ?? null,
    };
  });

  const trending = posts.slice(0, 10);
  const balaoPosts = posts.filter((p) => p.sourceDomain === "balao.info").slice(0, 6);

  const group1 = posts.slice(0, 3);
  const group2 = posts.slice(3, 13);
  const group3 = posts.slice(13, 16);
  const group4 = posts.slice(16, 26);
  const group5 = posts.slice(26, 29);

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Início", item: "https://www.balao.info" },
    { name: "Blog", item: "https://www.balao.info/blog" },
  ]);

  const faq = generateFAQSchema([
    {
      question: "Como escolher um notebook ideal para meu uso?",
      answer: `Fale no WhatsApp ${SITE_CONFIG.whatsapp.display} e diga seu objetivo (trabalho, estudo, games, edição). A Balão da Informática indica modelos com melhor custo-benefício e compatibilidade.`,
    },
    {
      question: "Vocês ajudam a montar PC Gamer e escolher peças?",
      answer: `Sim. Envie seu orçamento no WhatsApp ${SITE_CONFIG.whatsapp.display}. A equipe recomenda CPU, placa de vídeo, fonte, RAM e SSD pensando em desempenho e estabilidade.`,
    },
    {
      question: "Como aproveitar promoções com segurança?",
      answer: `Acompanhe as categorias do blog e a página de promoções. Se quiser, peça validação rápida no WhatsApp ${SITE_CONFIG.whatsapp.display} antes de fechar a compra.`,
    },
    {
      question: "Atendem Campinas e região?",
      answer: `Sim. A Balão da Informática fica em Campinas/SP e atende também online. Chame no WhatsApp ${SITE_CONFIG.whatsapp.display} para receber indicação e link direto do produto.`,
    },
  ]);

  const org = generateOrganizationSchema();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <JsonLd data={[org, breadcrumbs, faq]} />

      <section className="mb-6 rounded-md border border-neutral-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight">Blog Balão da Informática</h1>
            <p className="mt-2 text-sm text-neutral-700">
              Notícias de tecnologia, guias de compra e ofertas para quem quer escolher <strong>notebook</strong>,{" "}
              <strong>PC Gamer</strong>, <strong>hardware</strong> e periféricos com segurança.
            </p>
            <p className="mt-2 text-sm text-neutral-700">
              Precisa de indicação rápida? Chame no WhatsApp <strong>{SITE_CONFIG.whatsapp.display}</strong>.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-[#e41e26] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#c81920]"
            >
              Orçamento no WhatsApp
            </a>
            <Link href="/promocao" className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm font-extrabold text-neutral-900 hover:bg-neutral-50">
              Ver Promoções
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {group1.length > 0 && (
            <section className="grid gap-4 sm:grid-cols-12">
              <div className="sm:col-span-12">
                <HeroCard post={group1[0]} size="lg" />
              </div>
              {group1[1] && (
                <div className="sm:col-span-6">
                  <HeroCard post={group1[1]} size="sm" />
                </div>
              )}
              {group1[2] && (
                <div className="sm:col-span-6">
                  <HeroCard post={group1[2]} size="sm" />
                </div>
              )}
            </section>
          )}

          <section className="mt-8">
            <div className="flex items-end justify-between">
              <h2 className="text-lg font-extrabold tracking-tight">
                <span className="inline-block border-l-4 border-[#e41e26] pl-3">Destaques</span>
              </h2>
            </div>
            <div className="mt-4 divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white">
              {group2.map((p) => (
                <PostListItem key={p.id} post={p} />
              ))}
            </div>
          </section>

          {group3.length > 0 && (
            <section className="mt-8 grid gap-4 sm:grid-cols-12">
              <div className="sm:col-span-12">
                <HeroCard post={group3[0]} size="lg" />
              </div>
              {group3[1] && (
                <div className="sm:col-span-6">
                  <HeroCard post={group3[1]} size="sm" />
                </div>
              )}
              {group3[2] && (
                <div className="sm:col-span-6">
                  <HeroCard post={group3[2]} size="sm" />
                </div>
              )}
            </section>
          )}

          <section className="mt-8">
            <div className="flex items-end justify-between">
              <h2 className="text-lg font-extrabold tracking-tight">
                <span className="inline-block border-l-4 border-[#e41e26] pl-3">Mais Notícias</span>
              </h2>
            </div>
            <div className="mt-4 divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white">
              {group4.map((p) => (
                <PostListItem key={p.id} post={p} />
              ))}
            </div>
          </section>

          {group5.length > 0 && (
            <section className="mt-8 grid gap-4 sm:grid-cols-12">
              <div className="sm:col-span-12">
                <HeroCard post={group5[0]} size="lg" />
              </div>
              {group5[1] && (
                <div className="sm:col-span-6">
                  <HeroCard post={group5[1]} size="sm" />
                </div>
              )}
              {group5[2] && (
                <div className="sm:col-span-6">
                  <HeroCard post={group5[2]} size="sm" />
                </div>
              )}
            </section>
          )}

          {posts.length === 0 && (
            <div className="mt-8 p-8 text-center text-sm text-neutral-600">
              Ainda não há posts publicados. Aguarde a ingestão automática via RSS/Produtos.
            </div>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-8 space-y-8">
            <div className="rounded-md border border-neutral-200 bg-white">
              <div className="border-b border-neutral-200 px-4 py-3">
                <h2 className="text-sm font-extrabold tracking-tight">
                  <span className="inline-block border-l-4 border-[#e41e26] pl-3">Em alta</span>
                </h2>
              </div>
              <ol className="divide-y divide-neutral-200">
                {trending.slice(0, 5).map((p, idx) => (
                  <li key={p.id} className="flex gap-3 px-4 py-3">
                    <div className="w-6 flex-none text-right text-sm font-extrabold text-[#e41e26]">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/blog/${p.slug}`} className="text-sm font-semibold hover:underline">
                        {p.title}
                      </Link>
                      <div className="mt-1 text-xs font-semibold text-neutral-600">
                        {p.category}
                        {p.sourceDomain ? ` • ${p.sourceDomain}` : ""}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-md border border-neutral-200 bg-white">
              <div className="border-b border-neutral-200 px-4 py-3">
                <h2 className="text-sm font-extrabold tracking-tight">
                  <span className="inline-block border-l-4 border-[#e41e26] pl-3">Ofertas Balão</span>
                </h2>
              </div>
              <div className="divide-y divide-neutral-200">
                {balaoPosts.map((p) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50">
                    <div className="relative h-12 w-12 flex-none overflow-hidden rounded border border-neutral-100 bg-white">
                      <SafeImage
                        src={p.ogImageUrl || ogFallbackUrl(p)}
                        fallbackSrc={ogFallbackUrl(p)}
                        alt={p.title}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold leading-tight hover:underline">{p.title}</h3>
                      {isBalaoProductPromo(p) ? (
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-extrabold text-neutral-700">
                          <span className="text-[#e41e26]">{extractPriceText(`${p.excerpt} ${p.title}`) || "Preço sob consulta"}</span>
                          <span className="font-semibold text-neutral-500">{new Date(p.publishedAt ?? p.createdAt).toLocaleDateString("pt-BR")}</span>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold text-neutral-500">
                          <span className="text-[#e41e26]">Balão</span>
                          <span>{new Date(p.publishedAt ?? p.createdAt).toLocaleDateString("pt-BR")}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}

                <div className="p-4">
                  <a
                    href="https://wa.me/5519987510267"
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-md bg-[#e41e26] px-4 py-3 text-center text-sm font-extrabold text-white hover:bg-[#c81920]"
                  >
                    Comprar com ajuda no WhatsApp
                  </a>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link href="/notebooks" className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-50">
                      Notebooks
                    </Link>
                    <Link href="/pcgamer" className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-50">
                      PC Gamer
                    </Link>
                    <Link href="/departamentos" className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-50">
                      Departamentos
                    </Link>
                    <Link href="/promocao" className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-50">
                      Promoções
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function PostListItem({ post }: { post: BlogCardPost }) {
  return (
    <article className="flex gap-4 p-4 hover:bg-neutral-50/70">
      <div className="relative h-[72px] w-[112px] flex-none sm:h-[86px] sm:w-[140px]">
        <SafeImage
          src={post.ogImageUrl || ogFallbackUrl(post)}
          fallbackSrc={ogFallbackUrl(post)}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 112px, 140px"
          className="object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-600">
          <span className="uppercase tracking-wide text-[#e41e26]">{post.category}</span>
          {post.sourceDomain ? <span>{post.sourceDomain}</span> : null}
          <span>{new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("pt-BR")}</span>
        </div>
        <h3 className="mt-1 text-base font-extrabold leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-neutral-700 overflow-hidden max-h-[2.8rem]">{post.excerpt}</p>
      </div>
    </article>
  );
}

function ogFallbackUrl(post: { slug: string; title: string; category: string; sourceDomain: string | null }) {
  const t = post.title.slice(0, 140);
  const c = post.category.slice(0, 32);
  const s = (post.sourceDomain ?? "").slice(0, 48);
  return `/blog/api/og?title=${encodeURIComponent(t)}&category=${encodeURIComponent(c)}&source=${encodeURIComponent(s)}&seed=${encodeURIComponent(post.slug)}`;
}

function HeroCard({ post, size }: { post: BlogCardPost; size: "lg" | "sm" }) {
  const date = new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("pt-BR");
  const imageUrl = post.ogImageUrl || ogFallbackUrl(post);
  return (
    <article className="overflow-hidden rounded-md border border-neutral-200 bg-white">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9]">
          <SafeImage
            src={imageUrl}
            fallbackSrc={ogFallbackUrl(post)}
            alt={post.title}
            fill
            sizes={size === "lg" ? "(max-width: 1024px) 100vw, 880px" : "(max-width: 1024px) 100vw, 420px"}
            className="object-contain"
            priority={size === "lg"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/80">
              <span className="uppercase tracking-wide text-[#ff3b3b]">{post.category}</span>
              {post.sourceDomain ? <span className="text-white/70">{post.sourceDomain}</span> : null}
              <span className="text-white/60">{date}</span>
            </div>
            <h2 className={size === "lg" ? "mt-2 text-2xl font-extrabold leading-snug text-white" : "mt-2 text-lg font-extrabold leading-snug text-white"}>
              {post.title}
            </h2>
            <p className="mt-2 text-sm text-white/80 overflow-hidden max-h-[2.8rem]">{post.excerpt}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}
