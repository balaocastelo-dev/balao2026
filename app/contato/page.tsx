import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import StoreInfo from "@/components/StoreInfo";
import { BUSINESS_INFO } from "@/lib/business-info";
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from "@/components/JsonLd";
import { Phone, MessageCircle, Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Fale com o Balão da Informática Castelo | Contato Campinas",
  description: "Entre em contato com o Balão da Informática Castelo. Fale pelo WhatsApp 24h ou ligue (19) 3255-1661. Atendimento presencial na Av. Anchieta, 789 – Cambuí, Campinas.",
  keywords: [
    "contato balao da informatica castelo",
    "telefone balao da informatica campinas",
    "whatsapp balao da informatica",
    "endereco balao da informatica cambui"
  ],
  alternates: { canonical: "https://www.balao.info/contato" }
};

export default function ContatoPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "https://www.balao.info" },
    { name: "Contato", item: "https://www.balao.info/contato" }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <JsonLd data={breadcrumbSchema} />
      <Header />

      <section className="bg-zinc-950 text-white py-16 border-b-4 border-[#E60012]">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Fale com o Balão da Informática Castelo
          </h1>
          <p className="text-lg text-zinc-300">
            Tire suas dúvidas sobre peças, computadores, notebooks ou solicite suporte técnico especializado. Estamos à disposição presencialmente ou via WhatsApp 24h.
          </p>
        </div>
      </section>

      {/* Main Info Blocks */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm text-center flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                  <MessageCircle size={24} className="fill-current" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp 24 Horas</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Atendimento com agente de IA inteligente e equipe humana integrada pronto para ajudar a qualquer hora, em qualquer dia da semana.
                </p>
              </div>
              <WhatsAppCTA label="Chamar no WhatsApp" message="Olá! Vim pelo site e gostaria de atendimento." variant="success" className="w-full" />
            </div>

            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm text-center flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#E60012] mx-auto mb-6">
                  <Phone size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Telefone Fixo</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Se preferir falar por voz ou ligações analógicas tradicionais, ligue para nosso time comercial dentro do horário de atendimento presencial.
                </p>
              </div>
              <a
                href={`tel:${BUSINESS_INFO.phone.number}`}
                className="inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-full transition-all active:scale-95 shadow-md w-full"
              >
                Ligar: {BUSINESS_INFO.phone.display}
              </a>
            </div>

            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm text-center flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                  <Mail size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">E-mail Oficial</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Para propostas de parcerias corporativas, orçamentos institucionais formais ou cotações de peças via e-mail corporativo.
                </p>
              </div>
              <a
                href={`mailto:${BUSINESS_INFO.email}`}
                className="inline-flex items-center justify-center border-2 border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 font-bold px-6 py-3 rounded-full transition-all active:scale-95 w-full"
              >
                Enviar E-mail
              </a>
            </div>
          </div>

          {/* Store Info Component */}
          <div className="mb-16">
            <StoreInfo />
          </div>

          {/* Map Embed Section */}
          <div className="bg-gray-50 rounded-3xl border border-gray-100 p-4 shadow-sm overflow-hidden">
            <h3 className="text-xl font-black text-gray-900 mb-4 px-4 pt-2">Localização no Cambuí, Campinas</h3>
            <div className="relative w-full h-[450px] rounded-2xl overflow-hidden shadow-inner">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675.2812061219665!2d-47.05437812543085!3d-22.899351037748443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c8c7d6c6e737c3%3A0xe54e60155bfe71fb!2sAv.%20Anchieta%2C%20789%20-%20Cambu%C3%AD%2C%20Campinas%20-%20SP%2C%2013015-180!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </div>
            <div className="flex justify-between items-center px-4 py-3 text-xs text-gray-500">
              <span>📍 Av. Anchieta, 789 – Cambuí, Campinas – SP. CEP: {BUSINESS_INFO.postalCode}</span>
              <a 
                href="https://maps.google.com/?q=Av.+Anchieta,+789+-+Cambuí,+Campinas+-+SP"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#E60012] font-bold hover:underline"
              >
                Abrir no Google Maps &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-zinc-950 text-center py-6 text-zinc-600 border-t border-zinc-900 text-xs">
        &copy; {new Date().getFullYear()} Balão da Informática Castelo. Todos os direitos reservados.
      </footer>
    </div>
  );
}
