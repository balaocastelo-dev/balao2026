import type { Metadata } from "next";
import { estadoDoTelao } from "@/lib/arena/estado";
import PaginaDoPiloto from "./PaginaDoPiloto";

// Página de cada vendedor na Arena: quanto falta para a linha de chegada.
// Pública como o telão (sem cliente e sem reais), feita para o celular.

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ piloto: string }> }): Promise<Metadata> {
  const { piloto } = await params;
  const estado = await estadoDoTelao();
  const l = estado?.semana.linhas.find((x) => x.piloto.slug === piloto);
  const nome = l ? l.piloto.apelido || l.piloto.nome : "Piloto";
  return {
    title: `${nome} na Arena`,
    robots: { index: false, follow: false },
  };
}

export default async function Pagina({ params }: { params: Promise<{ piloto: string }> }) {
  const { piloto } = await params;
  const estado = await estadoDoTelao();
  return <PaginaDoPiloto slug={String(piloto).slice(0, 60)} inicial={estado} />;
}
