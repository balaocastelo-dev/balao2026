import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Bangers } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import VisitorTracker from "@/components/VisitorTracker";
import GlobalConversionTracker from "@/components/GlobalConversionTracker";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { getCategories } from "@/lib/db";
import type { Category } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
});

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
    template: "%s | Balão da Informática",
    default:
      "Balão da Informática | Loja de Informática em Campinas com WhatsApp Rápido",
  },
  description:
    "Loja de informática em Campinas com loja física no Cambuí. PCs Gamer, notebooks, peças, upgrades, periféricos e assistência técnica com atendimento pelo WhatsApp, retirada e entrega rápida na região.",
  metadataBase: getMetadataBase(),
  keywords: [
    "loja de informática campinas",
    "informática campinas",
    "pc gamer campinas",
    "notebook campinas",
    "assistência técnica informática campinas",
    "manutenção de notebook campinas",
    "montagem de pc gamer campinas",
    "hardware campinas",
    "loja de computadores cambuí",
    "balão da informática castelo",
    "balão da informática",
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
      "Balão da Informática | Loja de Informática em Campinas com WhatsApp Rápido",
    description:
      "Loja física em Campinas para PC Gamer, notebooks, peças, upgrades e assistência técnica. Consulte estoque pelo WhatsApp e retire no Cambuí.",
    siteName: "Balão da Informática",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Balão da Informática | Loja de Informática em Campinas com WhatsApp Rápido",
    description:
      "Loja física em Campinas para PC Gamer, notebooks, peças, upgrades e assistência técnica. Consulte estoque pelo WhatsApp e retire no Cambuí.",
    images: ["/logo.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["ComputerStore", "Store", "LocalBusiness"],
      "@id": "https://www.balao.info/#store",
      name: SITE_CONFIG.name,
      image: "https://www.balao.info/logo.png",
      description:
        "Loja de informática em Campinas especializada em computadores, PC Gamer, notebooks, hardware, periféricos e assistência técnica, com atendimento pelo WhatsApp e retirada na loja física.",
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE_CONFIG.address,
        addressLocality: SITE_CONFIG.city,
        addressRegion: SITE_CONFIG.region,
        postalCode: SITE_CONFIG.postalCode || undefined,
        addressCountry: "BR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -22.9099,
        longitude: -47.0626,
      },
      url: "https://www.balao.info",
      telephone: `+${SITE_CONFIG.phone.number}`,
      email: SITE_CONFIG.email,
      priceRange: "$$",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Saturday",
          opens: "09:00",
          closes: "13:00",
        },
      ],
      areaServed: [
        {
          "@type": "City",
          name: "Campinas",
          containedInPlace: { "@type": "State", name: "São Paulo" },
        },
        { "@type": "City", name: "Sumaré" },
        { "@type": "City", name: "Hortolândia" },
        { "@type": "City", name: "Paulínia" },
        { "@type": "City", name: "Valinhos" },
        { "@type": "City", name: "Vinhedo" },
        { "@type": "City", name: "Indaiatuba" },
        { "@type": "City", name: "Jaguariúna" },
      ],
      sameAs: [SITE_CONFIG.social.instagram, SITE_CONFIG.social.facebook],
      makesOffer: {
        "@type": "OfferCatalog",
        name: "Informática e Tecnologia",
        itemListElement: [
          { "@type": "Offer", name: "PC Gamer", category: "Computadores" },
          { "@type": "Offer", name: "Notebooks", category: "Informática" },
          { "@type": "Offer", name: "Assistência Técnica", category: "Serviços" },
          { "@type": "Offer", name: "Periféricos e Acessórios", category: "Informática" },
          { "@type": "Offer", name: "Reparo Apple", category: "Serviços" },
          { "@type": "Offer", name: "Upgrade de Hardware", category: "Serviços" },
          { "@type": "Offer", name: "Recuperação de Dados", category: "Serviços" },
        ],
      },
      knowsAbout: [
        "PC Gamer",
        "Notebook",
        "Assistência técnica de computadores",
        "Conserto de notebook",
        "Upgrade de SSD e memória",
        "Reparo Apple",
        "iPhone",
        "MacBook",
        "Periféricos gamer",
        "Hardware de computador",
        "Informática Campinas",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.balao.info/#website",
      url: "https://www.balao.info",
      name: SITE_CONFIG.name,
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
  const googleAdsId = "AW-18292094494";
  const googleTagIds = Array.from(
    new Set([gaId, googleAdsId].filter((id): id is string => Boolean(id))),
  );
  const googleTagPrimaryId = googleTagIds[0];
  const themeInitScript = `
    (function() {
      try {
        var saved = localStorage.getItem('balao-home-theme');
        var theme = saved === 'light' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-home-theme', theme);
      } catch (e) {
        document.documentElement.setAttribute('data-home-theme', 'dark');
      }
    })();
  `;
  const googleTagConfigScript = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    ${googleTagIds.map((id) => `gtag('config', '${id}');`).join("\n    ")}
  `;

  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${bangers.variable} antialiased flex flex-col min-h-screen overflow-x-hidden`}
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
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

        {googleTagPrimaryId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${googleTagPrimaryId}`}
            />
            <Script
              id="google-tag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: googleTagConfigScript,
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
              <FloatingWhatsApp />
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
