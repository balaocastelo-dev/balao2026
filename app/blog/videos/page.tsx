import Link from 'next/link';
import BlogPostCard from '@/components/blog/BlogPostCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { getPopularPosts, getPublishedPosts } from '@/lib/blog/store';

export const dynamic = 'force-dynamic';

export default async function BlogVideosPage() {
  const [posts, popular] = await Promise.all([
    getPublishedPosts({ limit: 24, videosOnly: true }),
    getPopularPosts(8)
  ]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Campinas e Região em Vídeo</h1>
              <p className="mt-2 text-sm text-gray-600">
                YouTube, Shorts, Reels, TikTok, lives e vídeos locais, com embeds.
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
                Ainda não há posts em vídeo publicados.
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

