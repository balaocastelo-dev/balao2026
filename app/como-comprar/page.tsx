import Header from "@/components/Header";
import type { Metadata } from "next";
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Como Comprar | Balão da Informática",
  description:
    "Guia passo a passo para comprar com segurança no Balão da Informática, loja de informática online com entrega rápida para Campinas e região e envio para todo o Brasil.",
  keywords: [
    "como comprar online",
    "como comprar balão da informática",
    "loja de informática online",
    "comprar computador campinas",
  ],
  alternates: { canonical: "https://www.balao.info/como-comprar" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/como-comprar",
    title: "Como Comprar | Balão da Informática",
    description:
      "Guia passo a passo para comprar com segurança no Balão da Informática, loja de informática online com entrega rápida para Campinas e região e envio para todo o Brasil.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Como Comprar | Balão da Informática",
    description:
      "Guia passo a passo para comprar com segurança no Balão da Informática, loja de informática online com entrega rápida para Campinas e região e envio para todo o Brasil.",
    images: ["/logo.png"],
  },
};

import Link from "next/link";
import { Search, ShoppingCart, User, CreditCard, Truck } from "lucide-react";

export default function ComoComprarPage() {
  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Como Comprar', item: 'https://www.balao.info/como-comprar' }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#E60012] border-b pb-4">Como Comprar</h1>
        
        <div className="max-w-4xl mx-auto space-y-12">
          <p className="text-lg text-gray-700">
            Comprar no <strong>Balão da Informática</strong> é simples, rápido e 100% seguro. 
            Siga o passo a passo abaixo para realizar seu pedido:
          </p>

          {/* Step 1 */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-red-50 p-4 rounded-full text-[#E60012]">
              <Search size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">1. Encontre o Produto</h2>
              <p className="text-gray-600">
                Navegue pelo menu de departamentos ou utilize a <strong>barra de busca</strong> no topo do site 
                para encontrar o que você precisa. Clique no produto para ver detalhes, fotos e especificações técnicas.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-red-50 p-4 rounded-full text-[#E60012]">
              <ShoppingCart size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">2. Adicione ao Carrinho</h2>
              <p className="text-gray-600">
                Gostou do produto? Clique no botão <strong>"Comprar"</strong>. O produto será adicionado ao seu carrinho. 
                Você pode continuar comprando ou finalizar o pedido clicando em "Ir para o carrinho".
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-red-50 p-4 rounded-full text-[#E60012]">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">3. Identificação</h2>
              <p className="text-gray-600">
                Para finalizar a compra, você precisará fazer login. Se já é cliente, insira seu e-mail e senha. 
                Se é sua primeira vez, faça um cadastro rápido informando seus dados para a nota fiscal e entrega.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-red-50 p-4 rounded-full text-[#E60012]">
              <Truck size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">4. Frete e Entrega</h2>
              <p className="text-gray-600">
                Informe o CEP do endereço de entrega para calcular o frete e o prazo. 
                Escolha a opção de envio que melhor atende à sua necessidade (Sedex, PAC, Transportadora ou Retirada).
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-red-50 p-4 rounded-full text-[#E60012]">
              <CreditCard size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">5. Pagamento</h2>
              <p className="text-gray-600">
                Escolha a forma de pagamento: Cartão de Crédito (em até 12x), Boleto Bancário ou PIX (com desconto). 
                Confira os dados do pedido e clique em <strong>"Finalizar Compra"</strong>.
              </p>
            </div>
          </div>

          <div className="bg-gray-100 p-8 rounded-xl text-center mt-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Pronto!</h3>
            <p className="text-gray-600 mb-6">
              Você receberá um e-mail com a confirmação do pedido. Agora é só aguardar a entrega!
            </p>
            <Link href="/" className="inline-block bg-[#E60012] text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 transition-colors">
              Começar a Comprar
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
