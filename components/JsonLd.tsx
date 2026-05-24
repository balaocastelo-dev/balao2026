import { parsePriceToNumber, Product } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";

type JsonLdProps = {
  data: Record<string, any> | Record<string, any>[];
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
    url: "https://www.balao.info",
    image: "https://www.balao.info/logo.png",
    telephone: `+${SITE_CONFIG.phone.number}`,
    email: SITE_CONFIG.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address,
      addressLocality: "Campinas",
      addressRegion: "SP",
      postalCode: "13025-000",
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
    areaServed: ["Campinas", "Sumaré", "Hortolândia", "Paulínia", "Valinhos", "Vinhedo", "Brasil"],
    sameAs: [SITE_CONFIG.social.instagram, SITE_CONFIG.social.facebook],
  };
}

export function generateProductSchema(product: Product) {
  const priceNumber = parsePriceToNumber(product.price);
  const price = Number.isFinite(priceNumber) ? priceNumber.toFixed(2) : undefined;
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
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
      url: `https://www.balao.info/product/${product.slug || product.id}`,
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
      url: `https://www.balao.info/product/${product.slug || product.id}`,
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
