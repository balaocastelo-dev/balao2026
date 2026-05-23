
import React from "react";
import { SITE_CONFIG } from "@/lib/config";
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
  Zap, 
  Battery, 
  Truck, 
  ShieldCheck, 
  MessageCircle, 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  Clock, 
  Star,
  ArrowRight,
  AlertTriangle,
  Flame,
  Plug,
  Laptop,
  Smartphone
} from "lucide-react";

function BlockUrgencyBanner() {
  return (
    <div className="bg-red-600 text-white py-2 text-center text-sm md:text-base font-bold animate-pulse">
      🚨 Bateria acabando? Entregamos seu carregador em até 60 minutos! Peça agora. 🚨
    </div>
  )
}

function BlockStats() {
  return (
    <section className="py-12 bg-blue-600 text-white">
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { label: "Carregadores em Estoque", value: "+1000" },
          { label: "Modelos Compatíveis", value: "99%" },
          { label: "Tempo Médio Entrega", value: "45min" },
          { label: "Garantia (Meses)", value: "12" }
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

function BlockSymptoms() {
  return (
    <section className="py-20 bg-zinc-50">
       <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-12 text-zinc-900">SINAIS QUE SEU CARREGADOR VAI PARAR</h2>
          <div className="grid md:grid-cols-4 gap-6">
             {[
               { icon: Zap, title: "Mau Contato", desc: "Só carrega se ficar mexendo no cabo ou na ponta." },
               { icon: Flame, title: "Superaquecimento", desc: "A fonte esquenta muito, chegando a queimar a mão." },
               { icon: Battery, title: "Carga Lenta", desc: "Demora horas para subir 10% de bateria." },
               { icon: AlertTriangle, title: "Ruídos Estranhos", desc: "Barulho de chiado ou zumbido vindo da fonte." }
             ].map((item, i) => (
               <div key={i} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                  <item.icon className="w-10 h-10 text-red-500 mb-4" />
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-zinc-600 text-sm">{item.desc}</p>
               </div>
             ))}
          </div>
       </div>
    </section>
  )
}

function BlockProcess() {
   return (
      <section className="py-20 bg-white text-center">
         <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black mb-12 text-slate-900">COMO COMPRAR O MODELO CERTO</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
               <div className="relative p-8 rounded-3xl bg-blue-50 border-2 border-blue-100">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
                  <h3 className="text-xl font-bold mt-4 mb-4">Verifique a Etiqueta</h3>
                  <p className="text-slate-600">Olhe embaixo do notebook ou na fonte antiga a voltagem (ex: 19V) e amperagem (ex: 3.42A).</p>
               </div>
               <div className="relative p-8 rounded-3xl bg-blue-50 border-2 border-blue-100">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
                  <h3 className="text-xl font-bold mt-4 mb-4">Confira o Pino</h3>
                  <p className="text-slate-600">Veja se a ponta é fina, grossa, retangular (USB) ou tipo C. Se tiver dúvida, tire uma foto!</p>
               </div>
               <div className="relative p-8 rounded-3xl bg-blue-50 border-2 border-blue-100">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
                  <h3 className="text-xl font-bold mt-4 mb-4">Chame no WhatsApp</h3>
                  <p className="text-slate-600">Mande a foto da etiqueta e do pino para nosso especialista confirmar o modelo exato.</p>
               </div>
            </div>
            <div className="mt-12">
               <a href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=Tenho%20dúvida%20no%20modelo%20do%20carregador`} className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-full font-bold hover:bg-green-600 transition-colors">
                  <MessageCircle /> Enviar foto agora
               </a>
            </div>
         </div>
      </section>
   )
}

function BlockConnectorTypes() {
   return (
      <section className="py-20 bg-slate-900 text-white">
         <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-12">TEMOS TODOS OS TIPOS DE CONECTORES</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {[
                  "Ponta Agulha (Dell/HP)",
                  "Ponta Amarela (Lenovo/Asus)",
                  "Ponta Azul (HP)",
                  "USB-C (Modernos)",
                  "Magsafe (MacBook)",
                  "Retangular (Lenovo)",
                  "Ponta Fina (Acer/Samsung)",
                  "Ponta Grossa (Toshiba)",
                  "Bullet (LG)",
                  "Surface (Microsoft)"
               ].map((type, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-lg flex items-center justify-center text-center h-24 hover:bg-white/10 transition-colors">
                     <span className="font-bold text-blue-300">{type}</span>
                  </div>
               ))}
            </div>
         </div>
      </section>
   )
}

function BlockSafety() {
   return (
      <section className="py-20 bg-red-50 border-y border-red-100">
         <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
               <AlertTriangle className="w-16 h-16 text-red-600 mb-6" />
               <h2 className="text-3xl font-black text-red-900 mb-6">O PERIGO DOS CARREGADORES BARATOS</h2>
               <p className="text-lg text-red-800 mb-6">
                  Carregadores genéricos de baixa qualidade não possuem filtros de linha e proteção contra surtos. O resultado?
               </p>
               <ul className="space-y-3">
                  {[
                     "Queima da placa mãe do notebook",
                     "Vício da bateria (perda de autonomia)",
                     "Risco de incêndio e curto-circuito",
                     "Interferência no trackpad e mouse"
                  ].map((item, i) => (
                     <li key={i} className="flex items-center gap-3 text-red-700 font-medium">
                        <Flame className="w-5 h-5" /> {item}
                     </li>
                  ))}
               </ul>
            </div>
            <div className="flex-1 bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500">
               <h3 className="text-xl font-bold mb-4 text-slate-900">Na Balão da Informática é diferente:</h3>
               <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                     <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                     <span className="text-slate-600">Componentes de alta qualidade que protegem seu notebook.</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                     <span className="text-slate-600">Voltagem estável que aumenta a vida útil da bateria.</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                     <span className="text-slate-600">Certificações de segurança INMETRO/CE.</span>
                  </li>
               </ul>
            </div>
         </div>
      </section>
   )
}

function BlockBrands() {
   return (
      <section className="py-16 bg-white">
         <div className="container mx-auto px-4 text-center">
            <p className="text-slate-500 font-bold mb-8 uppercase tracking-widest">Compatível com as principais marcas</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
               {["DELL", "HP", "LENOVO", "ACER", "SAMSUNG", "ASUS", "APPLE", "LG", "SONY", "POSITIVO"].map((brand, i) => (
                  <span key={i} className="text-2xl md:text-4xl font-black text-slate-300 hover:text-blue-600 cursor-default select-none">{brand}</span>
               ))}
            </div>
         </div>
      </section>
   )
}

function BlockWarrantyDetails() {
   return (
      <section className="py-20 bg-slate-50">
         <div className="container mx-auto px-4 text-center">
            <ShieldCheck className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-slate-900 mb-6">GARANTIA SEM BUROCRACIA</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12">
               Sabemos que você não pode ficar sem trabalhar. Por isso, nossa garantia é diferenciada.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-lg mb-2">Troca Imediata</h3>
                  <p className="text-sm text-slate-500">Se der defeito, trocamos na hora na loja. Sem esperar análise de fábrica.</p>
               </div>
               <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-lg mb-2">12 Meses</h3>
                  <p className="text-sm text-slate-500">Um ano inteiro de tranquilidade para você usar seu equipamento.</p>
               </div>
               <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-lg mb-2">Suporte Técnico</h3>
                  <p className="text-sm text-slate-500">Dúvidas sobre o funcionamento? Nossa equipe ajuda você.</p>
               </div>
            </div>
         </div>
      </section>
   )
}

export const metadata: Metadata = {
  title: "Carregadores de Notebook em Campinas | Entrega em 60 Minutos | Balão da Informática",
  description:
    "Carregadores originais e compatíveis para todas as marcas de notebook em Campinas. Dell, HP, Lenovo, Acer, Samsung, Asus. Entrega expressa em até 60 minutos.",
  keywords: [
    "carregadores campinas",
    "carregador notebook campinas",
    "fonte notebook campinas",
    "entrega rápida carregadores",
    "carregador dell campinas",
    "carregador lenovo campinas",
    "carregador acer campinas",
    "carregador hp campinas",
    "carregador samsung campinas",
    "carregador asus campinas",
  ],
  openGraph: {
    title: "Carregadores de Notebook em Campinas | Entrega Rápida",
    description:
      "Precisando de carregador urgente? Entregamos em até 60 minutos em Campinas e região. Todas as marcas e modelos com garantia.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

function BlockHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-zinc-950 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      
      <div className="container relative z-10 px-4 text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs md:text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Truck className="w-4 h-4 animate-bounce" />
          Entrega Expressa em 60 Minutos
        </div>
        
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-200 to-blue-900 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-in fade-in zoom-in-50 duration-1000 leading-none">
          CARREGADORES<br />
          <span className="text-stroke-white text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">ORIGINAIS</span>
        </h1>
        
        <p className="text-lg md:text-3xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Seu notebook parou? Não espere dias. Receba seu carregador novo em <strong className="text-blue-400 font-bold">até 60 minutos</strong> em Campinas.
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
    <section className="py-12 md:py-20 bg-white text-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
            <Clock className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Entrega Relâmpago</h3>
            <p className="text-slate-600">Receba em até 60 minutos em Campinas e região via motoboy.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
            <ShieldCheck className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Garantia Total</h3>
            <p className="text-slate-600">Produtos com garantia de troca imediata em caso de defeito.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
            <Zap className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Voltagem Correta</h3>
            <p className="text-slate-600">Auxiliamos na escolha da voltagem e amperagem correta.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
            <CheckCircle2 className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Todas as Marcas</h3>
            <p className="text-slate-600">Dell, HP, Lenovo, Acer, Samsung, Asus, Apple e muito mais.</p>
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
          POR QUE ESCOLHER A <span className="text-blue-600">BALÃO?</span>
        </h2>
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-3 bg-slate-900 text-white p-4 font-bold text-center">
            <div>Critério</div>
            <div className="text-blue-400">Balão da Informática</div>
            <div className="text-slate-500">Concorrência / Marketplaces</div>
          </div>
          
          <div className="divide-y divide-slate-100">
            <div className="grid grid-cols-3 p-4 text-center items-center hover:bg-slate-50">
              <div className="font-semibold text-slate-700">Tempo de Entrega</div>
              <div className="text-blue-600 font-bold">60 Minutos (Campinas)</div>
              <div className="text-slate-500">3 a 10 dias úteis</div>
            </div>
            <div className="grid grid-cols-3 p-4 text-center items-center hover:bg-slate-50">
              <div className="font-semibold text-slate-700">Garantia</div>
              <div className="text-blue-600 font-bold">Troca Imediata na Loja</div>
              <div className="text-slate-500">Processo lento de correios</div>
            </div>
            <div className="grid grid-cols-3 p-4 text-center items-center hover:bg-slate-50">
              <div className="font-semibold text-slate-700">Consultoria</div>
              <div className="text-blue-600 font-bold">Especialista Humano</div>
              <div className="text-slate-500">Chatbot ou Sem suporte</div>
            </div>
             <div className="grid grid-cols-3 p-4 text-center items-center hover:bg-slate-50">
              <div className="font-semibold text-slate-700">Compatibilidade</div>
              <div className="text-blue-600 font-bold">Teste na Hora</div>
              <div className="text-slate-500">Risco de comprar errado</div>
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
        <h2 className="text-3xl md:text-5xl font-black mb-12">QUEM COMPROU, APROVOU</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-blue-800/50 p-8 rounded-2xl border border-blue-700">
            <div className="flex justify-center gap-1 text-yellow-400 mb-4">
              <Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" />
            </div>
            <p className="italic mb-6">"Meu carregador queimou no meio de um projeto. A Balão entregou um novo em 40 minutos aqui no Cambuí. Salvaram minha vida!"</p>
            <p className="font-bold">- Ricardo M., Designer</p>
          </div>
          <div className="bg-blue-800/50 p-8 rounded-2xl border border-blue-700">
             <div className="flex justify-center gap-1 text-yellow-400 mb-4">
              <Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" />
            </div>
            <p className="italic mb-6">"Não sabia qual modelo comprar pro meu Dell antigo. Mandei foto no Whats e eles mandaram o link certo. Chegou rapidinho."</p>
            <p className="font-bold">- Ana Paula S., Advogada</p>
          </div>
          <div className="bg-blue-800/50 p-8 rounded-2xl border border-blue-700">
             <div className="flex justify-center gap-1 text-yellow-400 mb-4">
              <Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" />
            </div>
            <p className="italic mb-6">"Preço justo e atendimento excelente. Fui na loja retirar e testaram na hora no meu notebook."</p>
            <p className="font-bold">- Carlos E., Estudante</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockFAQ() {
  return (
    <section className="py-16 bg-white text-slate-900">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-black text-center mb-12">PERGUNTAS FREQUENTES</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-6">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" />
              Como saber se o carregador serve no meu notebook?
            </h3>
            <p className="text-slate-600">Verifique a voltagem (V) e amperagem (A) na etiqueta do seu carregador antigo ou embaixo do notebook. Ou simplesmente chame nosso suporte no WhatsApp e mande uma foto!</p>
          </div>
          <div className="border-b border-slate-200 pb-6">
            <h3 className="text-xl font-bold mb-2">É original?</h3>
            <p className="text-slate-600">Trabalhamos com carregadores originais e também marcas compatíveis de primeira linha (OEM), todas com garantia e certificação.</p>
          </div>
          <div className="border-b border-slate-200 pb-6">
            <h3 className="text-xl font-bold mb-2">Quanto custa a entrega?</h3>
            <p className="text-slate-600">A taxa de entrega varia conforme o bairro em Campinas. Consulte no WhatsApp. Para retirada na loja, o frete é grátis.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockContact() {
  return (
    <section className="py-16 bg-slate-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-8">ONDE ESTAMOS</h2>
        <p className="text-xl text-slate-300 mb-8">Av. Brasil, 1234 - Guanabara, Campinas - SP</p>
        
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          <a 
            href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=Ol%C3%A1%2C%20preciso%20de%20um%20carregador%20para%20meu%20notebook!`}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold text-xl flex items-center gap-3 transition-transform hover:scale-105"
          >
            <MessageCircle className="w-6 h-6" />
            Chamar no WhatsApp
          </a>
          <a 
            href="https://goo.gl/maps/XYZ" 
            target="_blank"
            className="bg-white hover:bg-slate-200 text-slate-900 px-8 py-4 rounded-full font-bold text-xl flex items-center gap-3 transition-transform hover:scale-105"
          >
            <MapPin className="w-6 h-6" />
            Ver no Mapa
          </a>
        </div>
        
        <div className="mt-12 opacity-50 text-sm">
          <p>Atendemos toda a região metropolitana de Campinas: Valinhos, Vinhedo, Sumaré, Hortolândia, Paulínia, Indaiatuba.</p>
        </div>
      </div>
    </section>
  );
}

export default async function CarregadoresPage() {
  const allProducts = await getProducts();
  const chargers = searchProducts(allProducts, "fonte notebook");
  const filteredChargers = chargers.slice(0, 12); // Show top 12 initially

  return (
    <main className="min-h-screen bg-white">
      <BlockUrgencyBanner />
      <Header />
      <BlockHero />
      <BlockStats />
      <BlockSymptoms />
      <BlockProcess />
      
      <div id="ofertas" className="py-16 container mx-auto px-4">
        <ProductCarousel 
          title="CARREGADORES EM DESTAQUE" 
          products={filteredChargers} 
        />
        
        <div className="text-center mt-12">
          <a 
            href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=N%C3%A3o%20achei%20meu%20modelo%20no%20site%2C%20pode%20me%20ajudar%3F`}
            className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline text-lg"
          >
            Não achou seu modelo? Consulte no estoque da loja <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>

      <BlockConnectorTypes />
      <BlockBenefits />
      <BlockSafety />
      <BlockBrands />
      <BlockComparison />
      <BlockTestimonials />
      <BlockWarrantyDetails />
      <BlockFAQ />
      <BlockContact />
    </main>
  );
}
