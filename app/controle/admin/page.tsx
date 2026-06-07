import type { Metadata } from "next";

import ControleAdminClient from "@/components/controle/ControleAdminClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Controle Admin",
  description:
    "Painel administrativo do controle de pecas da assistencia tecnica.",
};

export default function ControleAdminPage() {
  return <ControleAdminClient />;
}
