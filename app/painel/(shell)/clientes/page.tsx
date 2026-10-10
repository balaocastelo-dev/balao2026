import type { Metadata } from "next";
import { AreaClientes } from "@/components/painel/AreasDoCrm";

export const metadata: Metadata = {
  title: "Clientes",
};

export default async function PainelClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ segmento?: string | string[] }>;
}) {
  const { segmento } = await searchParams;
  return <AreaClientes segmento={typeof segmento === "string" ? segmento : undefined} />;
}
