import type { Metadata } from "next";

import ControleClient from "@/components/controle/ControleClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Controle de Pecas",
  description:
    "Controle de pecas da assistencia tecnica com retirada autorizada e recibo em PDF.",
};

export default function ControlePage() {
  return <ControleClient />;
}
