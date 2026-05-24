import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProductsByCategory } from '@/lib/db'
import { SITE_CONFIG } from '@/lib/config'
import { 
  CheckCircle, 
  MessageCircle, 
  Wrench, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  Zap, 
  Truck, 
  Award,
  Monitor,
  Smartphone,
  Wifi,
  Database,
  Search,
  ArrowRight,
  Droplets,
  Tablet,
  Recycle,
  Clock,
  Printer,
  Laptop,
  Mouse,
  Headphones
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Serviços de Informática e Ofertas Especiais | Balão da Informática Campinas',
  description:
    'Assistência técnica especializada em notebooks e computadores em Campinas. Promoções exclusivas de iPhone, Apple Watch e Monitores com entrega rápida. Mão de obra qualificada e garantia.',
  keywords: [
    'assistência técnica informática campinas',
    'conserto de notebook campinas',
    'montagem de pc gamer campinas',
    'iphone 17 pro max preço',
    'apple watch se 3 promoção',
    'monitor dell 27 polegadas',
    'formatação de computador campinas',
    'limpeza de pc gamer',
    'balão da informática serviços'
  ],
  alternates: { canonical: 'https://www.balao.info/servicos-e-ofertas' },
  openGraph: {
    title: 'Serviços de TI e Ofertas Relâmpago | Balão da Informática',
    description:
      'Confira nossas ofertas imperdíveis e serviços de assistência técnica especializada em Campinas. Qualidade, garantia e preço justo.',
    url: 'https://www.balao.info/servicos-e-ofertas',
    type: 'website',
    siteName: SITE_CONFIG.name,
    images: ['/logo.png']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Serviços de TI e Ofertas Relâmpago | Balão da Informática',
    description:
      'Confira nossas ofertas imperdíveis e serviços de assistência técnica especializada em Campinas. Qualidade, garantia e preço justo.',
    images: ['/logo.png']
  },
  robots: { index: true, follow: true }
}

const FEATURED_SERVICES = [
  {
    title: "Manutenção Especializada de Notebooks",
    description: "Reparo avançado de placa-mãe, troca de telas, teclados, baterias e carcaças. Soluções para equipamentos que não ligam, esquentam ou travam.",
    icon: Laptop, 
    details: ["Reballing de BGA", "Reparo de circuito de carga", "Troca de DC-Jack", "Limpeza química"]
  },
  {
    title: "Montagem e Otimização de PC Gamer",
    description: "Montagem profissional com cable management impecável. Otimização de BIOS, curvas de ventoinha e testes de estabilidade para máxima performance.",
    icon: Cpu,
    details: ["Consultoria de peças", "Overclock seguro", "Instalação de Water Cooler", "Personalização RGB"]
  },
  {
    title: "Upgrades de Performance (SSD e RAM)",
    description: "Deixe seu computador até 10x mais rápido com a instalação de SSDs NVMe e expansão de memória RAM. Clonagem de sistema sem perda de dados.",
    icon: HardDrive,
    details: ["Clonagem de HD para SSD", "Dual Channel", "Instalação de Heatsinks", "Backup de dados"]
  },
  {
    title: "Redes e Infraestrutura Wi-Fi",
    description: "Projetos de rede cabeada e Wi-Fi para residências e empresas. Configuração de roteadores, repetidores e servidores para conexão estável.",
    icon: Wifi,
    details: ["Cabeamento estruturado", "Configuração de Mesh", "Servidores de Arquivos", "VPN"]
  },
  {
    title: "Recuperação de Dados e Backup",
    description: "Recuperação profissional de arquivos deletados ou de HDs danificados. Implementação de rotinas de backup automático local e em nuvem.",
    icon: Database,
    details: ["Recuperação de HD/SSD", "Backup em Nuvem", "Restauração de Sistema", "Proteção de Dados"]
  },
  {
    title: "Limpeza e Manutenção Preventiva",
    description: "Aumente a vida útil do seu equipamento. Limpeza interna completa, troca de pasta térmica de alta condutividade e higienização externa.",
    icon: Wrench,
    details: ["Pasta térmica Silver/Gold", "Limpeza de contatos", "Desoxidação", "Lubrificação de fans"]
  },
  {
    title: "Reparo de Placa de iPhone",
    description: "Laboratório especializado em microeletrônica Apple. Recuperamos aparelhos condenados por outras assistências.",
    icon: Smartphone,
    details: ["Erro de Baseband", "Curto na placa", "Falha de áudio (Codec)", "Problemas de carga (Tristar)"],
    image: "/images/prizes/repair.png" 
  },
  {
    title: "Desoxidação (Banho Químico)",
    description: "Seu aparelho caiu na água? Traga imediatamente! Realizamos desoxidação completa com ultrassom e produtos específicos.",
    icon: Droplets,
    details: ["Banho Ultrassônico", "Tratamento anticorrosivo", "Secagem em estufa", "Análise microscópica"]
  },
  {
    title: "Manutenção de Tablet e iPad",
    description: "Troca de vidros, telas, baterias e conectores de carga para toda a linha iPad e Tablets Samsung/Lenovo.",
    icon: Tablet,
    details: ["Troca de Vidro Touch", "Troca de Display LCD", "Baterias Originais", "Conectores de Carga"]
  }
]

