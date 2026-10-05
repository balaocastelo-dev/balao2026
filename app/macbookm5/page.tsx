import type { Metadata } from "next";
import MacBookM5Landing from "./MacBookM5Landing";

const canonical = "https://www.balao.info/macbookm5";

export const metadata: Metadata = {
  title: "MacBook M5 em Campinas por R$ 10.999 | 10x sem juros",
  description:
    "Compre MacBook com chip M5 em Campinas por R$ 10.999 em até 10x sem juros. 6 meses de garantia Apple + 6 meses adicionais da Balão da Informática, completando 1 ano. Atendimento direto no WhatsApp.",
  keywords: [
    "macbook m5 campinas",
    "macbook campinas",
    "comprar macbook m5 campinas",
    "macbook m5 preço campinas",
    "macbook m5 10x sem juros",
    "macbook apple campinas",
    "loja apple campinas",
    "notebook apple campinas",
    "balão da informática macbook",
    "macbook cambuí campinas",
  ],
  alternates: { canonical },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: canonical,
    siteName: "Balão da Informática",
    title: "MacBook M5 em Campinas por R$ 10.999",
    description:
      "Oferta especial: R$ 10.999 em até 10x sem juros, com 1 ano de cobertura total de garantia.",
    images: [{ url: "/images/apple/subcategories/macbook-card.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MacBook M5 em Campinas | Balão da Informática",
    description: "R$ 10.999 em até 10x sem juros. Fale direto com a loja pelo WhatsApp.",
    images: ["/images/apple/subcategories/macbook-card.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "@id": canonical + "#product",
      name: "MacBook com chip M5",
      description:
        "MacBook com chip Apple M5 vendido pela Balão da Informática em Campinas, com atendimento direto pelo WhatsApp.",
      brand: { "@type": "Brand", name: "Apple" },
      image: "https://www.balao.info/images/apple/subcategories/macbook-card.png",
      sku: "MACBOOK-M5-BALAO",
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
          name: "Qual o preço do MacBook M5 na Balão da Informática?",
          acceptedAnswer: { "@type": "Answer", text: "R$ 10.999,00, com opção de pagamento em até 10x sem juros." }
        },
        {
          "@type": "Question",
          name: "Qual a garantia do MacBook M5?",
          acceptedAnswer: { "@type": "Answer", text: "São 6 meses de garantia Apple e mais 6 meses adicionais oferecidos pela Balão da Informática, completando 1 ano de cobertura." }
        },
        {
          "@type": "Question",
          name: "A Balão da Informática atende Campinas?",
          acceptedAnswer: { "@type": "Answer", text: "Sim. A loja atende Campinas e região, com contato comercial direto pelo WhatsApp (19) 98751-0267." }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Balão da Informática", item: "https://www.balao.info" },
        { "@type": "ListItem", position: 2, name: "MacBook M5", item: canonical }
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
