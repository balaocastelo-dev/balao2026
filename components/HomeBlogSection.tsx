"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ChevronRight, ArrowRight, Wrench, ShieldCheck } from "lucide-react";

interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover_image: string | null;
}

interface HomeBlogSectionProps {
  blogPosts: BlogPostItem[];
}

export default function HomeBlogSection({ blogPosts }: HomeBlogSectionProps) {
  if (!blogPosts || blogPosts.length === 0) return null;

  return (
    <section className="w-full rounded-[2rem] border border-slate-700/80 bg-[#111827] p-6 sm:p-8 shadow-2xl relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#E60012] text-white text-[10px] font-black uppercase tracking-widest shadow-md">
              Conteúdo & Dicas
            </span>
            <span className="text-xs font-bold text-slate-300">
              Guias de Compra e Assistência
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight mt-1.5">
            📰 Blog Balão da Informática
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Artigos técnicos, comparativos de hardware e tutoriais preparados por nossos especialistas.
          </p>
        </div>

        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-[#E60012] border border-slate-700 hover:border-[#E60012] text-xs font-black text-white transition-all group"
        >
          <span>Acessar Todos os Artigos</span>
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {blogPosts.slice(0, 3).map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col justify-between p-4 rounded-2xl bg-[#161f32] border border-slate-700/80 hover:border-[#E60012] transition-all hover:-translate-y-1 shadow-md"
          >
            <div>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-white/5 mb-3">
                <Image
                  src={post.cover_image || "/logo.png"}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 350px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur text-[10px] font-black uppercase text-[#E60012]">
                  {post.category || "Informática"}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-[#E60012] transition-colors">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-[#E60012]">
              <span>Ler artigo completo</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
