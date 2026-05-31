"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, Phone, MapPin, ChevronDown, ChevronUp, CreditCard, ShieldCheck, MessageCircle, Star, Truck } from "lucide-react";

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

  const mapLink = "https://goo.gl/maps/y1q8J9jX7k72";
  const whatsappHref = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
    SITE_CONFIG.whatsapp.messageDefault
  )}`;

  return (
    <footer className="bg-zinc-950 text-zinc-300 pt-14 pb-8 border-t border-[#E60012] mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-2xl bg-white/10 p-2 text-white">
              <Truck size={18} />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">Entrega rápida</div>
              <div className="text-xs text-zinc-400">Campinas e região (consulte)</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-2xl bg-white/10 p-2 text-white">
              <CreditCard size={18} />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">Até 12x</div>
              <div className="text-xs text-zinc-400">no cartão • sem juros</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-2xl bg-white/10 p-2 text-white">
              <MessageCircle size={18} />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">Atendimento WhatsApp</div>
              <div className="text-xs text-zinc-400">{SITE_CONFIG.whatsapp.display}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-2xl bg-white/10 p-2 text-white">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">Compra segura</div>
              <div className="text-xs text-zinc-400">suporte e assistência própria</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 mb-12">
          
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
            <p className="text-sm leading-relaxed mb-6 text-zinc-300">
              Loja de informática e assistência técnica em Campinas. PCs Gamer, notebooks, hardware e periféricos com suporte de especialista.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#128C7E] px-4 py-2 text-sm font-extrabold text-white transition-colors shadow-[0_14px_30px_rgba(18,140,126,0.25)]"
              >
                <MessageCircle size={16} />
                Falar no WhatsApp
              </a>
              <a
                href={mapLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-extrabold text-white transition-colors"
              >
                <MapPin size={16} />
                Loja física
              </a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-zinc-400">
              <a href={SITE_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook"><Facebook size={20} /></a>
              <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Links Section */}
          <div className="border-b border-white/10 md:border-none pb-4 md:pb-0">
            <button 
                onClick={() => toggleSection('institucional')}
                className="flex items-center justify-between w-full md:cursor-default"
            >
                <h3 className="text-white font-extrabold text-lg mb-2 md:mb-6">Institucional</h3>
                <span className="md:hidden">
                    {isExpanded('institucional') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
            </button>
            <ul className={`space-y-3 text-sm overflow-hidden transition-all duration-300 ${isExpanded('institucional') ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100 md:mt-0'}`}>
              <li><Link href="/sobre-nos" className="hover:text-white transition-colors">Sobre Nós</Link></li>
              <li><Link href="/sobre-a-empresa" className="hover:text-white transition-colors">Sobre a Empresa</Link></li>
              <li><Link href="/como-comprar" className="hover:text-white transition-colors">Como Comprar</Link></li>
              <li><Link href="/seguranca-e-privacidade" className="hover:text-white transition-colors">Segurança e Privacidade</Link></li>
              <li><Link href="/envio-e-entrega" className="hover:text-white transition-colors">Envio e Entrega</Link></li>
              <li><Link href="/trocas-e-devolucoes" className="hover:text-white transition-colors">Trocas e Devoluções</Link></li>
              <li><Link href="/fale-conosco" className="hover:text-white transition-colors">Fale Conosco</Link></li>
            </ul>
          </div>

          {/* Categories Section */}
          <div className="border-b border-white/10 md:border-none pb-4 md:pb-0">
            <button 
                onClick={() => toggleSection('departamentos')}
                className="flex items-center justify-between w-full md:cursor-default"
            >
                <h3 className="text-white font-extrabold text-lg mb-2 md:mb-6">Departamentos</h3>
                <span className="md:hidden">
                    {isExpanded('departamentos') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
            </button>
            <ul className={`space-y-3 text-sm overflow-hidden transition-all duration-300 ${isExpanded('departamentos') ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100 md:mt-0'}`}>
              <li><Link href="/pcgamer" className="hover:text-white transition-colors">PC Gamer</Link></li>
              <li><Link href="/notebooks" className="hover:text-white transition-colors">Notebooks</Link></li>
              <li><Link href="/promocao" className="hover:text-white transition-colors">Promoções</Link></li>
              <li><Link href="/?category=Hardware" className="hover:text-white transition-colors">Hardware</Link></li>
              <li><Link href="/?category=Monitores" className="hover:text-white transition-colors">Monitores</Link></li>
              <li><Link href="/?category=Periféricos" className="hover:text-white transition-colors">Periféricos</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="border-b border-white/10 md:border-none pb-4 md:pb-0">
            <button 
                onClick={() => toggleSection('atendimento')}
                className="flex items-center justify-between w-full md:cursor-default"
            >
                <h3 className="text-white font-extrabold text-lg mb-2 md:mb-6">Atendimento</h3>
                <span className="md:hidden">
                    {isExpanded('atendimento') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
            </button>
            <ul className={`space-y-4 text-sm overflow-hidden transition-all duration-300 ${isExpanded('atendimento') ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100 md:mt-0'}`}>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-[#E60012] mt-0.5" />
                <div>
                    <span className="block font-extrabold text-white">{SITE_CONFIG.phone.display}</span>
                    <span className="text-xs text-zinc-400">Seg. a Sex. das 9h às 18h</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#E60012]" />
                <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-white transition-colors">{SITE_CONFIG.email}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#E60012] mt-0.5" />
                <a href={mapLink} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  {SITE_CONFIG.address}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Star size={18} className="text-[#E60012] mt-0.5" />
                <a href={mapLink} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Ver avaliações no Google
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods Banner (Placeholder) */}
        <div className="border-t border-white/10 pt-8 pb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm font-bold text-white">Formas de pagamento</div>
            <div className="flex items-center gap-3 text-zinc-300" title="Formas de Pagamento: Pix e Cartões">
              <CreditCard size={26} className="text-white/70" />
              <span className="text-sm">Pix • Visa • Master • Elo • Amex</span>
            </div>
            <div className="text-sm flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <span className="text-emerald-200 font-extrabold">Site seguro</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 text-center text-sm text-zinc-400">
          <p className="mb-2">
            &copy; 2026 Balão da Informática. Todos os direitos reservados.{" "}
            <a href="https://www.balao.info" target="_blank" rel="noreferrer" className="hover:text-white">
              www.balao.info
            </a>
          </p>
          <p className="text-xs opacity-70">
            Razão Social: {SITE_CONFIG.companyName} • CNPJ: {SITE_CONFIG.cnpj} • UNIDADE FRANQUEADA ANCHIETA
          </p>
        </div>
      </div>
    </footer>
  );
}
