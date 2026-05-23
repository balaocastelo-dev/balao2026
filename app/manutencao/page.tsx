import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import { getProducts } from '@/lib/db'
import ProductCarousel from '@/components/ProductCarousel'
import { ALL_SERVICES, SERVICE_CATEGORIES } from '../servicos-e-ofertas/data'
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
  Clock
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Assistência Técnica PC e Notebook Campinas | Manutenção Especializada',
  description: 'Conserto rápido de notebooks e computadores em Campinas. Formatação, limpeza, troca de tela e upgrade. Laboratório próprio e garantia total.',
  keywords: [
    'manutencao pc campinas',
    'conserto notebook',
    'formatacao rapida',
    'limpeza pc gamer',
    'troca tela notebook',
    'assistencia tecnica informatica',
    'reparo placa mae campinas',
    'conserto macbook campinas',
    'tecnico informatica domicilio',
    'loja manutencao pc'
  ],
  alternates: {
    canonical: 'https://www.balao.info/manutencao',
  },
  openGraph: {
    title: 'Assistência Técnica Especializada | Balão da Informática',
    description: 'Diagnóstico grátis e reparo expresso para seu computador ou notebook em Campinas.',
    url: 'https://www.balao.info/manutencao',
    type: 'website',
    locale: 'pt_BR',
    images: ['/images/og-manutencao.jpg']
  }
}

export const dynamic = 'force-dynamic'

