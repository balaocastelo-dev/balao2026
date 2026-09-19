import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";
import Header from "@/components/Header";
import JsonLd, { generateBreadcrumbSchema, generateFAQSchema, generateOrganizationSchema } from "@/components/JsonLd";
import { listBlogPostsForPage } from "@/lib/blog-store";
import { SITE_CONFIG } from "@/lib/config";

export const runtime = "nodejs";
export const revalidate = 120;

type SearchParams = { cat?: string; category?: string };

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
    <div className="min-h-screen flex flex-col font-sans bg-slate-950 text-slate-100 selection:bg-[#E60012] selection:text-white">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <JsonLd data={[org, breadcrumbs, faq]} />

        {/* Impeccable Hero Header */}
        <section className="mb-12 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E60012]/10 border border-[#E60012]/30 text-[#E60012] text-xs font-black uppercase tracking-widest mb-4 shadow-sm">
                <span>⚡ Conteúdo & Tecnologia</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Blog Balão da Informática
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Notícias de tecnologia, guias definitivos de hardware, análises de <strong>notebooks</strong>,{" "}
                <strong>PCs Gamer</strong> e periféricos de alto desempenho. Tudo com a chancela de quem entende do assunto em Campinas.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-400 font-medium">
                <span>Precisa de indicação técnica imediata?</span>
                <span className="text-white font-bold bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">{SITE_CONFIG.whatsapp.display}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] px-6 py-4 text-sm font-black text-white hover:bg-red-700 transition-all shadow-lg shadow-red-950/50 hover:scale-[1.02] active:scale-95"
              >
                <span>Orçamento no WhatsApp</span>
              </a>
              <Link
                href="/promocao"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/50 backdrop-blur px-6 py-4 text-sm font-black text-white hover:bg-slate-800 hover:border-slate-600 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>Ver Ofertas e Promoções</span>
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-12 items-start">
          <div className="lg:col-span-8 space-y-10">
            {group1.length > 0 && (
              <section className="grid gap-6 sm:grid-cols-12">
                <div className="sm:col-span-12">
                  <HeroCard post={group1[0]} size="lg" priority />
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

            <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-3">
                  <span className="w-2.5 h-6 rounded-full bg-[#E60012]"></span>
                  <span>Destaques da Semana</span>
                </h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Atualizado</span>
              </div>
              <div className="divide-y divide-slate-800/80">
                {group2.map((p) => (
                  <PostListItem key={p.id} post={p} />
                ))}
              </div>
            </section>

            {/* Soro Embed Section in the center of the blog page */}
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xl relative overflow-hidden text-neutral-900">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-[#E60012] bg-[#E60012]/10 px-3 py-1 rounded-full border border-[#E60012]/20">
                  Publicações do Soro
                </span>
                <h3 className="text-xl font-black text-neutral-900 mt-2">Últimos Artigos Publicados</h3>
              </div>
              <div id="soro-blog" className="min-h-[150px] text-neutral-900 bg-white"></div>
              <Script src="https://app.trysoro.com/api/embed/71c5ae65-e641-4dca-928b-d80ac924512b" strategy="afterInteractive" />
            </section>

            {group3.length > 0 && (
              <section className="grid gap-6 sm:grid-cols-12">
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

            <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-3">
                  <span className="w-2.5 h-6 rounded-full bg-[#E60012]"></span>
                  <span>Mais Notícias e Análises</span>
                </h2>
              </div>
              <div className="divide-y divide-slate-800/80">
                {group4.map((p) => (
                  <PostListItem key={p.id} post={p} />
                ))}
              </div>
            </section>

            {group5.length > 0 && (
              <section className="grid gap-6 sm:grid-cols-12">
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
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400">
                <p className="text-lg font-medium">Ainda não há posts publicados. Aguarde a ingestão automática via RSS/Produtos.</p>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-8 space-y-8">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur p-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2.5">
                    <span className="w-2 h-5 rounded-full bg-[#E60012]"></span>
                    <span>Mais Lidos / Em Alta</span>
                  </h2>
                </div>
                <ol className="divide-y divide-slate-800/60">
                  {trending.slice(0, 5).map((p, idx) => (
                    <li key={p.id} className="flex gap-4 py-3.5 first:pt-0 last:pb-0 group">
                      <div className="w-7 flex-none text-right text-base font-black text-[#E60012]">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={`/blog/${p.slug}`} prefetch={false} className="text-sm font-bold text-slate-200 group-hover:text-white group-hover:underline line-clamp-2 leading-snug">
                          {p.title}
                        </Link>
                        <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-400">
                          <span className="text-[#E60012] font-semibold">{p.category}</span>
                          {p.sourceDomain ? <span>• {p.sourceDomain}</span> : ""}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur p-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2.5">
                    <span className="w-2 h-5 rounded-full bg-[#E60012]"></span>
                    <span>Ofertas Balão da Informática</span>
                  </h2>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {balaoPosts.map((p) => (
                    <Link key={p.id} href={`/blog/${p.slug}`} prefetch={false} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 group">
                      <div className="relative h-14 w-14 flex-none overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
                        <Image
                          src={p.ogImageUrl || ogFallbackUrl(p)}
                          alt={p.title}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-bold text-slate-200 group-hover:text-white group-hover:underline line-clamp-2 leading-snug">{p.title}</h3>
                        {isBalaoProductPromo(p) ? (
                          <div className="mt-1.5 flex items-center gap-2 text-xs font-black">
                            <span className="text-[#E60012] bg-red-950/50 px-2 py-0.5 rounded border border-red-900/50">{extractPriceText(`${p.excerpt} ${p.title}`) || "Consulte"}</span>
                            <span className="font-semibold text-slate-400 text-[10px]">{new Date(p.publishedAt ?? p.createdAt).toLocaleDateString("pt-BR")}</span>
                          </div>
                        ) : (
                          <div className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <span className="text-[#E60012]">Balão</span>
                            <span>• {new Date(p.publishedAt ?? p.createdAt).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}

                  <div className="pt-6 mt-6 border-t border-slate-800">
                    <a
                      href="https://wa.me/5519987510267"
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl bg-[#E60012] px-4 py-3.5 text-center text-sm font-black text-white hover:bg-red-700 transition-all shadow-lg shadow-red-950/50 hover:scale-[1.02] active:scale-95"
                    >
                      Comprar com Ajuda no WhatsApp
                    </a>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Link href="/notebooks" className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 text-center transition-colors">
                        Notebooks
                      </Link>
                      <Link href="/pcgamer" className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 text-center transition-colors">
                        PC Gamer
                      </Link>
                      <Link href="/departamentos" className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 text-center transition-colors">
                        Departamentos
                      </Link>
                      <Link href="/promocao" className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 text-center transition-colors">
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
    </div>
  );
}

function PostListItem({ post }: { post: BlogCardPost }) {
  return (
    <article className="flex gap-5 py-5 first:pt-0 last:pb-0 group">
      <div className="relative h-20 w-28 flex-none sm:h-24 sm:w-36 overflow-hidden rounded-2xl border border-slate-800 bg-slate-800">
        <Image
          src={post.ogImageUrl || ogFallbackUrl(post)}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 112px, 144px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
          <span className="uppercase tracking-widest text-[#E60012]">{post.category}</span>
          {post.sourceDomain ? <span>• {post.sourceDomain}</span> : null}
          <span>• {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("pt-BR")}</span>
        </div>
        <h3 className="mt-1.5 text-base sm:text-lg font-black text-slate-100 group-hover:text-white leading-snug">
          <Link href={`/blog/${post.slug}`} prefetch={false} className="hover:underline">
            {post.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-slate-300 line-clamp-2 leading-relaxed">{post.excerpt}</p>
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

function HeroCard({ post, size, priority }: { post: BlogCardPost; size: "lg" | "sm"; priority?: boolean }) {
  const date = new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("pt-BR");
  const imageUrl = post.ogImageUrl || ogFallbackUrl(post);
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur group hover:border-slate-700 transition-all shadow-xl">
      <Link href={`/blog/${post.slug}`} prefetch={false} className="block flex flex-col h-full">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            sizes={size === "lg" ? "(max-width: 1024px) 100vw, 880px" : "(max-width: 1024px) 100vw, 420px"}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={priority}
          />
        </div>
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
              <span className="uppercase tracking-widest text-[#E60012]">{post.category}</span>
              {post.sourceDomain ? <span>• {post.sourceDomain}</span> : null}
              <span>• {date}</span>
            </div>
            <h2 className={size === "lg" ? "mt-2.5 text-xl sm:text-2xl font-black leading-tight text-white group-hover:text-red-400 transition-colors" : "mt-2.5 text-base sm:text-lg font-black leading-tight text-white group-hover:text-red-400 transition-colors"}>
              {post.title}
            </h2>
            <p className="mt-2 text-sm text-slate-300 line-clamp-2 leading-relaxed">{post.excerpt}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-black text-[#E60012]">
            <span>Ler artigo completo</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
