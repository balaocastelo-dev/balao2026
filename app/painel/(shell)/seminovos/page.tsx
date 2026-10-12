import type { Metadata } from "next";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import PainelSeminovos from "./PainelSeminovos";

export const metadata: Metadata = {
  title: "Seminovos",
};

export const dynamic = "force-dynamic";

/**
 * Vitrine da página /seminovos e os leads que ela capta.
 * Cada aparelho cadastrado aqui aparece na página em segundos, com as fotos tiradas na loja.
 */
export default async function PainelSeminovosPage() {
  // A porta do painel já barra quem não entrou; cada ação confere de novo.
  if (!(await isPainelAuthenticated())) return null;
  return <PainelSeminovos />;
}
