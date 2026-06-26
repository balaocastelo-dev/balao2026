import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import StoreInfo from "@/components/StoreInfo";
import TestimonialsSection from "@/components/TestimonialsSection";
import JsonLd, { generateFAQSchema, generateBreadcrumbSchema } from "@/components/JsonLd";
import { Monitor, ShieldCheck, Clock, MapPin, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Manutenção de Computadores em Campinas | Balão Castelo",
  description: "Manutenção de computadores (desktops, PCs de escritório e PCs Gamer) em Campinas. Formatação, limpeza física, troca de pasta térmica e consertos gerais. WhatsApp 24h.",
  keywords: [
    "manutenção de computadores campinas",
    "conserto de computadores campinas",
    "técnico de informática campinas",
    "manutenção de pc campinas",
    "formatar computador campinas"
  ],
  alternates: { canonical: "https://www.balao.info/manutencao-computadores-campinas" }
};

const FAQS = [
  {
    question: "Quanto custa para formatar um computador?",
    answer: "A formatação padrão de computador inclui backup de segurança dos arquivos pessoais, instalação limpa do Windows/Linux e drivers oficiais. Fale conosco no WhatsApp para valores exatos."
  },
  {
    question: "Vocês atendem empresas em Campinas?",
    answer: "Sim, realizamos manutenção avulsa em computadores de empresas de Campinas e região metropolitana."
  },
  {
    question: "Meu PC está ligando mas não dá vídeo. Tem conserto?",
    answer: "Com certeza. Geralmente isso ocorre por mau contato em memórias, placa de vídeo ou problemas na fonte de alimentação. Nosso laboratório faz o teste e resolve no mesmo dia."
  }
];

export default function ManutencaoComputadoresCampinasPage() {
  const faqSchema = generateFAQSchema(FAQS);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "https://www.balao.info" },
    { name: "Manutenção de Computadores", item: "https://www.balao.info/manutencao-computadores-campinas" }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Header />

      <section className="bg-zinc-950 text-white py-20 border-b-4 border-[#E60012]">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6">
            Manutenção de Computadores em Campinas
          </h1>
          <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
            Seu computador de trabalho ou estudo está lento ou desligando sozinho? Fale com a equipe do Balão da Informática Castelo. Oferecemos formatação segura, limpeza física, troca de fontes e hardware queimado.
          </p>
          <div className="flex justify-center gap-4">
            <WhatsAppCTA 
              label="Falar com Técnico no WhatsApp" 
              message="Olá! Vim pela página de manutenção de computadores e preciso de assistência." 
              variant="primary" 
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-6">
            SUPORTE E MANUTENÇÃO LOCAL
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Estamos localizados na Av. Anchieta, 789 – Cambuí, em uma região de fácil acesso em Campinas. Você pode trazer seu desktop diretamente sem agendamento prévio ou tirar dúvidas no WhatsApp 24h.
          </p>
        </div>
      </section>

      <TestimonialsSection />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-gray-900 mb-12 text-center">ENDEREÇO E HORÁRIOS DA LOJA</h2>
          <StoreInfo />
        </div>
      </section>

      <section className="py-16 bg-zinc-950 text-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-black mb-8 text-center">FAQ - MANUTENÇÃO DE COMPUTADORES</h2>
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
