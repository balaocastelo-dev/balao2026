import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import { getProducts } from '@/lib/db'
import ProductCarousel from '@/components/ProductCarousel'
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from '@/components/JsonLd'
import { 
  Gamepad2, 
  Wrench, 
  Cpu, 
  Zap, 
  ThermometerSun, 
  Disc, 
  Cable, 
  Truck, 
  MessageCircle, 
  CheckCircle,
  Award,
  MapPin,
  HelpCircle,
  ShieldCheck,
  Search,
  Settings,
  Ghost,
  Timer,
  ThumbsUp,
  Star,
  Shield,
  AlertTriangle,
  Trophy
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Assistência Técnica Games Campinas | Conserto PS5, PS4, Xbox Series | Balão da Informática',
  description: 'Especialista em reparo de consoles: PlayStation 5, PS4, Xbox Series X/S e Xbox One. Limpeza, troca de pasta térmica, HDMI, fonte e controle. Orçamento grátis em Campinas.',
  keywords: [
    'conserto ps5 campinas',
    'manutenção ps4',
    'assistência técnica xbox series',
    'reparo controle ps5 drift',
    'limpeza ps5',
    'troca hdmi ps5',
    'conserto xbox one campinas',
    'assistência games campinas',
    'reparo placa mãe console',
    'loja de games campinas'
  ],
  alternates: {
    canonical: 'https://www.balao.info/assistenciagames',
  },
  openGraph: {
    title: 'Assistência Técnica Games Especializada | PS5, PS4 e Xbox | Balão da Informática',
    description: 'Seu console esquentando ou desligando? Resolvemos problemas de placa, HDMI, fonte e drift em controles. Atendemos todo o Brasil via correios.',
    url: 'https://www.balao.info/assistenciagames',
    type: 'website',
    locale: 'pt_BR',
    images: ['/images/og-games.jpg']
  }
}

export const dynamic = 'force-dynamic'

