import { Metadata } from "next";
import {
  Activity,
  AlertTriangle,
  Box,
  Cpu,
  HardDrive,
  ShieldCheck,
  Zap,
} from "lucide-react";
import AppleServicePage from "@/components/AppleServicePage";
import { SITE_CONFIG } from "@/lib/config";

const WHATSAPP_LINK =
  "https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20assist%C3%AAncia%20t%C3%A9cnica%20para%20Mac%20Mini%20em%20Campinas!";

export const metadata: Metadata = {
  title: "Assistência Mac Mini em Campinas | Upgrade e Reparo",
  description:
    "Assistência técnica especializada em Mac Mini em Campinas. Upgrade de SSD, memória, reparo de placa e manutenção com atendimento no Cambuí e região.",
  keywords: [
    "assistência mac mini campinas",
    "reparo mac mini campinas",
    "upgrade mac mini campinas",
    "manutenção mac mini cambuí",
    "troca ssd mac mini",
    "troca memória mac mini",
  ],
  alternates: { canonical: "https://www.balao.info/wendell/apple/mac-mini" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/wendell/apple/mac-mini",
    title: "Assistência Mac Mini em Campinas | Upgrade e Reparo",
    description:
      "Mac Mini com defeito, lentidão ou falhas? Fazemos upgrade, manutenção e reparo técnico em Campinas.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/apple/subcategories/macmini-card.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistência Mac Mini em Campinas | Upgrade e Reparo",
    description:
      "Mac Mini com defeito, lentidão ou falhas? Fazemos upgrade, manutenção e reparo técnico em Campinas.",
    images: ["/images/apple/subcategories/macmini-card.png"],
  },
};

export default function MacMiniPage() {
  return (
    <AppleServicePage
      backHref="/wendell/apple"
      backLabel="Voltar para Especialista Apple"
      badgeIcon={Box}
      badgeLabel="Assistência especializada para Mac Mini"
      title="Assistência para"
      highlightedWord="Mac Mini"
      description="Seu Mac Mini pode ganhar mais velocidade e estabilidade com um atendimento técnico certo. Realizamos upgrades, reparos avançados e manutenção preventiva para clientes de Campinas, especialmente Cambuí e bairros vizinhos."
      heroImageSrc="/images/apple/subcategories/macmini-card.png"
      heroImageAlt="Assistência técnica Mac Mini em Campinas"
      heroCaption="Upgrade, limpeza e reparo eletrônico para recuperar desempenho"
      whatsappHref={WHATSAPP_LINK}
      theme={{
        badge: "border-blue-100 bg-blue-50 text-blue-700",
        button: "bg-blue-600 text-white hover:bg-blue-700",
        buttonSoft: "border border-blue-200 bg-white text-blue-700 hover:bg-blue-50",
        iconWrap: "bg-blue-50",
        icon: "text-blue-600",
        ctaBg: "bg-gradient-to-r from-blue-600 to-blue-700",
        ctaButtonText: "text-blue-700",
      }}
      highlights={[
        {
          title: "Reparo de placa para Mac Mini",
          description:
            "Quando o equipamento não liga ou apresenta falhas graves, fazemos diagnóstico técnico e reparo avançado.",
          imageSrc: "/images/apple/macmini-placa.png",
          imageAlt: "Reparo de placa de Mac Mini",
        },
        {
          title: "Upgrade de hardware para mais velocidade",
          description:
            "Atualizações estratégicas deixam o Mac Mini mais rápido para trabalho, estudo e uso profissional.",
          imageSrc: "/images/apple/macmini-upgrade.png",
          imageAlt: "Upgrade de hardware Mac Mini",
        },
        {
          title: "Limpeza interna e manutenção preventiva",
          description:
            "Reduzimos aquecimento, ruídos e perda de desempenho com manutenção interna completa.",
          imageSrc: "/images/apple/macmini-limpeza.png",
          imageAlt: "Limpeza interna de Mac Mini",
        },
      ]}
      services={[
        {
          icon: HardDrive,
          title: "Upgrade de SSD",
          description: "Mais velocidade de sistema, aplicativos e abertura de arquivos.",
        },
        {
          icon: Cpu,
          title: "Upgrade de memória",
          description: "Melhore multitarefa e desempenho para tarefas mais exigentes.",
        },
        {
          icon: Zap,
          title: "Fonte e energia",
          description: "Tratamos falhas de alimentação, desligamentos e instabilidades.",
        },
        {
          icon: Activity,
          title: "Reparo de placa",
          description: "Análise técnica para Mac Mini sem vídeo, sem ligar ou travando.",
        },
        {
          icon: ShieldCheck,
          title: "Manutenção preventiva",
          description: "Troca de pasta térmica, limpeza e revisão geral do equipamento.",
        },
        {
          icon: AlertTriangle,
          title: "Problemas diversos",
          description: "Lentidão, superaquecimento, ruídos e falhas intermitentes.",
        },
      ]}
      localTitle="Mac Mini com suporte rápido em Campinas"
      localDescription="Atendemos clientes do Cambuí, Centro, Guanabara, Taquaral, Nova Campinas e arredores com foco em agilidade e orientação clara para cada defeito."
      ctaTitle="Quer deixar seu Mac Mini mais rápido ou consertar uma falha?"
      ctaDescription="Mande seu modelo e o sintoma no WhatsApp para receber uma orientação inicial e agilizar o atendimento."
    />
  );
}
