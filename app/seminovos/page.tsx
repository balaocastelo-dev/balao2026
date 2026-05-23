import { SITE_CONFIG } from "@/lib/config";
import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { getProducts, getCategories } from "@/lib/db";
import { Product, Category } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import HeroCTA from "@/components/HeroCTA";
import { Laptop2, ShieldCheck, BadgeCheck, Truck, Award, CheckCircle2 } from "lucide-react";
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema, generateItemListSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Notebooks Seminovos em Campinas com Entrega Rápida | Balão da Informática",
  description:
    "Notebooks usados e seminovos com garantia de 6 meses em Campinas, estoque real e entrega rápida para Campinas, Sumaré, Hortolândia, Paulínia, Valinhos e Vinhedo, com envio para todo o Brasil.",
  keywords: [
    "notebook seminovo campinas",
    "notebook usado campinas",
    "notebook barato campinas",
    "notebook seminovo brasil",
    "entrega rápida notebook campinas",
  ],
  openGraph: {
    title: "Notebooks Seminovos em Campinas com Entrega Rápida | Balão da Informática",
    description:
      "Compre notebooks usados e seminovos com garantia em Campinas, estoque atualizado e entrega rápida para Campinas e região metropolitana.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

function BlockHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black opacity-80"></div>
      <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      <div className="container relative z-10 px-4 text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs md:text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
          Campinas e Região
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-2xl animate-in fade-in zoom-in-50 duration-1000 leading-tight">
          NOTEBOOKS<br />SEMINOVOS
        </h1>
        
        <p className="text-lg md:text-3xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Equipamentos corporativos de alta performance, revisados e com <strong className="text-white font-bold">garantia real de 6 meses</strong>.
        </p>

        <div className="pt-8 flex justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <HeroCTA />
        </div>
      </div>
      
      {/* Brands Ticker (Static for now, could be marquee) */}
      <div className="absolute bottom-0 w-full bg-white/5 border-t border-white/10 py-4 md:py-6 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           <span className="text-lg md:text-2xl font-black text-white">DELL</span>
           <span className="text-lg md:text-2xl font-black text-white">HP</span>
           <span className="text-lg md:text-2xl font-black text-white">LENOVO</span>
           <span className="text-lg md:text-2xl font-black text-white">APPLE</span>
           <span className="text-lg md:text-2xl font-black text-white">ACER</span>
           <span className="text-lg md:text-2xl font-black text-white">ASUS</span>
        </div>
      </div>
    </section>
  );
}

