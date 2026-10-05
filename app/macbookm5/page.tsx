import type { Metadata } from "next";
import MacBookM5Landing from "./MacBookM5Landing";

const canonical = "https://www.balao.info/macbookm5";

export const metadata: Metadata = {
  title: "MacBook Pro 2025 M5 16GB 512GB em Campinas | R$ 10.999",
  description:
    "MacBook Pro 2025 com chip M5, 16GB e SSD 512GB por R$ 10.999 em até 10x sem juros na Balão da Informática em Campinas. 6 meses Apple + 6 meses adicionais da loja.",
  keywords: [
    "macbook pro 2025 m5 campinas",
    "macbook pro m5 16gb 512gb",
    "macbook pro m5 campinas",
    "comprar macbook pro m5 campinas",
    "macbook m5 512gb campinas",
    "macbook m5 16gb campinas",
    "macbook pro 2025 preço",
    "macbook pro 10x sem juros",
    "apple campinas",
    "macbook cambuí",
    "balão da informática macbook",
  ],
  alternates: { canonical },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: canonical,
    siteName: "Balão da Informática",
    title: "MacBook Pro 2025 M5 16GB 512GB | R$ 10.999",
    description:
      "Oferta em Campinas: MacBook Pro M5 com 16GB e SSD 512GB por R$ 10.999 em até 10x sem juros.",
    images: [{ url: "/images/apple/subcategories/macbook-card.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MacBook Pro 2025 M5 16GB 512GB | Balão da Informática",
    description:
      "R$ 10.999 em até 10x sem juros. 6 meses Apple + 6 meses Balão.",
    images: ["/images/apple/subcategories/macbook-card.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "@id": canonical + "#product",
      name: "MacBook Pro 2025 M5 16GB 512GB",
      description:
        "MacBook Pro 2025 com chip Apple M5, 16GB de memória e SSD de 512GB vendido pela Balão da Informática em Campinas.",
      brand: { "@type": "Brand", name: "Apple" },
      image: "https://www.balao.info/images/apple/subcategories/macbook-card.png",
      sku: "MACBOOK-PRO-2025-M5-16-512",
      offers: {
        "@type": "Offer",
        url: canonical,
        priceCurrency: "BRL",
        price: "10999.00",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "ComputerStore",
          name: "Balão da Informática",
          url: "https://www.balao.info",
          telephone: "+5519987510267",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Campinas",
            addressRegion: "SP",
            addressCountry: "BR"
          }
        }
      }
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Qual é o preço do MacBook Pro 2025 M5 16GB 512GB?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "R$ 10.999,00, com opção de pagamento em até 10x sem juros."
          }
        },
        {
          "@type": "Question",
          name: "Qual é a configuração do MacBook Pro anunciado?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "MacBook Pro 2025 com chip M5, 16GB de memória e SSD de 512GB."
          }
        },
        {
          "@type": "Question",
          name: "Qual é a garantia do MacBook Pro M5?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "São 6 meses de garantia Apple e mais 6 meses adicionais da Balão da Informática, completando 1 ano de cobertura."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Balão da Informática", item: "https://www.balao.info" },
        { "@type": "ListItem", position: 2, name: "MacBook Pro 2025 M5", item: canonical }
      ]
    }
  ]
};

export default function MacBookM5Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MacBookM5Landing />
    </>
  );
}
