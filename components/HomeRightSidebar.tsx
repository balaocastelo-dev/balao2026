"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Star, Wrench, ArrowRight } from "lucide-react";

interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover_image: string | null;
}

interface HomeRightSidebarProps {
  blogPosts: BlogPostItem[];
}

export default function HomeRightSidebar({ blogPosts }: HomeRightSidebarProps) {
  return (
    <aside className="w-full space-y-4">
      {/* 1. Quadros do Blog (Artigos e Guias de Compra) */}
      <div className="rounded-[1.75rem] border border-[var(--home-border)] bg-[var(--home-panel-bg)] p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-[#E60012]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Blog & Guias</h2>
          </div>
          <Link
            href="/blog"
            className="text-[11px] font-black uppercase tracking-wider text-[#E60012] hover:opacity-80"
          >
            Ver todos
          </Link>
        </div>

        <div className="space-y-3">
          {blogPosts.slice(0, 3).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-all hover:border-[#E60012]"
            >
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-white/[0.02] mb-2">
                <Image
                  src={post.cover_image || "/logo.png"}
                  alt={post.title}
                  fill
                  sizes="240px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur text-[9px] font-black uppercase text-[#E60012]">
                  {post.category || "Informática"}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-[#E60012] transition-colors">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. Promoção Especial de Assistência & Montagem */}
      <div className="rounded-[1.75rem] border border-red-500/30 bg-gradient-to-b from-red-950/30 via-[var(--home-panel-bg)] to-[var(--home-panel-bg)] p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Wrench size={18} className="text-[#E60012]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">Assistência Técnica</h3>
        </div>
        <h4 className="text-sm font-black text-white leading-snug">
          Montagem de PC & Upgrade na Hora
        </h4>
        <p className="mt-1 text-xs text-[var(--home-muted)] leading-relaxed">
          Traga seu computador para bancada própria no Cambuí. Formatação, troca de pasta térmica e diagnósticos rápidos.
        </p>
        <Link
          href="/manutencao"
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#E60012] hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition-colors shadow"
        >
          <span>Conhecer Serviços</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* 3. Prova Social Google 4.9 Estrelas */}
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 shadow-xl text-center">
        <div className="flex justify-center gap-1 text-[#E60012] mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={15} className="fill-[#E60012]" />
          ))}
        </div>
        <span className="text-xs font-black text-white">4.9 / 5.0 no Google Avaliações</span>
        <p className="mt-1 text-[11px] text-[var(--home-muted)]">
          Mais de 2.000 clientes satisfeitos em Campinas e Região Metropolitana.
        </p>
      </div>
    </aside>
  );
}
