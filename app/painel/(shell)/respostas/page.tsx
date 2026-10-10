import type { Metadata } from "next";
import { AreaRespostas } from "@/components/painel/AreasDoCrm";

export const metadata: Metadata = {
  title: "Respostas e etiquetas",
};

export default function PainelRespostasPage() {
  return <AreaRespostas />;
}