const maisDe50Servicos = [
  'Formatação com backup completo',
  'Instalação do Windows 11/10',
  'Remoção de vírus e malware',
  'Otimização de sistema lento',
  'Testes de estabilidade (Stress Test)',
  'Instalação de Pacote Office',
  'Configuração de Outlook/E-mail',
  'Upgrade de Placa de Vídeo',
  'Troca de Fonte de Alimentação',
  'Reparo de Carcaça e Dobradiças',
  'Solda de Componentes SMD',
  'Atualização de BIOS',
  'Correção de BIOS Corrompida',
  'Configuração de RAID 0/1/5',
  'Crimpagem de Cabos de Rede',
  'Configuração de Firewall Básico',
  'Compartilhamento de Impressoras',
  'Instalação de Impressoras Wi-Fi',
  'Manutenção Preventiva de Impressoras',
  'Criação de Pendrive Bootável',
  'Diagnóstico de Hardware Defeituoso',
  'Ajuste de Curva de Ventoinha',
  'Undervolt de Processador/GPU',
  'Calibração de Cores de Monitor',
  'Suporte Remoto (AnyDesk/TeamViewer)',
  'Inventário de Hardware/Software',
  'Consultoria para Upgrades',
  'Laudo Técnico para Seguradoras'
]

export const dynamic = 'force-dynamic'

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0
  const clean = priceStr.replace(/[^\d,]/g, '').replace(',', '.')
  return parseFloat(clean) || 0
}

