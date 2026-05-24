import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogPostCard from '@/components/blog/BlogPostCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { BLOG_CATEGORIES } from '@/lib/blog/constants';
import { getPopularPosts, getPublishedPosts } from '@/lib/blog/store';

export const dynamic = 'force-dynamic';

type Params = Promise<{ categoria: string }>;

export default async function BlogCategoryPage(props: { params: Params }) {
  const { categoria } = await props.params;
  const decoded = decodeURIComponent(categoria || '').trim();
  if (!decoded) notFound();

  const isKnown = BLOG_CATEGORIES.includes(decoded as any) || decoded === 'Campinas e Região';
  const category = isKnown ? decoded : decoded;

  const [posts, popular] = await Promise.all([
    getPublishedPosts({ limit: 24, category }),
    getPopularPosts(8)
  ]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{category}</h1>
              <p className="mt-2 text-sm text-gray-600">
                Últimas publicações da categoria.
              </p>
            </div>
            <Link href="/blog" className="text-sm font-semibold text-[#E60012] hover:underline">
              Voltar ao blog
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(p => (
              <BlogPostCard key={p.id} post={p} />
            ))}
          </div>

          {posts.length === 0 ? (
            <div className="mt-6 bg-white rounded-xl border p-6">
              <p className="text-sm text-gray-700">
                Nenhuma matéria publicada nesta categoria ainda.
              </p>
            </div>
          ) : null}
        </div>

        <div className="w-full lg:w-80 flex-shrink-0">
          <BlogSidebar popular={popular} />
        </div>
      </div>
    </main>
  );
}

