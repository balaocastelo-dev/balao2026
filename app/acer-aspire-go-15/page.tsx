import type { Metadata } from "next";

import AcerAspireGo15Landing from "./AcerAspireGo15Landing";
import { PARCELAS, PRECO, VALOR_DA_PARCELA } from "./dados";

const canonical = "https://www.balao.info/acer-aspire-go-15";
const imagem = "https://www.balao.info/images/acer-aspire-go-15/acer-aspire-go-15-og.jpg";
const preco = PRECO.toLocaleString("pt-BR");
const parcela = VALOR_DA_PARCELA.toLocaleString("pt-BR");

export const metadata: Metadata = {
  title: `Notebook Acer Aspire Go 15 i5 13ª geração, 8GB, SSD 256GB em Campinas | R$ ${preco}`,
  description: `Notebook Acer Aspire Go 15 novo e lacrado, com Intel Core i5 de 13ª geração, 8GB DDR5, SSD de 256GB, tela 15,6" Full HD e teclado numérico por R$ ${preco} à vista ou ${PARCELAS}x de R$ ${parcela}, com 1 ano de garantia do fabricante. Na vitrine da Balão da Informática, no Cambuí, em Campinas.`,
  keywords: [
    "acer aspire go 15",
    "acer aspire go 15 campinas",
    "notebook acer campinas",
    "notebook i5 13a geracao",
    "notebook 8gb ddr5 ssd 256gb",
    "notebook novo lacrado campinas",
    "notebook para estudar e trabalhar",
    "balão da informática",
  ],
  alternates: { canonical },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: canonical,
    siteName: "Balão da Informática",
    title: `Acer Aspire Go 15 · i5 13ª geração · 8GB · SSD 256GB | R$ ${preco}`,
    description: `Novo e lacrado, na vitrine da Balão, em Campinas. R$ ${preco} à vista ou ${PARCELAS}x de R$ ${parcela} no cartão, com 1 ano de garantia do fabricante.`,
    images: [{ url: imagem, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Acer Aspire Go 15 | R$ ${preco} | Balão da Informática`,
    description:
      "Intel Core i5 de 13ª geração, 8GB DDR5, SSD de 256GB, tela 15,6\" Full HD e teclado numérico. Novo lacrado, 1 ano de garantia.",
    images: [imagem],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "@id": `${canonical}#produto`,
      name: "Notebook Acer Aspire Go 15 — Intel Core i5 13ª geração, 8GB DDR5, SSD 256GB",
      description:
        "Notebook Acer Aspire Go 15 novo e lacrado, com processador Intel Core i5 de 13ª geração, 8GB de memória DDR5, SSD de 256GB, tela de 15,6 polegadas Full HD e teclado com bloco numérico.",
      brand: { "@type": "Brand", name: "Acer" },
      image: imagem,
      sku: "ACER-ASPIRE-GO-15-I5-8GB-256GB",
      itemCondition: "https://schema.org/NewCondition",
      offers: {
        "@type": "Offer",
        url: canonical,
        priceCurrency: "BRL",
        price: PRECO.toFixed(2),
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: {
          "@type": "ComputerStore",
          name: "Balão da Informática",
          url: "https://www.balao.info",
          telephone: "+5519987510267",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Av. Anchieta, 789",
            addressLocality: "Campinas",
            addressRegion: "SP",
            addressCountry: "BR",
          },
        },
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Balão da Informática", item: "https://www.balao.info" },
        { "@type": "ListItem", position: 2, name: "Acer Aspire Go 15", item: canonical },
      ],
    },
  ],
};

export default function AcerAspireGo15Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AcerAspireGo15Landing />
    </>
  );
}
