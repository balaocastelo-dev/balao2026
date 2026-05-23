import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { getProducts, getCategories } from "@/lib/db";
import { Product, Category } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";
import Image from "next/image";
import HeroCTA from "@/components/HeroCTA";
import NotebooksSearchGrid from "@/components/NotebooksSearchGrid";
import { 
  Laptop, 
  Battery, 
  Wifi, 
  Briefcase, 
  GraduationCap, 
  Zap, 
  ShieldCheck, 
  MessageCircle, 
  CheckCircle,
  Truck,
  Award,
  Cpu,
  HardDrive,
  Wrench,
  ChevronDown
} from "lucide-react";

export const metadata: Metadata = {
  title: "Notebooks em Campinas: Performance e Mobilidade | Balão da Informática",
  description:
    "Encontre o notebook ideal para trabalho, estudo ou games. Dell, Lenovo, Acer e Apple com garantia e entrega rápida em Campinas e região.",
  keywords: [
    "notebook campinas",
    "comprar notebook campinas",
    "notebook dell campinas",
    "macbook campinas",
    "notebook gamer campinas",
    "loja de notebook campinas",
  ],
  openGraph: {
    title: "Notebooks em Campinas: Performance e Mobilidade | Balão da Informática",
    description:
      "Notebooks novos e seminovos com garantia, upgrade na hora e entrega rápida em Campinas.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

function BlockHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>

      <div className="container relative z-10 px-4 text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs md:text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Laptop className="w-4 h-4 animate-bounce" />
          Campinas e Região
        </div>
        
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-200 to-blue-900 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-in fade-in zoom-in-50 duration-1000 leading-none">
          NOTEBOOKS<br />
          <span className="text-stroke-white text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">PREMIUM</span>
        </h1>
        
        <p className="text-lg md:text-3xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Mobilidade sem abrir mão da potência. Máquinas ideais para <strong className="text-blue-400 font-bold">Trabalho, Estudo e Games</strong>.
        </p>

        <div className="pt-8 flex justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <a 
             href="#ofertas"
             className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-600/30 hover:scale-105 flex items-center gap-2"
          >
             Ver Ofertas
          </a>
        </div>
      </div>
      
      {/* Marquee Brands */}
      <div className="absolute bottom-0 w-full bg-white/5 border-t border-white/10 py-4 md:py-6 backdrop-blur-sm overflow-hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-16 opacity-60 text-blue-200 font-bold tracking-widest text-xs md:text-xl">
           <span>DELL</span>
           <span>LENOVO</span>
           <span>ACER</span>
           <span>APPLE</span>
           <span>SAMSUNG</span>
           <span>ASUS</span>
           <span>HP</span>
        </div>
      </div>
    </section>
  );
}

