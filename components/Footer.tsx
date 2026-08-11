"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, Phone, MapPin, ChevronDown, ChevronUp, CreditCard } from "lucide-react";

import { SITE_CONFIG } from "@/lib/config";

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
    <footer className="mt-auto border-t border-[var(--site-border)] bg-[var(--site-panel)] pt-16 pb-8 text-[var(--site-muted)]">
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
            <p className="mb-6 text-sm leading-relaxed">
              Comércio e assistência técnica em informática. Tudo o que sua empresa e sua casa precisa em tecnologia.
            </p>
            <div className="flex gap-4">
              <a href={SITE_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[#E60012] transition-colors"><Facebook size={20} /></a>
              <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#E60012] transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Links Section */}
          <div className="border-b border-[var(--site-border)] pb-4 md:border-none md:pb-0">
            <button 
                onClick={() => toggleSection('institucional')}
                className="flex items-center justify-between w-full md:cursor-default"
            >
                <h3 className="mb-2 text-lg font-bold text-[var(--site-text)] md:mb-6">Institucional</h3>
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
          <div className="border-b border-[var(--site-border)] pb-4 md:border-none md:pb-0">
            <button 
                onClick={() => toggleSection('departamentos')}
                className="flex items-center justify-between w-full md:cursor-default"
            >
                <h3 className="mb-2 text-lg font-bold text-[var(--site-text)] md:mb-6">Departamentos</h3>
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
          <div className="border-b border-[var(--site-border)] pb-4 md:border-none md:pb-0">
            <button 
                onClick={() => toggleSection('atendimento')}
                className="flex items-center justify-between w-full md:cursor-default"
            >
                <h3 className="mb-2 text-lg font-bold text-[var(--site-text)] md:mb-6">Atendimento</h3>
                <span className="md:hidden">
                    {isExpanded('atendimento') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
            </button>
            <ul className={`space-y-4 text-sm overflow-hidden transition-all duration-300 ${isExpanded('atendimento') ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100 md:mt-0'}`}>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-[#E60012] mt-0.5" />
                <div>
                    <span className="block font-bold text-[var(--site-text)]">{SITE_CONFIG.phone.display}</span>
                    <span className="text-xs text-[var(--site-muted)]">{SITE_CONFIG.openingHoursDisplay}</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#E60012]" />
                <a href={`mailto:${SITE_CONFIG.email}`} className="transition-colors hover:text-[var(--site-text)]">{SITE_CONFIG.email}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#E60012] mt-0.5" />
                <span className="text-[var(--site-muted)]">
                    {SITE_CONFIG.address}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods Banner */}
        <div className="border-t border-[var(--site-border)] pt-8 pb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-[var(--site-soft)]">Formas de Pagamento</div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[var(--site-muted)]" title="Formas de Pagamento: Pix e Cartões">
                        <CreditCard size={32} />
                        <span className="text-sm">Pix, Visa, Master, Elo, Amex</span>
                    </div>
                </div>
                <div className="text-sm flex items-center gap-2">
                    <span className="text-green-500 font-bold">Site Seguro</span>
                    <div className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                </div>
            </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[var(--site-border)] pt-8 text-center text-sm text-[var(--site-muted)]">
          <p className="mb-2">&copy; 2026 Balão da Informática. Todos os direitos reservados. <Link href="/" className="hover:text-[#E60012]">www.balao.info</Link></p>
          <p className="text-xs opacity-60">Razão Social: {SITE_CONFIG.companyName} | CNPJ: {SITE_CONFIG.cnpj} UNIDADE FRANQUEADA ANCHIETA</p>
        </div>
      </div>
    </footer>
  );
}
