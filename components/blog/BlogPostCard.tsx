import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '@/lib/blog/types';
import { ensureFeaturedImageUrl } from '@/lib/blog/utils';

export default function BlogPostCard({ post }: { post: BlogPost }) {
  const imageUrl = ensureFeaturedImageUrl(post.featured_image, post.category);

  return (
    <article className="group bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative w-full aspect-[16/9] bg-gray-100">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            priority={false}
          />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-[#E60012]">
              {post.category}
            </span>
            {post.video_embed_url ? (
              <span className="text-xs text-gray-500">Vídeo</span>
            ) : null}
          </div>
          <h3 className="font-bold text-gray-900 leading-snug group-hover:text-[#E60012] transition-colors">
            {post.title}
          </h3>
          {post.excerpt ? (
            <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
