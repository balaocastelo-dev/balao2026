import Header from "@/components/Header";
import type { Metadata } from "next";
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Sobre Nós",
  description:
    "Conheça a história, missão e valores do Balão da Informática, loja de informática com entrega rápida em Campinas e região e envio para todo o Brasil.",
  keywords: [
    "balão da informática",
    "história balão da informática",
    "loja de informática campinas",
    "loja de informática brasil",
    "entrega rápida campinas",
  ],
  alternates: { canonical: "https://www.balao.info/sobre-nos" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/sobre-nos",
    title: "Sobre Nós | Balão da Informática",
    description:
      "Conheça a história, missão e valores do Balão da Informática, loja de informática com entrega rápida em Campinas e região e envio para todo o Brasil.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre Nós | Balão da Informática",
    description:
      "Conheça a história, missão e valores do Balão da Informática, loja de informática com entrega rápida em Campinas e região e envio para todo o Brasil.",
    images: ["/logo.png"],
  },
};

export default function SobreNosPage() {
  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Sobre Nós', item: 'https://www.balao.info/sobre-nos' }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#E60012] border-b pb-4">Sobre Nós</h1>
        
        <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
          <p>
            Bem-vindo ao <strong>Balão da Informática</strong>, sua referência em tecnologia e inovação. 
            Há mais de 20 anos no mercado, construímos uma história sólida baseada na confiança, 
            qualidade e compromisso com nossos clientes.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-800 mt-8">Nossa Missão</h2>
          <p>
            Proporcionar acesso às melhores tecnologias do mercado, oferecendo produtos de alta performance 
            com preços competitivos e um atendimento especializado que entende as necessidades de cada cliente, 
            seja para uso doméstico, profissional ou gamer.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8">Nossa Visão</h2>
          <p>
            Ser reconhecida como a principal parceira de tecnologia no Brasil, liderando o mercado 
            através da excelência em serviço, variedade de produtos e inovação constante na experiência de compra.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8">Nossos Valores</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Transparência:</strong> Agimos com honestidade e clareza em todas as nossas relações.</li>
            <li><strong>Qualidade:</strong> Trabalhamos apenas com as melhores marcas e produtos originais.</li>
            <li><strong>Compromisso:</strong> Cumprimos prazos e garantias, respeitando o consumidor.</li>
            <li><strong>Inovação:</strong> Estamos sempre atentos às novidades do setor tecnológico.</li>
          </ul>

          <div className="bg-gray-50 p-6 rounded-lg mt-8 border border-gray-100">
            <h3 className="text-xl font-bold text-[#E60012] mb-4">Por que escolher o Balão?</h3>
            <p>
              Além de um vasto catálogo de produtos, contamos com uma equipe de especialistas pronta para 
              tirar suas dúvidas e ajudar na escolha do equipamento ideal. Nossa logística eficiente 
              garante que seu pedido chegue rápido e seguro até você.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
