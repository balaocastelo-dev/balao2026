import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";

function getMetadataBase() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://www.balao.info";
  if (url.startsWith("http")) return new URL(url);
  return new URL(`https://${url}`);
}

export const metadata: Metadata = {
  title: {
    default: "Blog Balão da Informática — Notícias, Guias e Ofertas",
    template: "%s | Blog Balão da Informática",
  },
  description:
    "Notícias de tecnologia, guias de compra e ofertas de informática. Conteúdo atualizado com foco em SEO para quem quer comprar notebook, PC Gamer, hardware e periféricos. Atendimento rápido no WhatsApp.",
  keywords: [
    "loja de informática",
    "informática em Campinas",
    "hardware",
    "notebook",
    "pc gamer",
    "placa de vídeo",
    "ssd",
    "memória ram",
    "periféricos",
    "promoções",
  ],
  metadataBase: getMetadataBase(),
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/blog",
    siteName: SITE_CONFIG.name,
    title: "Blog Balão da Informática — Notícias, Guias e Ofertas",
    description:
      "Notícias de tecnologia, guias de compra e ofertas de informática. Atendimento rápido no WhatsApp.",
    images: [{ url: "/logo.png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const runtime = "nodejs";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
