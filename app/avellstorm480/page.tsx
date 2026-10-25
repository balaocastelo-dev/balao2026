import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import AvellStorm480Landing from "./AvellStorm480Landing";
import { PRECO, VALOR_DA_NOTA_FISCAL } from "./dados";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-luxo-serif",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-luxo-sans",
  display: "swap",
});

const canonical = "https://www.balao.info/avellstorm480";
const imagem = "https://www.balao.info/images/avell-storm-480/avell-storm-480-og.jpg";
const preco = PRECO.toLocaleString("pt-BR");

export const metadata: Metadata = {
  title: `Avell Storm 480 i9 14ª geração, 64GB, RTX 4080 em Campinas | R$ ${preco}`,
  description: `Notebook gamer Avell Storm 480 com Intel Core i9-14900HX, 64GB DDR5, SSD NVMe de 1TB, RTX 4080 de 12GB e tela de 17" QHD 240 Hz por R$ ${preco}, com 1 ano de garantia. Na vitrine da Balão da Informática, no Cambuí, em Campinas.`,
  keywords: [
    "avell storm 480",
    "avell storm 480 campinas",
    "notebook avell campinas",
    "notebook gamer i9 14900hx",
    "notebook rtx 4080 12gb",
    "notebook 64gb ddr5",
    "notebook gamer campinas",
    "notebook para ia local",
    "balão da informática",
  ],
  alternates: { canonical },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: canonical,
    siteName: "Balão da Informática",
    title: `Avell Storm 480 · i9 14ª geração · 64GB · RTX 4080 | R$ ${preco}`,
    description: `Unidade única na vitrine da Balão, em Campinas. Na nota fiscal R$ ${VALOR_DA_NOTA_FISCAL.toLocaleString("pt-BR")}; aqui, R$ ${preco} com 1 ano de garantia.`,
    images: [{ url: imagem, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Avell Storm 480 | R$ ${preco} | Balão da Informática`,
    description: "i9-14900HX, 64GB DDR5, SSD 1TB, RTX 4080 12GB, tela 17\" 240 Hz. 1 ano de garantia.",
    images: [imagem],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "@id": `${canonical}#produto`,
      name: "Notebook gamer Avell Storm 480 — i9-14900HX, 64GB DDR5, SSD 1TB, RTX 4080 12GB",
      description:
        "Notebook gamer Avell Storm 480 com Intel Core i9-14900HX (14ª geração), 64GB de memória DDR5, SSD NVMe de 1TB, NVIDIA GeForce RTX 4080 de 12GB e tela de 17 polegadas QHD de 240 Hz.",
      brand: { "@type": "Brand", name: "Avell" },
      image: imagem,
      sku: "AVELL-STORM-480-I9-64GB-1TB-RTX4080",
      offers: {
        "@type": "Offer",
        url: canonical,
        priceCurrency: "BRL",
        price: PRECO.toFixed(2),
        availability: "https://schema.org/InStock",
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
        { "@type": "ListItem", position: 2, name: "Avell Storm 480", item: canonical },
      ],
    },
  ],
};

export default function AvellStorm480Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AvellStorm480Landing classeFontes={`${serif.variable} ${sans.variable}`} />
    </>
  );
}
