import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import StoreInfo from "@/components/StoreInfo";
import TestimonialsSection from "@/components/TestimonialsSection";
import JsonLd, { generateFAQSchema, generateBreadcrumbSchema } from "@/components/JsonLd";
import { BUSINESS_INFO } from "@/lib/business-info";
import { 
  Laptop, 
  Cpu, 
  Handshake, 
  ShieldCheck, 
  Lock, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Venda seu Usado com Segurança em Campinas | Balão Castelo",
  description: "Venda seu notebook, PC Gamer ou peças usadas de informática em consignação com total segurança na loja física Balão da Informática Castelo, em Campinas. PIX direto.",
  keywords: [
    "vender notebook usado campinas",
    "vender pc gamer usado campinas",
    "consignação informática campinas",
    "comprar usado campinas",
    "balao da informatica usado"
  ],
  alternates: { canonical: "https://www.balao.info/venda-seu-usado" }
};

const FAQS = [
  {
    question: "Como funciona a consignação?",
    answer: "Você traz o equipamento para avaliação técnica presencial. Combinamos o valor pretendido, assinamos um contrato de consignação formal, revisamos e formatamos o equipamento de forma segura, e o anunciamos em nossa vitrine física e canais online."
  },
  {
    question: "Quais equipamentos posso deixar para vender?",
    answer: "Aceitamos notebooks modernos (Core i5 ou superior / Ryzen 5 ou superior), PCs Gamer completos, placas de vídeo de alta performance (Geforce/Radeon) e processadores/memórias modernas. Não aceitamos itens obsoletos ou quebrados."
  },
  {
    question: "Como recebo o pagamento?",
    answer: "Assim que o equipamento for vendido, fazemos o repasse do valor combinado diretamente via PIX em sua conta corrente, ou você pode utilizar o valor como crédito para adquirir outro produto na loja."
  },
  {
    question: "Meu equipamento fica seguro na loja?",
    answer: "Sim. Assinamos um termo oficial assumindo total responsabilidade civil e técnica sobre o equipamento enquanto ele estiver sob a guarda de nossa loja física monitorada."
  },
  {
    question: "Vocês formatam o equipamento antes da venda?",
    answer: "Sim. Realizamos uma formatação segura e completa (baixo nível/wipe) para garantir que nenhuma foto, senha, histórico ou arquivo pessoal possa ser recuperado pelo futuro comprador."
  }
];

