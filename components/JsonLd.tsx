import { getProductHref, parsePriceToNumber, Product } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export default function JsonLd({ data }: JsonLdProps) {
  const finalData = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : data;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(finalData) }}
    />
  );
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["ComputerStore", "Store", "LocalBusiness"],
    "@id": "https://www.balao.info/#organization",
    name: SITE_CONFIG.name,
    legalName: "Balão da Informática Comércio de Informática Ltda",
    url: "https://www.balao.info",
    logo: "https://www.balao.info/logo.png",
    image: "https://www.balao.info/logo.png",
    telephone: `+${SITE_CONFIG.phone.number}`,
    email: SITE_CONFIG.email,
    priceRange: "$$",
    paymentAccepted: ["Pix", "Cartão de Crédito", "Boleto", "Dinheiro"],
    currenciesAccepted: "BRL",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address,
      addressLocality: "Campinas",
      addressRegion: "SP",
      postalCode: SITE_CONFIG.postalCode,
      addressCountry: "BR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -22.9099,
      longitude: -47.0626,
    },
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
      { "@type": "City", name: "Campinas" },
      { "@type": "City", name: "Sumaré" },
      { "@type": "City", name: "Hortolândia" },
      { "@type": "City", name: "Paulínia" },
      { "@type": "City", name: "Valinhos" },
      { "@type": "City", name: "Vinhedo" },
      { "@type": "City", name: "Indaiatuba" },
      { "@type": "City", name: "Americana" },
      { "@type": "Country", name: "Brasil" }
    ],
    sameAs: [SITE_CONFIG.social.instagram, SITE_CONFIG.social.facebook],
  };
}

export function generateHomeAiAndGoogleSchema() {
  return [
    {
      "@type": "WebSite",
      "@id": "https://www.balao.info/#website",
      url: "https://www.balao.info",
      name: "Balão da Informática",
      description: "Loja de Informática, PC Gamer, Notebooks e Assistência Técnica em Campinas",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://www.balao.info/?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    generateOrganizationSchema(),
    {
      "@type": "FAQPage",
      "@id": "https://www.balao.info/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "Onde comprar PC Gamer e peças de informática em Campinas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Na Balão da Informática Castelo no Cambuí em Campinas. Oferecemos computadores montados, placas de vídeo RTX/Radeon, processadores Intel/Ryzen, SSDs e periféricos com pronta entrega, desconto de 10% no PIX ou até 10x sem juros e retirada no balcão em até 30 minutos."
          }
        },
        {
          "@type": "Question",
          name: "Como funciona o pagamento com desconto no PIX e parcelamento no cartão?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Todos os produtos contam com desconto progressivo para pagamento à vista no PIX (cerca de 10% OFF) ou podem ser parcelados em até 10x sem juros no cartão de crédito diretamente pelo site ou no balcão da loja física."
          }
        },
        {
          "@type": "Question",
          name: "A Balão da Informática realiza manutenção, upgrade e assistência técnica em Campinas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sim! Contamos com bancada técnica própria para diagnóstico rápido, conserto de notebooks, montagem de PC Gamer sob medida, troca de peças, limpeza e manutenção com garantia de serviço."
          }
        },
        {
          "@type": "Question",
          name: "Posso retirar meu pedido no balcão da loja física hoje mesmo?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sim, ao comprar pelo site ou solicitar pelo WhatsApp, seu pedido pode ser preparado para retirada imediata no balcão no bairro Cambuí em Campinas."
          }
        }
      ]
    }
  ];
}

export function generateProductSchema(product: Product) {
  const priceNumber = parsePriceToNumber(product.price);
  const price = Number.isFinite(priceNumber) ? priceNumber.toFixed(2) : undefined;
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const productUrl = `https://www.balao.info${getProductHref(product)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image,
    description: product.description || `Comprar ${product.name} em Campinas. ${product.category}`,
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.name,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "BRL",
      ...(price ? { price } : {}),
      priceValidUntil,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": "https://www.balao.info/#organization" },
    },
  };
}

export function generateItemListSchema(products: Product[], url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://www.balao.info${getProductHref(product)}`,
      name: product.name,
    })),
    url,
    numberOfItems: products.length,
  };
}

export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateServiceSchema({
  name,
  description,
  url,
  serviceType,
  areaServed = ["Campinas", "Sumaré", "Hortolândia", "Paulínia", "Valinhos", "Vinhedo", "Brasil"],
}: {
  name: string;
  description: string;
  url: string;
  serviceType: string;
  areaServed?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType,
    url,
    areaServed,
    provider: {
      "@id": "https://www.balao.info/#organization",
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: url,
      servicePhone: `+${SITE_CONFIG.phone.number}`,
    },
  };
}
