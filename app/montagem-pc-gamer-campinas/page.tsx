import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import StoreInfo from "@/components/StoreInfo";
import TestimonialsSection from "@/components/TestimonialsSection";
import JsonLd, { generateFAQSchema, generateBreadcrumbSchema } from "@/components/JsonLd";
import { Cpu, ShieldCheck, Clock, MapPin, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Montagem de PC Gamer em Campinas | Balão da Informática Castelo",
  description: "Montagem profissional de computadores gamers em Campinas. Escolha as melhores peças (Intel, AMD, Nvidia), montagem limpa e testes térmicos. WhatsApp 24h.",
  keywords: [
    "montagem de pc gamer campinas",
    "montar pc gamer campinas",
    "peças pc gamer campinas",
    "assistencia pc gamer campinas",
    "computador gamer campinas"
  ],
  alternates: { canonical: "https://www.balao.info/montagem-pc-gamer-campinas" }
};

const FAQS = [
  {
    question: "Quanto tempo demora para montar um PC Gamer?",
    answer: "Se todas as peças estiverem disponíveis, a montagem completa e a realização dos testes de estresse térmicos demoram entre 24h a 48h úteis."
  },
  {
    question: "Posso levar peças que comprei na internet para vocês montarem?",
    answer: "Sim! Montamos computadores utilizando as peças que você já comprou, cobrando apenas a taxa de serviço técnico especializado."
  },
  {
    question: "Vocês fazem cable management?",
    answer: "Sim, a organização dos cabos interna é item padrão em todas as nossas montagens para garantir fluxo de ar perfeito e estética limpa."
  }
];

export default function MontagemPcGamerCampinasPage() {
  const faqSchema = generateFAQSchema(FAQS);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "https://www.balao.info" },
    { name: "Montagem de PC Gamer", item: "https://www.balao.info/montagem-pc-gamer-campinas" }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Header />

      <section className="bg-zinc-950 text-white py-20 border-b-4 border-[#E60012]">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6">
            Montagem de PC Gamer em Campinas
          </h1>
          <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
            Monte o setup dos seus sonhos com técnicos experientes e peças de marcas consagradas. Orientação profissional sobre compatibilidade, testes termais sob estresse e cable management premium.
          </p>
          <div className="flex justify-center gap-4">
            <WhatsAppCTA 
              label="Quero montar meu PC Gamer" 
              message="Olá! Vim pela página de montagem de PC Gamer e gostaria de uma cotação." 
              variant="primary" 
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-6">
            SETUP PERSONALIZADO COM QUEM ENTENDE
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Evite erros comuns de compatibilidade ou queima de peças na montagem. No Balão Castelo, você compra o hardware (placas de vídeo RTX, fontes reais, processadores Ryzen ou Core) e sai com a máquina rodando perfeitamente.
          </p>
        </div>
      </section>

      <TestimonialsSection />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-gray-900 mb-12 text-center">LOJA FÍSICA NO CAMBUÍ</h2>
          <StoreInfo />
        </div>
      </section>

      <section className="py-16 bg-zinc-950 text-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-black mb-8 text-center">FAQ - MONTAGEM PC GAMER</h2>
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
