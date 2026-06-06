import { Metadata } from "next";
import {
  Activity,
  AlertTriangle,
  Battery,
  ShieldCheck,
  Tablet,
  Zap,
} from "lucide-react";
import AppleServicePage from "@/components/AppleServicePage";
import { SITE_CONFIG } from "@/lib/config";

const WHATSAPP_LINK =
  "https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20assist%C3%AAncia%20t%C3%A9cnica%20para%20iPad%20em%20Campinas!";

export const metadata: Metadata = {
  title: "Assistência iPad em Campinas | Tela, Bateria e Conector",
  description:
    "Assistência técnica especializada em iPad em Campinas. Troca de tela, bateria, conector de carga e reparo de placa com atendimento no Cambuí e região.",
  keywords: [
    "assistência ipad campinas",
    "reparo ipad campinas",
    "troca tela ipad campinas",
    "troca bateria ipad cambuí",
    "manutenção ipad campinas",
  ],
  alternates: { canonical: "https://www.balao.info/wendell/apple/ipad" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/wendell/apple/ipad",
    title: "Assistência iPad em Campinas | Tela, Bateria e Conector",
    description:
      "iPad com tela quebrada, bateria ruim ou falha de carga? Fazemos reparo especializado em Campinas.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/apple/generated/ipad-hero.svg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistência iPad em Campinas | Tela, Bateria e Conector",
    description:
      "iPad com tela quebrada, bateria ruim ou falha de carga? Fazemos reparo especializado em Campinas.",
    images: ["/images/apple/generated/ipad-hero.svg"],
  },
};

export default function IPadPage() {
  return (
    <AppleServicePage
      backHref="/wendell/apple"
      backLabel="Voltar para Especialista Apple"
      badgeIcon={Tablet}
      badgeLabel="Assistência especializada para iPad"
      title="Assistência para"
      highlightedWord="iPad"
      description="Seu iPad merece um reparo ágil e bem executado. Trabalhamos com troca de tela, bateria, conector e reparos técnicos para clientes do Cambuí, Nova Campinas, Centro e bairros próximos."
      heroImageSrc="/images/apple/generated/ipad-hero.svg"
      heroImageAlt="Assistência técnica iPad em Campinas"
      heroCaption="Tela, bateria e conector com atendimento rápido para Campinas"
      whatsappHref={WHATSAPP_LINK}
      theme={{
        badge: "border-green-100 bg-green-50 text-green-700",
        button: "bg-green-600 text-white hover:bg-green-700",
        buttonSoft: "border border-green-200 bg-white text-green-700 hover:bg-green-50",
        iconWrap: "bg-green-50",
        icon: "text-green-600",
        ctaBg: "bg-gradient-to-r from-green-600 to-green-700",
        ctaButtonText: "text-green-700",
      }}
      highlights={[
        {
          title: "Troca de tela para iPad",
          description:
            "Resolvemos trincas, toque falhando e danos visuais com substituição técnica e acabamento limpo.",
          imageSrc: "/images/apple/generated/ipad-tela.svg",
          imageAlt: "Troca de tela de iPad",
        },
        {
          title: "Bateria nova para recuperar autonomia",
          description:
            "Se a bateria dura pouco ou o iPad desliga sozinho, realizamos a substituição com segurança.",
          imageSrc: "/images/apple/generated/ipad-bateria.svg",
          imageAlt: "Troca de bateria de iPad",
        },
        {
          title: "Conector de carga com reparo preciso",
          description:
            "Para iPad que não carrega, carrega mal ou exige posição específica do cabo, fazemos o reparo correto.",
          imageSrc: "/images/apple/generated/ipad-carga.svg",
          imageAlt: "Reparo de conector de carga de iPad",
        },
      ]}
      services={[
        {
          icon: Tablet,
          title: "Troca de tela",
          description: "Substituição de tela quebrada, display falhando ou touch com defeito.",
        },
        {
          icon: Battery,
          title: "Troca de bateria",
          description: "Mais autonomia para estudo, trabalho e uso diário do iPad.",
        },
        {
          icon: Zap,
          title: "Conector de carga",
          description: "Correção de falhas de carga, mau contato e lentidão no carregamento.",
        },
        {
          icon: Activity,
          title: "Reparo de placa",
          description: "Diagnóstico avançado para iPad sem ligar ou com defeitos complexos.",
        },
        {
          icon: ShieldCheck,
          title: "Botões e sensores",
          description: "Atendimento para botão home, touch ID e outras falhas de usabilidade.",
        },
        {
          icon: AlertTriangle,
          title: "Problemas diversos",
          description: "Câmeras, áudio, microfone, travamentos e falhas de sistema.",
        },
      ]}
      localTitle="Reparo de iPad para Cambuí e região"
      localDescription="Atendemos Campinas com foco especial em bairros próximos ao Cambuí, agilizando avaliação e contato para quem precisa de solução rápida."
      ctaTitle="Seu iPad precisa voltar a funcionar sem dor de cabeça?"
      ctaDescription="Fale no WhatsApp, descreva o defeito e receba orientação para agilizar o reparo."
    />
  );
}
