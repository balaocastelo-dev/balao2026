"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, Phone, MapPin, ChevronDown, ChevronUp, CreditCard } from "lucide-react";

import { SITE_CONFIG } from "@/lib/config";
import { BUSINESS_INFO } from "@/lib/business-info";

export default function Footer() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isExpanded = (section: string) => expandedSections[section];

  return (
    <footer className="bg-gray-100 text-gray-600 pt-16 pb-8 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* About Section */}
          <div className="mb-6 md:mb-0">
            <Link href="/" className="block mb-6 group no-underline w-fit">
                <div className="relative w-[160px] h-[50px]">
                    <Image 
                        src="/logo.png" 
                        alt="Balão da Informática" 
                        fill
                        className="object-contain"
                    />
                </div>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Comércio e assistência técnica em informática. Tudo o que sua empresa e sua casa precisa em tecnologia.
            </p>
            <div className="flex gap-4">
              <a href={SITE_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#E60012] transition-colors"><Facebook size={20} /></a>
              <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#E60012] transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Links Section */}
          <div className="border-b border-gray-200 md:border-none pb-4 md:pb-0">
            <button 
                onClick={() => toggleSection('institucional')}
                className="flex items-center justify-between w-full md:cursor-default"
            >
                <h3 className="text-gray-900 font-bold text-lg mb-2 md:mb-6">Institucional</h3>
                <span className="md:hidden">
                    {isExpanded('institucional') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
            </button>
            <ul className={`space-y-3 text-sm overflow-hidden transition-all duration-300 ${isExpanded('institucional') ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100 md:mt-0'}`}>
              <li><Link href="/sobre-nos" className="hover:text-[#E60012] transition-colors">Sobre Nós</Link></li>
              <li><Link href="/sobre-a-empresa" className="hover:text-[#E60012] transition-colors">Sobre a Empresa</Link></li>
              <li><Link href="/como-comprar" className="hover:text-[#E60012] transition-colors">Como Comprar</Link></li>
              <li><Link href="/seguranca-e-privacidade" className="hover:text-[#E60012] transition-colors">Segurança e Privacidade</Link></li>
              <li><Link href="/envio-e-entrega" className="hover:text-[#E60012] transition-colors">Envio e Entrega</Link></li>
              <li><Link href="/trocas-e-devolucoes" className="hover:text-[#E60012] transition-colors">Trocas e Devoluções</Link></li>
              <li><Link href="/fale-conosco" className="hover:text-[#E60012] transition-colors">Fale Conosco</Link></li>
              <li><Link href="/especialidades" className="hover:text-[#E60012] transition-colors">Especialidades</Link></li>
              <li><Link href="/regiao" className="hover:text-[#E60012] transition-colors">Atendimento Regional</Link></li>
              <li><Link href="/urgente" className="hover:text-[#E60012] transition-colors">Atendimento Urgente</Link></li>
            </ul>
          </div>

          {/* Categories Section */}
          <div className="border-b border-gray-200 md:border-none pb-4 md:pb-0">
            <button 
                onClick={() => toggleSection('departamentos')}
                className="flex items-center justify-between w-full md:cursor-default"
            >
                <h3 className="text-gray-900 font-bold text-lg mb-2 md:mb-6">Departamentos</h3>
                <span className="md:hidden">
                    {isExpanded('departamentos') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
            </button>
            <ul className={`space-y-3 text-sm overflow-hidden transition-all duration-300 ${isExpanded('departamentos') ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100 md:mt-0'}`}>
              <li><Link href="/departamentos" className="hover:text-[#E60012] transition-colors">Departamentos</Link></li>
              <li><Link href="/pcgamer" className="hover:text-[#E60012] transition-colors">Computadores Gamer</Link></li>
              <li><Link href="/notebooks" className="hover:text-[#E60012] transition-colors">Notebooks</Link></li>
              <li><Link href="/premium" className="hover:text-[#E60012] transition-colors">Premium</Link></li>
              <li><Link href="/promocao" className="hover:text-[#E60012] transition-colors">Promoções</Link></li>
              <li><Link href="/seminovos" className="hover:text-[#E60012] transition-colors">Seminovos</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="border-b border-gray-200 md:border-none pb-4 md:pb-0">
            <button 
                onClick={() => toggleSection('atendimento')}
                className="flex items-center justify-between w-full md:cursor-default"
            >
                <h3 className="text-gray-900 font-bold text-lg mb-2 md:mb-6">Atendimento</h3>
                <span className="md:hidden">
                    {isExpanded('atendimento') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
            </button>
            <ul className={`space-y-4 text-sm overflow-hidden transition-all duration-300 ${isExpanded('atendimento') ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100 md:mt-0'}`}>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-[#E60012] mt-0.5" />
                <div>
                    <span className="block font-bold text-gray-900">{SITE_CONFIG.phone.display}</span>
                    <span className="text-xs">Seg–Sex: 08h–18h | Sáb: 08h–13h</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#E60012]" />
                <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-gray-900 transition-colors">{SITE_CONFIG.email}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#E60012] mt-0.5" />
                <span>
                    {SITE_CONFIG.address}<br />
                    <span className="text-xs">CEP: {BUSINESS_INFO.postalCode}</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#25D366" className="mt-0.5 shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span className="text-xs text-gray-600">WhatsApp 24h: agente de IA + atendimento humano</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods Banner (Placeholder) */}
        <div className="border-t border-gray-200 pt-8 pb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm">Formas de Pagamento</div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-gray-400" title="Formas de Pagamento: Pix e Cartões">
                        <CreditCard size={32} />
                        <span className="text-sm">Pix, Visa, Master, Elo, Amex</span>
                    </div>
                </div>
                <div className="text-sm flex items-center gap-2">
                    <span className="text-green-600">Site Seguro</span>
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                </div>
            </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          <p className="mb-2">&copy; 2026 Balão da Informática. Todos os direitos reservados. <Link href="/" className="hover:text-[#E60012]">www.balao.info</Link></p>
          <p className="text-xs opacity-60">Razão Social: {SITE_CONFIG.companyName} | CNPJ: {SITE_CONFIG.cnpj} UNIDADE FRANQUEADA ANCHIETA</p>
        </div>
      </div>
    </footer>
  );
}
