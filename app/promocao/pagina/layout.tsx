import type { Metadata } from "next";

// Metadados desta rota.
//
// A página é um componente de cliente ("use client"), e componente de cliente
// não pode exportar `metadata` — por isso o layout. Sem isto, ela herdava o
// título genérico do site: dez páginas apareciam iguais no Google, competindo
// entre si pelo mesmo resultado.
export const metadata: Metadata = {
  title: "PC Gamer e Workstation em Promoção | Balão da Informática",
  description: "Computadores gamer e workstation montados sob medida, com preço de promoção no Balão da Informática.",
  alternates: { canonical: "https://www.balao.info/promocao/pagina" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