function BlockFeatures() {
  return (
    <section className="min-h-[70vh] flex items-center bg-zinc-950 text-white py-12 md:py-20 relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
       
       <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-6 md:p-8 rounded-3xl hover:border-blue-500 transition-colors group">
                   <Briefcase className="w-10 h-10 md:w-12 md:h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-xl md:text-2xl font-bold mb-2">Corporativo</h3>
                   <p className="text-sm md:text-base text-zinc-400">Linhas Latitude, ThinkPad e ProBook. Durabilidade e segurança para sua empresa.</p>
                </div>
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-6 md:p-8 rounded-3xl hover:border-cyan-500 transition-colors group">
                   <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-xl md:text-2xl font-bold mb-2">Estudos</h3>
                   <p className="text-sm md:text-base text-zinc-400">Modelos leves com bateria de longa duração, ideais para levar à faculdade.</p>
                </div>
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-6 md:p-8 rounded-3xl hover:border-indigo-500 transition-colors group col-span-1 sm:col-span-2">
                   <Zap className="w-10 h-10 md:w-12 md:h-12 text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-xl md:text-2xl font-bold mb-2">Performance & Gamer</h3>
                   <p className="text-sm md:text-base text-zinc-400">Notebooks com RTX 3050/4060 e telas de alta frequência para jogos e renderização.</p>
                </div>
             </div>
          </div>
          
          <div className="order-1 lg:order-2 space-y-6 md:space-y-8 text-center lg:text-left">
             <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                PODER <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">PORTÁTIL</span>
             </h2>
             <p className="text-xl md:text-3xl font-medium text-zinc-300 leading-snug">
                Leve seu escritório ou setup gamer para onde você for. Liberdade total sem perder desempenho.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                   <Battery className="w-8 h-8 md:w-10 md:h-10 text-green-400" />
                   <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-500 text-left">Autonomia<br/>Estendida</div>
                </div>
                <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                   <Wifi className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
                   <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-500 text-left">Wi-Fi 6<br/>Ultra Rápido</div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
}

function BlockUpgrade() {
  return (
    <section className="py-12 bg-slate-100 text-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
           <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 flex flex-col justify-center h-full">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-4">
                UPGRADE<br/>
                <span className="text-blue-600">NA HORA</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                 Achou o notebook perfeito mas quer mais memória ou espaço? Turbinamos sua máquina no momento da compra.
              </p>
              <ul className="space-y-3 text-lg font-semibold text-slate-700">
                 <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                    <span>Instalação de SSD NVMe (até 10x mais rápido)</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                    <span>Aumento de Memória RAM (Multitarefa fluido)</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                    <span>Clonagem de Sistema e Dados</span>
                 </li>
              </ul>
           </div>
           
           <div className="relative">
              <div className="relative bg-white p-8 rounded-3xl shadow-lg border border-slate-200 h-full flex flex-col justify-center items-center text-center">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl opacity-50 pointer-events-none"></div>
                 <div className="relative z-10">
                    <div className="flex justify-center gap-4 mb-6">
                        <Cpu className="w-16 h-16 text-blue-600" />
                        <HardDrive className="w-16 h-16 text-cyan-600" />
                    </div>
                    <h3 className="text-3xl font-bold mb-3">Consultoria Grátis</h3>
                    <p className="text-slate-600 text-lg mb-6 max-w-md mx-auto">
                       Não sabe se o notebook suporta upgrade? Nossos técnicos avaliam as possibilidades na hora.
                    </p>
                    <a 
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20sobre%20upgrade%20para%20meu%20notebook!`}
                target="_blank" 
                       rel="noopener noreferrer"
                       className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 inline-block"
                    >
                       Falar com Técnico
                    </a>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}

function BlockQuality() {
   return (
      <section className="min-h-[50vh] flex items-center bg-blue-950 text-white py-12 md:py-20 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
         <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-300 font-bold mb-6 text-sm">
                  <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                  Qualidade Garantida
               </div>
               <h2 className="text-4xl md:text-7xl font-black leading-none mb-6">
                  REVISADOS E<br/>GARANTIDOS
               </h2>
               <p className="text-lg md:text-2xl text-blue-100 opacity-80 leading-relaxed">
                  Todos os equipamentos, novos ou seminovos, passam por rigorosa inspeção de 20 pontos. Tela, teclado, bateria, dobradiças e conectores testados à exaustão.
               </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
               <div className="bg-black/40 backdrop-blur p-6 rounded-2xl border border-blue-500/30 text-center md:text-left">
                  <Award className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 mb-3 mx-auto md:mx-0" />
                  <div className="text-xl md:text-3xl font-bold">Garantia</div>
                  <div className="text-xs md:text-sm opacity-70">Direto na loja</div>
               </div>
               <div className="bg-black/40 backdrop-blur p-6 rounded-2xl border border-blue-500/30 text-center md:text-left">
                  <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-500 mb-3 mx-auto md:mx-0" />
                  <div className="text-xl md:text-3xl font-bold">Nota Fiscal</div>
                  <div className="text-xs md:text-sm opacity-70">Procedência total</div>
               </div>
            </div>
         </div>
      </section>
   );
}

function BlockUrgency() {
   return (
      <section className="py-12 md:py-20 bg-cyan-600 text-white text-center">
         <div className="container mx-auto px-4 max-w-4xl space-y-8">
            <h2 className="text-3xl md:text-6xl font-black">
               PRECISA PARA HOJE?
            </h2>
            <p className="text-lg md:text-2xl font-medium opacity-90">
               Temos diversos modelos a pronta entrega. Retire na loja ou receba via motoboy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 md:pt-8">
               <a 
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=Ol%C3%A1%2C%20preciso%20de%20um%20notebook%20com%20urg%C3%AAncia!`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-cyan-900 px-6 py-4 md:px-8 md:py-5 rounded-full font-black text-lg md:text-xl hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-3 w-full sm:w-auto inline-flex"
               >
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                  CHAMAR NO WHATSAPP AGORA
               </a>
            </div>
            <p className="text-xs md:text-sm opacity-75 mt-4">
               Atendimento rápido • Orçamento sem compromisso
            </p>
         </div>
      </section>
   );
}

// Icon helper
function CheckCircle2({ className }: { className?: string }) {
   return (
      <svg 
         xmlns="http://www.w3.org/2000/svg" 
         width="24" 
         height="24" 
         viewBox="0 0 24 24" 
         fill="none" 
         stroke="currentColor" 
         strokeWidth="2" 
         strokeLinecap="round" 
         strokeLinejoin="round" 
         className={className}
      >
         <circle cx="12" cy="12" r="10"/>
         <path d="m9 12 2 2 4-4"/>
      </svg>
   )
}

function BlockWhyUs() {
  return (
    <section className="py-20 bg-slate-50 text-slate-900 border-t border-slate-200">
        <div className="container mx-auto px-4">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black mb-4">POR QUE ESCOLHER A BALÃO?</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">Confiança de quem está há mais de 15 anos no mercado de Campinas.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6 bg-white rounded-3xl shadow-lg border border-slate-100 hover:border-blue-500 transition-colors group">
                    <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-blue-600 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-bold mb-4">Procedência Garantida</h3>
                    <p className="text-slate-600">Todos os equipamentos com Nota Fiscal e garantia real. Sem surpresas.</p>
                </div>
                <div className="p-6 bg-white rounded-3xl shadow-lg border border-slate-100 hover:border-blue-500 transition-colors group">
                    <Wrench className="w-16 h-16 mx-auto mb-6 text-blue-600 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-bold mb-4">Laboratório Próprio</h3>
                    <p className="text-slate-600">Precisou de suporte? Resolvemos aqui mesmo em Campinas com técnicos certificados.</p>
                </div>
                <div className="p-6 bg-white rounded-3xl shadow-lg border border-slate-100 hover:border-blue-500 transition-colors group">
                    <Truck className="w-16 h-16 mx-auto mb-6 text-blue-600 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-bold mb-4">Entrega Imediata</h3>
                    <p className="text-slate-600">Comprou, levou. Ou receba no conforto da sua casa em até 24h na região.</p>
                </div>
             </div>
        </div>
    </section>
  )
}

function BlockTestimonials() {
  return (
    <section className="py-20 bg-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-center mb-12">CLIENTES SATISFEITOS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { name: "Mariana C.", role: "Designer", quote: "Precisava de um notebook potente para renderizar. O atendimento me indicou o modelo perfeito. Super rápido!" },
                    { name: "Carlos E.", role: "Estudante", quote: "Comprei um seminovo com cara de novo. Bateria durando muito e preço justo. Recomendo." },
                    { name: "Empresa X", role: "Parceiro B2B", quote: "Trocamos todo o parque de máquinas da empresa com a Balão. Suporte impecável e negociação transparente." }
                ].map((t, i) => (
                    <div key={i} className="bg-blue-800/50 p-8 rounded-3xl border border-blue-700">
                        <div className="flex items-center gap-2 mb-4 text-yellow-400">
                            {[1,2,3,4,5].map(s => <span key={s}>★</span>)}
                        </div>
                        <p className="text-blue-100 mb-6 italic">"{t.quote}"</p>
                        <div>
                            <div className="font-bold text-white">{t.name}</div>
                            <div className="text-sm text-blue-300">{t.role}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  )
}

function BlockPayment() {
    return (
        <section className="py-12 bg-white border-t border-slate-100">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">FACILIDADE NO PAGAMENTO</h2>
                <div className="flex flex-wrap justify-center gap-8 items-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-green-600">PIX</span>
                        <span className="text-sm font-bold text-slate-500">10% OFF</span>
                    </div>
                    <div className="w-px h-12 bg-slate-200"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-blue-600">12x</span>
                        <span className="text-sm font-bold text-slate-500">Sem Juros</span>
                    </div>
                    <div className="w-px h-12 bg-slate-200"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-slate-800">Troca</span>
                        <span className="text-sm font-bold text-slate-500">Aceitamos Usado</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default async function NotebooksPage() {
  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  // Filter logic for Notebooks (similar to PC Gamer but for Notebooks)
  // We can look for "notebook" in category name or slug
  const notebookProducts = allProducts.filter((p: Product) => {
    const name = p.name.toLowerCase();
    const category = p.category?.toLowerCase() || "";
    // Basic filter for notebooks
    return (
      category.includes("notebook") || 
      category.includes("laptop") || 
      name.includes("notebook") ||
      name.includes("macbook") ||
      name.includes("dell") || // Often notebooks
      name.includes("lenovo") // Often notebooks
    ) && !category.includes("pc gamer") && !name.includes("pc gamer"); 
    // Exclude PC Gamer explicitly if overlap exists, though unlikely with good categorization
  });

  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Notebooks', item: 'https://www.balao.info/notebooks' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      <Header />
      <main className="flex-1">
        
        {/* BLOCO 1: HERO */}
        <BlockHero />

        {/* BLOCK USAGE - GUIA DE ESCOLHA */}
        <section className="py-12 bg-white border-b border-slate-200">
            <div className="container mx-auto px-4">
                <h2 className="text-center text-2xl font-bold text-slate-900 mb-8">QUAL SEU OBJETIVO?</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a href="#ofertas" className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:scale-105 transition-all border border-slate-100">
                        <Briefcase className="w-10 h-10 text-slate-700" />
                        <span className="font-bold text-slate-900">Trabalho</span>
                    </a>
                    <a href="#ofertas" className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:scale-105 transition-all border border-slate-100">
                        <GraduationCap className="w-10 h-10 text-slate-700" />
                        <span className="font-bold text-slate-900">Estudos</span>
                    </a>
                    <a href="#ofertas" className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:scale-105 transition-all border border-slate-100">
                        <Zap className="w-10 h-10 text-slate-700" />
                        <span className="font-bold text-slate-900">Gamer</span>
                    </a>
                    <a href="#ofertas" className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:scale-105 transition-all border border-slate-100">
                        <Cpu className="w-10 h-10 text-slate-700" />
                        <span className="font-bold text-slate-900">Edição</span>
                    </a>
                </div>
            </div>
        </section>

        {/* PRODUTOS - GRID 1 */}
        <section id="ofertas" className="py-12 md:py-20 bg-zinc-50 min-h-[50vh]">
          <div className="container mx-auto px-4">
             <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-6xl font-black text-slate-900 mb-4">DESTAQUES DA SEMANA</h2>
                <div className="w-16 md:w-24 h-2 bg-blue-600 mx-auto rounded-full"></div>
                <p className="mt-4 text-lg md:text-xl text-slate-600">As melhores oportunidades em custo-benefício e performance.</p>
             </div>
             
             {notebookProducts.length === 0 ? (
               <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl p-8 md:p-12 text-center text-gray-500 text-lg md:text-xl">
                 Carregando estoque de notebooks...
               </div>
             ) : (
               <NotebooksSearchGrid initialProducts={notebookProducts} />
             )}
          </div>
        </section>

        {/* BLOCK TRADE IN */}
        <section className="py-16 bg-gradient-to-r from-blue-900 to-slate-900 text-white relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
             <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
                 <div className="flex-1 text-center md:text-left">
                     <div className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">ECONOMIA INTELIGENTE</div>
                     <h2 className="text-3xl md:text-5xl font-black mb-4">ACEITAMOS SEU USADO</h2>
                     <p className="text-lg text-slate-300 mb-6">Seu notebook antigo vale desconto na compra de um novo. Avaliação justa e na hora.</p>
                     <a href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`} target="_blank" className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform">
                        <MessageCircle className="w-5 h-5" />
                        Avaliar Meu Notebook
                     </a>
                 </div>
                 <div className="flex-1 grid grid-cols-2 gap-4">
                     <div className="bg-white/10 p-4 rounded-xl text-center backdrop-blur">
                         <div className="text-2xl font-bold text-green-400 mb-1">Na Hora</div>
                         <div className="text-sm text-slate-300">Avaliação Presencial</div>
                     </div>
                     <div className="bg-white/10 p-4 rounded-xl text-center backdrop-blur">
                         <div className="text-2xl font-bold text-green-400 mb-1">Qualquer Marca</div>
                         <div className="text-sm text-slate-300">Funcionando ou não</div>
                     </div>
                 </div>
             </div>
        </section>

        {/* BLOCO 2: FEATURES */}
        <BlockFeatures />

        {/* BLOCK BRANDS */}
        <section className="py-12 bg-white border-y border-slate-200">
             <div className="container mx-auto px-4 text-center">
                 <h3 className="text-slate-500 font-bold uppercase tracking-widest mb-8 text-sm">Trabalhamos com as Melhores Marcas</h3>
                 <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                     {/* Placeholder text for logos since we don't have SVGs handy, using text styling */}
                     <span className="text-2xl font-black text-slate-800">DELL</span>
                     <span className="text-2xl font-black text-slate-800">LENOVO</span>
                     <span className="text-2xl font-black text-slate-800">ACER</span>
                     <span className="text-2xl font-black text-slate-800">ASUS</span>
                     <span className="text-2xl font-black text-slate-800">APPLE</span>
                     <span className="text-2xl font-black text-slate-800">SAMSUNG</span>
                 </div>
             </div>
        </section>

        {/* BLOCO 3: UPGRADE */}
        <BlockUpgrade />

        {/* BLOCK SUPPORT */}
        <section className="py-20 bg-zinc-50">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1">
                        <h2 className="text-3xl font-black text-slate-900 mb-4">SUPORTE PÓS-VENDA</h2>
                        <p className="text-slate-600 mb-6">Não te abandonamos após a compra. Nossa equipe está pronta para ajudar com drivers, configuração e garantia.</p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <CheckCircle className="w-5 h-5 text-green-500" /> Drivers
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <CheckCircle className="w-5 h-5 text-green-500" /> Windows
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <CheckCircle className="w-5 h-5 text-green-500" /> Office
                            </div>
                        </div>
                    </div>
                    <div className="shrink-0">
                         <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                             <MessageCircle className="w-12 h-12" />
                         </div>
                    </div>
                </div>
            </div>
        </section>

        {/* BLOCO 4: QUALITY */}
        <BlockQuality />

        {/* BLOCK FAQ */}
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-3xl font-black text-center mb-12">PERGUNTAS FREQUENTES</h2>
                <div className="space-y-4">
                    <details className="group border border-slate-200 rounded-2xl p-6 cursor-pointer open:bg-slate-50 transition-colors">
                        <summary className="font-bold text-lg list-none flex justify-between items-center">
                            Os notebooks têm garantia?
                            <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                        </summary>
                        <p className="mt-4 text-slate-600">Sim! Equipamentos novos possuem 1 ano de garantia (fabricante + loja). Seminovos possuem 3 a 6 meses de garantia direta conosco.</p>
                    </details>
                    <details className="group border border-slate-200 rounded-2xl p-6 cursor-pointer open:bg-slate-50 transition-colors">
                        <summary className="font-bold text-lg list-none flex justify-between items-center">
                            Vocês fazem upgrade na hora?
                            <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                        </summary>
                        <p className="mt-4 text-slate-600">Com certeza. Você pode escolher o notebook e já solicitar aumento de memória RAM ou troca por SSD maior. O serviço é feito na hora.</p>
                    </details>
                    <details className="group border border-slate-200 rounded-2xl p-6 cursor-pointer open:bg-slate-50 transition-colors">
                        <summary className="font-bold text-lg list-none flex justify-between items-center">
                            Aceitam notebook usado na troca?
                            <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                        </summary>
                        <p className="mt-4 text-slate-600">Sim, aceitamos seu notebook usado como parte do pagamento. A avaliação é feita presencialmente em nossa loja em Campinas.</p>
                    </details>
                </div>
            </div>
        </section>

        {/* BLOCO 5: ENTREGA */}
        <section className="min-h-[50vh] flex items-center bg-slate-900 text-white py-12 md:py-20">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div className="text-center md:text-left">
                  <Truck className="w-16 h-16 md:w-20 md:h-20 text-blue-400 mb-6 mx-auto md:mx-0" />
                  <h2 className="text-4xl md:text-5xl font-black mb-6">ENTREGA EXPRESSA</h2>
                  <p className="text-lg md:text-xl text-slate-300 mb-6">
                     Receba seu notebook no mesmo dia em Campinas e Região. Enviamos para todo Brasil com seguro.
                  </p>
               </div>
               <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-blue-300">Região Metropolitana de Campinas</h3>
                  <ul className="space-y-3">
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Campinas</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Valinhos</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Vinhedo</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Sumaré</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Hortolândia</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Paulínia</li>
                  </ul>
               </div>
            </div>
        </section>

        {/* NOVOS BLOCOS */}
        <BlockWhyUs />
        <BlockTestimonials />
        <BlockPayment />

        {/* BLOCO 6: CTA FINAL */}
        <BlockUrgency />

      </main>
    </div>
  );
}
