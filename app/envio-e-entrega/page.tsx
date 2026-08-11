import Header from "@/components/Header";
import type { Metadata } from "next";
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Envio e Entrega | Balão da Informática",
  description:
    "Informações sobre frete, prazos e formas de entrega do Balão da Informática, com foco em entrega rápida para Campinas e região e envio para todo o Brasil.",
  keywords: [
    "envio e entrega",
    "frete loja de informática",
    "entrega rápida campinas",
    "entrega para todo o brasil",
    "retirada em loja campinas",
  ],
  alternates: { canonical: "https://www.balao.info/envio-e-entrega" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/envio-e-entrega",
    title: "Envio e Entrega | Balão da Informática",
    description:
      "Informações sobre frete, prazos e formas de entrega do Balão da Informática, com foco em entrega rápida para Campinas e região e envio para todo o Brasil.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Envio e Entrega | Balão da Informática",
    description:
      "Informações sobre frete, prazos e formas de entrega do Balão da Informática, com foco em entrega rápida para Campinas e região e envio para todo o Brasil.",
    images: ["/logo.png"],
  },
};

import { Truck, Clock, MapPin } from "lucide-react";

import { SITE_CONFIG } from "@/lib/config";

export default function EnvioEntregaPage() {
  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Envio e Entrega', item: 'https://www.balao.info/envio-e-entrega' }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#E60012] border-b pb-4">Envio e Entrega</h1>
        
        <div className="prose max-w-none text-gray-700 leading-relaxed space-y-8">
          
          <p className="text-lg">
            O <strong>{SITE_CONFIG.name}</strong> entrega em todo o Brasil através de parcerias com os Correios e as melhores transportadoras do país.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
            <div className="flex gap-4">
              <div className="text-[#E60012] pt-1"><Truck size={32} /></div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Formas de Envio</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Correios:</strong> SEDEX (Expresso) e PAC (Econômico).</li>
                  <li><strong>Transportadoras:</strong> Para volumes maiores ou regiões específicas.</li>
                  <li><strong>Motoboy:</strong> Disponível para algumas regiões de Campinas/SP (consulte no carrinho).</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-[#E60012] pt-1"><Clock size={32} /></div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Prazos de Entrega</h3>
                <p>
                  O prazo é calculado automaticamente no carrinho de compras de acordo com o CEP e a modalidade escolhida. 
                  O prazo começa a contar a partir da <strong>confirmação do pagamento</strong>.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800">Rastreamento</h2>
          <p>
            Assim que seu pedido for despachado, você receberá um código de rastreamento por e-mail. 
            Você também pode acompanhar o status do pedido acessando a área "Minha Conta" no site.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-6">Tentativas de Entrega</h2>
          <p>
            Serão realizadas até 3 tentativas de entrega. Caso não haja ninguém para receber, o produto retornará 
            ao nosso Centro de Distribuição e será necessário pagar um novo frete para reenvio.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-6">Retirada em Loja</h2>
          <p>
            Para clientes de Campinas e região, oferecemos a opção de <strong>Retirada na Loja</strong>. 
            Aguarde o e-mail de confirmação informando que o produto já está disponível para retirada antes de se dirigir ao local.
          </p>
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-4 rounded-lg inline-block">
             <MapPin size={20} />
             <span>{SITE_CONFIG.address}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
