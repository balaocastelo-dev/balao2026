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
  Monitor, 
  Cpu, 
  HardDrive, 
  Wrench, 
  ShieldCheck, 
  CheckCircle, 
  MapPin, 
  Clock, 
  MessageCircle,
  HelpCircle,
  Activity,
  Zap
} from "lucide-react";

export const metadata: Metadata = {
  title: "Assistência Técnica de Informática em Campinas | Balão Castelo",
  description: "Conserto de notebooks, manutenção de computadores, upgrades, montagem de PC Gamer e recuperação de dados em Campinas. Fale pelo WhatsApp 24h ou visite nossa loja no Cambuí.",
  keywords: [
    "assistência técnica informática campinas",
    "conserto notebook campinas",
    "manutenção de computadores campinas",
    "upgrade pc campinas",
    "recuperação de dados campinas",
    "limpeza notebook campinas",
    "balao da informatica castelo"
  ],
  alternates: { canonical: "https://www.balao.info/assistencia-tecnica" }
};

const FAQS = [
  {
    question: "Vocês consertam notebook?",
    answer: "Sim. Realizamos conserto de notebooks de todas as marcas (Dell, Lenovo, Acer, HP, Asus e Apple). Efetuamos troca de tela, bateria, teclado, reparo de carcaça, dobradiça e reparo avançado de placa-mãe."
  },
  {
    question: "Fazem upgrade de SSD e memória?",
    answer: "Sim. Instalamos SSDs de alta velocidade (NVMe/SATA) e expandimos a memória RAM de computadores e notebooks para deixá-los até 10 vezes mais rápidos."
  },
  {
    question: "Fazem limpeza interna e troca de pasta térmica?",
    answer: "Sim. Fazemos a desmontagem completa, remoção de poeira e aplicação de pasta térmica de alta performance (como Artic Silver ou Thermal Grizzly) para evitar superaquecimento e lentidão."
  },
  {
    question: "Fazem recuperação de dados?",
    answer: "Sim. Recuperamos arquivos perdidos, deletados ou de HDs/SSDs que pararam de funcionar ou estão corrompidos."
  },
  {
    question: "Preciso agendar atendimento?",
    answer: "Não é necessário. Você pode levar seu equipamento diretamente à nossa loja física na Av. Anchieta, 789 – Cambuí, dentro do horário de funcionamento presencial."
  },
  {
    question: "Posso chamar no WhatsApp antes de levar o equipamento?",
    answer: "Com certeza! Fale com nossa equipe técnica pelo WhatsApp 24h no número (19) 98751-0267 para tirar dúvidas preliminares."
  }
];

