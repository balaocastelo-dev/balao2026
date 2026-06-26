import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Bangers } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
});
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import VisitorTracker from "@/components/VisitorTracker";
import GlobalConversionTracker from "@/components/GlobalConversionTracker";

import { getCategories } from "@/lib/db";
import type { Category } from "@/lib/utils";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E60012",
};

function getMetadataBase() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://www.balao.info";
  if (url.startsWith("http")) return new URL(url);
  return new URL(`https://${url}`);
}

export const metadata: Metadata = {
  title: {
    template: "%s | Balão da Informática Castelo",
    default:
      "Balão da Informática Castelo | Loja de Informática em Campinas – Av. Anchieta, 789",
  },
  description:
    "Loja de informática completa com entrega rápida para Campinas, Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo e todo o Brasil. PCs Gamer, notebooks, hardware, periféricos e assistência técnica especializada.",
  metadataBase: getMetadataBase(),
  keywords: [
    "loja de informática",
    "balão da informática castelo",
    "loja de informática campinas",
    "pc gamer campinas",
    "notebook campinas",
    "hardware campinas",
    "assistência técnica informática campinas",
    "assistência técnica notebook campinas",
    "manutenção notebook campinas",
    "montagem pc gamer campinas",
    "av anchieta 789 campinas",
    "loja de computadores cambuí campinas",
    "balao da informatica",
    "entrega rápida campinas",
  ],
  authors: [{ name: "Balão da Informática" }],
  creator: "Balão da Informática",
  publisher: "Balão da Informática",
  robots: {
    index: true,
    follow: true,
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
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Balão da Informática | Loja de Informática com Entrega Rápida em Campinas e Região",
    description:
      "Loja de informática em Campinas com foco em PCs Gamer, notebooks e hardware, entrega rápida na região de Campinas e envio para todo o Brasil.",
    images: ["/logo.png"],
  },
};

import { SITE_CONFIG } from "@/lib/config";
import { BUSINESS_INFO } from "@/lib/business-info";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["ComputerStore", "Store", "LocalBusiness"],
      "@id": "https://www.balao.info/#store",
      name: BUSINESS_INFO.name,
      legalName: BUSINESS_INFO.legalName,
      taxID: BUSINESS_INFO.cnpj,
      image: "https://www.balao.info/logo.png",
      description:
        "Loja de informática em Campinas especializada em computadores, PC Gamer, notebooks, hardware e periféricos, com entrega rápida para Campinas e região.",
      address: {
        "@type": "PostalAddress",
        streetAddress: BUSINESS_INFO.streetAddress,
        addressLocality: BUSINESS_INFO.city,
        addressRegion: BUSINESS_INFO.state,
        postalCode: BUSINESS_INFO.postalCode,
        addressCountry: BUSINESS_INFO.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -22.9099,
        longitude: -47.0626,
      },
      url: "https://www.balao.info",
      telephone: BUSINESS_INFO.phone.e164,
      email: BUSINESS_INFO.email,
      priceRange: "$$",
      openingHours: BUSINESS_INFO.openingHours.iso,
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "18:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Saturday",
          opens: "08:00",
          closes: "13:00",
        },
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: BUSINESS_INFO.whatsapp.e164,
          contactType: "customer service",
          availableLanguage: "Portuguese",
          areaServed: "Campinas e Região Metropolitana de Campinas",
          contactOption: "TollFree",
          hoursAvailable: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
            opens: "00:00",
            closes: "23:59",
          },
        },
        {
          "@type": "ContactPoint",
          telephone: BUSINESS_INFO.phone.e164,
          contactType: "customer service",
          availableLanguage: "Portuguese",
          areaServed: "Campinas e Região Metropolitana de Campinas",
        },
      ],
      areaServed: BUSINESS_INFO.areaServed,
      sameAs: [BUSINESS_INFO.social.instagram, BUSINESS_INFO.social.facebook],
      makesOffer: {
        "@type": "OfferCatalog",
        name: "Informática e Tecnologia",
        itemListElement: [
          { "@type": "Offer", name: "PC Gamer", category: "Computadores" },
          { "@type": "Offer", name: "Notebooks", category: "Informática" },
          { "@type": "Offer", name: "Assistência Técnica", category: "Serviços" },
          { "@type": "Offer", name: "Periféricos e Acessórios", category: "Informática" },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.balao.info/#website",
      url: "https://www.balao.info",
      name: BUSINESS_INFO.name,
      publisher: { "@id": "https://www.balao.info/#store" },
      inLanguage: "pt-BR",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.balao.info/?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

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
        {gtmId && (
          <>
            <Script
              id="gtm-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${gtmId}');
                `,
              }}
            />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        )}

        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="ga-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', { send_page_view: true });
                `,
              }}
            />
          </>
        )}

        {metaPixelId && (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${metaPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}

        <VisitorTracker />
        <Suspense fallback={null}>
          <GlobalConversionTracker />
        </Suspense>
        <CartProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <LayoutWrapper categories={categories}>
                {children}
              </LayoutWrapper>
            </Suspense>
          </ToastProvider>
        </CartProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
