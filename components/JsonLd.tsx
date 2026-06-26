import { getProductHref, parsePriceToNumber, Product } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";
import { BUSINESS_INFO } from "@/lib/business-info";

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
    name: BUSINESS_INFO.name,
    legalName: BUSINESS_INFO.legalName,
    taxID: BUSINESS_INFO.cnpj,
    url: "https://www.balao.info",
    image: "https://www.balao.info/logo.png",
    telephone: BUSINESS_INFO.phone.e164,
    email: BUSINESS_INFO.email,
    priceRange: "$$",
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
  };
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
    description: `Comprar ${product.name} em Campinas. ${product.category}`,
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
