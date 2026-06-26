"use client";

import Header from "@/components/Header";
import { SITE_CONFIG } from "@/lib/config";
import { BUSINESS_INFO } from "@/lib/business-info";
import { useToast } from "@/context/ToastContext";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  trackFormAttempt,
  trackFormError,
  trackFormSuccess,
  trackPageLeadView,
} from "@/lib/tracking";

export default function FaleConoscoPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    trackPageLeadView({
      page_path: pathname,
      source: "fale-conosco",
      service: "Contato geral",
    });
  }, [pathname]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Send to API
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        message: formData.get("message"),
        subject: formData.get("subject"),
        source: "fale-conosco",
        service: "Contato geral",
      };

      trackFormAttempt({
        page_path: pathname,
        source: "fale-conosco",
        service: "Contato geral",
      });

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Falha ao enviar mensagem");

      trackFormSuccess({
        page_path: pathname,
        source: "fale-conosco",
        service: "Contato geral",
      });
      showToast("Mensagem enviada com sucesso! Entraremos em contato em breve.", "success");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error(error);
      trackFormError({
        page_path: pathname,
        source: "fale-conosco",
        service: "Contato geral",
      });
      showToast("Erro ao enviar mensagem. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#E60012] border-b pb-4">Fale Conosco</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Info */}
          <div className="space-y-8">
            <p className="text-lg text-gray-700">
              Tem alguma dúvida, sugestão ou reclamação? Estamos aqui para ouvir você. 
              Utilize o formulário ou um de nossos canais de atendimento.
            </p>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm text-[#E60012]">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Televendas</h3>
                  <a
                    href={`tel:${SITE_CONFIG.phone.number}`}
                    data-conversion-source="fale-conosco"
                    data-conversion-label="Televendas"
                    data-conversion-service="Contato geral"
                    className="text-gray-600 hover:text-[#E60012] transition-colors"
                  >
                    {SITE_CONFIG.phone.display}
                  </a>
                  <p className="text-sm text-gray-500">Seg–Sex: 08h–18h | Sáb: 08h–13h</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm text-[#E60012]">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">E-mail</h3>
                  <a
                    href={`mailto:${SITE_CONFIG.email}`}
                    data-conversion-source="fale-conosco"
                    data-conversion-label="Email contato"
                    data-conversion-service="Contato geral"
                    className="text-gray-600 hover:text-[#E60012] transition-colors"
                  >
                    {SITE_CONFIG.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm text-[#E60012]">
                  <MapPin size={24} />
                </div>
                <div>
                   <h3 className="font-bold text-gray-800 text-lg">Endereço</h3>
                   <p className="text-gray-600">
                     {SITE_CONFIG.address}
                   </p>
                   <p className="text-sm text-gray-500">CEP: {BUSINESS_INFO.postalCode}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm" style={{color: '#25D366'}}>
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">WhatsApp</h3>
                  <a
                    href={BUSINESS_INFO.whatsapp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-green-600 transition-colors font-bold"
                  >
                    {BUSINESS_INFO.whatsapp.display}
                  </a>
                  <p className="text-sm text-gray-500">Atendimento 24h: agente de IA + atendimento humano</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Envie sua mensagem</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">Nome</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    required 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700">Telefone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  required 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="subject" className="text-sm font-medium text-gray-700">Assunto</label>
                <select 
                  id="subject" 
                  name="subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all bg-white"
                >
                  <option>Dúvida sobre produto</option>
                  <option>Status do pedido</option>
                  <option>Troca ou devolução</option>
                  <option>Sugestão ou reclamação</option>
                  <option>Outros</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="message" className="text-sm font-medium text-gray-700">Mensagem</label>
                <textarea 
                  id="message" 
                  name="message"
                  required 
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Como podemos ajudar?"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#E60012] text-white font-bold py-3 px-6 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send size={18} /> Enviar Mensagem
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
