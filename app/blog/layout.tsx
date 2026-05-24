import type { Metadata } from 'next';
import BlogNav from '@/components/blog/BlogNav';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Portal automatizado de notícias, tecnologia, games, IA, hardware, informática e Campinas e região.'
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <BlogNav />
      {children}
    </div>
  );
}

