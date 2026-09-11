import type { Metadata } from "next";

// Metadados desta rota.
//
// A página é um componente de cliente ("use client"), e componente de cliente
// não pode exportar `metadata` — por isso o layout. Sem isto, ela herdava o
// título genérico do site: dez páginas apareciam iguais no Google, competindo
// entre si pelo mesmo resultado.
export const metadata: Metadata = {
  title: "Cancelar Inscrição | Balão da Informática",
  description: "Cancelamento de recebimento de e-mails do Balão da Informática.",
  alternates: { canonical: "https://www.balao.info/unsubscribe" },
  // Página de uso pontual: não deve disputar espaço no Google.
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
