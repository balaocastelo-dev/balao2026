import type { Metadata } from "next";
import PaginaVendedor from "@/components/vendedor/PaginaVendedor";
import { resolverVendedor } from "@/lib/vendedor-pagina";

// Slug que não é vendedor cai no 404 normal (notFound). As rotas com
// pasta própria — /iphone, /painel, /macbook… — nem chegam aqui: o
// Next entrega a página delas, com o SEO que já têm.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vendedor = await resolverVendedor(slug);
  if (!vendedor) {
    return {
      title: { absolute: "Página não encontrada" },
      robots: { index: false, follow: false },
    };
  }
  return {
    title: { absolute: `${vendedor.nome} | Atendimento` },
    description: "Área interna de atendimento do WhatsApp.",
    robots: { index: false, follow: false },
  };
}

export default async function PaginaPorSlug({ params }: Props) {
  const { slug } = await params;
  return <PaginaVendedor slug={slug} />;
}
