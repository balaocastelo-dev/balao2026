import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

function getMetadataBase() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://www.balao.info";
  if (url.startsWith("http")) return new URL(url);
  return new URL(`https://${url}`);
}

export const metadata: Metadata = {
  title: {
    default: "BalãoNews — Notícias de Tecnologia",
    template: "%s | BalãoNews",
  },
  description:
    "Notícias e análises de informática e tecnologia, com publicações automáticas e curadoria por IA. Conteúdo otimizado para SEO e com links diretos para ofertas do Balão da Informática.",
  metadataBase: getMetadataBase(),
  alternates: {
    canonical: "/blog",
  },
};

export const runtime = "nodejs";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-neutral-100 text-neutral-900">
      <header className="bg-neutral-950 text-white">
        <div className="border-b border-white/10">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs font-semibold text-neutral-300">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e41e26]" />
                Ao vivo
              </span>
              <span className="hidden sm:inline">Notícias de tecnologia e ofertas</span>
            </div>
            <div className="flex items-center gap-2">
              <a href="/blog/feed.xml" className="hover:text-white">
                RSS
              </a>
              <span className="text-white/20">•</span>
              <a href="https://wa.me/5519987510267" className="hover:text-white" target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/blog" className="flex items-center gap-3">
            <Image src="/logo.png" alt="BalãoNews" width={210} height={44} priority className="h-8 w-auto" />
            <span className="hidden text-xs font-semibold text-neutral-300 sm:inline">
              Informática • Hardware • Games • Ofertas
            </span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-extrabold tracking-tight text-neutral-200 md:flex">
            <Link href="/blog" className="hover:text-white">
              Início
            </Link>
            <Link href={{ pathname: "/blog", query: { cat: "Hardware" } }} className="hover:text-white">
              Hardware
            </Link>
            <Link href={{ pathname: "/blog", query: { cat: "Games" } }} className="hover:text-white">
              Games
            </Link>
            <Link href={{ pathname: "/blog", query: { cat: "Mobile" } }} className="hover:text-white">
              Mobile
            </Link>
            <Link href={{ pathname: "/blog", query: { cat: "Segurança" } }} className="hover:text-white">
              Segurança
            </Link>
            <Link href={{ pathname: "/blog", query: { cat: "IA" } }} className="hover:text-white">
              IA
            </Link>
            <Link href="/" className="hover:text-white">
              Loja
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15">
              Ir para Loja
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10 bg-neutral-950">
          <div className="mx-auto w-full max-w-7xl px-4">
            <div className="h-1 w-full bg-[#e41e26]" />
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-neutral-300 md:hidden">
              <Link href="/blog" className="hover:text-white">
                Início
              </Link>
              <Link href={{ pathname: "/blog", query: { cat: "Hardware" } }} className="hover:text-white">
                Hardware
              </Link>
              <Link href={{ pathname: "/blog", query: { cat: "Games" } }} className="hover:text-white">
                Games
              </Link>
              <Link href={{ pathname: "/blog", query: { cat: "Mobile" } }} className="hover:text-white">
                Mobile
              </Link>
              <Link href={{ pathname: "/blog", query: { cat: "Segurança" } }} className="hover:text-white">
                Segurança
              </Link>
              <Link href={{ pathname: "/blog", query: { cat: "IA" } }} className="hover:text-white">
                IA
              </Link>
              <Link href="/" className="hover:text-white">
                Loja
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 text-xs text-neutral-600">
          Conteúdo automatizado a partir de fontes públicas (RSS/URLs) com reescrita por IA. Links
          originais são mantidos como referência. Atendimento: WhatsApp 19 98751-0267.
        </div>
      </footer>
    </div>
  );
}
