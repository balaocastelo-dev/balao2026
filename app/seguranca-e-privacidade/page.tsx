import Header from "@/components/Header";
import type { Metadata } from "next";
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Segurança e Privacidade",
  description:
    "Política de privacidade, LGPD e certificados de segurança do Balão da Informática para compras online em todo o Brasil com foco em clientes de Campinas e região.",
  keywords: [
    "segurança loja de informática",
    "privacidade balão da informática",
    "compras seguras online",
    "lgpd ecommerce",
  ],
  alternates: { canonical: "https://www.balao.info/seguranca-e-privacidade" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/seguranca-e-privacidade",
    title: "Segurança e Privacidade | Balão da Informática",
    description:
      "Política de privacidade, LGPD e certificados de segurança do Balão da Informática para compras online em todo o Brasil com foco em clientes de Campinas e região.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Segurança e Privacidade | Balão da Informática",
    description:
      "Política de privacidade, LGPD e certificados de segurança do Balão da Informática para compras online em todo o Brasil com foco em clientes de Campinas e região.",
    images: ["/logo.png"],
  },
};

import { ShieldCheck, Lock, CreditCard } from "lucide-react";

export default function SegurancaPrivacidadePage() {
  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Segurança e Privacidade', item: 'https://www.balao.info/seguranca-e-privacidade' }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#E60012] border-b pb-4">Segurança e Privacidade</h1>
        
        <div className="prose max-w-none text-gray-700 leading-relaxed space-y-8">
          
          {/* Intro */}
          <p className="text-lg">
            A sua segurança vem em primeiro lugar para o <strong>Balão da Informática</strong>. Investimos nas tecnologias 
            mais avançadas de proteção de dados para você comprar com total tranquilidade.
          </p>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <div className="text-[#E60012] flex justify-center mb-4"><ShieldCheck size={48} /></div>
              <h3 className="font-bold text-lg mb-2">Certificado SSL</h3>
              <p className="text-sm text-gray-600">Todas as páginas são criptografadas, garantindo que seus dados trafeguem com segurança.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <div className="text-[#E60012] flex justify-center mb-4"><Lock size={48} /></div>
              <h3 className="font-bold text-lg mb-2">Proteção de Dados</h3>
              <p className="text-sm text-gray-600">Respeitamos a LGPD. Seus dados cadastrais não são vendidos ou divulgados para terceiros.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <div className="text-[#E60012] flex justify-center mb-4"><CreditCard size={48} /></div>
              <h3 className="font-bold text-lg mb-2">Pagamento Seguro</h3>
              <p className="text-sm text-gray-600">Não armazenamos dados do seu cartão de crédito. A transação é direta com a operadora.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800">Política de Privacidade</h2>
          <p>
            O Balão da Informática coleta apenas as informações necessárias para a realização e entrega do seu pedido. 
            Dados como CPF, endereço e telefone são utilizados exclusivamente para emissão de nota fiscal e envio da mercadoria.
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-6">E-mails e Comunicações</h3>
          <p>
            Enviamos e-mails com status do pedido e, caso você autorize, ofertas exclusivas. 
            Você pode cancelar o recebimento de ofertas a qualquer momento através do link no rodapé dos e-mails. 
            Nunca enviamos e-mails solicitando senhas ou com arquivos executáveis (exe, com, scr, bat).
          </p>

          <h3 className="text-xl font-bold text-gray-800 mt-6">Cookies</h3>
          <p>
            Utilizamos cookies apenas para melhorar sua experiência de navegação, como manter seu login ativo 
            ou lembrar itens no carrinho. Você pode limpar os cookies nas configurações do seu navegador a qualquer momento.
          </p>
        </div>
      </main>
    </div>
  );
}
