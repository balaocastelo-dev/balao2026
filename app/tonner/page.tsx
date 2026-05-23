import { Metadata } from 'next'
import Header from '@/components/Header'
import { 
  Printer, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Building2, 
  Package,
  BadgePercent,
  Phone,
  ArrowRight,
  Search,
  MessageCircle,
  Users,
  Trophy,
  ThumbsUp,
  Star
} from 'lucide-react'
import Link from 'next/link'
import ProductCarousel from '@/components/ProductCarousel'
import { getProducts } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Venda e Entrega de Toner em Campinas | Original e Compatível | Balão da Informática',
  description: 'Compre Toner HP, Brother, Samsung e Canon com entrega rápida em Campinas e envio para todo Brasil. Preços de atacado e varejo. Consulte nosso estoque!',
  keywords: [
    'toner campinas',
    'entrega toner rápido',
    'toner hp campinas',
    'toner brother',
    'toner samsung',
    'loja de toner',
    'suprimentos de impressão',
    'cartucho e toner',
    'toner compatível premium',
    'distribuidora de toner'
  ]
}

export default async function TonnerPage() {
  const allProducts = await getProducts()
  
  // Filtrar produtos relacionados a toner
  const tonerProducts = allProducts.filter(p => {
    const text = (p.name + " " + (p.description || "") + " " + p.category).toLowerCase()
    return text.includes('toner')
  })

  return (
    <div className="min-h-screen flex flex-col bg-black font-sans text-zinc-100">
      <Header />
      
      <main className="flex-1">
        {/* Bloco 1: Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-black z-0" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6 border border-blue-500/20">
                <Truck className="w-4 h-4" />
                <span>Entrega Expressa em Campinas e Região</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Toners Originais e Compatíveis com <span className="text-blue-500">Melhor Preço</span>
              </h1>
              <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
                Abasteça sua empresa ou home office com toners de alta qualidade. 
                Trabalhamos com HP, Brother, Samsung, Canon e muito mais. 
                Entrega rápida e garantia total.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="https://wa.me/5519993916723" target="_blank">
                  <button className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-lg rounded-md font-medium transition-colors w-full sm:w-auto">
                    <Phone className="w-5 h-5 mr-2" />
                    Pedir via WhatsApp
                  </button>
                </Link>
                <Link href="#catalogo">
                  <button className="inline-flex items-center justify-center border border-zinc-700 text-zinc-100 hover:bg-zinc-800 h-12 text-lg px-8 rounded-md font-medium transition-colors w-full sm:w-auto">
                    Ver Catálogo Online
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* NEW BLOCK: Stats */}
        <section className="py-12 bg-zinc-900 border-b border-zinc-800">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "50k+", label: "Toners Vendidos" },
              { num: "15k+", label: "Clientes Atendidos" },
              { num: "99%", label: "Satisfação" },
              { num: "24h", label: "Entrega Média" }
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{s.num}</div>
                <div className="text-sm text-zinc-500 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Bloco 2: Principais Marcas */}
        <section className="py-12 border-y border-zinc-800 bg-zinc-900/50">
          <div className="container mx-auto px-4">
            <p className="text-center text-zinc-500 mb-8 text-sm uppercase tracking-wider font-semibold">Trabalhamos com as principais marcas</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              {['HP', 'Brother', 'Samsung', 'Canon', 'Lexmark', 'Epson'].map((brand) => (
                <div key={brand} className="text-2xl font-bold text-zinc-400 flex items-center">
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bloco 3: Serviços e Diferenciais */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Por que comprar Toner na Balão?</h2>
              <p className="text-zinc-400">
                Oferecemos a combinação perfeita entre preço, qualidade e agilidade na entrega para manter sua impressora sempre funcionando.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-colors rounded-xl overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 text-blue-500">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-zinc-100">Entrega Rápida</h3>
                  <p className="text-zinc-400">
                    Para Campinas e região, oferecemos entrega expressa. Não pare sua produção por falta de tinta.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-colors rounded-xl overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 text-blue-500">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-zinc-100">Garantia Total</h3>
                  <p className="text-zinc-400">
                    Todos os nossos toners, sejam originais ou compatíveis, possuem garantia contra defeitos de fabricação.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-colors rounded-xl overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 text-blue-500">
                    <BadgePercent className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-zinc-100">Custo-Benefício</h3>
                  <p className="text-zinc-400">
                    Economize até 70% com nossa linha de compatíveis premium, sem abrir mão da qualidade de impressão.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NEW BLOCK: How to Buy */}
        <section className="py-20 bg-zinc-950 text-zinc-100 border-t border-zinc-800">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-16">COMO COMPRAR</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {[
                  { icon: Search, title: "Escolha o Modelo", desc: "Identifique o modelo da sua impressora ou cartucho." },
                  { icon: MessageCircle, title: "Envie no WhatsApp", desc: "Mande a foto ou modelo para nosso time." },
                  { icon: CheckCircle2, title: "Receba a Cotação", desc: "Preço na hora com opção Original ou Compatível." },
                  { icon: Truck, title: "Receba Rápido", desc: "Entrega expressa ou retirada na loja." }
               ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center group">
                     <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-blue-500 mb-6 border border-zinc-800 group-hover:border-blue-500 transition-colors">
                        <item.icon className="w-8 h-8" />
                     </div>
                     <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                     <p className="text-zinc-500 text-sm max-w-[200px]">{item.desc}</p>
                  </div>
               ))}
            </div>
          </div>
        </section>

        {/* Bloco 4: Carrossel de Produtos (Filtrado por Toner) */}
        <section id="catalogo" className="bg-zinc-900 py-16 border-y border-zinc-800">
          <div className="container mx-auto px-4">
             <ProductCarousel 
                title="Toners em Destaque" 
                products={tonerProducts} 
                isDark={true}
             />
             <div className="mt-8 text-center">
                <Link href="/busca?q=toner">
                  <button className="inline-flex items-center justify-center border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-10 px-4 py-2 rounded-md font-medium transition-colors">
                    Ver todos os toners
                  </button>
                </Link>
             </div>
          </div>
        </section>

        {/* NEW BLOCK: Bulk Promo */}
        <section className="py-20 bg-gradient-to-r from-blue-900 to-black text-white relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
           <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-2xl">
                 <h2 className="text-3xl md:text-5xl font-black mb-6">COMPRE MAIS, PAGUE MENOS</h2>
                 <p className="text-xl text-blue-200 mb-8">
                    Descontos progressivos para pedidos acima de 5 unidades. Ideal para empresas e revendas.
                 </p>
                 <ul className="space-y-2 mb-8 text-blue-100">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-400" /> 5% OFF acima de 5 un.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-400" /> 10% OFF acima de 10 un.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Frete Grátis acima de R$ 500</li>
                 </ul>
                 <Link href="https://wa.me/5519993916723?text=Quero%20cotar%20acima%20de%205%20unidades" target="_blank" className="bg-white text-blue-900 px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform inline-flex items-center gap-2">
                    Solicitar Cotação em Lote <ArrowRight className="w-5 h-5" />
                 </Link>
              </div>
              <div className="w-full md:w-1/3 bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 text-center">
                 <div className="text-6xl font-black text-blue-400 mb-2">15%</div>
                 <div className="text-xl font-bold uppercase tracking-wider mb-4">OFF NO PIX</div>
                 <p className="text-sm opacity-70">Para qualquer quantidade. Aproveite!</p>
              </div>
           </div>
        </section>

        {/* Bloco 5: Para Empresas (B2B) */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium mb-6">
                  <Building2 className="w-4 h-4" />
                  <span>Atendimento Corporativo</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Soluções para sua Empresa</h2>
                <p className="text-zinc-400 mb-6 text-lg">
                  Fornecemos suprimentos de impressão para escritórios, escolas e empresas de todos os portes.
                  Cadastre sua empresa e tenha acesso a condições especiais.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    'Faturamento facilitado para CNPJ',
                    'Entrega programada',
                    'Cotações rápidas por e-mail ou WhatsApp',
                    'Atendimento prioritário'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-zinc-300">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white h-10 px-6 py-2 rounded-md font-medium transition-colors">
                  Falar com Consultor Corporativo
                </button>
              </div>
              <div className="flex-1 relative">
                <div className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-8">
                   <Printer className="w-32 h-32 text-zinc-700" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bloco 6: SEO Nacional */}
        <section className="py-20 bg-zinc-900/30 border-y border-zinc-800">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">Entregamos Toners para Todo o Brasil</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Paraná', 'Santa Catarina', 'Rio Grande do Sul', 'Bahia', 'Distrito Federal'].map((state) => (
                <div key={state} className="flex items-center gap-2 text-zinc-400 p-3 rounded bg-zinc-900/50 border border-zinc-800/50">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>{state}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-zinc-500 mt-8 text-sm">
              Utilizamos transportadoras parceiras e Correios para garantir que seu toner chegue rápido e seguro, onde você estiver.
            </p>
          </div>
        </section>

        {/* Bloco 7: Original vs Compatível */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4 max-w-4xl">
             <h2 className="text-3xl font-bold mb-8 text-center">Toner Original ou Compatível?</h2>
             <div className="grid md:grid-cols-2 gap-8">
                <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
                   <h3 className="text-xl font-bold text-blue-400 mb-4">Toner Original</h3>
                   <p className="text-zinc-400 mb-4">
                     Fabricado pela própria marca da impressora (HP, Brother, etc). 
                     Garante a exata qualidade de cor e durabilidade especificada pelo fabricante.
                     Ideal para impressões fotográficas ou documentos críticos.
                   </p>
                </div>
                <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
                   <h3 className="text-xl font-bold text-green-400 mb-4">Toner Compatível</h3>
                   <p className="text-zinc-400 mb-4">
                     Produto novo, 100% compatível, fabricado por terceiros com certificação de qualidade.
                     Oferece excelente custo-benefício, chegando a custar muito menos.
                     Ideal para dia a dia, textos e rascunhos.
                   </p>
                </div>
             </div>
          </div>
        </section>

        {/* Bloco 8: FAQ */}
        <section className="py-20 bg-zinc-900">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold mb-12 text-center">Dúvidas Frequentes</h2>
            <div className="space-y-6">
              {[
                { q: "O toner compatível estraga a impressora?", a: "Não. Nossos toners compatíveis são de alta qualidade e respeitam as especificações dos fabricantes, não causando danos ao equipamento." },
                { q: "Vocês entregam no mesmo dia em Campinas?", a: "Sim! Para pedidos confirmados até as 14h, oferecemos opção de entrega expressa via motoboy para Campinas e região." },
                { q: "O toner tem garantia?", a: "Sim, oferecemos 3 meses de garantia para defeitos de fabricação em todos os cartuchos e toners." },
                { q: "Vocês recarregam toner?", a: "Focamos na venda de toners novos (originais e compatíveis) para garantir a máxima qualidade e menor índice de problemas." }
              ].map((item, i) => (
                <div key={i} className="bg-black border border-zinc-800 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <span className="text-blue-500">?</span> {item.q}
                  </h3>
                  <p className="text-zinc-400 ml-6">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bloco 9: Sustentabilidade */}
        <section className="py-16 bg-black border-t border-zinc-800">
          <div className="container mx-auto px-4 text-center">
             <div className="inline-block p-4 rounded-full bg-green-900/20 mb-6">
                <Package className="w-8 h-8 text-green-500" />
             </div>
             <h2 className="text-2xl font-bold mb-4">Descarte Consciente</h2>
             <p className="text-zinc-400 max-w-2xl mx-auto">
               Preocupados com o meio ambiente? Traga seu toner vazio até nossa loja que nós garantimos a destinação correta para reciclagem.
             </p>
          </div>
        </section>

        {/* NEW BLOCK: Testimonials */}
        <section className="py-20 bg-zinc-950 text-white border-y border-zinc-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">O Que Dizem Nossos Clientes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                  { name: "Carlos A.", role: "Gerente de TI", text: "Sempre compro os toners para a empresa aqui. Entrega rápida e nota fiscal certinha." },
                  { name: "Maria L.", role: "Advogada", text: "O toner compatível que comprei tem a mesma qualidade do original, mas paguei metade do preço." },
                  { name: "Pedro S.", role: "Gráfica Rápida", text: "Parceria de anos. Nunca me deixaram na mão quando precisei de suprimentos urgentes." }
               ].map((t, i) => (
                  <div key={i} className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
                     <div className="flex gap-1 text-yellow-500 mb-4">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                     </div>
                     <p className="text-zinc-300 italic mb-6">"{t.text}"</p>
                     <div>
                        <div className="font-bold">{t.name}</div>
                        <div className="text-xs text-blue-500 font-bold uppercase">{t.role}</div>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </section>

        {/* NEW BLOCK: Newsletter */}
        <section className="py-20 bg-blue-600 text-white text-center">
           <div className="container mx-auto px-4 max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">Ofertas Relâmpago</h2>
              <p className="mb-8 text-blue-100">Receba promoções exclusivas de toner direto no seu WhatsApp.</p>
              <Link href="https://wa.me/5519993916723?text=Quero%20entrar%20na%20lista%20VIP" target="_blank" className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
                 Entrar no Grupo VIP <BadgePercent className="w-5 h-5" />
              </Link>
           </div>
        </section>

        {/* Bloco 10: CTA Final */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-900/20" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-4xl font-bold mb-6">Precisa de Toner Agora?</h2>
            <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
              Não fique sem imprimir. Compre online ou chame no WhatsApp e receba rapidamente.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <button className="inline-flex items-center justify-center bg-white text-black hover:bg-zinc-200 text-lg px-8 h-12 rounded-md font-medium transition-colors w-full sm:w-auto">
                 Comprar Agora
               </button>
               <button className="inline-flex items-center justify-center border border-white text-white hover:bg-white/10 text-lg px-8 h-12 rounded-md font-medium transition-colors w-full sm:w-auto">
                 Falar com Vendedor
               </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
