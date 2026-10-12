import type { Metadata } from "next";
import { estadoDoTelao } from "@/lib/arena/estado";
import Telao from "./Telao";

export const metadata: Metadata = {
  title: "Arena de vendas",
  robots: { index: false, follow: false },
};

// Muda a cada venda: o estado vem do cache de 20 s (lib/arena/estado.ts).
export const dynamic = "force-dynamic";

/** O telão da loja: a corrida de vendas, ligada ao Bling pelo vigia do PC. */
export default async function ArenaPage() {
  const estado = await estadoDoTelao();
  return <Telao inicial={estado} />;
}
