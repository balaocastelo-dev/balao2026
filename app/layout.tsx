import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Bangers } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
});
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import VisitorTracker from "@/components/VisitorTracker";

import { getCategories } from "@/lib/db";
import type { Category } from "@/lib/utils";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E60012",
};

export const metadata: Metadata = {
  title: {
    template: "%s | Balão da Informática",
    default:
      "Balão da Informática | Loja de Informática com Entrega Rápida em Campinas e Região",
  },
  description:
    "Loja de informática completa com entrega rápida para Campinas, Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo e todo o Brasil. PCs Gamer, notebooks, hardware, periféricos e assistência técnica especializada.",
  keywords: [
    "loja de informática",
    "loja de informática online",
    "informática campinas",
    "pc gamer campinas",
    "pc gamer brasil",
    "computador completo",
    "notebook campinas",
    "hardware campinas",
    "loja de computadores",
    "entrega rápida campinas",
    "entrega rápida região metropolitana de campinas",
    "entrega para todo brasil",
    "assistência técnica informática campinas",
    "balão da informática",
  ],
  authors: [{ name: "Balão da Informática" }],
  creator: "Balão da Informática",
  publisher: "Balão da Informática",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.balao.info",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info",
    title:
      "Balão da Informática | Loja de Informática com Entrega Rápida em Campinas e Região",
    description:
      "Loja de informática em Campinas com foco em PCs Gamer, notebooks e hardware, entrega rápida na região de Campinas e envio para todo o Brasil.",
    siteName: "Balão da Informática",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Balão da Informática",
  "image": "https://www.balao.info/logo.png",
  "description": "Loja de informática em Campinas especializada em computadores, PC Gamer, notebooks, hardware e periféricos, com entrega rápida para Campinas e região.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Avenida Anchieta, 789, Cambuí",
    "addressLocality": "Campinas",
    "addressRegion": "SP",
    "postalCode": "13025-000",
    "addressCountry": "BR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -22.9099,
    "longitude": -47.0626
  },
  "url": "https://www.balao.info",
  "telephone": "+55 19 3255-1661",
  "email": "balaocastelo@balaodainformatica.com.br",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "09:00",
      "closes": "13:00"
    }
  ],
  "priceRange": "$$",
  "areaServed": [
    "Campinas",
    "Sumaré",
    "Hortolândia",
    "Paulínia",
    "Valinhos",
    "Vinhedo",
    "Brasil"
  ],
  "makesOffer": {
    "@type": "OfferCatalog",
    "name": "Informática e Tecnologia",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "PC Gamer",
        "category": "Computadores"
      },
      {
        "@type": "Offer",
        "name": "Notebooks",
        "category": "Informática"
      },
      {
        "@type": "Offer",
        "name": "Periféricos e Acessórios",
        "category": "Informática"
      }
    ]
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <html lang="pt-BR">
      <body
        className={`${bangers.variable} antialiased flex flex-col min-h-screen overflow-x-hidden`}
      >
        <VisitorTracker />
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Suspense>
                <LayoutWrapper categories={categories}>
                  {children}
                </LayoutWrapper>
              </Suspense>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
