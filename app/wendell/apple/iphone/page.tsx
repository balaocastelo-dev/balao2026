import { Metadata } from "next";
import {
  Activity,
  AlertTriangle,
  Battery,
  ShieldCheck,
  Smartphone,
  Zap,
  Camera,
} from "lucide-react";
import AppleServicePage from "@/components/AppleServicePage";
import { SITE_CONFIG } from "@/lib/config";

const WHATSAPP_LINK =
  "https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20assist%C3%AAncia%20t%C3%A9cnica%20para%20iPhone%20em%20Campinas!";

export const metadata: Metadata = {
  title: "Assistência iPhone em Campinas | Tela, Bateria e Conector",
  description:
    "Assistência técnica especializada em iPhone em Campinas. Troca de tela, bateria, conector de carga, câmera e reparo de placa com atendimento no Cambuí e região.",
  keywords: [
    "assistência iphone campinas",
    "reparo iphone campinas",
    "troca tela iphone campinas",
    "troca bateria iphone cambuí",
    "conserto iphone campinas",
    "manutenção iphone campinas",
  ],
  alternates: { canonical: "https://www.balao.info/wendell/apple/iphone" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/wendell/apple/iphone",
    title: "Assistência iPhone em Campinas | Tela, Bateria e Conector",
    description:
      "iPhone com tela quebrada, bateria ruim, falha de carga ou defeito técnico? Atendimento especializado em Campinas.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/apple/subcategories/iphone-card.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistência iPhone em Campinas | Tela, Bateria e Conector",
    description:
      "iPhone com tela quebrada, bateria ruim, falha de carga ou defeito técnico? Atendimento especializado em Campinas.",
    images: ["/images/apple/subcategories/iphone-card.png"],
  },
};

export default function IPhonePage() {
  return (
    <AppleServicePage
      backHref="/wendell/apple"
      backLabel="Voltar para Especialista Apple"
      badgeIcon={Smartphone}
      badgeLabel="Assistência especializada para iPhone"
      title="Assistência para"
      highlightedWord="iPhone"
      description="Seu iPhone merece um atendimento técnico ágil e preciso. Fazemos troca de tela, bateria, conector, câmera e reparos avançados para clientes de Campinas, Cambuí e bairros próximos."
      heroImageSrc="/images/apple/subcategories/iphone-card.png"
      heroImageAlt="Assistência técnica iPhone em Campinas"
      heroCaption="Tela, bateria, conector e reparos técnicos com atendimento rápido"
      whatsappHref={WHATSAPP_LINK}
      mobileHighlightsFirst
      theme={{
        badge: "border-sky-100 bg-sky-50 text-sky-700",
        button: "bg-sky-600 text-white hover:bg-sky-700",
        buttonSoft: "border border-sky-200 bg-white text-sky-700 hover:bg-sky-50",
        iconWrap: "bg-sky-50",
        icon: "text-sky-600",
        ctaBg: "bg-gradient-to-r from-sky-600 to-sky-700",
        ctaButtonText: "text-sky-700",
      }}
      highlights={[
        {
          title: "Troca de tela para iPhone",
          description:
            "Resolvemos telas trincadas, toque falhando, manchas, linhas e quebras que comprometem o uso do aparelho.",
          imageSrc: "/images/apple/iphone/iphone-reparo-bancada.png",
          imageAlt: "Troca de tela de iPhone",
        },
        {
          title: "Reparo de tampa quebrada com retirada a laser",
          description:
            "Removemos a tampa traseira quebrada com tecnica de retirada a laser para um acabamento mais preciso e seguro no reparo do iPhone.",
          imageSrc: "/images/apple/iphone/iphone-interno-reparo.png",
          imageAlt: "Reparo de tampa traseira quebrada de iPhone",
        },
        {
          title: "Conector e carga com reparo preciso",
          description:
            "Para iPhone que não carrega, carrega mal ou exige posição específica do cabo, fazemos o reparo correto.",
          imageSrc: "/images/apple/iphone/iphone-conector-reparo.png",
          imageAlt: "Reparo de conector de carga de iPhone",
        },
      ]}
      showcaseImageSrc="/images/apple/iphone/apple-bench-showcase.png"
      showcaseImageAlt="Estrutura de bancada para atendimento Apple na Balão da Informática"
      showcaseTitle="Ambiente técnico preparado para atendimento especializado em iPhone"
      showcaseDescription="Seu iPhone passa por uma bancada organizada, com estrutura para diagnóstico preciso, reparo cuidadoso e atendimento rápido para quem precisa voltar a usar o aparelho sem demora."
      services={[
        {
          icon: Smartphone,
          title: "Troca de tela",
          description: "Substituição de tela quebrada, display falhando ou touch com defeito.",
        },
        {
          icon: Battery,
          title: "Troca de bateria",
          description: "Mais autonomia para uso diário, trabalho e estudo sem sustos.",
        },
        {
          icon: Zap,
          title: "Conector de carga",
          description: "Correção de mau contato, lentidão no carregamento e falhas de energia.",
        },
        {
          icon: Camera,
          title: "Câmeras e sensores",
          description: "Atendimento para câmera, Face ID, áudio, microfone e sensores diversos.",
        },
        {
          icon: Activity,
          title: "Reparo de placa",
          description: "Diagnóstico avançado para iPhone sem ligar ou com defeitos complexos.",
        },
        {
          icon: ShieldCheck,
          title: "Botões e usabilidade",
          description: "Problemas em botões, vibração, alto-falante e outras falhas do aparelho.",
        },
        {
          icon: AlertTriangle,
          title: "Problemas diversos",
          description: "Travamentos, aquecimento, reinicialização e falhas gerais de funcionamento.",
        },
      ]}
      localTitle="Reparo de iPhone para Cambuí e região"
      localDescription="Atendemos Campinas com foco especial em bairros próximos ao Cambuí, agilizando o contato para quem precisa de solução rápida para o iPhone."
      ctaTitle="Seu iPhone precisa voltar a funcionar sem dor de cabeça?"
      ctaDescription="Fale no WhatsApp, descreva o defeito e receba orientação para agilizar o reparo."
    />
  );
}
