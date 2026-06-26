import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import StoreInfo from "@/components/StoreInfo";
import TestimonialsSection from "@/components/TestimonialsSection";
import JsonLd, { generateFAQSchema, generateBreadcrumbSchema } from "@/components/JsonLd";
import { HardDrive, ShieldCheck, Clock, MapPin, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Recuperação de Dados em Campinas | Balão da Informática Castelo",
  description: "Serviço profissional de recuperação de arquivos e dados perdidos em HDs, SSDs, pendrives e cartões de memória em Campinas. Análise segura e confidencial. WhatsApp 24h.",
  keywords: [
    "recuperação de dados campinas",
    "recuperar arquivos hd campinas",
    "recuperar fotos apagadas campinas",
    "recuperar dados ssd campinas",
    "assistencia tecnica hd campinas"
  ],
  alternates: { canonical: "https://www.balao.info/recuperacao-de-dados-campinas" }
};

const FAQS = [
  {
    question: "Quanto custa o diagnóstico para recuperação de dados?",
    answer: "A avaliação primária para analisar as chances de recuperação é feita em laboratório. Entre em contato pelo WhatsApp para agendar."
  },
  {
    question: "Vocês garantem que os arquivos serão recuperados?",
    answer: "Nenhum laboratório pode garantir 100% antes da análise. No entanto, nossas taxas de sucesso em danos lógicos e partições corrompidas são muito altas."
  },
  {
    question: "O processo é confidencial?",
    answer: "Com certeza. Mantemos sigilo absoluto sobre os dados de nossos clientes, com exclusão segura dos backups após a entrega definitiva dos dados recuperados."
  }
];

export default function RecuperacaoDeDadosCampinasPage() {
  const faqSchema = generateFAQSchema(FAQS);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "https://www.balao.info" },
    { name: "Recuperação de Dados", item: "https://www.balao.info/recuperacao-de-dados-campinas" }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Header />

      <section className="bg-zinc-950 text-white py-20 border-b-4 border-[#E60012]">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6">
            Recuperação de Dados em Campinas
          </h1>
          <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
            Perdeu seus arquivos, fotos de família ou documentos da empresa? Recuperamos dados de HDs externos, internos, SSDs, pendrives e cartões de memória corrompidos ou formatados.
          </p>
          <div className="flex justify-center gap-4">
            <WhatsAppCTA 
              label="Falar com Especialista em Dados" 
              message="Olá! Preciso de ajuda para recuperar arquivos perdidos em um dispositivo de armazenamento." 
              variant="primary" 
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-6">
            SEGURANÇA E CONFIDENCIALIDADE
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Traga seu dispositivo para análise em nossa loja física na Av. Anchieta, 789 – Cambuí, Campinas. Contamos com softwares especializados e técnicas avançadas para ler partições danificadas e extrair seus dados com segurança.
          </p>
        </div>
      </section>

      <TestimonialsSection />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-gray-900 mb-12 text-center">INFORMAÇÕES DE ATENDIMENTO</h2>
          <StoreInfo />
        </div>
      </section>

      <section className="py-16 bg-zinc-950 text-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-black mb-8 text-center">FAQ - RECUPERAÇÃO DE DADOS</h2>
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
