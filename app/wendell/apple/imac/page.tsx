import { Metadata } from "next";
import {
  Activity,
  AlertTriangle,
  Cpu,
  HardDrive,
  Monitor,
  ShieldCheck,
  Zap,
} from "lucide-react";
import AppleServicePage from "@/components/AppleServicePage";
import { SITE_CONFIG } from "@/lib/config";

const WHATSAPP_LINK =
  "https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20assist%C3%AAncia%20t%C3%A9cnica%20para%20iMac%20em%20Campinas!";

export const metadata: Metadata = {
  title: "Assistência iMac em Campinas | Tela, SSD e Reparo de Placa",
  description:
    "Assistência técnica especializada em iMac em Campinas. Troca de tela, upgrade de SSD, memória e reparo de placa com atendimento no Cambuí e região.",
  keywords: [
    "assistência imac campinas",
    "reparo imac campinas",
    "troca tela imac campinas",
    "upgrade imac cambuí",
    "manutenção imac campinas",
  ],
  alternates: { canonical: "https://www.balao.info/wendell/apple/imac" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/wendell/apple/imac",
    title: "Assistência iMac em Campinas | Tela, SSD e Reparo de Placa",
    description:
      "Seu iMac precisa de reparo, troca de tela ou upgrade? Atendemos Campinas com foco em qualidade e agilidade.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/apple/subcategories/imac-card.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistência iMac em Campinas | Tela, SSD e Reparo de Placa",
    description:
      "Seu iMac precisa de reparo, troca de tela ou upgrade? Atendemos Campinas com foco em qualidade e agilidade.",
    images: ["/images/apple/subcategories/imac-card.png"],
  },
};

export default function IMacPage() {
  return (
    <AppleServicePage
      backHref="/wendell/apple"
      backLabel="Voltar para Especialista Apple"
      badgeIcon={Monitor}
      badgeLabel="Assistência especializada para iMac"
      title="Assistência para"
      highlightedWord="iMac"
      description="Se o seu iMac perdeu desempenho, quebrou a tela ou apresenta falhas técnicas, conte com uma equipe preparada para reparos, upgrades e manutenção completa em Campinas e região."
      heroImageSrc="/images/apple/subcategories/imac-card.png"
      heroImageAlt="Assistência técnica iMac em Campinas"
      heroCaption="Troca de tela, upgrade de SSD e reparo técnico para mais velocidade e desempenho"
      whatsappHref={WHATSAPP_LINK}
      theme={{
        badge: "border-purple-100 bg-purple-50 text-purple-700",
        button: "bg-purple-600 text-white hover:bg-purple-700",
        buttonSoft: "border border-purple-200 bg-white text-purple-700 hover:bg-purple-50",
        iconWrap: "bg-purple-50",
        icon: "text-purple-600",
        ctaBg: "bg-gradient-to-r from-purple-600 to-purple-700",
        ctaButtonText: "text-purple-700",
      }}
      highlights={[
        {
          title: "Reparo de placa lógica para iMac",
          description:
            "Corrigimos falhas eletrônicas, problemas de inicialização e defeitos que exigem diagnóstico técnico detalhado.",
          imageSrc: "/images/apple/imac-placa.png",
          imageAlt: "Reparo de placa lógica de iMac",
        },
        {
          title: "Troca de tela com instalação segura",
          description:
            "Substituímos telas com trincas, manchas, falhas de imagem ou danos físicos com acabamento profissional.",
          imageSrc: "/images/apple/imac-tela.png",
          imageAlt: "Troca de tela de iMac",
        },
        {
          title: "Upgrade de SSD para mais velocidade",
          description:
            "Deixe o iMac mais rápido para abrir programas, arquivos e executar tarefas pesadas com mais fluidez.",
          imageSrc: "/images/apple/imac-ssd.png",
          imageAlt: "Upgrade de SSD em iMac",
        },
      ]}
      services={[
        {
          icon: Monitor,
          title: "Troca de tela",
          description: "Reparo para telas quebradas, com manchas, listras ou falhas visuais.",
        },
        {
          icon: HardDrive,
          title: "Upgrade de SSD",
          description: "Mais rapidez no sistema, inicialização e produtividade diária.",
        },
        {
          icon: Cpu,
          title: "Upgrade de memória",
          description: "Aumente a capacidade de multitarefa e melhore o desempenho.",
        },
        {
          icon: Activity,
          title: "Reparo de placa lógica",
          description: "Atendimento para iMac sem ligar, travando ou com defeitos de hardware.",
        },
        {
          icon: ShieldCheck,
          title: "Limpeza preventiva",
          description: "Revisão interna para reduzir aquecimento e preservar a máquina.",
        },
        {
          icon: Zap,
          title: "Fonte e energia",
          description: "Análise de falhas elétricas, reinícios e desligamentos inesperados.",
        },
        {
          icon: AlertTriangle,
          title: "Outros defeitos",
          description: "Áudio, vídeo, lentidão, falhas de sistema ou comportamento anormal.",
        },
      ]}
      localTitle="Atendimento de iMac para Campinas e entorno"
      localDescription="Recebemos clientes do Cambuí e também de Nova Campinas, Taquaral, Guanabara, Centro, Bosque e bairros próximos com suporte técnico objetivo."
      ctaTitle="Seu iMac merece voltar a trabalhar em alto nível"
      ctaDescription="Entre em contato agora e envie os sintomas do equipamento para agilizar o diagnóstico e o atendimento."
    />
  );
}
