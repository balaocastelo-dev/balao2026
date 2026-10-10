/**
 * As áreas que usam o monitor inteiro (o atendimento do WhatsApp). Passam pela
 * mesma porta do painel, mas sem o menu ao lado: cada pedaço de tela conta
 * para quem está respondendo cliente. A volta ao painel fica no topo da tela.
 */
export default function PainelTelaCheiaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
