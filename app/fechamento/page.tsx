import type { Metadata } from "next";
import FechamentoClient from "@/components/fechamento/FechamentoClient";

export const metadata: Metadata = {
  title: "Fechamento da assistência",
  robots: { index: false, follow: false },
};

/**
 * A porta do balcão para o fechamento da semana: quem usa é o pessoal da
 * assistência, com a senha do dia. A mesma tela abre dentro do painel, em
 * /painel/fechamento, para quem já entrou com a senha do painel.
 */
export default function FechamentoPage() {
  return <FechamentoClient />;
}