function formatPrice(val: number): string {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Componente Service Card
const ServiceCard = ({ service }: { service: typeof FEATURED_SERVICES[0] }) => (
  <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-3xl overflow-hidden hover:border-red-600/30 transition-all group h-full flex flex-col hover:transform hover:scale-[1.02] duration-300">
    <div className="flex flex-col h-full">
      {/* Image/Icon Side */}
      <div className="relative h-48 bg-zinc-900/50 flex items-center justify-center p-8 overflow-hidden">
        {service.image && (
          <>
            <Image
              src={service.image}
              alt={service.title}
              fill
              className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
          </>
        )}
        
        <div className="relative z-10 w-16 h-16 bg-zinc-900/80 backdrop-blur rounded-2xl flex items-center justify-center text-red-600 shadow-xl border border-zinc-700 group-hover:scale-110 transition-transform duration-500">
          <service.icon className="w-8 h-8" />
        </div>
      </div>

      {/* Content Side */}
      <div className="p-8 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-red-500 transition-colors">
          {service.title}
        </h3>
        <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
          {service.description}
        </p>
        
        <div className="space-y-3 mb-8 flex-grow">
          {service.details.map((detail, i) => (
            <div key={i} className="flex items-center gap-3 text-zinc-400 group-hover:text-zinc-300 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
              <span className="font-medium text-sm">{detail}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <Link 
            href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
            className="inline-flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-900/20 hover:shadow-red-900/40 gap-2 group-hover:translate-x-1 duration-300"
          >
            <MessageCircle className="w-5 h-5" />
            Orçamento
          </Link>
        </div>
      </div>
    </div>
  </div>
)

// Componente Product Carousel
const ProductCarousel = ({ title, products, icon: Icon, bgClass = "bg-zinc-50" }: { title: string, products: any[], icon: any, bgClass?: string }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className={`py-20 border-y border-zinc-200 ${bgClass}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-900/20 transform -rotate-3">
                <Icon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-4xl font-black text-zinc-900 uppercase tracking-tight leading-none">
                  {title}
              </h3>
              <p className="text-red-600 font-bold tracking-widest uppercase text-sm mt-1">Ofertas Selecionadas</p>
            </div>
        </div>
        
        <div className="flex overflow-x-auto pb-12 gap-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-zinc-200 -mx-4 px-4 md:mx-0 md:px-0">
            {products.map((product, idx) => {
                const currentPrice = product.priceValue;
                const originalPrice = currentPrice * 1.4;

                return (
                    <div 
                        key={product.id || idx} 
                        className="snap-start shrink-0 w-[300px] bg-white rounded-3xl border border-zinc-100 shadow-lg hover:shadow-2xl transition-all flex flex-col overflow-hidden group hover:-translate-y-2 duration-300"
                    >
                        <div className="relative h-64 bg-white p-8 flex items-center justify-center border-b border-zinc-50">
                            {product.image ? (
                                <div className="relative w-full h-full">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-contain group-hover:scale-110 transition-transform duration-500"
                                        sizes="300px"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-zinc-50 text-zinc-300 rounded-lg">
                                    <span className="text-xs font-bold">Sem Imagem</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md z-10 tracking-wider">
                                MENOR PREÇO
                            </div>
                        </div>

                        <div className="p-6 flex flex-col flex-grow">
                            <h4 className="text-base font-bold text-zinc-800 mb-4 line-clamp-2 min-h-[3em] leading-relaxed" title={product.name}>
                                {product.name}
                            </h4>
                            
                            <div className="mt-auto pt-4 border-t border-zinc-50">
                                <div className="flex flex-col gap-1 mb-5">
                                    <span className="text-xs text-zinc-400 line-through">
                                        De: {formatPrice(originalPrice)}
                                    </span>
                                    <span className="text-3xl font-black text-red-600 tracking-tight">
                                        {formatPrice(currentPrice)}
                                    </span>
                                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded w-fit">
                                      À vista no PIX
                                    </span>
                                </div>
                                
                                <Link 
                                    href={`/product/${product.id}`}
                                    className="w-full bg-zinc-900 hover:bg-red-600 text-white text-sm font-bold py-4 px-6 rounded-xl transition-all text-center block shadow-lg shadow-zinc-900/10 hover:shadow-red-900/30"
                                >
                                    COMPRAR AGORA
                                </Link>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  )
}

// Componente Full Width Banner
const FullWidthBanner = ({ title, subtitle, bgImage, theme = "dark" }: { title: string, subtitle: string, bgImage?: string, theme?: "dark" | "light" }) => (
  <section className={`relative py-32 overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'}`}>
    {bgImage && (
      <div className="absolute inset-0 z-0">
        <Image src={bgImage} alt="Background" fill className="object-cover opacity-20" />
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-transparent' : 'bg-gradient-to-r from-zinc-100 via-zinc-100/90 to-transparent'}`} />
      </div>
    )}
    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-3xl">
        <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight">
          {title}
        </h2>
        <p className={`text-2xl md:text-3xl font-light mb-10 leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
          {subtitle}
        </p>
        <Link 
          href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
          className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl transition-transform hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
          Falar com Consultor
        </Link>
      </div>
    </div>
  </section>
)

export default async function Page() {
  const [redeRaw, hardwareRaw, licencaRaw, perifericosRaw, computadoresRaw, monitoresRaw, microsoftRaw] = await Promise.all([
    getProductsByCategory('rede'),
    getProductsByCategory('hardware'),
    getProductsByCategory('licen'),
    getProductsByCategory('perif'),
    getProductsByCategory('comput'),
    getProductsByCategory('monitor'),
    getProductsByCategory('microsoft')
  ])

  const process = (list: any[]) => list
    .map(p => ({ ...p, priceValue: parsePrice(p.price) }))
    .filter(p => p.priceValue > 0)
    .sort((a, b) => a.priceValue - b.priceValue)
    .slice(0, 10);

  const redeProducts = process(redeRaw);
  const hardwareProducts = process(hardwareRaw);
  const licencaProducts = process(licencaRaw);
  const perifericosProducts = process(perifericosRaw);
  const computadoresProducts = process(computadoresRaw);
  const monitoresProducts = process(monitoresRaw);
  const microsoftProducts = process(microsoftRaw);

  const servicesBlock1 = FEATURED_SERVICES.slice(0, 3);
  const servicesBlock2 = FEATURED_SERVICES.slice(3, 6);
  const servicesBlock3 = FEATURED_SERVICES.slice(6, 9);

  return (
    <main className="min-h-screen bg-zinc-50 font-sans selection:bg-red-900 selection:text-white">
      
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm fixed top-0 w-full z-50 border-b border-red-600 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="https://www.balao.info" className="hover:opacity-80 transition-opacity">
             <Image 
               src="/logo.png" 
               alt={SITE_CONFIG.name} 
               width={180} 
               height={60} 
               className="h-12 w-auto object-contain"
               priority
             />
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
              className="hidden sm:flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
            >
              <MessageCircle className="w-4 h-4" />
              {SITE_CONFIG.whatsapp.display}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-black text-white overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-black to-black"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/20 rounded-full blur-[120px] animate-pulse"></div>

        <div className="container relative z-10 px-4 text-center space-y-6 md:space-y-8">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs md:text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Wrench className="w-4 h-4 animate-bounce" />
            Assistência Técnica Especializada
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-red-200 to-red-900 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-in fade-in zoom-in-50 duration-1000 leading-none">
            SERVIÇOS<br />
            <span className="text-stroke-white text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">& OFERTAS</span>
          </h1>
          
          <p className="text-lg md:text-3xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Soluções completas para sua empresa e residência. <strong className="text-red-400 font-bold">Manutenção, Redes e Vendas</strong>.
          </p>

          <div className="pt-8 flex justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 gap-4">
            <Link 
               href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
               className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-red-600/30 hover:scale-105 flex items-center gap-2"
            >
               <MessageCircle className="w-5 h-5" />
               Falar com Técnico
            </Link>
            <Link 
               href="#ofertas"
               className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg transition-all backdrop-blur-sm flex items-center gap-2"
            >
               Ver Ofertas
            </Link>
          </div>
        </div>
        
        {/* Marquee Services */}
        <div className="absolute bottom-0 w-full bg-white/5 border-t border-white/10 py-4 md:py-6 backdrop-blur-sm overflow-hidden">
          <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-16 opacity-60 text-red-200 font-bold tracking-widest text-xs md:text-xl">
             <span>NOTEBOOKS</span>
             <span>PC GAMER</span>
             <span>APPLE</span>
             <span>REDES</span>
             <span>SERVIDORES</span>
             <span>RECUPERAÇÃO DE DADOS</span>
             <span>IMPRESSORAS</span>
          </div>
        </div>
      </section>

      {/* Categorias Rápidas */}
      <section className="py-12 bg-zinc-900 border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { name: "Notebooks", icon: Laptop, href: "#notebooks" },
              { name: "PC Gamer", icon: Cpu, href: "#pcgamer" },
              { name: "Apple", icon: Smartphone, href: "#apple" },
              { name: "Monitores", icon: Monitor, href: "#monitores" },
              { name: "Periféricos", icon: Mouse, href: "#perifericos" },
              { name: "Redes", icon: Wifi, href: "#redes" },
              { name: "Impressoras", icon: Printer, href: "#impressoras" },
              { name: "Licenças", icon: ShieldCheck, href: "#licencas" },
            ].map((cat, idx) => (
               <Link 
                key={idx} 
                href={cat.href}
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-zinc-800/50 hover:bg-red-600 border border-zinc-800 hover:border-red-500 transition-all group"
              >
                <cat.icon className="w-8 h-8 text-zinc-400 group-hover:text-white transition-colors" />
                <span className="text-xs font-bold text-zinc-400 group-hover:text-white uppercase tracking-wider text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bloco 1: Serviços Destaque */}
      <section className="py-24 bg-zinc-900 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              SOLUÇÕES <span className="text-red-600">PROFISSIONAIS</span>
            </h2>
            <p className="text-xl text-zinc-400">Laboratório próprio com equipamentos de última geração</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {servicesBlock1.map((service, idx) => (
                <ServiceCard key={idx} service={service} />
             ))}
          </div>
        </div>
      </section>

      <div id="ofertas"></div>

      {/* Carrossel 1: Hardware */}
      <div id="pcgamer" className="scroll-mt-24">
        <ProductCarousel title="Hardware & Upgrade" products={hardwareProducts} icon={Cpu} bgClass="bg-white" />
      </div>

      {/* Banner 1 */}
      <FullWidthBanner 
        title="PC GAMER DOS SONHOS" 
        subtitle="Montamos sua máquina com as melhores peças e cable management impecável. Performance extrema para seus jogos."
        theme="dark"
      />

      {/* Carrossel 2: Periféricos */}
      <div id="perifericos" className="scroll-mt-24">
        <ProductCarousel title="Periféricos Gamer" products={perifericosProducts} icon={Mouse} bgClass="bg-zinc-50" />
      </div>

      {/* Bloco 2: Serviços Apple/Mobile */}
      <section id="apple" className="py-24 bg-zinc-900 scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-px bg-zinc-800 flex-grow"></div>
            <h2 className="text-3xl font-bold text-white uppercase tracking-widest">Especialista Apple</h2>
            <div className="h-px bg-zinc-800 flex-grow"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {servicesBlock3.map((service, idx) => (
                <ServiceCard key={idx} service={service} />
             ))}
          </div>
        </div>
      </section>

      {/* Carrossel 3: Notebooks/Computadores */}
      <div id="notebooks" className="scroll-mt-24">
        <ProductCarousel title="Notebooks & PCs" products={computadoresProducts} icon={Laptop} bgClass="bg-white" />
      </div>

      {/* Banner 2 */}
      <FullWidthBanner 
        title="REDES CORPORATIVAS" 
        subtitle="Projetos de infraestrutura, servidores e segurança para sua empresa. Conectividade sem falhas."
        theme="light"
      />

      {/* Carrossel 4: Rede */}
      <div id="redes" className="scroll-mt-24">
        <ProductCarousel title="Conectividade" products={redeProducts} icon={Wifi} bgClass="bg-zinc-50" />
      </div>

      {/* Bloco 3: Serviços Gerais */}
      <section id="impressoras" className="py-24 bg-zinc-900 scroll-mt-24">
        <div className="container mx-auto px-4">
           <div className="flex items-center gap-4 mb-16">
            <div className="h-px bg-zinc-800 flex-grow"></div>
            <h2 className="text-3xl font-bold text-white uppercase tracking-widest">Manutenção & Suporte</h2>
            <div className="h-px bg-zinc-800 flex-grow"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {servicesBlock2.map((service, idx) => (
                <ServiceCard key={idx} service={service} />
             ))}
          </div>
        </div>
      </section>

      {/* Carrossel 5: Monitores */}
      <div id="monitores" className="scroll-mt-24">
        <ProductCarousel title="Monitores & Imagem" products={monitoresProducts} icon={Monitor} bgClass="bg-white" />
      </div>

      {/* Banner 3 */}
      <FullWidthBanner 
        title="LICENCIAMENTO MICROSOFT" 
        subtitle="Garanta a legalidade e segurança do seu software. Windows, Office e Servidores originais."
        theme="dark"
      />

      {/* Carrossel 6: Licenças */}
      <div id="licencas" className="scroll-mt-24">
        <ProductCarousel title="Softwares Originais" products={licencaProducts} icon={ShieldCheck} bgClass="bg-zinc-50" />
        <ProductCarousel title="Soluções Microsoft" products={microsoftProducts} icon={ShieldCheck} bgClass="bg-zinc-50" />
      </div>

      {/* Outros Serviços Listagem */}
      <section className="py-24 bg-zinc-900 border-t border-zinc-800">
        <div className="container mx-auto px-4">
             <h3 className="text-2xl font-bold text-center text-zinc-500 mb-16 uppercase tracking-widest">Mais de 50 Serviços Especializados</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {maisDe50Servicos.map((servico, idx) => (
                  <Link 
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
                    key={idx}
                    className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/30 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all group"
                  >
                    <CheckCircle className="w-5 h-5 text-zinc-600 group-hover:text-red-500 transition-colors flex-shrink-0" />
                    <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                      {servico}
                    </span>
                  </Link>
                ))}
             </div>

             <div className="mt-32 text-center">
                <div className="inline-block p-12 bg-gradient-to-br from-red-600 to-red-900 rounded-[3rem] shadow-2xl relative overflow-hidden max-w-5xl mx-auto w-full">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full blur-3xl -ml-48 -mb-48" />
                  
                  <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
                      Não encontrou o que precisa?
                    </h2>
                    <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto">
                      Nossa equipe técnica está pronta para analisar seu caso específico. 
                      Traga seu equipamento para um orçamento sem compromisso.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                      <Link 
                        href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
                        className="bg-white text-red-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Conversar Agora
                      </Link>
                      <Link 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE_CONFIG.address)}`}
                        target="_blank"
                        className="bg-red-800/50 hover:bg-red-800 text-white border border-red-400/30 font-bold py-4 px-10 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <Truck className="w-5 h-5" />
                        Ver Endereço
                      </Link>
                    </div>
                    <p className="mt-8 text-sm text-red-200/60">
                      {SITE_CONFIG.address} • {SITE_CONFIG.phone.display}
                    </p>
                  </div>
                </div>
             </div>
        </div>
      </section>
    </main>
  )
}
