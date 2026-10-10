import type { Metadata } from "next";
import ControleAdminClient from "@/components/controle/ControleAdminClient";

export const metadata: Metadata = {
  title: "Estoque de peças",
};

/**
 * O estoque de peças da assistência, dentro do painel. É a mesma tela de
 * /controle/admin — aqui ela reconhece a sessão do painel e não pede a senha
 * do dia.
 */
export default function PainelControlePage() {
  return <ControleAdminClient />;
}
