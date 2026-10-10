import type { Metadata } from "next";
import { AreaAtendimento } from "@/components/painel/AreasDoCrm";

export const metadata: Metadata = {
  title: "Números do atendimento",
};

export default function PainelAtendimentoPage() {
  return <AreaAtendimento />;
}
