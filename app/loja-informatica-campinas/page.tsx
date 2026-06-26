import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import StoreInfo from "@/components/StoreInfo";
import TestimonialsSection from "@/components/TestimonialsSection";
import JsonLd, { generateFAQSchema, generateBreadcrumbSchema } from "@/components/JsonLd";
import { BUSINESS_INFO } from "@/lib/business-info";
import { List, ShieldCheck, Clock, MapPin, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Loja de Informática em Campinas | Balão da Informática Castelo",
  description: "Encontre PCs Gamer, notebooks novos e seminovos, peças, componentes e acessórios na maior loja de informática de Campinas. Atendimento presencial no Cambuí e WhatsApp 24h.",
  keywords: [
    "loja de informática campinas",
    "loja informática cambui campinas",
    "comprar peças computador campinas",
    "comprar notebook campinas",
    "balão da informática campinas"
  ],
  alternates: { canonical: "https://www.balao.info/loja-informatica-campinas" }
};

const FAQS = [
  {
    question: "Onde fica a loja física?",
    answer: `Nossa loja fica na Av. Anchieta, 789 – Cambuí, Campinas – SP. Fica em uma área central de fácil acesso com estacionamento conveniente e atendimento presencial.`
  },
  {
    question: "Vocês têm computadores e notebooks pronta entrega?",
    answer: "Sim! Temos diversos modelos de PCs Gamer e notebooks (novos e seminovos) em nossa vitrine física prontos para retirada imediata."
  },
  {
    question: "Como posso consultar o estoque de peças?",
    answer: "Como nosso estoque de peças (placas de vídeo, processadores, memórias, fontes) muda rapidamente, você pode consultar a disponibilidade em tempo real no nosso WhatsApp 24h pelo número (19) 98751-0267."
  }
];

export default function LojaInformaticaCampinasPage() {
  const faqSchema = generateFAQSchema(FAQS);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "https://www.balao.info" },
    { name: "Loja de Informática", item: "https://www.balao.info/loja-informatica-campinas" }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Header />

      <section className="bg-zinc-950 text-white py-20 border-b-4 border-[#E60012]">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6">
            Loja de Informática em Campinas
          </h1>
          <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
            Seja para comprar um PC Gamer de alta performance, um notebook para estudos ou peças avulsas de hardware, a unidade física do Balão da Informática Castelo no Cambuí é o seu endereço definitivo em Campinas e região.
          </p>
          <div className="flex justify-center gap-4">
            <WhatsAppCTA 
              label="Consultar Estoque no WhatsApp" 
              message="Olá! Vim pela página de loja de informática e gostaria de saber se vocês têm um produto em estoque." 
              variant="primary" 
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-6">
            TUDO EM TECNOLOGIA E ASSISTÊNCIA TÉCNICA
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Unimos a variedade de produtos e peças de informática ao suporte local diferenciado, assistência técnica de confiança e consignação de seminovos. Atendimento rápido na Av. Anchieta, 789.
          </p>
        </div>
      </section>

      <TestimonialsSection />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-gray-900 mb-12 text-center">LOJA FÍSICA E ATENDIMENTO COMPLETO</h2>
          <StoreInfo />
        </div>
      </section>

      <section className="py-16 bg-zinc-950 text-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-black mb-8 text-center">FAQ - LOJA DE INFORMÁTICA</h2>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/40">
                <h3 className="text-lg font-bold mb-2 text-red-400">{faq.question}</h3>
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
