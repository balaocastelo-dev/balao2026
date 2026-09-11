import type { Metadata } from "next";

// Metadados desta rota.
//
// A página é um componente de cliente ("use client"), e componente de cliente
// não pode exportar `metadata` — por isso o layout. Sem isto, ela herdava o
// título genérico do site: dez páginas apareciam iguais no Google, competindo
// entre si pelo mesmo resultado.
export const metadata: Metadata = {
  title: "Roleta de Prêmios | Clube de Vantagens | Balão da Informática",
  description: "Gire a roleta do Clube de Vantagens do Balão da Informática e ganhe descontos na hora.",
  alternates: { canonical: "https://www.balao.info/roleta" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
