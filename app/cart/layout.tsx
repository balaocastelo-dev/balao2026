import type { Metadata } from "next";

// Metadados desta rota.
//
// A página é um componente de cliente ("use client"), e componente de cliente
// não pode exportar `metadata` — por isso o layout. Sem isto, ela herdava o
// título genérico do site: dez páginas apareciam iguais no Google, competindo
// entre si pelo mesmo resultado.
export const metadata: Metadata = {
  title: "Carrinho de Compras | Balão da Informática",
  description: "Revise os itens do seu carrinho e finalize o pedido pelo WhatsApp com o Balão da Informática.",
  alternates: { canonical: "https://www.balao.info/cart" },
  // Página de uso pontual: não deve disputar espaço no Google.
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