export default function AssistenciaTecnicaPage() {
  const faqSchema = generateFAQSchema(FAQS);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "https://www.balao.info" },
    { name: "Assistência Técnica", item: "https://www.balao.info/assistencia-tecnica" }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Header />

      {/* Hero Section */}
      <section className="relative bg-zinc-950 text-white py-24 overflow-hidden border-b-4 border-[#E60012]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black opacity-80" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <span className="bg-red-600/10 border border-red-500/30 text-red-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-6">
            Serviço Autorizado e Especializado
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Assistência Técnica de Informática em Campinas
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Conserto de notebooks, computadores, upgrades, limpeza, montagem de PC Gamer e recuperação de dados com atendimento presencial na Av. Anchieta, 789 – Cambuí.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <WhatsAppCTA 
              label="Chamar no WhatsApp" 
              message="Olá! Preciso de atendimento técnico para meu equipamento." 
              variant="primary" 
            />
            <a 
              href="#localizacao" 
              className="inline-flex items-center justify-center gap-2 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white px-6 py-3 rounded-full font-bold transition-all shadow-md active:scale-95"
            >
              Ver localização da loja
            </a>
          </div>
        </div>
      </section>

      {/* Serviços mais procurados */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              SERVIÇOS MAIS PROCURADOS
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Diagnosticamos e reparamos o seu computador ou notebook com rapidez e garantia de peças originais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#E60012] mb-6">
                <Laptop size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Conserto de Notebook</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Troca de tela quebrada, teclado, bateria, reparo de dobradiças e carcaças. Manutenção preventiva e corretiva para Dell, Lenovo, HP, Acer, Asus, Apple e mais.
              </p>
              <WhatsAppCTA label="Consertar meu Notebook" message="Olá! Meu notebook está com problemas e preciso de um orçamento." variant="outline" className="w-full text-xs" />
            </div>

            <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#E60012] mb-6">
                <Monitor size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Manutenção de Computadores</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Formatação, remoção de vírus, reinstalação de sistema operacional, diagnóstico de lentidão e travamentos, substituição de fontes e placas-mãe queimadas.
              </p>
              <WhatsAppCTA label="Consertar meu Computador" message="Olá! Meu PC está com problemas e preciso de manutenção." variant="outline" className="w-full text-xs" />
            </div>

            <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#E60012] mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Upgrade de RAM e SSD</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Deixe seu equipamento antigo super rápido! Substituição de HD por SSD de alta performance e expansão de memória RAM para melhorar o desempenho geral.
              </p>
              <WhatsAppCTA label="Quero um Upgrade" message="Olá! Gostaria de um orçamento para fazer upgrade de memória e SSD." variant="outline" className="w-full text-xs" />
            </div>

            <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#E60012] mb-6">
                <Wrench size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Limpeza e Pasta Térmica</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Limpeza interna completa com troca de pasta térmica para reduzir o calor, acabar com barulho excessivo de coolers e prevenir queima de componentes.
              </p>
              <WhatsAppCTA label="Solicitar Limpeza" message="Olá! Gostaria de fazer a limpeza interna e troca de pasta térmica no meu equipamento." variant="outline" className="w-full text-xs" />
            </div>

            <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#E60012] mb-6">
                <Cpu size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Montagem de PC Gamer</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Montagem especializada com cable management perfeito e testes térmicos. Te ajudamos a escolher as peças corretas para obter o máximo desempenho em jogos.
              </p>
              <WhatsAppCTA label="Montar meu PC Gamer" message="Olá! Quero ajuda para selecionar e montar meu PC Gamer personalizado." variant="outline" className="w-full text-xs" />
            </div>

            <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#E60012] mb-6">
                <HardDrive size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Recuperação de Dados</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Serviço de recuperação de arquivos perdidos ou excluídos em HDs, SSDs e pendrives que pararam de funcionar de forma segura e confidencial.
              </p>
              <WhatsAppCTA label="Recuperar meus Dados" message="Olá! Preciso de ajuda para recuperar dados de um dispositivo de armazenamento." variant="outline" className="w-full text-xs" />
            </div>
          </div>
        </div>
      </section>

      {/* Por que escolher */}
      <section className="py-20 bg-zinc-900 text-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">POR QUE ESCOLHER O BALÃO CASTELO?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Trabalhamos focados em honestidade, agilidade e excelência técnica.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex items-start gap-4">
              <CheckCircle className="text-red-500 shrink-0" size={24} />
              <div>
                <h4 className="text-lg font-bold mb-2">Loja Física no Cambuí</h4>
                <p className="text-zinc-400 text-sm">Traga seu notebook ou PC pessoalmente para maior segurança. Estamos localizados na Av. Anchieta, 789.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="text-red-500 shrink-0" size={24} />
              <div>
                <h4 className="text-lg font-bold mb-2">Peças e Reparo no mesmo Lugar</h4>
                <p className="text-zinc-400 text-sm">Possuímos um amplo estoque de peças de reposição rápidas (telas, teclados, baterias, SSDs, fontes) facilitando o reparo.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="text-red-500 shrink-0" size={24} />
              <div>
                <h4 className="text-lg font-bold mb-2">Suporte WhatsApp 24h</h4>
                <p className="text-zinc-400 text-sm">Você nunca fica sem resposta. Nosso WhatsApp conta com inteligência artificial e time humano 24 horas por dia.</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <WhatsAppCTA label="Falar agora com a assistência no WhatsApp" message="Olá! Preciso de atendimento técnico para meu equipamento." variant="primary" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Localização & Info */}
      <section id="localizacao" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">ATENDIMENTO LOCAL EM CAMPINAS</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Visite nossa estrutura física e fale diretamente com quem resolve.</p>
          </div>
          <StoreInfo />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-zinc-950 text-white border-t border-zinc-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <HelpCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-black">DÚVIDAS FREQUENTES</h2>
          </div>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/40">
                <h3 className="text-lg font-bold mb-2 text-red-400 flex items-start gap-2">
                  <span className="text-red-500 font-bold text-xl leading-none">?</span>
                  {faq.question}
                </h3>
                <p className="text-zinc-400 text-sm pl-4 leading-relaxed">{faq.answer}</p>
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
