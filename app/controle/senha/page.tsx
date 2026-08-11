import type { Metadata } from "next";

import ControleSenhaClient from "@/components/controle/ControleSenhaClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Senha do Controle",
  description:
    "Pagina protegida para consultar a senha dinamica de retirada de pecas.",
};

export default function ControleSenhaPage() {
  return <ControleSenhaClient />;
}
