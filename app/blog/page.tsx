import Link from 'next/link';
import BlogPostCard from '@/components/blog/BlogPostCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { BLOG_CATEGORIES } from '@/lib/blog/constants';
import { getPopularPosts, getPublishedPosts } from '@/lib/blog/store';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ q?: string; categoria?: string }>;

export default async function BlogIndex(props: { searchParams: SearchParams }) {
  const sp = await props.searchParams;
  const q = (sp?.q || '').trim();
  const categoria = (sp?.categoria || '').trim();

  const postsPromise = getPublishedPosts({ limit: 18, query: q || undefined, category: categoria || undefined });
  const popularPromise = getPopularPosts(8);
  const [posts, popular] = await Promise.all([postsPromise, popularPromise]);

  const featured = posts[0] || null;
  const rest = featured ? posts.slice(1) : posts;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Portal de Notícias do Balão
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Tecnologia, games, IA, hardware, informática e Campinas e região.
              </p>
            </div>

            <form action="/blog" className="flex gap-2 w-full sm:w-auto">
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar no blog…"
                className="w-full sm:w-72 px-3 py-2 rounded-md border bg-white text-sm outline-none focus:ring-2 focus:ring-[#E60012]/30 focus:border-[#E60012]"
              />
              <button className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors">
                Buscar
              </button>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={q ? `/blog?q=${encodeURIComponent(q)}` : '/blog'}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${!categoria ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 hover:text-[#E60012]'}`}
            >
              Tudo
            </Link>
            {BLOG_CATEGORIES.map(cat => (
              <Link
                key={cat}
                href={`/blog?categoria=${encodeURIComponent(cat)}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${categoria === cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 hover:text-[#E60012]'}`}
              >
                {cat}
              </Link>
            ))}
          </div>

          {featured ? (
            <section className="mt-8">
              <h2 className="text-base font-bold text-gray-900">Destaque</h2>
              <div className="mt-3">
                <BlogPostCard post={featured} />
              </div>
            </section>
          ) : null}

          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Recentes</h2>
              <div className="flex items-center gap-3">
                <Link href="/blog/campinas" className="text-sm font-semibold text-[#E60012] hover:underline">
                  Campinas
                </Link>
                <Link href="/blog/videos" className="text-sm font-semibold text-gray-900 hover:underline">
                  Vídeos
                </Link>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map(p => (
                <BlogPostCard key={p.id} post={p} />
              ))}
            </div>
            {rest.length === 0 ? (
              <div className="mt-6 bg-white rounded-xl border p-6">
                <p className="text-sm text-gray-700">
                  Ainda não há posts publicados. Use o painel em <Link className="text-[#E60012] font-semibold hover:underline" href="/admin/blog">/admin/blog</Link> para cadastrar RSS e gerar matérias.
                </p>
              </div>
            ) : null}
          </section>
        </div>

        <div className="w-full lg:w-80 flex-shrink-0">
          <BlogSidebar popular={popular} />
        </div>
      </div>
    </main>
  );
}

