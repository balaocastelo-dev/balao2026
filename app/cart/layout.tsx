import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Carrinho | Balão da Informática" },
  robots: { index: false, follow: false },
};

export default function LayoutDoCarrinho({ children }: { children: React.ReactNode }) {
  return children;
}
