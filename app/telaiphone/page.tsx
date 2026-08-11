import { Metadata } from 'next'
import Header from '@/components/Header'
import JsonLd, { generateOrganizationSchema, generateFAQSchema } from '@/components/JsonLd'
import { 
  Smartphone, 
  Battery, 
  ShieldCheck, 
  Clock,
  Zap,
  Star,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Award,
  CreditCard,
  MapPin,
  ChevronRight,
  Droplets,
  Eye,
  Camera,
  Search,
  CheckCircle,
  HelpCircle,
  Map
} from 'lucide-react'
import Link from 'next/link'
import Model3DViewer from "@/components/Model3DViewer"

export const metadata: Metadata = {
  title: 'Conserto de iPhone Campinas | Troca de Tela e Bateria em 3 Horas',
  description: 'Assistência técnica especializada Apple em Campinas. Troca de tela e bateria de iPhone em até 3 horas. Peças premium, garantia de 1 ano e preço justo no Cambuí.',
  keywords: [
    'conserto de iphone campinas',
    'assistencia tecnica apple campinas',
    'troca de tela iphone campinas',
    'troca de bateria iphone campinas',
    'conserto iphone rapido campinas',
    'reparo de iphone cambuí',
    'bateria iphone original campinas',
    'tela iphone oled premium campinas',
    'assistencia apple campinas regiao',
    'preco troca tela iphone 11 12 13 14 15',
    'iphone parou de carregar campinas',
    'manutencao iphone campinas',
    'trocar vidro iphone campinas'
  ],
  alternates: {
    canonical: 'https://www.balao.info/telaiphone',
  },
  openGraph: {
    title: 'Troca de Tela e Bateria de iPhone em Campinas | Balão da Informática',
    description: 'Seu iPhone novo de novo em até 3 horas. Especialistas em Apple no Cambuí, Campinas.',
    url: 'https://www.balao.info/telaiphone',
    type: 'website',
    images: ['/logo.png']
  }
}

const WHATSAPP_LINK = "https://wa.me/5519987510267?text=Olá!%20Vi%20a%20página%20de%20telas%20e%20baterias%20e%20gostaria%20de%20um%20orçamento%20para%20meu%20iPhone."

const FAQS = [
  {
    question: "Quanto tempo demora a troca da tela do iPhone?",
    answer: "Na Balão da Informática, realizamos a troca da tela em até 3 horas, dependendo do modelo e disponibilidade de estoque. Muitos modelos ficam prontos em menos tempo."
  },
  {
    question: "A bateria trocada mostra a saúde no sistema?",
    answer: "Sim, trabalhamos com baterias de alta qualidade. Em modelos mais novos, realizamos o transplante do chip original quando necessário para que a saúde continue sendo exibida sem mensagens de 'peça desconhecida'."
  },
  {
    question: "Qual a garantia do serviço de reparo?",
    answer: "Oferecemos garantia total de 1 ano em nossas telas Premium e baterias selecionadas, cobrindo qualquer defeito de fabricação ou falha no componente."
  },
  {
    question: "O iPhone continua resistente à água após aberto?",
    answer: "Sim, nós repomos o adesivo de vedação original (seal) após o fechamento do aparelho para manter a proteção contra poeira e respingos, seguindo o padrão Apple."
  }
];

function BlockHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-black text-white overflow-hidden pt-20">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateFAQSchema(FAQS)
      ]} />
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[120px] animate-pulse"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-8">
              <Zap className="w-4 h-4 fill-current" />
              Serviço Expresso: Pronto em até 3 horas
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8 uppercase">
              CONSERTO DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">IPHONE</span> EM CAMPINAS
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mb-10 font-light leading-relaxed">
              Sua tela quebrou ou a bateria viciou? Somos a <strong className="text-white">Assistência Técnica Apple</strong> número 1 no Cambuí. Reparos rápidos, peças Premium e <strong className="text-white">Garantia de 1 Ano</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href={WHATSAPP_LINK}
                target="_blank"
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-full font-black text-xl transition-all shadow-xl shadow-red-600/20 hover:scale-105 flex items-center justify-center gap-3 group"
              >
                <MessageCircle className="w-6 h-6 fill-current" />
                ORÇAMENTO GRÁTIS AGORA
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 opacity-60">
               <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-bold uppercase tracking-wider">Garantia de 1 Ano</span>
               </div>
               <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-bold uppercase tracking-wider">12x sem juros</span>
               </div>
               <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-bold uppercase tracking-wider">Até 3 Horas</span>
               </div>
            </div>
          </div>
          
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-transparent pointer-events-auto sketchfab-embed-wrapper">
              <Model3DViewer
                title="iPhone 12 Teardown"
                allowFullScreen
                allow="autoplay; fullscreen; xr-spatial-tracking"
                src="https://sketchfab.com/models/708eaa5d195544918e5f70b69eedcdfa/embed?autospin=1&autostart=1&preload=1&transparent=1&ui_hint=0&ui_theme=dark&ui_infos=0&ui_watermark=0&ui_controls=0&ui_general_controls=0"
                className="absolute bg-transparent"
                style={{
                  top: -260,
                  left: -100,
                  width: "calc(100% + 200px)",
                  height: "calc(100% + 520px)",
                  transform: "scale(0.55)",
                  transformOrigin: "center",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function BlockLocalSEO() {
  const bairros = ["Cambuí", "Taquaral", "Guanabara", "Castelo", "Mansões Santo Antônio", "Barão Geraldo", "Alphaville", "Swiss Park", "Nova Campinas"];
  
  return (
    <section className="py-12 bg-zinc-900/50 border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <MapPin className="text-red-500 shrink-0" size={32} />
            <div>
              <h3 className="font-bold text-lg">Atendimento em toda Campinas</h3>
              <p className="text-zinc-500 text-sm">Bairros com maior volume de atendimento:</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {bairros.map(b => (
              <span key={b} className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400 border border-zinc-700">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function BlockServices() {
  const services = [
    {
      title: "Troca de Tela iPhone",
      desc: "Telas OLED e Incell Premium com brilho e touch idênticos ao original. Recuperamos o True Tone e Face ID.",
      features: ["OLED Soft Premium", "Recuperação True Tone", "Touch de Alta Precisão", "Vedação de Fábrica"],
      icon: Smartphone,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Troca de Bateria iPhone",
      desc: "Baterias homologadas que não viciam. Mantemos a saúde da bateria visível no sistema (iOS).",
      features: ["Saúde 100% no Sistema", "Células de Alta Densidade", "Sem Mensagem de Erro", "Garantia de 1 Ano"],
      icon: Battery,
      color: "text-green-500",
      bg: "bg-green-500/10"
    }
  ]

  return (
    <section className="py-24 bg-zinc-950" id="servicos">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-4">REPARO ESPECIALIZADO APPLE</h2>
          <p className="text-xl text-zinc-500">Técnicos certificados e laboratório de última geração.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((s, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-[2.5rem] hover:border-zinc-700 transition-all group">
              <div className={`${s.bg} ${s.color} w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                <s.icon size={40} />
              </div>
              <h2 className="text-4xl font-black mb-4 uppercase">{s.title}</h2>
              <p className="text-xl text-zinc-400 mb-8 leading-relaxed">{s.desc}</p>
              <ul className="space-y-4 mb-10">
                {s.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-zinc-300 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-red-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link 
                href={WHATSAPP_LINK}
                target="_blank"
                className="inline-flex items-center gap-2 text-white font-bold text-lg border-b-2 border-red-600 pb-1 hover:text-red-500 transition-colors"
              >
                Ver preço para meu iPhone <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BlockComparison() {
  return (
    <section className="py-24 bg-black border-y border-zinc-900">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 italic">POR QUE NÃO ESCOLHER A TELA MAIS BARATA?</h2>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
            Cuidado com "telas paralelas" de baixa qualidade. Elas danificam seu aparelho a longo prazo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-red-500 flex items-center gap-3 uppercase">
              <AlertTriangle /> TELAS "BARATAS" (MERCADO)
            </h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-12 h-12 shrink-0 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                  <Battery size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Drenagem de Bateria</h4>
                  <p className="text-zinc-500 text-sm">Tecnologia inferior que gasta até 40% mais bateria do iPhone.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-12 h-12 shrink-0 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                  <Eye size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Baixa Resolução</h4>
                  <p className="text-zinc-500 text-sm">Cores lavadas, fantasmas na imagem e touch impreciso.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-12 h-12 shrink-0 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Risco à Placa</h4>
                  <p className="text-zinc-500 text-sm">Componentes sem proteção que podem causar curto-circuito.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-8 p-8 bg-zinc-900/50 rounded-3xl border border-red-500/20 shadow-2xl shadow-red-500/5">
            <h3 className="text-2xl font-bold text-green-500 flex items-center gap-3 uppercase">
              <Award /> TELAS PREMIUM BALÃO
            </h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-12 h-12 shrink-0 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                  <Battery size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Eficiência Energética</h4>
                  <p className="text-zinc-400 text-sm">Tecnologia OLED que respeita o consumo original do aparelho.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-12 h-12 shrink-0 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Fidelidade Total</h4>
                  <p className="text-zinc-400 text-sm">Mesma gama de cores e taxa de atualização de 120Hz (nos modelos Pro).</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-12 h-12 shrink-0 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Garantia de 1 Ano</h4>
                  <p className="text-zinc-400 text-sm">Cobertura total contra defeitos, garantindo sua tranquilidade.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function BlockUrgency() {
  return (
    <section className="py-16 bg-red-600 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex p-4 bg-white/20 rounded-full mb-6 animate-bounce">
          <AlertTriangle size={40} />
        </div>
        <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight uppercase">IPHONE ESQUENTANDO OU INCHADO?</h2>
        <p className="text-xl md:text-2xl font-medium mb-10 max-w-3xl mx-auto opacity-90">
          Não corra riscos. Baterias com defeito podem explodir ou danificar a tela. Realizamos o diagnóstico gratuito e a troca em <strong className="underline">menos de 3 horas</strong>.
        </p>
        <Link 
          href={WHATSAPP_LINK}
          target="_blank"
          className="bg-white text-red-600 px-12 py-5 rounded-full font-black text-2xl hover:scale-105 transition-transform inline-block shadow-2xl"
        >
          FALAR COM TÉCNICO AGORA
        </Link>
      </div>
    </section>
  )
}

function BlockFAQ() {
  return (
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-16 uppercase italic">Dúvidas Frequentes (FAQ)</h2>
        <div className="space-y-6">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                <HelpCircle className="text-red-500 shrink-0" />
                {faq.question}
              </h3>
              <p className="text-zinc-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BlockWhyUs() {
  return (
    <section className="py-24 bg-black border-t border-zinc-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-6xl font-black text-center mb-20 italic uppercase">POR QUE A BALÃO DA INFORMÁTICA?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center group">
             <div className="w-20 h-20 mx-auto bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800 group-hover:border-red-500 transition-colors">
                <Droplets className="text-blue-500" size={32} />
             </div>
             <h3 className="text-2xl font-bold mb-4 uppercase">Vedação Original</h3>
             <p className="text-zinc-500 leading-relaxed">Única assistência em Campinas que repõe a vedação original contra água em todos os reparos.</p>
          </div>
          <div className="text-center group">
             <div className="w-20 h-20 mx-auto bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800 group-hover:border-red-500 transition-colors">
                <Camera className="text-purple-500" size={32} />
             </div>
             <h3 className="text-2xl font-bold mb-4 uppercase">Técnicos Certificados</h3>
             <p className="text-zinc-500 leading-relaxed">Especialistas treinados para lidar com a placa e componentes sensíveis do iPhone.</p>
          </div>
          <div className="text-center group">
             <div className="w-20 h-20 mx-auto bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800 group-hover:border-red-500 transition-colors">
                <ShieldCheck className="text-red-500" size={32} />
             </div>
             <h3 className="text-2xl font-bold mb-4 uppercase">Garantia Nacional</h3>
             <p className="text-zinc-500 leading-relaxed">Sua nota fiscal garante o serviço. Transparência e segurança para você e seu Apple.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function BlockReviews() {
  const reviews = [
    { name: "Julio Cesar", model: "iPhone 14 Pro Max", text: "A tela quebrou e eu precisava do celular pro trabalho. Trocado em 2h no Cambuí, serviço impecável. True Tone ok!" },
    { name: "Beatriz Oliveira", model: "iPhone 12 Mini", text: "Minha bateria estava estufando. Resolveram rápido, preço justo e o atendimento é excelente. Recomendo muito." },
    { name: "Marcos Paulo", model: "iPhone 13", text: "Melhor assistência de Campinas. Já levei em outras, mas a qualidade da tela da Balão é surreal, igual original." }
  ]

  return (
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-16 uppercase">O QUE NOSSOS CLIENTES DIZEM</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 hover:border-red-500/50 transition-all">
              <div className="flex gap-1 text-yellow-500 mb-6">
                {[1,2,3,4,5].map(s => <Star key={s} size={18} fill="currentColor" />)}
              </div>
              <p className="text-zinc-300 italic mb-8 leading-relaxed">"{r.text}"</p>
              <div>
                <div className="font-bold text-lg">{r.name}</div>
                <div className="text-red-500 text-sm font-bold uppercase tracking-wider">{r.model}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BlockCTA() {
  return (
    <section className="py-24 bg-black text-center">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-red-600 to-red-900 p-12 md:p-20 rounded-[3rem] shadow-2xl shadow-red-600/20 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
           <h2 className="text-4xl md:text-7xl font-black text-white mb-8 relative z-10 leading-tight uppercase">VOLTE A USAR SEU IPHONE HOJE!</h2>
           <p className="text-xl md:text-2xl text-white/90 mb-12 relative z-10 font-medium">
             Não espere dias. Temos estoque próprio para entrega imediata no Cambuí.
           </p>
           <Link 
             href={WHATSAPP_LINK}
             target="_blank"
             className="bg-white text-red-600 px-12 py-6 rounded-full font-black text-2xl hover:scale-105 transition-transform inline-flex items-center gap-3 relative z-10 shadow-xl"
           >
             <MessageCircle className="w-8 h-8 fill-current" />
             PEDIR ORÇAMENTO WHATSAPP
           </Link>
           <div className="mt-8 text-white/60 text-sm font-bold uppercase tracking-widest relative z-10">
              📍 Av. Anchieta, 789 - Cambuí, Campinas/SP
           </div>
        </div>
      </div>
    </section>
  )
}

export default function TelaIphonePage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500 selection:text-white">
      <Header />
      
      <main>
        <BlockHero />
        <BlockLocalSEO />
        <div className="bg-zinc-900/30 py-6 border-y border-white/5 overflow-hidden">
           <div className="flex whitespace-nowrap gap-12 animate-marquee font-black text-2xl md:text-4xl opacity-20 italic">
              <span>IPHONE 15 PRO MAX</span>
              <span>IPHONE 14 PLUS</span>
              <span>IPHONE 13 PRO</span>
              <span>IPHONE 12 MINI</span>
              <span>IPHONE 11 PRO</span>
              <span>IPHONE SE</span>
              <span>IPHONE XR</span>
              <span>IPHONE 8 PLUS</span>
              <span>IPHONE 15 PRO MAX</span>
              <span>IPHONE 14 PLUS</span>
              <span>IPHONE 13 PRO</span>
              <span>IPHONE 12 MINI</span>
              <span>IPHONE 11 PRO</span>
              <span>IPHONE SE</span>
              <span>IPHONE XR</span>
              <span>IPHONE 8 PLUS</span>
           </div>
        </div>
        <BlockServices />
        <BlockComparison />
        <BlockUrgency />
        <BlockWhyUs />
        <BlockFAQ />
        <BlockReviews />
        <BlockCTA />
      </main>
    </div>
  )
}
