import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import StoreInfo from "@/components/StoreInfo";
import TestimonialsSection from "@/components/TestimonialsSection";
import JsonLd, { generateFAQSchema, generateBreadcrumbSchema } from "@/components/JsonLd";
import { Laptop, ShieldCheck, Clock, MapPin, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Conserto de Notebook em Campinas | Balão da Informática Castelo",
  description: "Assistência técnica para notebook em Campinas. Conserto de tela, teclado, bateria, carcaça e placa-mãe. Atendimento presencial na Av. Anchieta, 789 – Cambuí e WhatsApp 24h.",
  keywords: [
    "conserto de notebook campinas",
    "assistência técnica notebook campinas",
    "consertar notebook cambuí campinas",
    "conserto macbook campinas",
    "reparo de notebook campinas",
    "tela de notebook campinas"
  ],
  alternates: { canonical: "https://www.balao.info/conserto-notebook-campinas" }
};

const FAQS = [
  {
    question: "Quanto tempo demora para avaliar meu notebook?",
    answer: "A maioria das avaliações e diagnósticos rápidos de notebooks é feita no mesmo dia ou em até 24h úteis na nossa unidade do Cambuí."
  },
  {
    question: "Vocês trocam tela quebrada de notebook?",
    answer: "Sim. Temos em estoque telas LED de várias resoluções e tamanhos (14.0, 15.6, etc.) e realizamos a substituição com garantia local."
  },
  {
    question: "Trocam teclado de notebook de qualquer marca?",
    answer: "Sim, trocamos teclados de marcas como Dell, Acer, Lenovo, HP, Samsung, Asus e Apple."
  },
  {
    question: "Aceitam cartão ou parcelamento no conserto?",
    answer: "Sim, aceitamos pagamentos via PIX com desconto ou parcelamento em até 12 vezes no cartão de crédito."
  }
];

export default function ConsertoNotebookCampinasPage() {
  const faqSchema = generateFAQSchema(FAQS);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "https://www.balao.info" },
    { name: "Conserto de Notebook", item: "https://www.balao.info/conserto-notebook-campinas" }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Header />

      <section className="bg-zinc-950 text-white py-20 border-b-4 border-[#E60012]">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6">
            Conserto de Notebook em Campinas
          </h1>
          <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
            Seu notebook está travando, não liga ou quebrou a tela? Resolva na hora na nossa loja física no Cambuí. Troca de telas, baterias, teclados, limpeza térmica e upgrades de SSD.
          </p>
          <div className="flex justify-center gap-4">
            <WhatsAppCTA 
              label="Quero consertar meu notebook" 
              message="Olá! Vim pela página de conserto de notebook e gostaria de um orçamento." 
              variant="primary" 
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-black text-gray-900 mb-6 text-center">
            ASSISTÊNCIA RÁPIDA E ESPECIALIZADA
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed text-center">
            Com mais de 15 anos de mercado, o Balão da Informática Castelo realiza reparos rápidos com técnicos experientes locais. Contamos com laboratório próprio em Campinas equipado para consertos simples até reparo avançado de placa-mãe.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex gap-4">
              <Laptop className="text-[#E60012] shrink-0" size={32} />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Marcas que Atendemos</h3>
                <p className="text-gray-600 text-sm">Dell, Lenovo, Acer, HP, Asus, Samsung, MacBook (Apple) e notebooks corporativos ou gamers.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <ShieldCheck className="text-[#E60012] shrink-0" size={32} />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Garantia Local</h3>
                <p className="text-gray-600 text-sm">Todos os nossos serviços contam com garantia legal de 90 dias direto em nossa loja física em Campinas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-gray-900 mb-12 text-center">INFORMAÇÕES DE ATENDIMENTO E LOCALIZAÇÃO</h2>
          <StoreInfo />
        </div>
      </section>

      <section className="py-16 bg-zinc-950 text-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-black mb-8 text-center">FAQ - CONSERTO DE NOTEBOOK</h2>
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
