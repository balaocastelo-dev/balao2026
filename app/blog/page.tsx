import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { getBlogPosts } from "@/lib/db";

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

export default async function BlogPage(props: { searchParams?: SearchParams }) {
  const sp = (await props.searchParams) ?? {};
  const categoryRaw =
    typeof sp.cat === "string" && sp.cat.trim()
      ? sp.cat.trim()
      : typeof sp.category === "string" && sp.category.trim()
        ? sp.category.trim()
        : undefined;

  const rawPosts = await getBlogPosts({ limit: 50, category: categoryRaw });

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

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      {categoryRaw ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-4 py-3">
          <div className="text-sm">
            <span className="font-semibold">Categoria:</span>{" "}
            <span className="font-semibold text-[#e41e26]">{categoryRaw}</span>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-neutral-700 hover:underline">
            Limpar filtro
          </Link>
        </div>
      ) : null}

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
                      <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold text-neutral-500">
                        <span className="text-[#e41e26]">Oferta</span>
                        <span>{new Date(p.publishedAt ?? p.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>
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
      <div className="relative hidden h-[86px] w-[140px] flex-none sm:block">
        <SafeImage
          src={post.ogImageUrl || ogFallbackUrl(post)}
          fallbackSrc={ogFallbackUrl(post)}
          alt={post.title}
          fill
          sizes="140px"
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
