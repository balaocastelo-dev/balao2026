import Header from "@/components/Header";
import type { Metadata } from "next";
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Sobre a Empresa",
  description:
    "Dados corporativos, estrutura logística e lojas do Balão da Informática, referência nacional em informática com entrega rápida para Campinas e região.",
  keywords: [
    "empresa balão da informática",
    "loja de informática brasil",
    "estrutura logística campinas",
    "entrega rápida informática",
  ],
  alternates: { canonical: "https://www.balao.info/sobre-a-empresa" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/sobre-a-empresa",
    title: "Sobre a Empresa | Balão da Informática",
    description:
      "Dados corporativos, estrutura logística e lojas do Balão da Informática, referência nacional em informática com entrega rápida para Campinas e região.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre a Empresa | Balão da Informática",
    description:
      "Dados corporativos, estrutura logística e lojas do Balão da Informática, referência nacional em informática com entrega rápida para Campinas e região.",
    images: ["/logo.png"],
  },
};

import { SITE_CONFIG } from "@/lib/config";

export default function SobreAEmpresaPage() {
  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Sobre a Empresa', item: 'https://www.balao.info/sobre-a-empresa' }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#E60012] border-b pb-4">Sobre a Empresa</h1>
        
        <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
          <p>
            O <strong>{SITE_CONFIG.name}</strong> é uma das maiores redes de varejo de informática e eletrônicos do Brasil. 
            Fundada com o objetivo de democratizar o acesso à tecnologia, nossa empresa cresceu e se consolidou 
            como sinônimo de variedade e preço justo.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8">Estrutura e Logística</h2>
          <p>
            Contamos com Centros de Distribuição estrategicamente localizados para garantir agilidade na entrega 
            em todo o território nacional. Nossa infraestrutura permite o processamento rápido de pedidos, 
            desde a confirmação do pagamento até a expedição.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8">Nossas Lojas</h2>
          <p>
            Além do nosso forte e-commerce, possuímos lojas físicas onde você pode conferir os produtos de perto, 
            retirar suas compras online e receber atendimento personalizado de nossos consultores.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8">Dados Corporativos</h2>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p><strong>Razão Social:</strong> {SITE_CONFIG.companyName}</p>
            <p><strong>CNPJ:</strong> {SITE_CONFIG.cnpj}</p>
            <p><strong>Endereço Matriz:</strong> {SITE_CONFIG.address}</p>
            <p><strong>CEP:</strong> 13025-000</p>
            <p><strong>Inscrição Estadual:</strong> 000.000.000.000</p>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            * O {SITE_CONFIG.name} preza pela legalidade e transparência. Todos os nossos produtos são vendidos com Nota Fiscal.
          </p>
        </div>
      </main>
    </div>
  );
}
