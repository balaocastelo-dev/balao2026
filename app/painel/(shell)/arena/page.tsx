import type { Metadata } from "next";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import PainelArena from "./PainelArena";

export const metadata: Metadata = {
  title: "Arena de vendas",
};

export const dynamic = "force-dynamic";

/**
 * Administração da Arena (a corrida de vendas do telão da loja, em /arena).
 * Pilotos, metas, pontuação, pedidos e orçamentos do Bling, prêmio e o vigia.
 */
export default async function PainelArenaPage() {
  // A porta do painel já barra quem não entrou; cada ação confere de novo.
  if (!(await isPainelAuthenticated())) return null;
  return <PainelArena />;
}
