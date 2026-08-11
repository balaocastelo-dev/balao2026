import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import { getProducts } from '@/lib/db'
import ProductCarousel from '@/components/ProductCarousel'
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from '@/components/JsonLd'
import { 
  CheckCircle, 
  MessageCircle, 
  Search,
  Truck, 
  Award,
  MapPin,
  ChevronDown,
  Star,
  Wrench,
  ShieldCheck,
  Zap,
  Cpu,
  Server,
  Wifi,
  Activity,
  MousePointer2,
  Settings,
  Lock,
  Printer,
  Tag,
  Percent,
  Timer,
  ShoppingBag
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Promoção de Informática Campinas | Ofertas Relâmpago PC Gamer e Hardware',
  description: 'As melhores ofertas de hardware, periféricos e computadores em Campinas. Preços imbatíveis em placas de vídeo, processadores e SSDs. Entrega rápida no interior paulista.',
  keywords: [
    'promocao informatica campinas',
    'oferta placa de video',
    'desconto pc gamer',
    'loja hardware campinas',
    'black friday informatica',
    'ssd barato campinas',
    'processador em oferta',
    'monitor gamer promocao',
    'kit upgrade barato',
    'balao da informatica ofertas'
  ],
  alternates: {
    canonical: 'https://www.balao.info/promocao',
  },
  openGraph: {
    title: 'Ofertas Relâmpago | Balão da Informática Campinas',
    description: 'Hardware e PC Gamer com descontos reais. Aproveite nossas promoções exclusivas para Campinas e Região.',
    url: 'https://www.balao.info/promocao',
    type: 'website',
    locale: 'pt_BR',
    images: ['/images/og-promocao.jpg']
  }
}

export const dynamic = 'force-dynamic'

// Helper para filtrar produtos
const getPromotionalProducts = (products: any[], categoryKeywords: string[]) => {
  return products.filter(p => {
    const text = (p.name + " " + (p.description || "")).toLowerCase()
    return categoryKeywords.some(k => text.includes(k))
  }).slice(0, 12)
}

function BlockHero() {
  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Promoção', item: 'https://www.balao.info/promocao' }
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-black text-white overflow-hidden">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[800px] md:h-[800px] bg-purple-600/20 rounded-full blur-[60px] md:blur-[120px] animate-pulse"></div>

      <div className="container relative z-10 px-4 text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Tag className="w-3 h-3 md:w-4 md:h-4 animate-bounce" />
          Descontos Reais & Imediatos
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-200 to-purple-900 drop-shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-in fade-in zoom-in-50 duration-1000 leading-[0.9] py-2">
          OFERTAS<br />
          <span className="text-stroke-white text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">RELÂMPAGO</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-3xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 px-2">
          Os melhores preços em <strong className="text-purple-400 font-bold">hardware e periféricos</strong> de Campinas. Cobrimos ofertas da concorrência local.
        </p>

        <div className="pt-4 md:pt-8 flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 px-4">
          <Link 
             href="https://wa.me/5519993916723?text=Ol%C3%A1%2C%20vi%20as%20promo%C3%A7%C3%B5es%20no%20site%20e%20quero%20saber%20mais!"
             target="_blank"
             className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg transition-all shadow-lg shadow-purple-600/30 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
             <MessageCircle className="w-5 h-5" />
             Ver no WhatsApp
          </Link>
          <Link 
             href="#destaques"
             className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 backdrop-blur-sm w-full sm:w-auto"
          >
             <ShoppingBag className="w-5 h-5" />
             Ver Destaques
          </Link>
        </div>
      </div>
      
      {/* Marquee Benefits */}
      <div className="absolute bottom-0 w-full bg-white/5 border-t border-white/10 py-4 md:py-6 backdrop-blur-sm overflow-hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-16 opacity-60 text-purple-200 font-bold tracking-widest text-xs md:text-xl">
           <span className="flex items-center gap-2"><Percent className="w-4 h-4" /> DESCONTOS PIX</span>
           <span className="flex items-center gap-2"><Truck className="w-4 h-4" /> ENTREGA RÁPIDA</span>
           <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> GARANTIA TOTAL</span>
           <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> LOJA FÍSICA</span>
        </div>
      </div>
    </section>
  );
}

