import { Metadata } from "next";
import {
  Activity,
  AlertTriangle,
  Battery,
  ShieldCheck,
  Watch,
  Zap,
} from "lucide-react";
import AppleServicePage from "@/components/AppleServicePage";
import { SITE_CONFIG } from "@/lib/config";

const WHATSAPP_LINK =
  "https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20assist%C3%AAncia%20t%C3%A9cnica%20para%20Apple%20Watch%20em%20Campinas!";

export const metadata: Metadata = {
  title: "Assistência Apple Watch em Campinas | Tela, Bateria e Coroa",
  description:
    "Assistência técnica especializada em Apple Watch em Campinas. Troca de tela, bateria, digital crown e reparo de placa com atendimento no Cambuí e região.",
  keywords: [
    "assistência apple watch campinas",
    "reparo apple watch campinas",
    "troca tela apple watch campinas",
    "troca bateria apple watch cambuí",
    "manutenção apple watch campinas",
  ],
  alternates: { canonical: "https://www.balao.info/wendell/apple/apple-watch" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/wendell/apple/apple-watch",
    title: "Assistência Apple Watch em Campinas | Tela, Bateria e Coroa",
    description:
      "Apple Watch com tela quebrada, bateria ruim ou coroa digital travada? Atendemos Campinas com reparo especializado.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/apple/watch-hero.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistência Apple Watch em Campinas | Tela, Bateria e Coroa",
    description:
      "Apple Watch com tela quebrada, bateria ruim ou coroa digital travada? Atendemos Campinas com reparo especializado.",
    images: ["/images/apple/watch-hero.webp"],
  },
};

export default function AppleWatchPage() {
  return (
    <AppleServicePage
      backHref="/wendell/apple"
      backLabel="Voltar para Especialista Apple"
      badgeIcon={Watch}
      badgeLabel="Assistência especializada para Apple Watch"
      title="Assistência para"
      highlightedWord="Apple Watch"
      description="Seu Apple Watch precisa de cuidado técnico preciso. Fazemos reparos em tela, bateria, coroa digital e falhas eletrônicas para clientes do Cambuí, Centro e bairros próximos em Campinas."
      heroImageSrc="/images/apple/watch-hero.webp"
      heroImageAlt="Assistência técnica Apple Watch em Campinas"
      heroCaption="Tela, bateria e coroa digital com reparo especializado"
      whatsappHref={WHATSAPP_LINK}
      theme={{
        badge: "border-orange-100 bg-orange-50 text-orange-700",
        button: "bg-orange-600 text-white hover:bg-orange-700",
        buttonSoft: "border border-orange-200 bg-white text-orange-700 hover:bg-orange-50",
        iconWrap: "bg-orange-50",
        icon: "text-orange-600",
        ctaBg: "bg-gradient-to-r from-orange-600 to-orange-700",
        ctaButtonText: "text-orange-700",
      }}
      highlights={[
        {
          title: "Troca de tela com acabamento fino",
          description:
            "Corrigimos danos visuais e problemas de toque para devolver conforto e boa leitura no seu relógio.",
          imageSrc: "/images/apple/watch-tela.png",
          imageAlt: "Troca de tela de Apple Watch",
        },
        {
          title: "Substituição de bateria",
          description:
            "Quando a autonomia cai ou o relógio desliga cedo, fazemos a troca para recuperar o uso no dia a dia.",
          imageSrc: "/images/apple/watch-bateria.png",
          imageAlt: "Troca de bateria de Apple Watch",
        },
        {
          title: "Reparo da coroa digital",
          description:
            "Se a coroa trava, falha ou perde resposta, realizamos o reparo para restaurar a navegação do aparelho.",
          imageSrc: "/images/apple/watch-coroa.png",
          imageAlt: "Reparo da coroa digital do Apple Watch",
        },
      ]}
      services={[
        {
          icon: Watch,
          title: "Troca de tela",
          description: "Display quebrado, vidro solto ou toque comprometido em várias séries.",
        },
        {
          icon: Battery,
          title: "Troca de bateria",
          description: "Mais autonomia e estabilidade para voltar a usar o relógio com confiança.",
        },
        {
          icon: Zap,
          title: "Digital Crown e carga",
          description: "Atendimento para coroa digital, conectividade e falhas de carregamento.",
        },
        {
          icon: Activity,
          title: "Reparo de placa",
          description: "Diagnóstico técnico para Apple Watch que não liga ou apresenta falhas críticas.",
        },
        {
          icon: ShieldCheck,
          title: "Botões e vedação",
          description: "Ajustes e reparos para manter funcionamento correto e bom acabamento.",
        },
        {
          icon: AlertTriangle,
          title: "Outros defeitos",
          description: "Problemas de software, áudio, vibração ou comportamento irregular.",
        },
      ]}
      localTitle="Atendimento de Apple Watch em Campinas"
      localDescription="Recebemos clientes do Cambuí, Guanabara, Taquaral, Centro e outras regiões próximas com foco em diagnóstico rápido e comunicação direta."
      ctaTitle="Quer resolver o problema do seu Apple Watch sem enrolação?"
      ctaDescription="Chame no WhatsApp agora, envie o defeito e receba orientação para agilizar o próximo passo."
    />
  );
}
