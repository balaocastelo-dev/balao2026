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
  DollarSign,
  Camera,
  Users,
  Handshake,
  Smartphone,
  XCircle,
  AlertTriangle,
  Monitor,
  HardDrive,
  Laptop
} from 'lucide-react'

function BlockStats() {
  return (
    <section className="py-12 bg-zinc-900 border-b border-zinc-800">
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
        {[
          { label: "Equipamentos Vendidos", value: "+2.500" },
          { label: "Tempo Médio de Venda", value: "7 Dias" },
          { label: "Avaliação de Clientes", value: "4.9/5" },
          { label: "Anos de Mercado", value: "15" }
        ].map((stat, i) => (
          <div key={i}>
            <div className="text-4xl font-black mb-2 text-green-500">{stat.value}</div>
            <div className="text-zinc-400 text-sm uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function BlockComparison() {
  return (
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-black text-center mb-16">
          POR QUE VENDER COM A <span className="text-green-500">BALÃO?</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
           {/* Vender Sozinho */}
           <div className="bg-zinc-900/50 p-8 rounded-3xl border border-red-900/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">RISCO ALTO</div>
              <h3 className="text-2xl font-bold mb-6 text-red-400">Vender Sozinho (OLX/Face)</h3>
              <ul className="space-y-4">
                 <li className="flex items-start gap-3 text-zinc-400">
                    <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                    <span>Golpes de pagamento e comprovantes falsos.</span>
                 </li>
                 <li className="flex items-start gap-3 text-zinc-400">
                    <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                    <span>Estranhos visitando sua casa para "testar".</span>
                 </li>
                 <li className="flex items-start gap-3 text-zinc-400">
                    <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                    <span>Mensagens de curiosos o dia todo.</span>
                 </li>
                 <li className="flex items-start gap-3 text-zinc-400">
                    <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                    <span>Sem garantia para quem compra (desvaloriza o produto).</span>
                 </li>
              </ul>
           </div>

           {/* Vender na Balão */}
           <div className="bg-zinc-900 p-8 rounded-3xl border border-green-500/50 relative overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.1)]">
              <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMENDADO</div>
              <h3 className="text-2xl font-bold mb-6 text-green-400">Vender na Balão</h3>
              <ul className="space-y-4">
                 <li className="flex items-start gap-3 text-white">
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                    <span>Pagamento garantido e seguro.</span>
                 </li>
                 <li className="flex items-start gap-3 text-white">
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                    <span>Loja física no centro (segurança total).</span>
                 </li>
                 <li className="flex items-start gap-3 text-white">
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                    <span>Nós atendemos os interessados.</span>
                 </li>
                 <li className="flex items-start gap-3 text-white">
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                    <span>Oferecemos garantia e parcelamento (vende mais rápido).</span>
                 </li>
              </ul>
           </div>
        </div>
      </div>
    </section>
  )
}

function BlockWhatWeAccept() {
   return (
      <section className="py-20 bg-zinc-950 text-white">
         <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black text-center mb-12">O QUE COMPRAMOS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-green-500 transition-colors text-center group">
                  <Smartphone className="w-12 h-12 mx-auto mb-4 text-zinc-500 group-hover:text-green-500 transition-colors" />
                  <h3 className="font-bold text-lg">Celulares</h3>
                  <p className="text-sm text-zinc-500 mt-2">iPhones e Androids topo de linha (Samsung S, Xiaomi).</p>
               </div>
               <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-green-500 transition-colors text-center group">
                  <Laptop className="w-12 h-12 mx-auto mb-4 text-zinc-500 group-hover:text-green-500 transition-colors" />
                  <h3 className="font-bold text-lg">Notebooks</h3>
                  <p className="text-sm text-zinc-500 mt-2">Dell, Lenovo, Acer, Macbooks. Core i5 ou superior.</p>
               </div>
               <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-green-500 transition-colors text-center group">
                  <Cpu className="w-12 h-12 mx-auto mb-4 text-zinc-500 group-hover:text-green-500 transition-colors" />
                  <h3 className="font-bold text-lg">PC Gamer</h3>
                  <p className="text-sm text-zinc-500 mt-2">Computadores montados com placa de vídeo dedicada.</p>
               </div>
               <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-green-500 transition-colors text-center group">
                  <Monitor className="w-12 h-12 mx-auto mb-4 text-zinc-500 group-hover:text-green-500 transition-colors" />
                  <h3 className="font-bold text-lg">Periféricos</h3>
                  <p className="text-sm text-zinc-500 mt-2">Monitores, Placas de Vídeo e peças high-end.</p>
               </div>
            </div>
         </div>
      </section>
   )
}

function BlockWhatWeDontAccept() {
   return (
      <section className="py-12 bg-zinc-900 border-y border-zinc-800 text-white">
         <div className="container mx-auto px-4 max-w-4xl text-center">
            <h3 className="text-xl font-bold mb-8 text-zinc-400 flex items-center justify-center gap-2">
               <XCircle className="text-red-500" />
               O que NÃO aceitamos no momento
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
               {["Impressoras", "Monitores de Tubo (CRT)", "Peças Quebradas", "Notebooks muito antigos (DDR2)", "Celulares Bloqueados", "Tablets Genéricos"].map((item, i) => (
                  <span key={i} className="bg-zinc-800 px-4 py-2 rounded-full text-zinc-400 text-sm border border-zinc-700">
                     {item}
                  </span>
               ))}
            </div>
         </div>
      </section>
   )
}

function BlockSafety() {
   return (
      <section className="py-20 bg-black text-white">
         <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">
               <h2 className="text-3xl font-black mb-6">SEGURANÇA DE DADOS</h2>
               <div className="flex gap-4">
                  <div className="bg-green-900/20 p-4 rounded-xl h-fit">
                     <Lock className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold mb-2">Formatação Segura (Wipe)</h3>
                     <p className="text-zinc-400">Antes de colocar à venda, realizamos uma formatação de baixo nível que impede a recuperação dos seus arquivos pessoais, fotos e senhas.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="bg-green-900/20 p-4 rounded-xl h-fit">
                     <ShieldCheck className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold mb-2">Contrato de Consignação</h3>
                     <p className="text-zinc-400">Tudo documentado. Você recebe um contrato com a descrição do item, valor combinado e prazos. Transparência total.</p>
                  </div>
               </div>
            </div>
            <div className="flex-1 bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
               <h3 className="font-bold text-center mb-6 text-zinc-300">NOSSO COMPROMISSO</h3>
               <ul className="space-y-4">
                  <li className="flex items-center justify-between p-4 bg-black rounded-lg border border-zinc-800">
                     <span>Privacidade</span>
                     <CheckCircle className="text-green-500" />
                  </li>
                  <li className="flex items-center justify-between p-4 bg-black rounded-lg border border-zinc-800">
                     <span>Honestidade na Avaliação</span>
                     <CheckCircle className="text-green-500" />
                  </li>
                  <li className="flex items-center justify-between p-4 bg-black rounded-lg border border-zinc-800">
                     <span>Pagamento Pontual</span>
                     <CheckCircle className="text-green-500" />
                  </li>
               </ul>
            </div>
         </div>
      </section>
   )
}

function BlockTestimonials() {
   return (
      <section className="py-20 bg-zinc-950 text-white">
         <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-black mb-12">QUEM VENDEU, RECOMENDA</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 relative">
                  <div className="flex justify-center gap-1 text-green-500 mb-4">
                     <Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" />
                  </div>
                  <p className="italic mb-6 text-zinc-300">"Tinha um PC Gamer parado há meses. Levei na Balão, avaliaram na hora e venderam em 1 semana. O PIX caiu na hora."</p>
                  <p className="font-bold">- Felipe J., Programador</p>
               </div>
               <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 relative">
                  <div className="flex justify-center gap-1 text-green-500 mb-4">
                     <Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" />
                  </div>
                  <p className="italic mb-6 text-zinc-300">"Melhor que vender no Facebook. Não tive dor de cabeça com ninguém me chamando. Recomendo muito."</p>
                  <p className="font-bold">- Amanda S., Arquiteta</p>
               </div>
               <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 relative">
                  <div className="flex justify-center gap-1 text-green-500 mb-4">
                     <Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" />
                  </div>
                  <p className="italic mb-6 text-zinc-300">"Vendi meu MacBook antigo para dar entrada em um novo com eles. Avaliação justa e processo transparente."</p>
                  <p className="font-bold">- Roberto M., Fotógrafo</p>
               </div>
            </div>
         </div>
      </section>
   )
}

function BlockFAQ() {
   return (
      <section className="py-20 bg-black text-white">
         <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-black text-center mb-12">DÚVIDAS FREQUENTES</h2>
            <div className="space-y-6">
               <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/50">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-green-400">
                     <DollarSign className="w-5 h-5" />
                     Quanto vocês cobram?
                  </h3>
                  <p className="text-zinc-400">Trabalhamos com uma porcentagem sobre a venda ou valor líquido combinado. Isso é definido na avaliação, sem surpresas.</p>
               </div>
               <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/50">
                  <h3 className="text-xl font-bold mb-2 text-green-400">Preciso deixar o equipamento na loja?</h3>
                  <p className="text-zinc-400">Sim. Para vender rápido, o produto precisa estar disponível para os clientes verem e testarem em nossa vitrine física.</p>
               </div>
               <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/50">
                  <h3 className="text-xl font-bold mb-2 text-green-400">Quanto tempo demora?</h3>
                  <p className="text-zinc-400">A média é de 7 a 15 dias para itens com preço de mercado. Itens muito específicos podem levar mais tempo.</p>
               </div>
               <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/50">
                  <h3 className="text-xl font-bold mb-2 text-green-400">Vocês compram à vista?</h3>
                  <p className="text-zinc-400">Em alguns casos específicos de alta liquidez (como iPhones recentes ou MacBooks), podemos fazer uma oferta de compra imediata com valor diferenciado.</p>
               </div>
            </div>
         </div>
      </section>
   )
}

function BlockLocation() {
   return (
      <section className="py-16 bg-zinc-900 text-white border-t border-zinc-800">
         <div className="container mx-auto px-4 text-center">
            <MapPin className="w-12 h-12 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black mb-4">TRAGA SEU EQUIPAMENTO</h2>
            <p className="text-xl text-zinc-400 mb-8">Av. Brasil, 1234 - Guanabara, Campinas - SP</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
               <a href="https://wa.me/5519993916723" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-colors">
                  <MessageCircle /> Agendar Avaliação
               </a>
               <a href="https://goo.gl/maps/XYZ" target="_blank" className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-colors">
                  <MapPin /> Ver no Google Maps
               </a>
            </div>
         </div>
      </section>
   )
}

export const metadata: Metadata = {
  title: 'Venda seu PC Usado em Consignação Campinas | Avaliação Justa',
  description: 'Transforme seu computador ou notebook usado em dinheiro. Avaliação justa, segurança total e pagamento garantido em Campinas. Venda sem dor de cabeça.',
  keywords: [
    'venda pc usado campinas',
    'consignacao informatica',
    'vender notebook usado',
    'avaliacao pc gamer',
    'loja compra pc usado',
    'vender macbook campinas',
    'compro seu pc',
    'troca pc gamer',
    'balao da informatica usados',
    'reciclagem eletronicos campinas'
  ],
  alternates: {
    canonical: 'https://www.balao.info/consignacao',
  },
  openGraph: {
    title: 'Venda seu Equipamento Usado | Balão da Informática',
    description: 'Nós vendemos para você. Segurança, vitrine na loja física e pagamento garantido.',
    url: 'https://www.balao.info/consignacao',
    type: 'website',
    locale: 'pt_BR',
    images: ['/images/og-consignacao.jpg']
  }
}

export const dynamic = 'force-dynamic'

function BlockHero() {
  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Consignação', item: 'https://www.balao.info/consignacao' }
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-black text-white overflow-hidden">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/40 via-black to-black"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[800px] md:h-[800px] bg-green-600/20 rounded-full blur-[60px] md:blur-[120px] animate-pulse"></div>

      <div className="container relative z-10 px-4 text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-300 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
          <DollarSign className="w-3 h-3 md:w-4 md:h-4 animate-bounce" />
          Transforme Equipamento em Dinheiro
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-green-200 to-green-900 drop-shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-in fade-in zoom-in-50 duration-1000 leading-[0.9] py-2">
          VENDA SEU<br />
          <span className="text-stroke-white text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">USADO</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-3xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 px-2">
          Avaliação justa e venda rápida. Deixe a burocracia com a gente e receba o <strong className="text-green-500 font-bold">pagamento garantido</strong>.
        </p>

        <div className="pt-4 md:pt-8 flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 px-4">
          <Link 
             href="https://wa.me/5519993916723?text=Quero%20vender%20meu%20computador%20usado!"
             target="_blank"
             className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg transition-all shadow-lg shadow-green-600/30 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
             <Camera className="w-5 h-5" />
             Avaliar Meu Equipamento
          </Link>
          <Link 
             href="#como-funciona"
             className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 backdrop-blur-sm w-full sm:w-auto"
          >
             <Settings className="w-5 h-5" />
             Como Funciona
          </Link>
        </div>
      </div>
      
      {/* Marquee Benefits */}
      <div className="absolute bottom-0 w-full bg-white/5 border-t border-white/10 py-4 md:py-6 backdrop-blur-sm overflow-hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-16 opacity-60 text-green-200 font-bold tracking-widest text-xs md:text-xl">
           <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> SEGURANÇA TOTAL</span>
           <span className="flex items-center gap-2"><Users className="w-4 h-4" /> VITRINE NA LOJA</span>
           <span className="flex items-center gap-2"><Handshake className="w-4 h-4" /> SEM CURIOSOS</span>
           <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> PAGAMENTO PIX</span>
        </div>
      </div>
    </section>
  );
}

function BlockDivider({ text, subtext }: { text: string, subtext?: string }) {
  return (
    <section className="relative py-16 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden bg-black border-y border-zinc-800">
       <div className="absolute inset-0 bg-green-900/10"></div>
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
       
       <div className="relative z-10 container px-4">
          <h2 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 uppercase leading-none mb-4 drop-shadow-xl break-words">
             {text}
          </h2>
          {subtext && (
             <p className="text-sm sm:text-xl md:text-2xl text-green-500 font-bold tracking-widest uppercase animate-pulse">
                {subtext}
             </p>
          )}
       </div>
    </section>
  )
}

function StepCard({ number, title, description, icon: Icon }: { number: string, title: string, description: string, icon: any }) {
   return (
      <div className="relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
         <div className="relative p-8 bg-zinc-900 ring-1 ring-zinc-800 rounded-xl leading-none flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
               <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-full text-green-400 font-bold text-xl border border-green-500/20">
                  {number}
               </div>
               <Icon className="w-8 h-8 text-zinc-500 group-hover:text-green-500 transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors">{title}</h3>
            <p className="text-zinc-400 text-lg leading-relaxed">{description}</p>
         </div>
      </div>
   )
}

function BlockSteps() {
   return (
      <section id="como-funciona" className="py-20 bg-zinc-950 relative overflow-hidden">
         <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <StepCard 
                  number="1"
                  title="Contato"
                  description="Envie fotos e especificações do seu equipamento pelo nosso WhatsApp."
                  icon={Smartphone}
               />
               <StepCard 
                  number="2"
                  title="Avaliação"
                  description="Nossos técnicos avaliam o estado e definimos juntos um preço justo de venda."
                  icon={Search}
               />
               <StepCard 
                  number="3"
                  title="Exposição"
                  description="Seu produto fica exposto em nossa loja física e site para milhares de clientes."
                  icon={Users}
               />
               <StepCard 
                  number="4"
                  title="Pagamento"
                  description="Assim que vendido, transferimos o valor combinado via PIX para sua conta."
                  icon={DollarSign}
               />
            </div>
         </div>
      </section>
   )
}

function BlockUrgency() {
   return (
      <section className="py-20 bg-green-600 text-white text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
         <div className="container mx-auto px-4 max-w-4xl space-y-8 relative z-10">
            <h2 className="text-4xl md:text-7xl font-black tracking-tight">
               QUER VENDER RÁPIDO?
            </h2>
            <p className="text-xl md:text-3xl font-medium opacity-90">
               Temos uma lista de espera de compradores procurando equipamentos usados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
               <a 
                  href="https://wa.me/5519993916723?text=Quero%20vender%20hoje!"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-green-900 px-8 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-2xl flex items-center justify-center gap-3 w-full sm:w-auto"
               >
                  <DollarSign className="w-6 h-6 animate-pulse" />
                  AVALIAR AGORA
               </a>
            </div>
            <p className="text-sm opacity-75 mt-4 font-mono">
               Campinas e Região • Pagamento Seguro • Sem Burocracia
            </p>
         </div>
      </section>
   );
}

export default async function ConsignacaoPage() {
  const allProducts = await getProducts()
  
  // Helper para filtrar o que aceitamos (simulação com produtos novos)
  const acceptedExamples = allProducts.filter(p => {
    const text = (p.name + " " + (p.description || "")).toLowerCase()
    return ['notebook', 'pc', 'gamer', 'placa', 'video'].some(k => text.includes(k))
  }).slice(0, 12)

  return (
    <div className="min-h-screen flex flex-col bg-black font-sans">
      <Header />
      <main className="flex-1">
        
        <BlockHero />
        <BlockStats />
        <BlockSteps />
        <BlockComparison />
        <BlockWhatWeAccept />
        <BlockWhatWeDontAccept />

        <BlockDivider text="O QUE ACEITAMOS" subtext="Equipamentos com Alta Procura" />

        <section className="bg-zinc-900 py-20 relative">
           <div className="container mx-auto px-4">
              <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-12 text-lg">
                 Aceitamos equipamentos em bom estado, com menos de 5 anos de uso. 
                 Notebooks, PCs Gamer, Placas de Vídeo e Monitores são os mais procurados.
              </p>
              <ProductCarousel 
                 title="Exemplos do que Vendemos" 
                 products={acceptedExamples} 
              />
           </div>
        </section>

        <BlockSafety />
        <BlockTestimonials />
        <BlockFAQ />
        <BlockLocation />
        
        {/* CTA FINAL */}
        <BlockUrgency />

      </main>
    </div>
  )
}