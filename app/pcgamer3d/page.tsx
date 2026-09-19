import type { Metadata } from "next";
import Header from "@/components/Header";
import Pcgamer3dLanding from "./pcgamer3d-landing";
import { getProducts, searchProductsByKeywords } from "@/lib/db";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
  generateServiceSchema,
  generateItemListSchema,
} from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Montagem de PC Gamer 3D em Campinas | Airflow, Cable Management e FPS Máximo | Balão da Informática",
  description:
    "Guia técnico e montagem profissional de PC Gamer com modelo 3D interativo: sequência correta, pasta térmica de alta condutividade, cable management e validação por benchmarks no Cambuí.",
  keywords: [
    "montagem pc gamer profissional",
    "montagem pc gamer campinas",
    "pc gamer 3d",
    "cable management pc gamer",
    "airflow pc gamer",
    "pasta termica correta",
    "BIOS tuning performance",
    "undervolt cpu gpu",
    "otimizacao de FPS",
    "balao da informatica cambui",
  ],
  alternates: {
    canonical: "https://www.balao.info/pcgamer3d",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/pcgamer3d",
    title: "Montagem de PC Gamer 3D | Balão da Informática",
    description:
      "Conteúdo técnico e montagem profissional: cable management, airflow, BIOS tuning e benchmarks com bancada própria no Cambuí.",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Montagem de PC Gamer 3D | Balão da Informática",
    description: "Guia técnico de montagem profissional e setups gamer com pronta entrega em Campinas.",
    images: ["/logo.png"],
  },
};

const PCGAMER_FAQS = [
  {
    question: "Quanto tempo leva a montagem de um PC Gamer na Balão?",
    answer:
      "A montagem completa com cable management profissional, instalação limpa do Windows e testes de estresse leva em média de 3 a 24 horas em nossa bancada no Cambuí.",
  },
  {
    question: "Vocês realizam testes de estabilidade e temperatura antes da entrega?",
    answer:
      "Sim! Todo PC montado passa por bateria de benchmarks (Cinebench, FurMark e 3DMark) com monitoramento contínuo de temperaturas de CPU, VRM e GPU para garantir zero estrangulamento térmico (thermal throttling).",
  },
  {
    question: "Posso levar minhas próprias peças para vocês montarem?",
    answer:
      "Com certeza! Montamos máquinas com peças compradas conosco ou trazidas pelo cliente, realizando a organização impecável dos cabos e curva de fans personalizada.",
  },
];

export default async function PcGamer3DPage() {
  const [allProducts, keywordGamer] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["gamer", "rtx", "ryzen", "core i5", "core i7", "watercooler", "gabinete"], 16),
  ]);

  let gamerProducts = keywordGamer;
  if (gamerProducts.length === 0) {
    gamerProducts = allProducts.slice(0, 8);
  }

  const breadcrumbs = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "PC Gamer 3D", item: "https://www.balao.info/pcgamer3d" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbs),
          generateItemListSchema(gamerProducts, "https://www.balao.info/pcgamer3d"),
          generateFAQSchema(PCGAMER_FAQS),
          generateServiceSchema({
            name: "Montagem Profissional de PC Gamer em Campinas",
            description:
              "Serviço de montagem especializada de computadores gamer com cable management e testes de estabilidade.",
            url: "https://www.balao.info/pcgamer3d",
            serviceType: "Montagem e Customização de Computadores Gamer",
          }),
        ]}
      />
      <Header />
      <main>
        <Pcgamer3dLanding products={gamerProducts} />
      </main>
    </div>
  );
}
