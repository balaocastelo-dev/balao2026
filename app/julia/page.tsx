import type { Metadata } from "next";
import PaginaVendedor from "@/components/vendedor/PaginaVendedor";

export const metadata: Metadata = {
  title: "Atendimento | Balão da Informática",
  description: "Área interna de atendimento do WhatsApp.",
  robots: {
    index: false,
    follow: false,
  },
};

// A sessão vive em cookie, então a página não pode ser cacheada estática.
export const dynamic = "force-dynamic";

export default function JuliaPage() {
  return <PaginaVendedor slug="julia" />;
}