function BlockDivider({ text, subtext }: { text: string, subtext?: string }) {
  return (
    <section className="relative py-16 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden bg-black border-y border-zinc-800">
       <div className="absolute inset-0 bg-purple-900/10"></div>
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
       
       <div className="relative z-10 container px-4">
          <h2 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 uppercase leading-none mb-4 drop-shadow-xl break-words">
             {text}
          </h2>
          {subtext && (
             <p className="text-sm sm:text-xl md:text-2xl text-purple-500 font-bold tracking-widest uppercase animate-pulse">
                {subtext}
             </p>
          )}
       </div>
    </section>
  )
}

function BlockFeature({ title, description, icon: Icon, isDark = true }: { title: string, description: string, icon: any, isDark?: boolean }) {
  return (
    <div className={`p-8 rounded-3xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-slate-900'} h-full flex flex-col items-start gap-4 transition-all hover:scale-105`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
      <p className={`text-lg leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>{description}</p>
    </div>
  )
}

function BlockSteps() {
  return (
    <section className="py-20 bg-zinc-50 text-slate-900 border-y border-zinc-200">
        <div className="container mx-auto px-4">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black mb-4">COMO COMPRAR</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">É simples, rápido e seguro garantir sua oferta.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                {[
                    { step: "01", title: "Escolha", desc: "Navegue pelas ofertas e escolha seu produto." },
                    { step: "02", title: "Chame", desc: "Clique no botão do WhatsApp para falar com vendedor." },
                    { step: "03", title: "Pague", desc: "Confirme a disponibilidade e faça o pagamento (PIX/Cartão)." },
                    { step: "04", title: "Receba", desc: "Retire na loja na hora ou receba em casa." }
                ].map((s, i) => (
                    <div key={i} className="text-center relative z-10">
                        <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-lg shadow-purple-600/30">
                            {s.step}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                        <p className="text-slate-600 text-sm">{s.desc}</p>
                    </div>
                ))}
             </div>
        </div>
    </section>
  )
}

function BlockBrands() {
  return (
    <section className="py-12 bg-white border-y border-slate-100">
      <div className="container mx-auto px-4">
        <p className="text-center text-slate-400 font-bold text-sm uppercase tracking-widest mb-8">As melhores marcas do mundo</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           {/* Logos simplificados com texto para evitar imagens externas quebradas */}
           {['NVIDIA', 'AMD', 'INTEL', 'ASUS', 'LOGITECH', 'CORSAIR', 'HYPERX', 'SAMSUNG', 'LG', 'ACER'].map((brand) => (
             <div key={brand} className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2">
               <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
               {brand}
             </div>
           ))}
        </div>
      </div>
    </section>
  )
}

function BlockNewsletter() {
  return (
    <section className="py-20 bg-zinc-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-purple-900/20"></div>
      <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
         <div className="inline-block p-3 rounded-full bg-purple-500/20 mb-6">
            <MessageCircle className="w-8 h-8 text-purple-400" />
         </div>
         <h2 className="text-3xl md:text-4xl font-black mb-4">OFERTAS SECRETAS?</h2>
         <p className="text-zinc-400 mb-8 text-lg">Entre para nossa lista VIP no WhatsApp e receba cupons exclusivos antes de todo mundo.</p>
         <form className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Seu WhatsApp (DDD + Número)" 
              className="flex-1 bg-zinc-800 border-zinc-700 rounded-xl px-6 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-lg shadow-purple-600/20">
               QUERO ENTRAR
            </button>
         </form>
         <p className="text-xs text-zinc-500 mt-4">Sem spam. Apenas promoções reais.</p>
      </div>
    </section>
  )
}

function BlockUrgencyBanner() {
  return (
    <div className="bg-yellow-400 text-yellow-900 py-3 overflow-hidden">
      <div className="container mx-auto px-4 flex items-center justify-center gap-4 text-sm md:text-base font-black uppercase tracking-wide animate-pulse">
         <Timer className="w-5 h-5" />
         <span>Corra! As ofertas mudam em: 04h 12m 33s</span>
         <Timer className="w-5 h-5" />
      </div>
    </div>
  )
}

function BlockPriceGuarantee() {
  return (
    <section className="py-12 bg-purple-50 border-y border-purple-100">
       <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
             <Percent className="w-8 h-8 text-purple-600" />
          </div>
          <div>
             <h3 className="text-xl font-bold text-purple-900">GARANTIA DE MENOR PREÇO</h3>
             <p className="text-purple-700/80">Achou mais barato em Campinas? Nós cobrimos a oferta da concorrência na hora!</p>
          </div>
          <Link 
             href="https://wa.me/5519993916723?text=Achei%20mais%20barato%20e%20quero%20negociar!"
             target="_blank"
             className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 transition-colors"
          >
             NEGOCIAR AGORA
          </Link>
       </div>
    </section>
  )
}

function BlockTestimonials() {
  return (
    <section className="py-20 bg-white text-slate-900">
        <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-center mb-12">QUEM APROVEITOU</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { name: "Felipe G.", item: "RTX 4060", text: "Preço imbatível. Cheguei na loja, fui super bem atendido e já saí com a placa." },
                    { name: "Mariana L.", item: "PC Gamer", text: "Montei meu PC completo com eles. A consultoria pelo Whats ajudou muito a escolher as peças certas." },
                    { name: "João V.", item: "Monitor 144hz", text: "Entrega super rápida em Valinhos. O monitor chegou perfeito e bem embalado." }
                ].map((t, i) => (
                    <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-purple-500 transition-colors">
                        <div className="flex items-center gap-1 text-yellow-500 mb-4">
                            {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                        </div>
                        <p className="text-slate-600 mb-6 italic">"{t.text}"</p>
                        <div>
                            <div className="font-bold text-slate-900">{t.name}</div>
                            <div className="text-xs text-purple-600 font-bold uppercase tracking-wider">Comprou {t.item}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  )
}

export default async function PromocaoPage() {
  const allProducts = await getProducts()
  
  const hardwareProducts = getPromotionalProducts(allProducts, ['placa', 'video', 'processador', 'mae', 'ram', 'ssd', 'nvme'])
  const peripheralProducts = getPromotionalProducts(allProducts, ['teclado', 'mouse', 'headset', 'monitor', 'gamer'])
  const pcProducts = getPromotionalProducts(allProducts, ['pc', 'computador', 'notebook', 'gamer'])

  return (
    <div className="min-h-screen flex flex-col bg-black font-sans">
      <Header />
      <main className="flex-1">
        
        <BlockHero />

        <div id="destaques" className="bg-zinc-950 py-20 relative overflow-hidden">
           <div className="container mx-auto px-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                 <BlockFeature 
                    title="Ofertas Diárias" 
                    description="Descontos reais em processadores, placas de vídeo, SSDs e periféricos selecionados."
                    icon={Zap}
                 />
                 <BlockFeature 
                    title="Retirada Local" 
                    description="Compre online e retire na loja em Campinas para economizar o frete e agilizar."
                    icon={MapPin}
                 />
                 <BlockFeature 
                    title="Kits Upgrade" 
                    description="Combos de Placa-mãe + Processador + Memória com valor reduzido para você."
                    icon={Cpu}
                 />
              </div>
              
              {/* BLOCK PAYMENT */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
                  <div className="text-center">
                      <div className="text-3xl font-bold text-green-500 mb-1">10% OFF</div>
                      <div className="text-zinc-400 text-sm">no PIX</div>
                  </div>
                  <div className="text-center">
                      <div className="text-3xl font-bold text-blue-500 mb-1">12x</div>
                      <div className="text-zinc-400 text-sm">Sem Juros</div>
                  </div>
                  <div className="text-center">
                      <div className="text-3xl font-bold text-purple-500 mb-1">Express</div>
                      <div className="text-zinc-400 text-sm">Entrega Rápida</div>
                  </div>
                  <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-500 mb-1">Garantia</div>
                      <div className="text-zinc-400 text-sm">Com Nota Fiscal</div>
                  </div>
              </div>

              <ProductCarousel 
                 title="Hardware em Oferta" 
                 products={hardwareProducts} 
              />
           </div>
        </div>

        <BlockDivider text="GAMER" subtext="Periféricos de Alta Performance" />

        <section className="bg-slate-50 py-20 relative">
           <div className="container mx-auto px-4">
              <ProductCarousel 
                 title="Periféricos Gamer" 
                 products={peripheralProducts} 
              />
              
              {/* BLOCK CATEGORIES - NAV RAPIDA */}
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Teclados', 'Mouses', 'Headsets', 'Monitores', 'Cadeiras', 'Mousepads', 'Controles', 'Streaming'].map((cat, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center font-bold text-slate-700 border border-slate-200 cursor-pointer hover:border-purple-500 hover:text-purple-600">
                          {cat}
                      </div>
                  ))}
              </div>
           </div>
        </section>

        {/* BLOCK TRUST */}
        <section className="py-20 bg-zinc-900 text-white border-y border-zinc-800">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-black mb-12">POR QUE COMPRAR CONOSCO?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 bg-black/40 rounded-3xl border border-zinc-800">
                        <MapPin className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Loja Física em Campinas</h3>
                        <p className="text-zinc-400">Você sabe onde nos encontrar. Garantia real e suporte presencial.</p>
                    </div>
                    <div className="p-6 bg-black/40 rounded-3xl border border-zinc-800">
                        <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Procedência Garantida</h3>
                        <p className="text-zinc-400">Produtos originais, lacrados e com nota fiscal. Revenda autorizada das grandes marcas.</p>
                    </div>
                    <div className="p-6 bg-black/40 rounded-3xl border border-zinc-800">
                        <MessageCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Suporte Especializado</h3>
                        <p className="text-zinc-400">Dúvidas na instalação? Nossa equipe técnica te ajuda após a compra.</p>
                    </div>
                </div>
            </div>
        </section>

        <BlockDivider text="COMPUTADORES" subtext="PC Gamer e Notebooks" />

        <section className="bg-zinc-900 py-20 relative">
           <div className="container mx-auto px-4">
              <ProductCarousel 
                 title="PCs e Notebooks" 
                 products={pcProducts} 
              />
           </div>
        </section>

        <BlockNewsletter />

        <BlockSteps />
        
        <BlockTestimonials />
        
        {/* BLOCK FAQ */}
        <section className="py-20 bg-slate-100 text-slate-900">
            <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-3xl font-black text-center mb-12">DÚVIDAS SOBRE AS PROMOÇÕES</h2>
                <div className="space-y-4">
                    <details className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <summary className="font-bold text-lg cursor-pointer list-none flex justify-between">Os produtos são novos? <ChevronDown className="w-5 h-5"/></summary>
                        <p className="mt-4 text-slate-600">Sim, todos os produtos da seção Promoção são novos, lacrados e com garantia total, salvo se explicitamente marcado como "Open Box" ou "Seminovo".</p>
                    </details>
                    <details className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <summary className="font-bold text-lg cursor-pointer list-none flex justify-between">Posso retirar na hora? <ChevronDown className="w-5 h-5"/></summary>
                        <p className="mt-4 text-slate-600">Sim! Se o produto estiver marcado como "Disponível na Loja", você pode comprar pelo site e retirar imediatamente em nossa unidade de Campinas.</p>
                    </details>
                    <details className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <summary className="font-bold text-lg cursor-pointer list-none flex justify-between">Parcela no cartão? <ChevronDown className="w-5 h-5"/></summary>
                        <p className="mt-4 text-slate-600">Parcelamos em até 12x no cartão de crédito. O desconto de 10% é exclusivo para pagamento à vista no PIX.</p>
                    </details>
                </div>
            </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 bg-purple-600 text-white text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
           <div className="container mx-auto px-4 max-w-4xl space-y-8 relative z-10">
              <h2 className="text-4xl md:text-7xl font-black tracking-tight">
                 NÃO PERCA TEMPO
              </h2>
              <p className="text-xl md:text-3xl font-medium opacity-90">
                 Muitas ofertas são limitadas ao estoque disponível na loja.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                 <a 
                    href="https://wa.me/5519993916723?text=Quero%20aproveitar%20as%20ofertas%20do%20site!"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white text-purple-900 px-8 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-2xl flex items-center justify-center gap-3 w-full sm:w-auto"
                 >
                    <MessageCircle className="w-6 h-6" />
                    CHAMAR NO WHATSAPP
                 </a>
              </div>
              <p className="text-sm opacity-75 mt-4 font-mono">
                 Atendimento Rápido • Campinas e Região • Cobrimos Ofertas
              </p>
           </div>
        </section>

      </main>
    </div>
  )
}