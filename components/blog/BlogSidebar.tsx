import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '@/lib/blog/types';
import { ensureFeaturedImageUrl } from '@/lib/blog/utils';

export default function BlogSidebar({ popular }: { popular: BlogPost[] }) {
  return (
    <aside className="space-y-6">
      <div className="bg-white rounded-xl border p-4">
        <h3 className="text-sm font-bold text-gray-900">Em alta</h3>
        <div className="mt-4 space-y-3">
          {popular.map(p => {
            const img = ensureFeaturedImageUrl(p.featured_image, p.category);
            return (
              <Link key={p.id} href={`/blog/${p.slug}`} className="flex gap-3 group">
                <div className="relative w-16 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                  <Image src={img} alt={p.title} fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#E60012]">{p.category}</p>
                  <p className="text-sm font-medium text-gray-900 leading-snug group-hover:text-[#E60012] transition-colors line-clamp-2">
                    {p.title}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <h3 className="text-sm font-bold text-gray-900">Campinas e Região</h3>
        <p className="mt-2 text-sm text-gray-600">
          Acompanhe tecnologia, eventos e novidades locais.
        </p>
        <Link
          href="/blog/campinas"
          className="mt-3 inline-flex items-center justify-center w-full px-4 py-2 rounded-md bg-[#E60012] text-white text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          Ver seção
        </Link>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <h3 className="text-sm font-bold text-gray-900">Campinas e Região em Vídeo</h3>
        <p className="mt-2 text-sm text-gray-600">
          Vídeos organizados por tema, com embeds nativos.
        </p>
        <Link
          href="/blog/videos"
          className="mt-3 inline-flex items-center justify-center w-full px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
        >
          Ver vídeos
        </Link>
      </div>
    </aside>
  );
}
