import type { Metadata } from "next";
import Link from "next/link";
import { getBlogCategories, getBlogPosts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog",
    description:
      "Blog oficial do Balão da Informática com notícias de tecnologia, guias de compra e dicas práticas. Atendimento no WhatsApp 19 98751-0267.",
    alternates: {
      canonical: "https://www.balao.info/blog",
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: "https://www.balao.info/blog",
      title: "Blog | Balão da Informática",
      description:
        "Notícias de tecnologia, guias e conteúdos práticos. Fale no WhatsApp 19 98751-0267.",
      siteName: "Balão da Informática",
    },
  };
}

export default async function BlogPage(props: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = (await props.searchParams) || {};
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const category = typeof searchParams.category === "string" ? searchParams.category : "";

  const [posts, categories] = await Promise.all([
    getBlogPosts({ limit: 24, category: category || undefined, query: q || undefined }),
    getBlogCategories(40),
  ]);

  return (
    <main className="container mx-auto px-4 py-10">
      <section className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-white to-red-50 p-6 md:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900">
              Blog do Balão da Informática
            </h1>
            <p className="mt-3 text-gray-700 text-base md:text-lg">
              Notícias, guias e dicas práticas para comprar e usar tecnologia com segurança. Atendimento rápido no{" "}
              <a className="text-[#E60012] font-bold underline" href="https://wa.me/5519987510267" target="_blank" rel="noopener noreferrer">
                WhatsApp 19 98751-0267
              </a>
              .
            </p>
          </div>

          <form className="w-full md:w-[420px]" action="/blog" method="get">
            <div className="flex gap-2">
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar no blog (ex: notebook, SSD, placa de vídeo)"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#E60012] bg-white"
              />
              <button className="px-5 py-3 rounded-xl bg-[#E60012] text-white font-bold hover:bg-red-700">
                Buscar
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-900">Últimas publicações</h2>
            {(q || category) && (
              <Link href="/blog" className="text-sm font-bold text-[#E60012] hover:underline">
                Limpar filtros
              </Link>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
              <p className="text-gray-700">Nenhuma publicação encontrada.</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <article key={post.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <Link href={`/blog/${post.slug}`} className="block p-5">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      {post.category && (
                        <span className="inline-flex items-center rounded-full bg-red-50 text-[#E60012] px-3 py-1 font-bold">
                          {post.category}
                        </span>
                      )}
                      <span>
                        {new Date(post.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      {post.reading_time_minutes ? <span>• {post.reading_time_minutes} min</span> : null}
                    </div>
                    <h3 className="mt-3 text-lg md:text-xl font-black text-gray-900 leading-snug">
                      {post.title}
                    </h3>
                    {post.excerpt ? <p className="mt-3 text-gray-700 max-h-[4.5rem] overflow-hidden">{post.excerpt}</p> : null}
                    <div className="mt-4 text-sm font-bold text-[#E60012]">Ler agora</div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-gray-900">Categorias</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.length === 0 ? (
                <span className="text-sm text-gray-600">Em breve</span>
              ) : (
                categories.map((c) => (
                  <Link
                    key={c}
                    href={`/blog?category=${encodeURIComponent(c)}`}
                    className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-sm font-bold text-gray-800 hover:border-[#E60012] hover:text-[#E60012]"
                  >
                    {c}
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E60012]/20 bg-gradient-to-br from-red-50 to-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-gray-900">Precisa de ajuda para escolher?</h3>
            <p className="mt-2 text-gray-700">
              Fale com um especialista e receba indicação do melhor custo-benefício para seu uso.
            </p>
            <a
              href="https://wa.me/5519987510267"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#E60012] px-5 py-3 font-black text-white hover:bg-red-700"
            >
              Chamar no WhatsApp
            </a>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/notebooks" className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-900 hover:border-[#E60012]">
                Notebooks
              </Link>
              <Link href="/pcgamer" className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-900 hover:border-[#E60012]">
                PC Gamer
              </Link>
              <Link href="/departamentos" className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-900 hover:border-[#E60012]">
                Departamentos
              </Link>
              <Link href="/fale-conosco" className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-900 hover:border-[#E60012]">
                Atendimento
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
