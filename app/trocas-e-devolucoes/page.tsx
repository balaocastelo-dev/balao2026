import Header from "@/components/Header";
import type { Metadata } from "next";
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Trocas e Devoluções",
  description:
    "Política de trocas, devoluções e garantias do Balão da Informática para clientes de Campinas, região metropolitana e todo o Brasil.",
  keywords: [
    "trocas e devoluções",
    "garantia loja de informática",
    "balão da informática trocas",
    "compras online campinas",
  ],
  alternates: { canonical: "https://www.balao.info/trocas-e-devolucoes" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/trocas-e-devolucoes",
    title: "Trocas e Devoluções | Balão da Informática",
    description: "Política de trocas, devoluções e garantias do Balão da Informática para clientes de Campinas, região metropolitana e todo o Brasil.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trocas e Devoluções | Balão da Informática",
    description: "Política de trocas, devoluções e garantias do Balão da Informática para clientes de Campinas, região metropolitana e todo o Brasil.",
    images: ["/logo.png"],
  },
};

import { RefreshCcw, AlertTriangle, CheckCircle } from "lucide-react";

export default function TrocasDevolucoesPage() {
  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Trocas e Devoluções', item: 'https://www.balao.info/trocas-e-devolucoes' }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#E60012] border-b pb-4">Trocas e Devoluções</h1>
        
        <div className="prose max-w-none text-gray-700 leading-relaxed space-y-8">
          
          <p className="text-lg">
            Nossa política de trocas e devoluções segue rigorosamente o <strong>Código de Defesa do Consumidor</strong>. 
            Queremos que você esteja totalmente satisfeito com sua compra.
          </p>

          <div className="space-y-8">
            {/* Arrependimento */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCcw className="text-[#E60012]" size={28} />
                <h2 className="text-2xl font-bold text-gray-800 m-0">Devolução por Arrependimento</h2>
              </div>
              <p>
                Você tem até <strong>7 (sete) dias corridos</strong> após o recebimento do produto para solicitar a devolução 
                por arrependimento ou desistência.
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-1 text-sm text-gray-600">
                <li>O produto deve estar em sua embalagem original, sem indícios de uso.</li>
                <li>Deve acompanhar nota fiscal, manual e todos os acessórios.</li>
                <li>O reembolso será feito integralmente após a conferência do produto devolvido.</li>
              </ul>
            </div>

            {/* Defeito */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-[#E60012]" size={28} />
                <h2 className="text-2xl font-bold text-gray-800 m-0">Produto com Defeito</h2>
              </div>
              <p>
                Se o produto apresentar defeito dentro de <strong>7 dias</strong>, a troca é feita diretamente conosco. 
                Após este prazo, a garantia deve ser acionada junto ao fabricante (o prazo total varia conforme o produto).
              </p>
              <p className="mt-4 font-bold text-gray-800">Como proceder:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm text-gray-600">
                <li>Entre em contato pelo "Fale Conosco" informando o defeito.</li>
                <li>Enviaremos as instruções para postagem reversa (sem custo).</li>
                <li>Após análise técnica (até 30 dias), enviaremos um produto novo ou realizaremos o reembolso.</li>
              </ol>
            </div>

            {/* Avarias */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="text-[#E60012]" size={28} />
                <h2 className="text-2xl font-bold text-gray-800 m-0">Avaria no Transporte</h2>
              </div>
              <p>
                Confira o produto no ato da entrega. Se a embalagem estiver violada ou o produto avariado, 
                <strong> recuse o recebimento</strong> e anote o motivo no verso da nota fiscal.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t pt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Canais de Atendimento para Trocas</h3>
            <p>
              Para iniciar um processo de troca ou devolução, entre em contato através do e-mail: <br />
              <a href="mailto:sac@balaodainformatica.com.br" className="text-[#E60012] font-bold hover:underline">sac@balaodainformatica.com.br</a>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