function BlockPayOnDelivery() {
  return (
    <section className="min-h-[80vh] flex items-center bg-emerald-600 text-white py-12 md:py-20 relative overflow-hidden">
       <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
       <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-teal-800/30 rounded-full blur-3xl"></div>

       <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
             <div className="inline-block bg-black/20 backdrop-blur-sm px-6 py-2 rounded-full text-xs md:text-sm font-black uppercase tracking-[0.2em] border border-white/20">
                Exclusividade Balão
             </div>
             <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                PAGUE AO <br />
                <span className="text-emerald-950">RECEBER</span>
             </h2>
             <p className="text-lg md:text-3xl font-medium text-emerald-50 leading-snug">
                Sem pegadinhas. Você recebe o notebook em casa, testa tudo com calma e só paga se gostar.
             </p>
             <ul className="space-y-4 text-lg md:text-xl font-semibold inline-block text-left">
                <li className="flex items-center gap-3">
                   <CheckCircle2 className="w-8 h-8 text-emerald-950 shrink-0" />
                   <span>Entrega Grátis em Campinas</span>
                </li>
                <li className="flex items-center gap-3">
                   <CheckCircle2 className="w-8 h-8 text-emerald-950 shrink-0" />
                   <span>Aceitamos Pix, Cartão e Dinheiro</span>
                </li>
                <li className="flex items-center gap-3">
                   <CheckCircle2 className="w-8 h-8 text-emerald-950 shrink-0" />
                   <span>Satisfação garantida ou nada feito</span>
                </li>
             </ul>
          </div>
          <div className="relative h-full min-h-[300px] md:min-h-[400px] flex items-center justify-center">
             <div className="relative w-full aspect-square max-w-md bg-white/10 backdrop-blur-md rounded-[3rem] border border-white/20 shadow-2xl flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                   <ShieldCheck className="w-24 h-24 md:w-32 md:h-32 mx-auto text-emerald-200" />
                   <div className="text-3xl md:text-4xl font-black">RISCO ZERO</div>
                   <div className="text-base md:text-lg opacity-80">Seu dinheiro está seguro.<br/>Sua satisfação em primeiro lugar.</div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
}

function BlockWarranty() {
  return (
    <section className="min-h-[70vh] flex items-center bg-slate-100 text-slate-900 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-tight">
            NÃO É SÓ UMA VENDA.<br/>
            <span className="text-blue-600">É SUPORTE REAL.</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-12">
             <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 hover:-translate-y-2 transition-transform duration-300">
                <BadgeCheck className="w-16 h-16 text-blue-600 mb-6" />
                <h3 className="text-2xl font-bold mb-3">6 Meses de Garantia</h3>
                <p className="text-slate-600 text-lg">
                   Garantia direto com a loja. Deu problema? A gente resolve rápido, sem burocracia de fabricante.
                </p>
             </div>
             <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 hover:-translate-y-2 transition-transform duration-300">
                <Laptop2 className="w-16 h-16 text-blue-600 mb-6" />
                <h3 className="text-2xl font-bold mb-3">Completo na Caixa</h3>
                <p className="text-slate-600 text-lg">
                   Acompanha carregador original e embalagem protegida. Revisado, limpo e com bateria verificada.
                </p>
             </div>
             <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 hover:-translate-y-2 transition-transform duration-300">
                <Award className="w-16 h-16 text-blue-600 mb-6" />
                <h3 className="text-2xl font-bold mb-3">Windows 11 + Office</h3>
                <p className="text-slate-600 text-lg">
                   Formatado e configurado com softwares essenciais. É ligar e sair trabalhando ou estudando.
                </p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockStock() {
  return (
    <section className="min-h-[60vh] flex items-center bg-amber-400 text-amber-950 py-12 md:py-20 relative overflow-hidden">
       <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-amber-950/10 px-6 py-2 rounded-full mb-8">
             <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
             <span className="font-bold uppercase tracking-widest text-sm md:text-base">Atualização em Tempo Real</span>
          </div>
          
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
             ESTOQUE AO VIVO
          </h2>
          
          <p className="text-xl md:text-4xl font-bold max-w-4xl mx-auto leading-tight opacity-90">
             "Se o anúncio está no site, o notebook está na prateleira."
          </p>
          
          <p className="mt-6 text-lg md:text-xl opacity-75">
             Nada de "consulte disponibilidade". Viu, gostou, comprou.
          </p>
       </div>
    </section>
  );
}

function BlockDelivery() {
    return (
      <section className="min-h-[70vh] flex items-center bg-indigo-900 text-white py-12 md:py-20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
           <div className="order-2 md:order-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/10">
                 <Truck className="w-16 h-16 md:w-20 md:h-20 text-indigo-300 mb-6" />
                 <h3 className="text-3xl md:text-4xl font-bold mb-4">Campinas e Região</h3>
                 <p className="text-lg md:text-xl text-indigo-200 mb-8">
                    Entregamos em Campinas, Sumaré, Hortolândia, Paulínia, Valinhos e Vinhedo.
                 </p>
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 bg-indigo-950/50 p-4 rounded-xl">
                       <div className="font-bold text-xl md:text-2xl">HOJE</div>
                       <div className="text-sm opacity-70">Para pedidos até 12h</div>
                    </div>
                    <div className="flex items-center gap-4 bg-indigo-950/50 p-4 rounded-xl">
                       <div className="font-bold text-xl md:text-2xl">AMANHÃ</div>
                       <div className="text-sm opacity-70">Para pedidos após 12h</div>
                    </div>
                 </div>
              </div>
           </div>
           <div className="order-1 md:order-2 space-y-8 text-center md:text-left">
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
                 ENTREGA <br/>
                 <span className="text-indigo-400">GRÁTIS</span>
              </h2>
              <p className="text-xl md:text-2xl text-indigo-100 font-light">
                 Não cobramos frete para a região metropolitana. O preço que você vê é o preço final.
              </p>
              <a href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=Ol%C3%A1%2C%20gostaria%20de%20consultar%20a%20entrega%20para%20meu%20CEP%20(Seminovos).`} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg md:text-xl hover:bg-indigo-50 transition-colors inline-block">
                 Consultar meu CEP no WhatsApp
              </a>
           </div>
        </div>
      </section>
    );
}

export default async function SeminovosPage() {
  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const rootCategory = categories.find(
    (c: Category) => c.slug === "semi-novo"
  );

  const validCategories = new Set<string>();

  if (rootCategory) {
    validCategories.add(rootCategory.name);
    const stack = [rootCategory.id];
    while (stack.length > 0) {
      const currentId = stack.pop() as string;
      const children = categories.filter((c) => c.parent_id === currentId);
      for (const child of children) {
        validCategories.add(child.name);
        stack.push(child.id);
      }
    }
  }

  const seminovos = allProducts.filter((p: Product) => {
    if (!rootCategory) return false;
    if (!p.category) return false;
    return validCategories.has(p.category);
  });

  // Dividir produtos se necessário, ou mostrar todos em uma super grid
  // Vou mostrar todos em uma grid central poderosa

  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Seminovos', item: 'https://www.balao.info/seminovos' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems),
        generateItemListSchema(seminovos, 'https://www.balao.info/seminovos')
      ]} />
      <Header />
      <main className="flex-1">
        
        {/* BLOCO 1: HERO */}
        <BlockHero />

        {/* PRODUTOS - PARTE PRINCIPAL */}
        <section id="ofertas" className="py-12 md:py-20 bg-gray-50 min-h-[50vh]">
          <div className="container mx-auto px-4">
             <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-6xl font-black text-slate-900 mb-4">NOSSAS OFERTAS</h2>
                <div className="w-16 md:w-24 h-2 bg-emerald-500 mx-auto rounded-full"></div>
             </div>
             
             {seminovos.length === 0 ? (
               <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500 text-xl">
                 Carregando estoque atualizado...
               </div>
             ) : (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                   {seminovos.map((item) => (
                     <ProductCard key={item.id} product={item} />
                   ))}
                 </div>
             )}
          </div>
        </section>

        {/* BLOCO 2: PAGUE AO RECEBER */}
        <BlockPayOnDelivery />

        {/* BLOCO 3: ESTOQUE AO VIVO */}
        <BlockStock />

        {/* BLOCO 4: GARANTIA */}
        <BlockWarranty />

        {/* BLOCO 5: ENTREGA */}
        <BlockDelivery />

        {/* FINAL */}
        <section className="py-12 bg-white text-center">
            <div className="container mx-auto px-4 max-w-4xl">
               <h3 className="text-2xl font-bold text-slate-900 mb-6">Ainda com dúvidas?</h3>
               <p className="text-slate-600 mb-8">
                  Nossa equipe técnica está pronta para te ajudar a escolher o modelo ideal para seu trabalho ou estudo.
               </p>
               <a href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20um%20especialista%20sobre%20notebooks%20seminovos.`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white rounded-full font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                  Falar com Especialista no WhatsApp
               </a>
            </div>
        </section>

      </main>
    </div>
  );
}

