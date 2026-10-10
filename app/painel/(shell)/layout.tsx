import PainelShell from "@/components/painel/PainelShell";

/** As áreas que aparecem com o menu do painel ao lado. */
export default function PainelComMenuLayout({ children }: { children: React.ReactNode }) {
  return <PainelShell>{children}</PainelShell>;
}
