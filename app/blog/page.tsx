import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import JsonLd, { generateBreadcrumbSchema, generateFAQSchema, generateOrganizationSchema } from "@/components/JsonLd";
import { listBlogPostsForPage } from "@/lib/blog-store";
import { getCategories, getProducts } from "@/lib/db";
import { parsePriceToNumber, type Category, type Product } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";

export const runtime = "nodejs";
export const revalidate = 120;

type SearchParams = { cat?: string; category?: string; q?: string };

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

function normalize(text: string) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
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
  const rawQ = props.searchParams?.q ?? "";
  const q = normalize(rawQ);
  const selectedCategory = (props.searchParams?.category || props.searchParams?.cat || "").trim();

  const [rawPosts, products, categories] = await Promise.all([listBlogPostsForPage({ take: 70 }), getProducts(), getCategories()]);

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

  const filtered = posts.filter((p) => {
    if (selectedCategory) {
      if (normalize(p.category) !== normalize(selectedCategory)) return false;
    }
    if (!q) return true;
    const hay = normalize(`${p.title} ${p.excerpt} ${p.category}`);
    return hay.includes(q);
  });

  const trending = filtered.slice(0, 10);
  const balaoPosts = filtered.filter((p) => p.sourceDomain === "balao.info").slice(0, 6);

  const featuredPost = filtered[0] ?? null;
  const latestPosts = filtered.slice(featuredPost ? 1 : 0, (featuredPost ? 1 : 0) + 8);

  const categoriesSorted = (() => {
    const counts = new Map<string, number>();
    filtered.forEach((p) => {
      const c = (p.category || "Tecnologia").trim() || "Tecnologia";
      counts.set(c, (counts.get(c) || 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .slice(0, 8);
  })();

  const findBySlug = (s: string, all: Category[]) => all.find((c) => c.slug === s);
  const premiumCategory = findBySlug("premium", categories);
  const getDescendantNames = (root: Category | undefined, all: Category[]) => {
    if (!root) return [];
    const descendants: string[] = [];
    const stack = [root.id];
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      const children = all.filter((c) => c.parent_id === currentId);
      children.forEach((child) => {
        descendants.push(child.name);
        stack.push(child.id);
      });
    }
    return descendants;
  };
  const validCategories = new Set<string>();
  if (premiumCategory?.name) {
    validCategories.add(premiumCategory.name);
    getDescendantNames(premiumCategory, categories).forEach((n) => validCategories.add(n));
  }
  const premiumProducts = (products as Product[]).filter((p) => {
    if (validCategories.size > 0) return validCategories.has(p.category);
    return normalize(p.category) === "premium";
  });
  const premiumImages = premiumProducts.map((p) => p.image).filter((img): img is string => Boolean(img));
  const heroImage = premiumImages.length > 0 ? premiumImages[Math.floor(Math.random() * premiumImages.length)] : "/logo.png";

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
    <div className="min-h-screen flex flex-col font-sans bg-white text-zinc-950">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8">
        <JsonLd data={[org, breadcrumbs, faq]} />

        <section className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 sm:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(230,0,18,0.10),transparent_40%),radial-gradient(circle_at_85%_55%,rgba(0,0,0,0.04),transparent_45%)]" />
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E60012]/15 bg-[#E60012]/5 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#E60012]">
                Blog Balão
              </div>
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.02]">
                Conteúdo que tecnologia com <span className="text-[#E60012]">performance</span>.
              </h1>
              <p className="mt-4 text-sm sm:text-base text-zinc-600 max-w-2xl">
                Guias, dicas e novidades para escolher PC Gamer, notebooks, hardware e upgrades com mais segurança e custo-benefício.
              </p>

              <form method="get" action="/blog" className="mt-6 flex flex-col sm:flex-row gap-3">
                {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
                <div className="flex-1 relative">
                  <input
                    name="q"
                    defaultValue={rawQ}
                    placeholder="Buscar artigos no blog…"
                    className="w-full h-12 rounded-2xl border border-black/10 bg-white px-4 pr-12 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E60012]/15"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4 rounded-xl bg-[#E60012] text-white text-sm font-extrabold hover:brightness-110"
                  >
                    Buscar
                  </button>
                </div>
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-12 inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 text-sm font-extrabold text-zinc-900 hover:bg-zinc-50"
                >
                  Atendimento WhatsApp
                </a>
              </form>

              <div className="mt-6">
                <div className="text-xs font-extrabold text-zinc-700">Navegue por tópicos</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href="/blog"
                    className={`rounded-full border px-3 py-2 text-xs font-extrabold transition-colors ${
                      !selectedCategory ? "border-[#E60012]/20 bg-[#E60012]/10 text-[#E60012]" : "border-black/10 bg-white text-zinc-800 hover:bg-zinc-50"
                    }`}
                  >
                    Todos
                  </Link>
                  {categoriesSorted.map((c) => (
                    <Link
                      key={c}
                      href={`/blog?category=${encodeURIComponent(c)}`}
                      className={`rounded-full border px-3 py-2 text-xs font-extrabold transition-colors ${
                        normalize(selectedCategory) === normalize(c)
                          ? "border-[#E60012]/20 bg-[#E60012]/10 text-[#E60012]"
                          : "border-black/10 bg-white text-zinc-800 hover:bg-zinc-50"
                      }`}
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.10)]">
                <Image src={heroImage} alt="Ilustração de tecnologia" fill className="object-contain p-8" sizes="(max-width: 1024px) 100vw, 420px" unoptimized />
              </div>
            </div>
          </div>
        </section>

        {featuredPost ? (
          <section className="mt-8 rounded-[28px] border border-black/10 bg-white overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-center">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#E60012]">Artigo em destaque</div>
                <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  <Link href={`/blog/${featuredPost.slug}`} prefetch={false} className="hover:underline">
                    {featuredPost.title}
                  </Link>
                </h2>
                <p className="mt-3 text-sm text-zinc-600 leading-relaxed line-clamp-3">{featuredPost.excerpt}</p>
                <div className="mt-6">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    prefetch={false}
                    className="inline-flex items-center justify-center rounded-2xl bg-[#E60012] px-5 py-3 text-sm font-extrabold text-white hover:brightness-110"
                  >
                    Ler artigo completo →
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-7 relative min-h-[220px]">
                <Image
                  src={featuredPost.ogImageUrl || ogFallbackUrl(featuredPost)}
                  alt={featuredPost.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 760px"
                />
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-zinc-500">Últimos artigos</div>
              <h2 className="mt-2 text-2xl font-black tracking-tight">Para ler agora</h2>
            </div>
            <Link href="/blog" className="text-sm font-extrabold text-[#E60012] hover:underline">
              Ver todos →
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestPosts.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-[22px] border border-black/10 bg-white hover:shadow-[0_20px_70px_rgba(0,0,0,0.10)] transition-shadow">
                <Link href={`/blog/${p.slug}`} prefetch={false} className="block">
                  <div className="relative aspect-[16/10] bg-white">
                    <Image src={p.ogImageUrl || ogFallbackUrl(p)} alt={p.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 300px" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#E60012] line-clamp-1">{p.category}</div>
                      {p.readingTimeMin ? <div className="text-[11px] font-bold text-zinc-500">{p.readingTimeMin} min</div> : null}
                    </div>
                    <h3 className="mt-2 text-sm font-black leading-snug line-clamp-2">{p.title}</h3>
                    <p className="mt-2 text-xs text-zinc-600 line-clamp-2">{p.excerpt}</p>
                    <div className="mt-3 text-[11px] font-semibold text-zinc-500">
                      {new Date(p.publishedAt ?? p.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-8 rounded-[22px] border border-black/10 bg-white p-8 text-center text-sm text-zinc-600">
              Nenhum artigo encontrado para este filtro.
            </div>
          ) : null}
        </section>

        <section className="mt-10 rounded-[28px] border border-black/10 bg-white p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#E60012]/10 border border-[#E60012]/15 flex items-center justify-center text-[#E60012] font-black">
                ✉
              </div>
              <div>
                <div className="text-lg font-black">Fique por dentro das novidades</div>
                <div className="mt-1 text-sm text-zinc-600">Receba artigos, dicas e ofertas especiais direto no seu e-mail.</div>
              </div>
            </div>
            <form className="flex w-full max-w-xl flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="h-12 flex-1 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E60012]/15"
              />
              <button type="button" className="h-12 rounded-2xl bg-[#E60012] px-6 text-sm font-extrabold text-white hover:brightness-110">
                Inscrever-se
              </button>
            </form>
          </div>
        </section>

        <section className="mt-10 rounded-[28px] border border-black/10 bg-white p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Enviamos para todo o Brasil", desc: "Entrega rápida e rastreamento." },
              { title: "Parcele em até 12x sem juros", desc: "No cartão de crédito." },
              { title: "Garantia e qualidade", desc: "Produtos com suporte real." },
              { title: "Suporte especializado", desc: "Atendimento técnico antes e depois da compra." },
            ].map((b) => (
              <div key={b.title} className="rounded-2xl border border-black/10 bg-zinc-50 p-4">
                <div className="text-sm font-black">{b.title}</div>
                <div className="mt-1 text-xs text-zinc-600">{b.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function PostListItem({ post }: { post: BlogCardPost }) {
  return (
    <article className="flex gap-4 p-4 hover:bg-neutral-50/70">
      <div className="relative h-[72px] w-[112px] flex-none sm:h-[86px] sm:w-[140px]">
        <Image
          src={post.ogImageUrl || ogFallbackUrl(post)}
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
          <Link href={`/blog/${post.slug}`} prefetch={false} className="hover:underline">
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

function HeroCard({ post, size, priority }: { post: BlogCardPost; size: "lg" | "sm"; priority?: boolean }) {
  const date = new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("pt-BR");
  const imageUrl = post.ogImageUrl || ogFallbackUrl(post);
  return (
    <article className="overflow-hidden rounded-md border border-neutral-200 bg-white">
      <Link href={`/blog/${post.slug}`} prefetch={false} className="block">
        <div className="relative aspect-[16/9]">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            sizes={size === "lg" ? "(max-width: 1024px) 100vw, 880px" : "(max-width: 1024px) 100vw, 420px"}
            className="object-contain"
            priority={priority}
          />
        </div>
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-600">
            <span className="uppercase tracking-wide text-[#e41e26]">{post.category}</span>
            {post.sourceDomain ? <span>{post.sourceDomain}</span> : null}
            <span>{date}</span>
          </div>
          <h2 className={size === "lg" ? "mt-2 text-2xl font-extrabold leading-snug text-neutral-900" : "mt-2 text-lg font-extrabold leading-snug text-neutral-900"}>
            {post.title}
          </h2>
          <p className="mt-2 text-sm text-neutral-700 overflow-hidden max-h-[2.8rem]">{post.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}
