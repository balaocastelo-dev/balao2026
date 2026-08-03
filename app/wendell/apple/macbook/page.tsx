import { Metadata } from "next";
import {
  Activity,
  Battery,
  HardDrive,
  Keyboard,
  Laptop,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import AppleServicePage from "@/components/AppleServicePage";
import { SITE_CONFIG } from "@/lib/config";

const WHATSAPP_LINK =
  "https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20assist%C3%AAncia%20t%C3%A9cnica%20para%20MacBook%20em%20Campinas!";

export const metadata: Metadata = {
  title: "Assistência MacBook em Campinas | Tela, Bateria e Placa",
  description:
    "Assistência técnica especializada em MacBook em Campinas. Troca de tela, bateria, teclado, SSD e reparo de placa com atendimento no Cambuí e bairros próximos.",
  keywords: [
    "assistência macbook campinas",
    "reparo macbook campinas",
    "troca tela macbook campinas",
    "troca teclado macbook cambuí",
    "upgrade macbook campinas",
    "manutenção macbook campinas",
  ],
  alternates: { canonical: "https://www.balao.info/wendell/apple/macbook" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/wendell/apple/macbook",
    title: "Assistência MacBook em Campinas | Tela, Bateria e Placa",
    description:
      "Serviço especializado para MacBook Air e Pro em Campinas, com foco em tela, bateria, teclado e placa lógica.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/apple/subcategories/macbook-card.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistência MacBook em Campinas | Tela, Bateria e Placa",
    description:
      "Serviço especializado para MacBook Air e Pro em Campinas, com foco em tela, bateria, teclado e placa lógica.",
    images: ["/images/apple/subcategories/macbook-card.png"],
  },
};

export default function MacBookPage() {
  return (
    <AppleServicePage
      backHref="/wendell/apple"
      backLabel="Voltar para Especialista Apple"
      badgeIcon={Laptop}
      badgeLabel="Assistência especializada para MacBook"
      title="Assistência para"
      highlightedWord="MacBook"
      description="Seu MacBook Air ou Pro merece um atendimento técnico preciso. Fazemos reparos avançados, upgrades e manutenção com foco em desempenho, segurança e agilidade para clientes de Campinas, Cambuí e região."
      heroImageSrc="/images/apple/subcategories/macbook-card.png"
      heroImageAlt="Assistência técnica MacBook em Campinas"
      heroCaption="Troca de tela, bateria, teclado e placa com diagnóstico especializado"
      whatsappHref={WHATSAPP_LINK}
      theme={{
        badge: "border-violet-100 bg-violet-50 text-violet-700",
        button: "bg-violet-600 text-white hover:bg-violet-700",
        buttonSoft: "border border-violet-200 bg-white text-violet-700 hover:bg-violet-50",
        iconWrap: "bg-violet-50",
        icon: "text-violet-600",
        ctaBg: "bg-gradient-to-r from-violet-600 to-violet-700",
        ctaButtonText: "text-violet-700",
      }}
      highlights={[
        {
          title: "Troca de tela com acabamento profissional",
          description:
            "Substituímos telas quebradas, riscadas ou com falhas de imagem para devolver aparência e usabilidade ao seu MacBook.",
          imageSrc: "/images/apple/macbook-tela.png",
          imageAlt: "Troca de tela de MacBook",
        },
        {
          title: "Bateria nova para recuperar autonomia",
          description:
            "Quando a bateria descarrega rápido, estufa ou perde desempenho, fazemos a substituição com instalação segura.",
          imageSrc: "/images/apple/macbook-bateria.png",
          imageAlt: "Troca de bateria de MacBook",
        },
        {
          title: "Reparo de placa para casos complexos",
          description:
            "Analisamos falhas de energia, aquecimento, não liga e outros defeitos eletrônicos com reparo em nível avançado.",
          imageSrc: "/images/apple/macbook-placa.png",
          imageAlt: "Reparo de placa lógica MacBook",
        },
      ]}
      services={[
        {
          icon: Laptop,
          title: "Troca de tela",
          description: "Display quebrado, manchas, linhas ou imagem apagando em MacBook Air e Pro.",
        },
        {
          icon: Keyboard,
          title: "Troca de teclado e trackpad",
          description: "Teclas falhando, trackpad sem clique ou problemas após contato com líquido.",
        },
        {
          icon: Battery,
          title: "Troca de bateria",
          description: "Bateria com baixa autonomia, superaquecimento ou alerta de manutenção.",
        },
        {
          icon: HardDrive,
          title: "Upgrade de SSD",
          description: "Melhore velocidade de inicialização, abertura de programas e resposta geral.",
        },
        {
          icon: Activity,
          title: "Reparo de placa lógica",
          description: "Diagnóstico técnico para MacBook que não liga ou apresenta falhas intermitentes.",
        },
        {
          icon: ShieldCheck,
          title: "Limpeza e manutenção",
          description: "Manutenção preventiva para reduzir aquecimento e preservar desempenho.",
        },
        {
          icon: AlertTriangle,
          title: "Problemas diversos",
          description: "USB com defeito, áudio falhando, travamentos, lentidão ou superaquecimento.",
        },
      ]}
      localTitle="Atendemos Cambuí e bairros próximos"
      localDescription="Se você está no Cambuí, Nova Campinas, Guanabara, Taquaral ou Centro de Campinas, fale com a nossa equipe e receba orientação rápida para o seu MacBook."
      ctaTitle="Seu MacBook precisa voltar a render bem?"
      ctaDescription="Envie o modelo e o defeito no WhatsApp e receba um atendimento direto e objetivo para resolver o problema."
    />
  );
}
