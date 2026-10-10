import type { Metadata } from "next";
import FechamentoClient from "@/components/fechamento/FechamentoClient";

export const metadata: Metadata = {
  title: "Fechamento da assistência",
};

/**
 * O fechamento da semana, dentro do painel. É a mesma tela de /fechamento —
 * aqui ela reconhece a sessão do painel e não pede a senha do dia.
 */
export default function PainelFechamentoPage() {
  return <FechamentoClient />;
}
