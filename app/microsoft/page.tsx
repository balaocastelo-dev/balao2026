
import { SITE_CONFIG } from "@/lib/config";
import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { getProducts } from "@/lib/db";
import { searchProducts } from "@/lib/searchUtils";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import HeroCTA from "@/components/HeroCTA";
import OfferCountdown from "@/components/OfferCountdown";
import ProductCarousel from "@/components/ProductCarousel";
import { 
  Key, 
  ShieldCheck, 
  Download, 
  MessageCircle, 
  CheckCircle2, 
  Monitor, 
  CreditCard, 
  Lock, 
  Star,
  ArrowRight,
  HelpCircle,
  Building2,
  Clock,
  Wifi,
  FileText,
  Layout
} from "lucide-react";

export const metadata: Metadata = {
  title: "Licenças Microsoft em Campinas | Windows e Office Originais | Balão da Informática",
  description:
    "Compre licenças originais Microsoft Windows 10, Windows 11, Office 365 e Office 2021. Chave de ativação imediata e vitalícia. Suporte para instalação em Campinas.",
  keywords: [
    "licença microsoft campinas",
    "windows original campinas",
    "office original campinas",
    "comprar windows 10 campinas",
    "comprar windows 11 campinas",
    "office 365 preço",
    "chave ativação windows",
    "licença vitalicia office",
  ],
  openGraph: {
    title: "Licenças Microsoft Originais em Campinas | Entrega Digital Imediata",
    description:
      "Garanta seu software original. Licenças Windows e Office com garantia e suporte técnico. Ativação online ou na loja.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

function BlockStats() {
  return (
    <section className="py-12 bg-blue-600 text-white">
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { label: "Licenças Vendidas", value: "+50k" },
          { label: "Clientes Felizes", value: "99%" },
          { label: "Anos de Mercado", value: "15" },
          { label: "Suporte Técnico", value: "24/7" }
        ].map((stat, i) => (
          <div key={i}>
            <div className="text-4xl font-black mb-2">{stat.value}</div>
            <div className="text-blue-200 text-sm uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function BlockWindowsFeatures() {
  return (
    <section className="py-20 bg-white">
       <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
             <h2 className="text-3xl font-black text-slate-900 mb-6">Windows 11: O Futuro Chegou</h2>
             <p className="text-lg text-slate-600 mb-6">Design renovado, widgets úteis e o melhor desempenho para jogos. Atualize agora para a versão mais moderna do sistema operacional.</p>
             <ul className="space-y-3">
                {["Menu Iniciar Centralizado", "Layouts de Encaixe (Snap)", "DirectStorage para Games", "Integração com Teams"].map((f, i) => (
                   <li key={i} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" /> {f}
                   </li>
                ))}
             </ul>
          </div>
          <div className="flex-1 bg-slate-100 p-8 rounded-2xl border border-slate-200">
             <Layout className="w-24 h-24 text-blue-500 mx-auto mb-4" />
             <p className="text-center font-bold text-slate-500">Interface Moderna e Fluida</p>
          </div>
       </div>
    </section>
  )
}

function BlockOfficeFeatures() {
  return (
    <section className="py-20 bg-slate-50 border-y border-slate-200">
       <div className="container mx-auto px-4 flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1">
             <h2 className="text-3xl font-black text-slate-900 mb-6">Office 365 vs Vitalício</h2>
             <p className="text-lg text-slate-600 mb-6">Escolha a melhor opção para sua produtividade. Word, Excel, PowerPoint e muito mais.</p>
             <ul className="space-y-3">
                {["1TB de Nuvem (OneDrive) no 365", "Licença Única no Office 2021", "Apps Sempre Atualizados", "Colaboração em Tempo Real"].map((f, i) => (
                   <li key={i} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-orange-600" /> {f}
                   </li>
                ))}
             </ul>
          </div>
          <div className="flex-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-100 p-4 rounded-xl text-blue-700 font-bold text-center">Word</div>
                <div className="bg-green-100 p-4 rounded-xl text-green-700 font-bold text-center">Excel</div>
                <div className="bg-orange-100 p-4 rounded-xl text-orange-700 font-bold text-center">PowerPoint</div>
                <div className="bg-blue-50 p-4 rounded-xl text-blue-500 font-bold text-center">Outlook</div>
             </div>
          </div>
       </div>
    </section>
  )
}

function BlockProcess() {
   return (
      <section className="py-20 bg-blue-900 text-white text-center">
         <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black mb-12">COMO FUNCIONA A COMPRA</h2>
            <div className="grid md:grid-cols-4 gap-8">
               {[
                  { step: "01", title: "Escolha", desc: "Selecione a versão do Windows ou Office." },
                  { step: "02", title: "Pagamento", desc: "Pague via PIX ou Cartão com segurança." },
                  { step: "03", title: "Recebimento", desc: "Chave enviada em 5 min no seu e-mail." },
                  { step: "04", title: "Ativação", desc: "Insira a chave e ative seu produto original." }
               ].map((s, i) => (
                  <div key={i} className="bg-blue-800/50 p-6 rounded-2xl border border-blue-700 relative">
                     <span className="absolute -top-4 -left-4 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold border-4 border-blue-900">{s.step}</span>
                     <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                     <p className="text-blue-200 text-sm">{s.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>
   )
}

function BlockBusiness() {
   return (
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-blue-600/10"></div>
         <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl font-black mb-6">PARA EMPRESAS</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">Precisa regularizar seu parque de máquinas? Temos condições especiais para volume.</p>
            <div className="flex justify-center gap-4">
               <a href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`} className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors">
                  Solicitar Cotação PJ
               </a>
            </div>
         </div>
      </section>
   )
}

function BlockSecurity() {
   return (
      <section className="py-20 bg-red-50 border-y border-red-100">
         <div className="container mx-auto px-4 text-center max-w-3xl">
            <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-red-900 mb-6">DIGA NÃO À PIRATARIA</h2>
            <p className="text-lg text-red-800 mb-8">
               Ativadores "gratuitos" (KMS, Crack) abrem portas para hackers roubarem seus dados bancários e senhas. 
               Não arrisque sua segurança por uma economia que custa caro.
            </p>
            <div className="inline-block bg-white px-6 py-3 rounded-lg border border-red-200 text-red-600 font-bold shadow-sm">
               Proteja seus dados agora
            </div>
         </div>
      </section>
   )
}

function BlockUrgency() {
   return (
      <div className="bg-yellow-400 text-yellow-900 py-3 font-bold text-center text-sm md:text-base animate-pulse">
         ⚡ OFERTA RELÂMPAGO: Windows 10 Pro com 50% OFF - Só hoje! ⚡
      </div>
   )
}

function BlockSupport() {
   return (
      <section className="py-20 bg-slate-50">
         <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-black mb-12">SUPORTE ESPECIALIZADO</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <Monitor className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Acesso Remoto</h3>
                  <p className="text-sm text-slate-500">Configuramos tudo para você via AnyDesk ou TeamViewer.</p>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <MessageCircle className="w-10 h-10 text-green-500 mx-auto mb-4" />
                  <h3 className="font-bold mb-2">WhatsApp</h3>
                  <p className="text-sm text-slate-500">Tire dúvidas em tempo real com nossos técnicos.</p>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <CheckCircle2 className="w-10 h-10 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Garantia</h3>
                  <p className="text-sm text-slate-500">Se a chave não funcionar, devolvemos seu dinheiro.</p>
               </div>
            </div>
         </div>
      </section>
   )
}

function BlockHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-blue-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-blue-900 to-black"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
      
      <div className="container relative z-10 px-4 text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 border border-white/20 text-blue-200 text-xs md:text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Key className="w-4 h-4 animate-bounce" />
          Licenciamento Oficial e Garantido
        </div>
        
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-300 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] animate-in fade-in zoom-in-50 duration-1000 leading-none">
          SOFTWARE<br />
          <span className="text-stroke-white text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">ORIGINAL</span>
        </h1>
        
        <p className="text-lg md:text-3xl text-blue-100 max-w-4xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Segurança e desempenho para seu PC. Licenças vitalícias do <strong className="text-white font-bold">Windows</strong> e <strong className="text-white font-bold">Office</strong> com suporte técnico incluso.
        </p>

        <div className="pt-8 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <HeroCTA />
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
             <OfferCountdown />
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockBenefits() {
  return (
    <section className="py-12 md:py-20 bg-slate-50 text-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-shadow text-center group">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
              <Download className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold mb-2">Entrega Digital</h3>
            <p className="text-slate-600">Receba sua chave de ativação por e-mail ou WhatsApp em minutos após a confirmação.</p>
          </div>
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-shadow text-center group">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
              <Lock className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold mb-2">100% Seguro</h3>
            <p className="text-slate-600">Livre-se de ativadores piratas e vírus. Tenha acesso a todas as atualizações de segurança.</p>
          </div>
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-shadow text-center group">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
              <ShieldCheck className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold mb-2">Garantia Vitalícia</h3>
            <p className="text-slate-600">Chaves originais vinculadas à sua conta Microsoft. Reinstale quando precisar.</p>
          </div>
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-shadow text-center group">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
              <Monitor className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold mb-2">Suporte Remoto</h3>
            <p className="text-slate-600">Dificuldade para instalar? Nossos técnicos acessam remotamente e configuram para você.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockComparison() {
  return (
    <section className="py-16 bg-slate-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-black text-center mb-12 text-slate-900">
          SOFTWARE <span className="text-blue-600">GENUÍNO</span>
        </h2>
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-3 bg-blue-900 text-white p-4 font-bold text-center">
            <div>Critério</div>
            <div className="text-cyan-400">Licença Original</div>
            <div className="text-slate-400">Ativadores / Pirata</div>
          </div>
          
          <div className="divide-y divide-slate-100">
            <div className="grid grid-cols-3 p-4 text-center items-center hover:bg-slate-50">
              <div className="font-semibold text-slate-700">Segurança</div>
              <div className="text-blue-600 font-bold">100% Seguro</div>
              <div className="text-slate-500">Risco de Vírus/Malware</div>
            </div>
            <div className="grid grid-cols-3 p-4 text-center items-center hover:bg-slate-50">
              <div className="font-semibold text-slate-700">Atualizações</div>
              <div className="text-blue-600 font-bold">Automáticas (Windows Update)</div>
              <div className="text-slate-500">Bloqueadas</div>
            </div>
            <div className="grid grid-cols-3 p-4 text-center items-center hover:bg-slate-50">
              <div className="font-semibold text-slate-700">Estabilidade</div>
              <div className="text-blue-600 font-bold">Sem falhas ou telas azuis</div>
              <div className="text-slate-500">Travamentos constantes</div>
            </div>
             <div className="grid grid-cols-3 p-4 text-center items-center hover:bg-slate-50">
              <div className="font-semibold text-slate-700">Legalidade</div>
              <div className="text-blue-600 font-bold">Nota Fiscal e Auditoria</div>
              <div className="text-slate-500">Crime de Pirataria</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockTestimonials() {
  return (
    <section className="py-16 bg-blue-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-12">CLIENTES SATISFEITOS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-blue-800/50 p-8 rounded-2xl border border-blue-700">
            <div className="flex justify-center gap-1 text-yellow-400 mb-4">
              <Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" />
            </div>
            <p className="italic mb-6">"Comprei o Windows 11 Pro e a chave chegou no meu e-mail em 5 minutos. Ativei sem problemas."</p>
            <p className="font-bold">- Marcos V., TI</p>
          </div>
          <div className="bg-blue-800/50 p-8 rounded-2xl border border-blue-700">
             <div className="flex justify-center gap-1 text-yellow-400 mb-4">
              <Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" />
            </div>
            <p className="italic mb-6">"Precisava do Office para a empresa e eles me orientaram qual versão comprar. Nota fiscal emitida certinho."</p>
            <p className="font-bold">- Juliana R., Gerente</p>
          </div>
          <div className="bg-blue-800/50 p-8 rounded-2xl border border-blue-700">
             <div className="flex justify-center gap-1 text-yellow-400 mb-4">
              <Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" />
            </div>
            <p className="italic mb-6">"O suporte me ajudou a instalar remotamente porque eu não sabia formatar. Excelente serviço!"</p>
            <p className="font-bold">- Pedro H., Estudante</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockFAQ() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-5xl font-black text-center mb-16 text-slate-900">DÚVIDAS FREQUENTES</h2>
        
        <div className="grid gap-6">
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-blue-900">
              <HelpCircle className="text-blue-600" />
              A licença expira?
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Não. As licenças do Windows (10/11) e Office 2019/2021 são vitalícias (ESD). Você paga uma única vez e é seu para sempre. Já o Office 365 é uma assinatura anual ou mensal.
            </p>
          </div>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-blue-900">
              <HelpCircle className="text-blue-600" />
              Serve para formatar o PC?
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Sim! Você pode baixar a imagem oficial (ISO) direto do site da Microsoft e usar nossa chave para ativar durante ou após a formatação.
            </p>
          </div>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-blue-900">
              <HelpCircle className="text-blue-600" />
              Vocês instalam pra mim?
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Oferecemos suporte remoto gratuito para ativação. Se precisar de formatação completa e backup, consulte nossos valores de serviço técnico na loja.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockContact() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-8">PRECISA DE AJUDA?</h2>
        <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
          Nossa equipe está pronta para tirar suas dúvidas e ajudar na escolha da melhor versão para seu uso.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <a 
            href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=Ol%C3%A1%2C%20quero%20comprar%20uma%20licen%C3%A7a%20Microsoft!`}
            className="bg-green-500 hover:bg-green-600 text-white px-10 py-5 rounded-full font-bold text-xl flex items-center gap-3 transition-all hover:scale-105 shadow-lg shadow-green-900/20"
          >
            <MessageCircle className="w-6 h-6" />
            Falar com Especialista
          </a>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/10 text-sm text-slate-400">
          <p>Balão da Informática - Soluções em Tecnologia desde 2010</p>
        </div>
      </div>
    </section>
  );
}

export default async function MicrosoftPage() {
  const allProducts = await getProducts();
  const products = searchProducts(allProducts, "microsoft");
  const filteredProducts = products.slice(0, 8); // Show top 8

  return (
    <main className="min-h-screen bg-white">
      <BlockUrgency />
      <Header />
      <BlockHero />
      <BlockStats />
      <BlockBenefits />
      <BlockWindowsFeatures />
      
      <div id="ofertas" className="py-16 container mx-auto px-4">
        <ProductCarousel 
          title="LICENÇAS MICROSOFT" 
          products={filteredProducts} 
        />
      </div>

      <BlockOfficeFeatures />
      <BlockProcess />
      <BlockSecurity />
      <BlockComparison />
      <BlockBusiness />
      <BlockTestimonials />
      <BlockSupport />
      <BlockFAQ />
      <BlockContact />
    </main>
  );
}
