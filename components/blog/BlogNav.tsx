import Link from 'next/link';
import { BLOG_MENU } from '@/lib/blog/constants';

export default function BlogNav() {
  return (
    <div className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/blog" className="text-lg font-bold text-gray-900">
            Blog
          </Link>
          <span className="text-sm text-gray-500 hidden sm:inline">
            Notícias, tecnologia, games, IA, hardware e Campinas
          </span>
        </div>
        <nav className="flex items-center gap-4">
          {BLOG_MENU.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-[#E60012] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