export default function VendaSeuUsadoPage() {
  const faqSchema = generateFAQSchema(FAQS);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "https://www.balao.info" },
    { name: "Venda seu Usado", item: "https://www.balao.info/venda-seu-usado" }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Header />

      {/* Hero Section */}
      <section className="relative bg-zinc-950 text-white py-24 overflow-hidden border-b-4 border-emerald-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-950/20 via-black to-black opacity-80" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <span className="bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-6">
            Seguro contra Golpes e Comprovantes Falsos
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Venda seu notebook, PC Gamer ou peça usada com segurança em Campinas
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            No Balão da Informática Castelo, você deixa seu equipamento em consignação, nossa equipe avalia, anuncia e vende com segurança pela loja.
          </p>
          <div className="flex justify-center">
            <WhatsAppCTA 
              label="Quero vender meu usado com segurança" 
              message="Olá! Tenho um notebook/PC usado e gostaria de saber sobre a avaliação para venda em consignação." 
              variant="success" 
            />
          </div>
        </div>
      </section>

      {/* Risco OLX vs Segurança Balão */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Vender Sozinho */}
            <div className="bg-red-50/50 p-8 rounded-3xl border border-red-200/50 relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Alto Risco</div>
               <h3 className="text-2xl font-bold mb-6 text-red-700 flex items-center gap-2">
                 <AlertTriangle size={24} /> Vender Sozinho (OLX/Facebook)
               </h3>
               <ul className="space-y-4 text-gray-600 text-sm">
                  <li className="flex items-start gap-3">
                     <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                     <span>Golpes de motoboy, falsos comprovantes de PIX ou depósitos em envelope vazio.</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                     <span>Receber estranhos ou curiosos na sua casa para testar o PC ou notebook.</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                     <span>Perda de tempo enorme respondendo chat e propostas absurdas de trocas.</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                     <span>Sem dar garantia para quem compra, forçando você a vender muito abaixo do preço.</span>
                  </li>
               </ul>
            </div>

            {/* Vender na Balão */}
            <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-200/50 relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Recomendado</div>
               <h3 className="text-2xl font-bold mb-6 text-emerald-700 flex items-center gap-2">
                 <CheckCircle size={24} /> Vender na Balão Castelo
               </h3>
               <ul className="space-y-4 text-gray-700 text-sm">
                  <li className="flex items-start gap-3">
                     <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                     <span><strong>Segurança Total:</strong> Pagamento garantido via PIX direto em sua conta após a venda.</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                     <span><strong>Formatação Segura:</strong> Protegemos seus dados pessoais de forma definitiva (wipe de disco).</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                     <span><strong>Sem Encomodação:</strong> Nós anunciamos, negociamos, vendemos e entregamos o equipamento.</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                     <span><strong>Mais Valor:</strong> Vendemos parcelado no cartão e damos garantia técnica para o comprador.</span>
                  </li>
               </ul>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center mt-12">
            <p className="text-gray-700 font-medium mb-2">
              ⚠️ Evite golpes, comprovantes falsos e perda de tempo respondendo curiosos.
            </p>
            <p className="text-gray-600 text-sm">
              Venda seu equipamento usado com a estrutura e a segurança de uma loja física tradicional em Campinas.
            </p>
          </div>
        </div>
      </section>

      {/* Como Funciona em Etapas */}
      <section className="py-20 bg-zinc-950 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">PROCESSO DE VENDA EM 6 ETAPAS</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Tudo transparente, rápido e formalizado em contrato.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 relative">
              <span className="absolute -top-4 left-6 bg-emerald-600 text-white font-black w-8 h-8 rounded-full flex items-center justify-center">1</span>
              <h4 className="text-lg font-bold mb-3 mt-2 text-zinc-100">Leve à Loja</h4>
              <p className="text-zinc-400 text-sm">Traga o equipamento completo (com carregador e caixa, se tiver) na Av. Anchieta, 789 – Cambuí.</p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 relative">
              <span className="absolute -top-4 left-6 bg-emerald-600 text-white font-black w-8 h-8 rounded-full flex items-center justify-center">2</span>
              <h4 className="text-lg font-bold mb-3 mt-2 text-zinc-100">Avaliação Técnica</h4>
              <p className="text-zinc-400 text-sm">Nossa equipe avalia o estado físico, configurações e peças internas do seu computador ou notebook.</p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 relative">
              <span className="absolute -top-4 left-6 bg-emerald-600 text-white font-black w-8 h-8 rounded-full flex items-center justify-center">3</span>
              <h4 className="text-lg font-bold mb-3 mt-2 text-zinc-100">Conferência e Wipe</h4>
              <p className="text-zinc-400 text-sm">O produto passa por testes de hardware e realizamos a formatação segura para proteger sua privacidade.</p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 relative">
              <span className="absolute -top-4 left-6 bg-emerald-600 text-white font-black w-8 h-8 rounded-full flex items-center justify-center">4</span>
              <h4 className="text-lg font-bold mb-3 mt-2 text-zinc-100">Anúncio e Vitrine</h4>
              <p className="text-zinc-400 text-sm">O produto é limpo, higienizado, exposto em nossa vitrine física do Cambuí e anunciado em canais digitais.</p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 relative">
              <span className="absolute -top-4 left-6 bg-emerald-600 text-white font-black w-8 h-8 rounded-full flex items-center justify-center">5</span>
              <h4 className="text-lg font-bold mb-3 mt-2 text-zinc-100">Negociação da Loja</h4>
              <p className="text-zinc-400 text-sm">Cuidamos de responder dúvidas, oferecer parcelamento em 12x e dar garantia de 90 dias para facilitar a venda.</p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 relative">
              <span className="absolute -top-4 left-6 bg-emerald-600 text-white font-black w-8 h-8 rounded-full flex items-center justify-center">6</span>
              <h4 className="text-lg font-bold mb-3 mt-2 text-zinc-100">Receba no PIX</h4>
              <p className="text-zinc-400 text-sm">Após a venda e conclusão do prazo contratual, você recebe o valor combinado direto no PIX ou usa de crédito.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <WhatsAppCTA 
              label="Iniciar Consignação no WhatsApp" 
              message="Olá! Gostaria de agendar para levar meu equipamento na loja para consignação." 
              variant="success" 
            />
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <TestimonialsSection />

      {/* Loja e Horários */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-gray-900 mb-12 text-center">TRAGA SEU EQUIPAMENTO HOJE MESMO</h2>
          <StoreInfo />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-zinc-950 text-white border-t border-zinc-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-black mb-8 text-center">FAQ - VENDA SEU USADO</h2>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/40">
                <h3 className="text-lg font-bold mb-2 text-emerald-400">{faq.question}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-zinc-950 text-center py-6 text-zinc-600 border-t border-zinc-900 text-xs">
        &copy; {new Date().getFullYear()} Balão da Informática Castelo. Todos os direitos reservados.
      </footer>
    </div>
  );
}