function BlockHero() {
  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Assistência Games', item: 'https://www.balao.info/assistenciagames' }
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-black text-white overflow-hidden">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>

      <div className="container relative z-10 px-4 text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs md:text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Gamepad2 className="w-4 h-4 animate-bounce" />
          Laboratório Especializado em Games
        </div>
        
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-200 to-purple-900 drop-shadow-[0_0_30px_rgba(147,51,234,0.5)] animate-in fade-in zoom-in-50 duration-1000 leading-none">
          GAME OVER?<br />
          <span className="text-stroke-white text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">NUNCA!</span>
        </h1>
        
        <p className="text-lg md:text-3xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Ressuscitamos seu console. Especialistas em <strong className="text-purple-400 font-bold">PlayStation 5, PS4, Xbox Series e One</strong>.
        </p>

        <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <Link 
             href="https://wa.me/5519993916723?text=Preciso%20de%20assist%C3%AAncia%20para%20meu%20videogame!"
             target="_blank"
             className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-purple-600/30 hover:scale-105 flex items-center justify-center gap-2"
          >
             <MessageCircle className="w-5 h-5" />
             Orçamento Grátis
          </Link>
          <Link 
             href="#servicos"
             className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 backdrop-blur-sm"
          >
             <Settings className="w-5 h-5" />
             Ver Serviços
          </Link>
        </div>
      </div>
      
      {/* Marquee Consoles */}
      <div className="absolute bottom-0 w-full bg-white/5 border-t border-white/10 py-4 md:py-6 backdrop-blur-sm overflow-hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-16 opacity-60 text-purple-200 font-bold tracking-widest text-xs md:text-xl">
           <span>PLAYSTATION 5</span>
           <span>XBOX SERIES X</span>
           <span>PS4 PRO</span>
           <span>XBOX ONE S</span>
           <span>NINTENDO SWITCH</span>
           <span>DUALSENSE</span>
           <span>CONTROLE ELITE</span>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ icon: Icon, title, description, items }: { icon: any, title: string, description: string, items: string[] }) {
  return (
    <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 p-8 rounded-3xl hover:border-purple-500 transition-all group h-full flex flex-col">
      <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-purple-500 group-hover:bg-purple-500/10 transition-all mb-6 border border-zinc-700 group-hover:border-purple-500/30">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">{title}</h3>
      <p className="text-zinc-400 mb-6 leading-relaxed">{description}</p>
      <ul className="space-y-3 mt-auto">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 text-zinc-300 text-sm">
            <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function BlockServices() {
  const services = [
    {
      icon: ThermometerSun,
      title: "Limpeza e Refrigeração",
      description: "Seu console parece uma turbina de avião? Resolvemos o superaquecimento antes que queime o processador.",
      items: [
        "Limpeza química completa",
        "Troca de Pasta Térmica (Prata/Liquid Metal)",
        "Desobstrução de dissipadores",
        "Lubrificação de cooler"
      ]
    },
    {
      icon: Cable,
      title: "Reparo de HDMI e Conexões",
      description: "Imagem falhando, tela preta ou conector quebrado. Trocamos a porta HDMI com solda BGA precisa.",
      items: [
        "Troca de conector HDMI",
        "Reparo de CI de vídeo (Panasonic/Retimer)",
        "Conserto de porta USB/Rede",
        "Resolução de 'Luz Azul da Morte' (BLOD)"
      ]
    },
    {
      icon: Disc,
      title: "Leitor e Drives",
      description: "Console não puxa o disco, não lê jogos ou faz barulho estranho ao rodar mídia física.",
      items: [
        "Alinhamento de mecanismo",
        "Limpeza de lente óptica",
        "Troca de unidade óptica completa",
        "Reparo de ejeção automática"
      ]
    },
    {
      icon: Gamepad2,
      title: "Conserto de Controles",
      description: "Recupere a precisão do seu DualSense, DualShock 4 ou Controle Xbox. Adeus Drift!",
      items: [
        "Troca de analógico (Drift)",
        "Substituição de bateria viciada",
        "Reparo de botões e gatilhos",
        "Limpeza interna de contatos"
      ]
    },
    {
      icon: Zap,
      title: "Fonte e Energia",
      description: "Console não liga, desliga sozinho ou sofreu descarga elétrica (raio/pico de luz).",
      items: [
        "Reparo de fonte interna",
        "Troca de componentes queimados",
        "Recuperação de trilhas",
        "Análise de curto na placa-mãe"
      ]
    },
    {
      icon: Cpu,
      title: "Placa-Mãe e Chipset",
      description: "Problemas complexos que outras assistências condenam. Temos laboratório avançado de eletrônica.",
      items: [
        "Reballing de APU/CPU",
        "Troca de Memória GDDR",
        "Reparo de circuito de Stand-by",
        "Atualização de BIOS/Firmware corrompido"
      ]
    }
  ];

  return (
    <section id="servicos" className="py-20 bg-zinc-950 text-white relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            SOLUÇÕES PARA <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">TODOS OS DEFEITOS</span>
          </h2>
          <p className="text-zinc-400 text-lg">
            Utilizamos peças originais e equipamentos de ponta para garantir que seu videogame volte a funcionar como novo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <ServiceCard key={idx} {...service} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BlockNational() {
  return (
    <section className="py-20 bg-purple-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6">
            <Truck className="w-4 h-4" />
            Atendemos Todo o Brasil
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            MORA LONGE?<br />
            <span className="text-purple-300">ENVIE PELOS CORREIOS</span>
          </h2>
          <p className="text-purple-100 text-lg mb-8 leading-relaxed">
            Não confie seu console a curiosos. Envie para o laboratório mais especializado de Campinas. Recebemos equipamentos de todo o país com total segurança.
          </p>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 font-medium">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">1</div>
              Entre em contato e solicite a etiqueta de envio.
            </li>
            <li className="flex items-center gap-3 font-medium">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">2</div>
              Embale seu console com segurança.
            </li>
            <li className="flex items-center gap-3 font-medium">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">3</div>
              Receba o orçamento aprovado e acompanhe o reparo.
            </li>
            <li className="flex items-center gap-3 font-medium">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">4</div>
              Receba de volta em casa, com garantia e nota fiscal.
            </li>
          </ul>
          <Link 
            href="https://wa.me/5519993916723?text=Quero%20enviar%20meu%20console%20pelos%20Correios!"
            target="_blank"
            className="bg-white text-purple-900 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform inline-flex items-center gap-2 shadow-xl"
          >
            <Truck className="w-5 h-5" />
            Iniciar Envio Agora
          </Link>
        </div>
        <div className="relative h-[400px] bg-purple-800/50 rounded-3xl border border-purple-500/30 flex items-center justify-center p-8">
          <MapPin className="w-32 h-32 text-purple-400 opacity-50 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-2">Recebemos de:</p>
              <p className="text-purple-200">São Paulo, Rio de Janeiro, Minas Gerais,<br/>Paraná, Bahia e muito mais.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function BlockFAQ() {
  return (
    <section className="py-20 bg-black text-white border-t border-zinc-900">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-5xl font-black text-center mb-12">DÚVIDAS FREQUENTES</h2>
        
        <div className="space-y-6">
          <div className="bg-zinc-900 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" /> Quanto tempo demora o conserto?
            </h3>
            <p className="text-zinc-300 leading-relaxed">
              A maioria dos reparos como limpeza, troca de HDMI e fonte são realizados em <strong>24 a 48 horas</strong>. Reparos complexos de placa-mãe podem levar de 3 a 5 dias úteis para testes rigorosos de estresse.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5" /> Qual a garantia do serviço?
            </h3>
            <p className="text-zinc-300 leading-relaxed">
              Oferecemos <strong>90 dias (3 meses) de garantia</strong> legal para qualquer serviço realizado e peças trocadas. Para alguns serviços específicos, podemos estender esse prazo.
            </p>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Meus jogos e saves são apagados?
            </h3>
            <p className="text-zinc-300 leading-relaxed">
              Em 95% dos casos, <strong>NÃO</strong>. Preservamos seus dados sempre que possível. A formatação só é feita se houver dano irrecuperável no HD/SSD ou no sistema de arquivos, e sempre com sua autorização prévia.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default async function AssistenciaGamesPage() {
  const allProducts = await getProducts()
  
  // Filtrar produtos relacionados a console e playstation
  const gameProducts = allProducts.filter(p => {
    const text = (p.name + " " + (p.description || "") + " " + p.category).toLowerCase()
    return (text.includes('console') || text.includes('playstation') || text.includes('xbox') || text.includes('game'))
  })

  return (
    <div className="min-h-screen flex flex-col bg-black font-sans">
      <Header />
      <main className="flex-1">
        
        <BlockHero />

        {/* NEW BLOCK: Stats */}
        <section className="py-12 bg-zinc-900 border-b border-zinc-800">
           <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                 { num: "15k+", label: "Consoles Reparados", icon: Gamepad2 },
                 { num: "98%", label: "Taxa de Sucesso", icon: Trophy },
                 { num: "24h", label: "Orçamento Médio", icon: Timer },
                 { num: "12x", label: "Parcelamento", icon: ThumbsUp }
              ].map((s, i) => (
                 <div key={i} className="group hover:bg-zinc-800/50 p-4 rounded-2xl transition-colors">
                    <div className="flex justify-center mb-4 text-purple-500 group-hover:scale-110 transition-transform">
                       <s.icon className="w-8 h-8" />
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-white mb-2">{s.num}</div>
                    <div className="text-sm text-zinc-500 uppercase tracking-wider font-bold">{s.label}</div>
                 </div>
              ))}
           </div>
        </section>

        <BlockServices />

        {/* NEW BLOCK: Process */}
        <section className="py-20 bg-zinc-950 text-white relative overflow-hidden border-t border-zinc-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-4">COMO FUNCIONA</h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">Seu game novo de novo em 4 passos simples.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { step: "01", title: "Entrada", desc: "Traga seu console ou envie pelos Correios." },
                        { step: "02", title: "Análise", desc: "Diagnóstico preciso em laboratório próprio." },
                        { step: "03", title: "Aprovação", desc: "Orçamento detalhado via WhatsApp." },
                        { step: "04", title: "Diversão", desc: "Retire seu game pronto para jogar." }
                    ].map((item, i) => (
                        <div key={i} className="relative group">
                            <div className="text-6xl font-black text-zinc-800 absolute -top-8 left-1/2 -translate-x-1/2 z-0 group-hover:text-purple-900/20 transition-colors">
                                {item.step}
                            </div>
                            <div className="relative z-10 bg-zinc-900 p-8 rounded-3xl border border-zinc-800 hover:border-purple-500 transition-colors text-center">
                                <h3 className="text-xl font-bold mb-2 text-purple-400">{item.title}</h3>
                                <p className="text-zinc-400 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* NEW BLOCK: Common Problems */}
        <section className="py-20 bg-black text-white">
           <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-5xl font-black text-center mb-16">DEFEITOS COMUNS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                    { title: "Luz Azul da Morte", desc: "O terror do PS4/PS5. Resolvemos com Reballing profissional.", icon: Ghost },
                    { title: "Drift no Analógico", desc: "Seu personagem anda sozinho? Trocamos o mecanismo 3D.", icon: Gamepad2 },
                    { title: "Superaquecimento", desc: "Barulho alto e desligamentos. Limpeza e pasta térmica resolvem.", icon: ThermometerSun },
                    { title: "Não Lê Disco", desc: "Drive óptico travado ou lente suja. Recuperamos seu leitor.", icon: Disc },
                    { title: "HDMI Quebrado", desc: "Mal contato ou porta danificada. Troca do conector na hora.", icon: Cable },
                    { title: "Não Liga", desc: "Fonte queimada ou curto na placa. Diagnóstico eletrônico avançado.", icon: Zap }
                 ].map((prob, i) => (
                    <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 transition-colors">
                       <div className="p-3 bg-red-500/10 rounded-xl text-red-500 shrink-0">
                          <prob.icon className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="font-bold text-lg mb-1">{prob.title}</h3>
                          <p className="text-sm text-zinc-400 leading-relaxed">{prob.desc}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* PRODUTOS EM DESTAQUE */}
        <section className="bg-zinc-900 py-16 border-y border-zinc-800">
           <div className="container mx-auto px-4">
              <ProductCarousel 
                 title="Consoles e Acessórios em Estoque" 
                 products={gameProducts} 
              />
           </div>
        </section>

        {/* NEW BLOCK: Warranty */}
        <section className="py-20 bg-zinc-900 text-white border-y border-zinc-800">
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
              <div className="flex-1 bg-black p-8 rounded-3xl border border-zinc-800 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 bg-green-600 text-black font-black text-xs uppercase tracking-widest rounded-bl-2xl">
                    Aprovado
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center font-bold">VS</div>
                       <div>
                          <h3 className="font-bold text-green-500">Balão Games</h3>
                          <p className="text-xs text-zinc-500">Laboratório Profissional</p>
                       </div>
                    </div>
                    <div className="h-px bg-zinc-800"></div>
                    <div className="space-y-2 text-sm text-zinc-300">
                       <p className="flex justify-between"><span>Técnicos Certificados</span> <CheckCircle className="w-4 h-4 text-green-500" /></p>
                       <p className="flex justify-between"><span>Ferramentas de Precisão</span> <CheckCircle className="w-4 h-4 text-green-500" /></p>
                       <p className="flex justify-between"><span>Ambiente ESD (Anti-estático)</span> <CheckCircle className="w-4 h-4 text-green-500" /></p>
                       <p className="flex justify-between"><span>Controle de Qualidade</span> <CheckCircle className="w-4 h-4 text-green-500" /></p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        <BlockNational />

        <BlockFAQ />

        <BlockFAQ />

        {/* NEW BLOCK: Testimonials */}
        <section className="py-20 bg-zinc-950 text-white border-t border-zinc-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black mb-12 text-center">GAMERS APROVAM</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                  { name: "Lucas M.", game: "PS5", text: "Achei que meu PS5 tinha morrido com o raio. Recuperaram a fonte e ainda limparam. Top!" },
                  { name: "Amanda K.", game: "Switch", text: "Trocaram o analógico do meu Joycon em 1 hora. O drift sumiu completamente." },
                  { name: "Roberto J.", game: "Xbox Series S", text: "Enviei de Minas Gerais pelos correios. Chegou perfeito e muito bem embalado. Recomendo." }
               ].map((t, i) => (
                  <div key={i} className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
                     <div className="flex gap-1 text-yellow-500 mb-4">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                     </div>
                     <p className="text-zinc-300 italic mb-6">"{t.text}"</p>
                     <div>
                        <div className="font-bold">{t.name}</div>
                        <div className="text-xs text-purple-500 font-bold uppercase">{t.game}</div>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </section>

        {/* NEW BLOCK: Newsletter/Tips */}
        <section className="py-20 bg-purple-600 text-white text-center">
           <div className="container mx-auto px-4 max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">Dicas de Mestre?</h2>
              <p className="mb-8 text-purple-100">Entre no nosso grupo e receba dicas de como cuidar do seu console e promoções de jogos.</p>
              <Link href="https://wa.me/5519993916723?text=Quero%20dicas%20para%20meu%20game" target="_blank" className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold hover:bg-purple-50 transition-colors inline-flex items-center gap-2">
                 Entrar na Comunidade <Gamepad2 className="w-5 h-5" />
              </Link>
           </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-purple-900 to-indigo-900 text-white text-center">
           <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-5xl font-black mb-8">PRONTO PARA VOLTAR AO JOGO?</h2>
              <Link 
                 href="https://wa.me/5519993916723?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20reparo%20para%20meu%20videogame."
                 target="_blank"
                 className="inline-flex items-center gap-3 bg-white text-purple-900 px-10 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-2xl"
              >
                 <MessageCircle className="w-6 h-6" />
                 FALAR COM TÉCNICO AGORA
              </Link>
           </div>
        </section>

      </main>
    </div>
  )
}