import type { Metadata } from "next";
import { Archivo, Source_Serif_4 } from "next/font/google";
import { SITE_CONFIG } from "@/lib/config";
import "./blog.css";

// Títulos e interface. O eixo de largura (wdth) é o que deixa os títulos um
// pouco expandidos sem carregar uma segunda família.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-blog-titulo",
  display: "swap",
});

// Texto corrido dos artigos.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-blog-texto",
  display: "swap",
});

function baseDoSite() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://www.balao.info";
  return new URL(url.startsWith("http") ? url : `https://${url}`);
}

export const metadata: Metadata = {
  metadataBase: baseDoSite(),
  title: {
    default: "Blog da Balão da Informática: guias, análises e assistência",
    template: "%s | Balão da Informática",
  },
  description:
    "Guias de compra, análises com números de teste e orientação de assistência técnica da Balão da Informática, loja de informática em Campinas.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/blog",
    siteName: SITE_CONFIG.name,
  },
  robots: { index: true, follow: true },
};

export default function LayoutDoBlog({ children }: { children: React.ReactNode }) {
  return <div className={`blog-raiz ${archivo.variable} ${sourceSerif.variable} min-h-screen`}>{children}</div>;
}