function BlockStats() {
  return (
    <section className="py-12 bg-zinc-900 border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "+15k", label: "Equipamentos Reparados", icon: Wrench },
            { value: "98%", label: "Clientes Satisfeitos", icon: Star },
            { value: "24h", label: "Orçamento Médio", icon: Clock },
            { value: "12", label: "Anos de Experiência", icon: Award }
          ].map((stat, i) => (
            <div key={i} className="p-4">
              <stat.icon className="w-8 h-8 mx-auto mb-4 text-blue-500" />
              <div className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-sm text-zinc-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BlockWarranty() {
  return (
    <section className="py-20 bg-zinc-950 text-white border-y border-zinc-800">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <ShieldCheck className="w-20 h-20 text-green-500 mb-6" />
          <h2 className="text-4xl font-black mb-6">GARANTIA DE VERDADE</h2>
          <p className="text-xl text-zinc-300 mb-8 leading-relaxed">
            Não brincamos em serviço. Todos os reparos possuem garantia legal de 90 dias, cobrindo peças e mão de obra. 
            Se o problema voltar, nós resolvemos sem custo adicional.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-lg">
              <CheckCircle className="w-6 h-6 text-green-500" /> Peças 100% Originais
            </li>
            <li className="flex items-center gap-3 text-lg">
              <CheckCircle className="w-6 h-6 text-green-500" /> Nota Fiscal de Serviço
            </li>
            <li className="flex items-center gap-3 text-lg">
              <CheckCircle className="w-6 h-6 text-green-500" /> Suporte Pós-Venda
            </li>
          </ul>
        </div>
        <div className="flex-1 bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
             <h3 className="text-2xl font-bold mb-4 text-blue-400">O que a garantia cobre?</h3>
             <ul className="space-y-3 text-zinc-400">
                <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Defeitos na peça substituída</li>
                <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Falhas na mão de obra executada</li>
                <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Suporte para dúvidas relacionadas</li>
             </ul>
             <div className="mt-8 pt-6 border-t border-zinc-800">
                <p className="text-sm text-zinc-500">Consulte os termos completos no momento da contratação.</p>
             </div>
        </div>
      </div>
    </section>
  )
}

function BlockTestimonials() {
  return (
    <section className="py-20 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/5"></div>
        <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-center mb-16">O QUE DIZEM NOSSOS CLIENTES</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { name: "Ricardo Silva", role: "Empresário", text: "Salvaram meu notebook com todos os dados da empresa. Atendimento rápido e muito profissional.", stars: 5 },
                    { name: "Ana Paula", role: "Designer", text: "Meu MacBook ficou novo! A troca da tela foi perfeita e o preço muito justo comparado à autorizada.", stars: 5 },
                    { name: "Carlos Eduardo", role: "Gamer", text: "Limpeza e troca de pasta térmica no meu PC Gamer. A temperatura baixou 15 graus! Recomendo demais.", stars: 5 }
                ].map((t, i) => (
                    <div key={i} className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 hover:border-blue-500 transition-colors">
                        <div className="flex gap-1 text-yellow-500 mb-4">
                            {[...Array(t.stars)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
                        </div>
                        <p className="text-zinc-300 mb-6 italic">"{t.text}"</p>
                        <div>
                            <div className="font-bold text-white">{t.name}</div>
                            <div className="text-sm text-blue-500">{t.role}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  )
}

function BlockNational() {
    return (
        <section className="py-20 bg-blue-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="container mx-auto px-4 relative z-10 text-center">
                <Truck className="w-20 h-20 mx-auto mb-6 text-white/80" />
                <h2 className="text-3xl md:text-5xl font-black mb-6">ATENDIMENTO NACIONAL</h2>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                    Não é de Campinas? Não tem problema! Recebemos equipamentos de todo o Brasil via Correios ou Transportadora.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <div className="bg-white/10 backdrop-blur px-6 py-4 rounded-xl border border-white/20">
                        <span className="block text-2xl font-bold">01</span>
                        <span className="text-sm">Entre em contato</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur px-6 py-4 rounded-xl border border-white/20">
                        <span className="block text-2xl font-bold">02</span>
                        <span className="text-sm">Envie o equipamento</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur px-6 py-4 rounded-xl border border-white/20">
                        <span className="block text-2xl font-bold">03</span>
                        <span className="text-sm">Receba reparado</span>
                    </div>
                </div>
                <div className="mt-12">
                    <Link 
                        href="https://wa.me/5519993916723?text=Quero%20enviar%20meu%20equipamento%20pelos%20Correios"
                        target="_blank"
                        className="bg-white text-blue-900 px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform inline-flex items-center gap-2"
                    >
                        Solicitar Etiqueta de Envio <MessageCircle className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    )
}

function BlockHero() {
  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Manutenção', item: 'https://www.balao.info/manutencao' }
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-black text-white overflow-hidden">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[800px] md:h-[800px] bg-blue-600/20 rounded-full blur-[60px] md:blur-[120px] animate-pulse"></div>

      <div className="container relative z-10 px-4 text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Wrench className="w-3 h-3 md:w-4 md:h-4 animate-bounce" />
          Laboratório Próprio em Campinas
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-200 to-blue-900 drop-shadow-[0_0_30px_rgba(37,99,235,0.5)] animate-in fade-in zoom-in-50 duration-1000 leading-[0.9] py-2">
          MANUTENÇÃO<br />
          <span className="text-stroke-white text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">TÉCNICA</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-3xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 px-2">
          Seu computador parou? Nós resolvemos. Especialistas em <strong className="text-blue-500 font-bold">Notebooks, PC Gamer e MacBooks</strong>.
        </p>

        <div className="pt-4 md:pt-8 flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 px-4">
          <Link 
             href="https://wa.me/5519993916723?text=Preciso%20de%20assist%C3%AAncia%20t%C3%A9cnica%20para%20meu%20computador!"
             target="_blank"
             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg transition-all shadow-lg shadow-blue-600/30 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
             <MessageCircle className="w-5 h-5" />
             Orçamento Rápido
          </Link>
          <Link 
             href="#servicos"
             className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 backdrop-blur-sm w-full sm:w-auto"
          >
             <Settings className="w-5 h-5" />
             Nossos Serviços
          </Link>
        </div>
      </div>
      
      {/* Marquee Techs */}
      <div className="absolute bottom-0 w-full bg-white/5 border-t border-white/10 py-4 md:py-6 backdrop-blur-sm overflow-hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-16 opacity-60 text-blue-200 font-bold tracking-widest text-xs md:text-xl">
           <span>DIAGNÓSTICO GRÁTIS</span>
           <span>PEÇAS ORIGINAIS</span>
           <span>GARANTIA DE 90 DIAS</span>
           <span>TÉCNICOS CERTIFICADOS</span>
           <span>RAPIDEZ</span>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service }: { service: any }) {
  const Icon = service.icon
  return (
    <div className="group bg-zinc-900/50 backdrop-blur border border-zinc-800 p-4 md:p-6 rounded-3xl hover:border-blue-500 transition-all hover:bg-zinc-900/80">
      <details className="w-full group/details">
        <summary className="flex items-start cursor-pointer list-none relative select-none">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 items-start">
             <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-all shrink-0 border border-zinc-700 group-hover:border-blue-500/30">
                <Icon className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2 pr-6 sm:pr-0">
                    {service.title}
                </h3>
                <p className="text-zinc-400 mt-2 text-sm leading-relaxed pr-8">
                    {service.shortDescription}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 group-open/details:hidden">
                  <span className="text-blue-500 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Ver Detalhes
                  </span>
                </div>
             </div>
          </div>
          <div className="absolute right-0 top-0 text-zinc-500 transition-transform duration-300 group-open/details:rotate-180">
              <ChevronDown className="w-5 h-5" />
          </div>
        </summary>
        
        <div className="mt-6 pt-6 border-t border-zinc-800 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Search className="w-4 h-4" /> Sintomas Comuns
                    </h4>
                    <ul className="space-y-2 mb-6">
                        {service.symptoms?.map((s: string, i: number) => (
                            <li key={i} className="text-zinc-300 flex items-start gap-2 text-sm">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                                {s}
                            </li>
                        ))}
                    </ul>

                    <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Wrench className="w-4 h-4" /> O que faremos
                    </h4>
                    <ul className="space-y-2">
                        {service.process?.map((p: string, i: number) => (
                            <li key={i} className="text-zinc-300 flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700/50">
                    <p className="text-zinc-400 text-sm italic leading-relaxed mb-6">
                        "{service.longDescription}"
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm pt-4 border-t border-zinc-700/50">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span>Garantia: <span className="text-white font-bold">{service.warranty}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Truck className="w-4 h-4 text-blue-400" />
                            <span>Prazo: <span className="text-white font-bold">{service.time}</span></span>
                        </div>
                    </div>
                    <Link 
                        href={`https://wa.me/5519993916723?text=Olá, gostaria de agendar manutenção para: ${service.title}`}
                        target="_blank"
                        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-bold text-center text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Agendar via WhatsApp
                    </Link>
                </div>
            </div>
        </div>
      </details>
    </div>
  )
}

function BlockCategory({ category, isDark = true, reverse = false }: { category: any, isDark?: boolean, reverse?: boolean }) {
  const categoryServices = ALL_SERVICES.filter(s => s.categoryId === category.id)
  
  return (
    <section id={category.id} className={`py-12 md:py-20 relative overflow-hidden ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {isDark && (
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(37,99,235,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] pointer-events-none"></div>
      )}
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`flex flex-col lg:flex-row gap-8 lg:gap-20 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
           
           {/* Header da Categoria */}
           <div className="lg:w-1/3 space-y-4 md:space-y-8 relative lg:sticky lg:top-24 h-fit z-10">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-xs md:text-sm font-bold uppercase tracking-widest ${isDark ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-blue-100 border-blue-200 text-blue-700'}`}>
                 <category.icon className="w-3 h-3 md:w-4 md:h-4" />
                 {category.title}
              </div>
              
              <h2 className={`text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                 {category.title.split(' ').slice(0, 2).join(' ')} <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                    {category.title.split(' ').slice(2).join(' ')}
                 </span>
              </h2>
              
              <p className={`text-sm sm:text-base md:text-xl font-medium leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                 {category.description}
              </p>

              <div className="block pt-2">
                 <Link 
                    href="https://wa.me/5519993916723"
                    target="_blank"
                    className={`inline-flex items-center gap-2 md:gap-3 font-bold text-base md:text-lg hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                 >
                    Falar com Técnico <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                 </Link>
              </div>
           </div>

           {/* Lista de Serviços */}
           <div className="lg:w-2/3 grid grid-cols-1 gap-4 md:gap-6">
              {categoryServices.map((service, idx) => (
                 <div key={idx} className={isDark ? '' : 'shadow-lg shadow-slate-200'}>
                    <ServiceCard service={service} />
                 </div>
              ))}
           </div>

        </div>
      </div>
    </section>
  )
}

function BlockDivider({ text, subtext }: { text: string, subtext?: string }) {
  return (
    <section className="relative py-16 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden bg-black border-y border-zinc-800">
       <div className="absolute inset-0 bg-blue-900/10"></div>
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
       
       <div className="relative z-10 container px-4">
          <h2 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 uppercase leading-none mb-4 drop-shadow-xl break-words">
             {text}
          </h2>
          {subtext && (
             <p className="text-sm sm:text-xl md:text-2xl text-blue-500 font-bold tracking-widest uppercase animate-pulse">
                {subtext}
             </p>
          )}
       </div>
    </section>
  )
}

function BlockUrgency() {
   return (
      <section className="py-20 bg-blue-600 text-white text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
         <div className="container mx-auto px-4 max-w-4xl space-y-8 relative z-10">
            <h2 className="text-4xl md:text-7xl font-black tracking-tight">
               PROBLEMA URGENTE?
            </h2>
            <p className="text-xl md:text-3xl font-medium opacity-90">
               Atendimento prioritário para empresas e casos críticos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
               <a 
                  href="https://wa.me/5519993916723?text=SOS%20Manuten%C3%A7%C3%A3o%20Urgente!"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-blue-900 px-8 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-2xl flex items-center justify-center gap-3 w-full sm:w-auto"
               >
                  <Activity className="w-6 h-6 animate-pulse" />
                  CHAMAR TÉCNICO AGORA
               </a>
            </div>
            <p className="text-sm opacity-75 mt-4 font-mono">
               Plantão WhatsApp • Atendimento Rápido • Campinas e Região
            </p>
         </div>
      </section>
   );
}

export default async function ManutencaoPage() {
  const allProducts = await getProducts()
  
  // Helper para filtrar peças de reparo
  const repairParts = allProducts.filter(p => {
    const text = (p.name + " " + (p.description || "")).toLowerCase()
    return ['ssd', 'memoria', 'fonte', 'pasta', 'cooler'].some(k => text.includes(k))
  }).slice(0, 8)

  return (
    <div className="min-h-screen flex flex-col bg-black font-sans">
      <Header />
      <main className="flex-1">
        
        <BlockHero />

        {/* ANCORAS RAPIDAS */}
        <div className="bg-zinc-900 border-b border-zinc-800 py-4 overflow-x-auto sticky top-0 z-50 backdrop-blur-md bg-zinc-900/80">
           <div className="container mx-auto px-4 flex gap-4 min-w-max">
              {SERVICE_CATEGORIES.map((cat) => (
                 <a 
                    key={cat.id} 
                    href={`#${cat.id}`}
                    className="px-4 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors text-sm font-bold flex items-center gap-2"
                 >
                    <cat.icon className="w-4 h-4" />
                    {cat.title}
                 </a>
              ))}
           </div>
        </div>

        <div id="servicos">
            <BlockCategory category={SERVICE_CATEGORIES[0]} isDark={true} /> {/* Software */}
            
            <BlockDivider text="HARDWARE" subtext="Reparo de Precisão" />

            <BlockCategory category={SERVICE_CATEGORIES[1]} isDark={false} reverse={true} /> {/* Hardware (Light) */}
            
            {/* PEÇAS PARA REPARO */}
            <section className="bg-slate-100 py-12 border-t border-slate-200">
               <div className="container mx-auto px-4">
                  <ProductCarousel 
                     title="Peças para Reparo Rápido" 
                     products={repairParts} 
                  />
               </div>
            </section>

            {/* BLOCK STEPS - PROCESSO */}
            <section className="py-20 bg-zinc-900 text-white relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4">COMO FUNCIONA</h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">Processo transparente e seguro do início ao fim.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { step: "01", title: "Entrada", desc: "Check-in do equipamento e relato do problema." },
                            { step: "02", title: "Diagnóstico", desc: "Análise técnica detalhada em até 24h." },
                            { step: "03", title: "Reparo", desc: "Execução aprovada com peças originais." },
                            { step: "04", title: "Testes", desc: "Stress test e validação de qualidade." }
                        ].map((item, i) => (
                            <div key={i} className="bg-zinc-800/50 p-8 rounded-3xl border border-zinc-700 hover:border-blue-500 transition-colors relative group">
                                <div className="text-6xl font-black text-zinc-800 group-hover:text-blue-900/50 absolute top-4 right-4 transition-colors">{item.step}</div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold mb-2 text-blue-400">{item.title}</h3>
                                    <p className="text-zinc-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <BlockCategory category={SERVICE_CATEGORIES[3]} isDark={true} /> {/* Performance */}
            
            <BlockCategory category={SERVICE_CATEGORIES[2]} isDark={false} reverse={true} /> {/* Redes (Light) */}

            <BlockTestimonials />

            {/* BLOCK FAQ */}
            <section className="py-20 bg-slate-50 text-slate-900">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl md:text-5xl font-black text-center mb-12">DÚVIDAS FREQUENTES</h2>
                    <div className="space-y-4">
                        {[
                            { q: "Quanto tempo leva o diagnóstico?", a: "Para a maioria dos casos, o diagnóstico é feito em até 24 horas úteis." },
                            { q: "Tem garantia?", a: "Sim, oferecemos 90 dias de garantia legal sobre o serviço realizado e peças substituídas." },
                            { q: "Vocês buscam o equipamento?", a: "Sim, temos serviço de leva e traz para Campinas e região (consulte taxas)." },
                            { q: "Perco meus arquivos?", a: "Sempre tentamos preservar seus dados. Caso seja necessária formatação, oferecemos backup como serviço adicional." }
                        ].map((faq, i) => (
                            <details key={i} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer">
                                <summary className="flex justify-between items-center font-bold text-lg list-none">
                                    {faq.q}
                                    <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180 text-blue-500" />
                                </summary>
                                <p className="mt-4 text-slate-600 leading-relaxed">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <BlockDivider text="CORPORATIVO" subtext="Contratos de Manutenção" />

            <BlockCategory category={SERVICE_CATEGORIES[4]} isDark={true} /> {/* Corporativo */}
            
            {/* BLOCK WHY US */}
            <section className="py-20 bg-blue-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6">
                            <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-blue-300" />
                            <h3 className="text-2xl font-bold mb-4">Segurança de Dados</h3>
                            <p className="text-blue-100">Protocolos rígidos para garantir a confidencialidade das suas informações.</p>
                        </div>
                        <div className="p-6">
                            <Award className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
                            <h3 className="text-2xl font-bold mb-4">Técnicos Certificados</h3>
                            <p className="text-blue-100">Equipe constantemente treinada nas novas tecnologias do mercado.</p>
                        </div>
                        <div className="p-6">
                            <MapPin className="w-16 h-16 mx-auto mb-6 text-red-400" />
                            <h3 className="text-2xl font-bold mb-4">Laboratório Próprio</h3>
                            <p className="text-blue-100">Infraestrutura completa em Campinas para reparos complexos.</p>
                        </div>
                     </div>
                </div>
            </section>
        </div>

        <BlockUrgency />

      </main>
    </div>
  )
}