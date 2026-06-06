import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import JsonLd, { generateBreadcrumbSchema, generateFAQSchema, generateOrganizationSchema } from "@/components/JsonLd";
import SafeImage from "@/components/SafeImage";
import { SITE_CONFIG } from "@/lib/config";
import { listAppleRadarPosts } from "@/lib/apple-news";

export const runtime = "nodejs";
export const revalidate = 900;

function formatDate(input: string) {
  return new Date(input).toLocaleDateString("pt-BR");
}

const fallbackImage = "/images/apple/hub-hero-real.png";

export const metadata: Metadata = {
  title: "Blog Apple em Campinas | Radar de Noticias Apple",
  description:
    "Blog Apple da Balão da Informática com notícias em português sobre iPhone, iPad, Mac e Apple Watch, além de atendimento Apple em Campinas.",
  alternates: { canonical: "https://www.balao.info/wendell/apple/blog" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/wendell/apple/blog",
    title: "Blog Apple em Campinas | Radar de Noticias Apple",
    description:
      "Acompanhe notícias Apple em português e fale com especialistas em assistência Apple em Campinas.",
    siteName: SITE_CONFIG.name,
    images: [{ url: fallbackImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Apple em Campinas | Radar de Noticias Apple",
    description:
      "Acompanhe notícias Apple em português e fale com especialistas em assistência Apple em Campinas.",
    images: [fallbackImage],
  },
};

export default async function AppleBlogPage() {
  const posts = await listAppleRadarPosts(36);
  const featured = posts[0] || null;
  const sideFeatured = posts.slice(1, 3);
  const listPosts = posts.slice(3, 15);
  const morePosts = posts.slice(15, 30);
  const categoryMap = new Map<string, number>();
  posts.forEach((post) => categoryMap.set(post.category, (categoryMap.get(post.category) || 0) + 1));
  const categories = Array.from(categoryMap.entries()).slice(0, 6);

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Início", item: "https://www.balao.info" },
    { name: "Especialista Apple", item: "https://www.balao.info/wendell/apple" },
    { name: "Blog Apple", item: "https://www.balao.info/wendell/apple/blog" },
  ]);

  const faq = generateFAQSchema([
    {
      question: "O blog Apple é atualizado automaticamente?",
      answer:
        "Sim. O blog reúne automaticamente notícias Apple em português publicadas por fontes especializadas.",
    },
    {
      question: "Posso falar com a loja direto pelo blog?",
      answer: `Sim. Em qualquer notícia você pode seguir para o WhatsApp ${SITE_CONFIG.whatsapp.display} e pedir orientação sobre MacBook, iMac, iPad, Apple Watch e Mac Mini.`,
    },
    {
      question: "Vocês atendem Campinas e bairros próximos?",
      answer:
        "Sim. Atendemos Campinas com foco em Cambuí, Nova Campinas, Guanabara, Taquaral, Bosque, Centro e bairros próximos.",
    },
  ]);

  const org = generateOrganizationSchema();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:py-10">
        <JsonLd data={[org, breadcrumbs, faq]} />

        <section className="overflow-hidden rounded-[2rem] border border-red-100 bg-white shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 md:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                Notícias Apple em português
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-gray-900 md:text-6xl">
                Blog Apple com
                <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                  {" "}novidades, lançamentos e atualizações do dia a dia
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
                Acompanhe notícias sobre iPhone, iPad, Mac e Apple Watch em português. Se o seu equipamento
                precisa de atenção, você também encontra atendimento Apple em Campinas.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=Olá! Quero ajuda com um equipamento Apple em Campinas.`}
                  target="_blank"
                  className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-red-700"
                >
                  Falar no WhatsApp
                </Link>
                <Link
                  href="/wendell/apple"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-800 transition hover:bg-gray-50"
                >
                  Ver serviços Apple
                </Link>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {["iPhone, iPad e Mac", "Fontes em português", "Atendimento Apple em Campinas"].map((item) => (
                  <div key={item} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[320px] lg:min-h-full">
              <Image
                src={fallbackImage}
                alt="Blog Apple da Balão da Informática"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">Balão da Informática</p>
                <p className="mt-2 max-w-md text-2xl font-black text-white">
                  Novidades do universo Apple para acompanhar e decidir com mais segurança
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {featured ? (
              <section className="grid gap-4 sm:grid-cols-12">
                <div className="sm:col-span-12">
                  <HeroCard post={featured} priority />
                </div>
                {sideFeatured.map((post) => (
                  <div key={post.id} className="sm:col-span-6">
                    <MiniHeroCard post={post} />
                  </div>
                ))}
              </section>
            ) : null}

            <section className="mt-8">
              <div className="flex items-end justify-between">
                <h2 className="text-lg font-extrabold tracking-tight">
                  <span className="inline-block border-l-4 border-red-600 pl-3">Noticias em destaque</span>
                </h2>
              </div>
              <div className="mt-4 divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                {listPosts.map((post) => (
                  <PostListItem key={post.id} post={post} />
                ))}
                {posts.length === 0 ? (
                  <div className="p-8 text-center text-sm text-neutral-600">
                    Nenhuma notícia Apple em português foi encontrada neste momento. Tente novamente em alguns minutos.
                  </div>
                ) : null}
              </div>
            </section>

            {morePosts.length > 0 ? (
              <section className="mt-8">
                <div className="flex items-end justify-between">
                  <h2 className="text-lg font-extrabold tracking-tight">
                    <span className="inline-block border-l-4 border-red-600 pl-3">Mais do Radar Apple</span>
                  </h2>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {morePosts.map((post) => (
                    <MiniHeroCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-8 space-y-8">
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <div className="border-b border-neutral-200 px-4 py-3">
                  <h2 className="text-sm font-extrabold tracking-tight">
                    <span className="inline-block border-l-4 border-red-600 pl-3">Em alta no Apple</span>
                  </h2>
                </div>
                <ol className="divide-y divide-neutral-200">
                  {posts.slice(0, 5).map((post, idx) => (
                    <li key={post.id} className="flex gap-3 px-4 py-3">
                      <div className="w-6 flex-none text-right text-sm font-extrabold text-red-600">{idx + 1}</div>
                      <div className="min-w-0">
                        <Link href={`/wendell/apple/blog/${post.slug}`} className="text-sm font-semibold hover:underline">
                          {post.title}
                        </Link>
                        <div className="mt-1 text-xs font-semibold text-neutral-600">
                          {post.category}
                          {post.source_domain ? ` • ${post.source_domain}` : ""}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <div className="border-b border-neutral-200 px-4 py-3">
                  <h2 className="text-sm font-extrabold tracking-tight">
                    <span className="inline-block border-l-4 border-red-600 pl-3">Categorias Apple</span>
                  </h2>
                </div>
                <div className="grid gap-3 p-4">
                  {categories.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
                      <span>{name}</span>
                      <span className="rounded-full bg-white px-2 py-1 text-xs text-gray-500">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] bg-gradient-to-br from-red-600 to-red-700 p-6 text-white shadow-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Atendimento rápido</p>
                <h2 className="mt-3 text-2xl font-black">Precisa de assistencia Apple em Campinas?</h2>
                <p className="mt-3 text-sm leading-6 text-white/90">
                  Se o seu MacBook, iPad, iMac, Apple Watch ou Mac Mini precisa de reparo, fale agora com a equipe.
                </p>
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=Olá! Quero orçamento para um equipamento Apple.`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-extrabold text-red-700"
                >
                  Solicitar atendimento
                </a>
                <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold">
                  <Link href="/wendell/apple/macbook" className="rounded-xl bg-white/10 px-3 py-3 hover:bg-white/15">MacBook</Link>
                  <Link href="/wendell/apple/imac" className="rounded-xl bg-white/10 px-3 py-3 hover:bg-white/15">iMac</Link>
                  <Link href="/wendell/apple/ipad" className="rounded-xl bg-white/10 px-3 py-3 hover:bg-white/15">iPad</Link>
                  <Link href="/wendell/apple/apple-watch" className="rounded-xl bg-white/10 px-3 py-3 hover:bg-white/15">Apple Watch</Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function PostListItem({ post }: { post: Awaited<ReturnType<typeof listAppleRadarPosts>>[number] }) {
  return (
    <article className="flex gap-4 p-4 hover:bg-neutral-50/70">
      <div className="relative h-[72px] w-[112px] flex-none overflow-hidden rounded-xl border border-neutral-100 bg-white sm:h-[86px] sm:w-[140px]">
        <SafeImage
          src={post.cover_image || fallbackImage}
          fallbackSrc={fallbackImage}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 112px, 140px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-600">
          <span className="uppercase tracking-wide text-red-600">{post.category}</span>
          {post.source_domain ? <span>{post.source_domain}</span> : null}
          <span>{formatDate(post.published_at)}</span>
        </div>
        <h3 className="mt-1 text-base font-extrabold leading-snug">
          <Link href={`/wendell/apple/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h3>
        <p className="mt-1 max-h-[2.8rem] overflow-hidden text-sm text-neutral-700">{post.excerpt}</p>
      </div>
    </article>
  );
}

function HeroCard({
  post,
  priority,
}: {
  post: Awaited<ReturnType<typeof listAppleRadarPosts>>[number];
  priority?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
      <Link href={`/wendell/apple/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9]">
          <SafeImage
            src={post.cover_image || fallbackImage}
            fallbackSrc={fallbackImage}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 880px"
            className="object-cover"
            priority={priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/80">
              <span className="rounded-full bg-white/15 px-3 py-1 uppercase tracking-wide">{post.category}</span>
              {post.source_domain ? <span>{post.source_domain}</span> : null}
              <span>{formatDate(post.published_at)}</span>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-snug md:text-3xl">{post.title}</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base">{post.excerpt}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}

function MiniHeroCard({ post }: { post: Awaited<ReturnType<typeof listAppleRadarPosts>>[number] }) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-sm">
      <Link href={`/wendell/apple/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/10]">
          <SafeImage
            src={post.cover_image || fallbackImage}
            fallbackSrc={fallbackImage}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 420px"
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-600">
            <span className="uppercase tracking-wide text-red-600">{post.category}</span>
            {post.source_domain ? <span>{post.source_domain}</span> : null}
            <span>{formatDate(post.published_at)}</span>
          </div>
          <h3 className="mt-2 text-lg font-extrabold leading-snug text-neutral-900">{post.title}</h3>
          <p className="mt-2 max-h-[2.8rem] overflow-hidden text-sm text-neutral-700">{post.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}
