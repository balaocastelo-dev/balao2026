import Header from "@/components/Header";
import type { Metadata } from "next";
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";
import { BUSINESS_INFO } from "@/lib/business-info";

export const metadata: Metadata = {
  title: "Sobre Nós | Balão da Informática Castelo – Campinas",
  description:
    "Conheça a unidade Balão da Informática Castelo, localizada na Av. Anchieta, 789 – Cambuí, Campinas. Loja de informática com assistência técnica, PCs Gamer, notebooks e atendimento via WhatsApp 24h.",
  keywords: [
    "balão da informática castelo",
    "loja de informática campinas",
    "assistência técnica informática campinas",
    "av anchieta 789 campinas",
    "cambuí campinas informática",
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

          <div className="bg-red-50 p-6 rounded-lg mt-8 border border-red-100">
            <h3 className="text-xl font-bold text-[#E60012] mb-4">Unidade Castelo – Campinas</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Endereço:</strong> {BUSINESS_INFO.address}</li>
              <li><strong>CEP:</strong> {BUSINESS_INFO.postalCode}</li>
              <li><strong>Telefone:</strong> {BUSINESS_INFO.phone.display}</li>
              <li><strong>WhatsApp:</strong> <a href={BUSINESS_INFO.whatsapp.href} target="_blank" rel="noopener noreferrer" className="text-green-600 font-bold hover:underline">{BUSINESS_INFO.whatsapp.display}</a></li>
              <li><strong>E-mail:</strong> <a href={`mailto:${BUSINESS_INFO.email}`} className="text-[#E60012] hover:underline">{BUSINESS_INFO.email}</a></li>
              <li><strong>Horário:</strong> Seg–Sex: 08h–18h | Sáb: 08h–13h</li>
              <li><strong>WhatsApp 24h:</strong> atendimento com agente de IA e humano</li>
              <li><strong>CNPJ:</strong> {BUSINESS_INFO.cnpj}</li>
            </ul>
            <p className="mt-4 text-gray-600">
              Estamos na <strong>Av. Anchieta, 789 – Cambuí, Campinas/SP</strong>. 
              Atendimento presencial de segunda a sexta das 08h às 18h e aos sábados das 08h às 13h.
              Fale agora no WhatsApp: <a href={BUSINESS_INFO.whatsapp.href} target="_blank" rel="noopener noreferrer" className="text-green-600 font-bold">{BUSINESS_INFO.whatsapp.display}</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
