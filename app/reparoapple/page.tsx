import { Metadata } from 'next'
import Header from '@/components/Header'
import { 
  Smartphone, 
  Battery, 
  Cpu, 
  Wifi, 
  ShieldCheck, 
  Wrench, 
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  ArrowRight,
  AlertTriangle,
  Star,
  Zap,
  ThumbsUp,
  Truck
} from 'lucide-react'
import Link from 'next/link'
import ProductCarousel from '@/components/ProductCarousel'
import { getProducts } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Conserto de iPhone e iPad em Campinas | Assistência Apple Especializada | Balão da Informática',
  description: 'Assistência Técnica Especializada Apple em Campinas. Troca de tela iPhone, bateria, conector de carga, Face ID e reparo de placa. Peças premium e garantia.',
  keywords: [
    'conserto iphone campinas',
    'assistência técnica apple',
    'troca tela iphone',
    'bateria iphone viciada',
    'conserto ipad campinas',
    'reparo placa iphone',
    'face id iphone',
    'vidro traseiro iphone',
    'loja apple campinas',
    'manutenção iphone'
  ]
}

// Novos Blocos
function BlockUrgencyBanner() {
  return (
    <div className="bg-red-600 text-white py-3 overflow-hidden">
      <div className="container mx-auto px-4 flex items-center justify-center gap-4 text-sm md:text-base font-black uppercase tracking-wide animate-pulse text-center">
         <AlertTriangle className="w-5 h-5" />
         <span>SEU IPHONE CAIU NA ÁGUA? NÃO LIGUE! TRAGA IMEDIATAMENTE PARA O BANHO QUÍMICO.</span>
         <AlertTriangle className="w-5 h-5" />
      </div>
    </div>
  )
}

function BlockSymptoms() {
  return (
    <section className="py-12 bg-zinc-950 border-y border-zinc-900">
       <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-zinc-100">Sintomas Comuns que Resolvemos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               "Tela piscando ou manchada",
               "Bateria descarrega em 2h",
               "Não carrega (cabo solto)",
               "Face ID parou de funcionar",
               "Sem sinal de operadora",
               "Câmera tremendo ou preta",
               "Som baixo ou chiando",
               "Travado na maçã (loop)"
             ].map((s, i) => (
               <div key={i} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full shrink-0 animate-pulse"></div>
                  <span className="text-sm font-medium text-zinc-300">{s}</span>
               </div>
             ))}
          </div>
       </div>
    </section>
  )
}

function BlockComparison() {
  return (
    <section className="py-20 bg-black">
       <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Qualidade da Tela: Você Escolhe</h2>
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="p-4">Característica</th>
                      <th className="p-4 text-green-500 font-bold">Original Recondicionada</th>
                      <th className="p-4 text-blue-400 font-bold">Premium (OLED Soft)</th>
                      <th className="p-4 text-zinc-500">Incell (Básica)</th>
                   </tr>
                </thead>
                <tbody className="text-zinc-300">
                   <tr className="border-b border-zinc-900">
                      <td className="p-4 font-bold">Brilho e Cores</td>
                      <td className="p-4">100% Idêntico (Original)</td>
                      <td className="p-4">95-98% Similar</td>
                      <td className="p-4 text-zinc-500">80% (Mais lavada)</td>
                   </tr>
                   <tr className="border-b border-zinc-900">
                      <td className="p-4 font-bold">Touch 3D/Haptic</td>
                      <td className="p-4">Perfeito</td>
                      <td className="p-4">Excelente</td>
                      <td className="p-4 text-zinc-500">Regular</td>
                   </tr>
                   <tr className="border-b border-zinc-900">
                      <td className="p-4 font-bold">Consumo Bateria</td>
                      <td className="p-4">Normal</td>
                      <td className="p-4">Normal</td>
                      <td className="p-4 text-zinc-500">Alto Consumo</td>
                   </tr>
                   <tr className="border-b border-zinc-900">
                      <td className="p-4 font-bold">Garantia</td>
                      <td className="p-4 text-green-500 font-bold">1 Ano</td>
                      <td className="p-4 text-blue-400 font-bold">6 Meses</td>
                      <td className="p-4 text-zinc-500">3 Meses</td>
                   </tr>
                </tbody>
             </table>
          </div>
          <p className="text-center text-zinc-500 text-sm mt-6">* Recomendamos sempre telas Originais ou Premium para manter a experiência Apple.</p>
       </div>
    </section>
  )
}

function BlockStats() {
  return (
    <section className="py-12 bg-zinc-900 border-y border-zinc-800">
       <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
             <div className="text-4xl font-black text-white mb-2">+15.000</div>
             <div className="text-zinc-500 text-sm uppercase tracking-wider">iPhones Reparados</div>
          </div>
          <div>
             <div className="text-4xl font-black text-white mb-2">98%</div>
             <div className="text-zinc-500 text-sm uppercase tracking-wider">Taxa de Sucesso</div>
          </div>
          <div>
             <div className="text-4xl font-black text-white mb-2">45min</div>
             <div className="text-zinc-500 text-sm uppercase tracking-wider">Troca de Tela</div>
          </div>
          <div>
             <div className="text-4xl font-black text-white mb-2">4.9/5</div>
             <div className="text-zinc-500 text-sm uppercase tracking-wider">Avaliação Google</div>
          </div>
       </div>
    </section>
  )
}

function BlockAccessories() {
  return (
    <section className="py-20 bg-zinc-950">
       <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Proteja seu Investimento</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="p-6 bg-black rounded-2xl border border-zinc-800 hover:border-purple-500 transition-colors">
                <ShieldCheck className="w-12 h-12 mx-auto text-purple-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Película 3D/Privacidade</h3>
                <p className="text-zinc-400">Aplicação perfeita sem bolhas. Proteção contra riscos e quedas.</p>
             </div>
             <div className="p-6 bg-black rounded-2xl border border-zinc-800 hover:border-purple-500 transition-colors">
                <Battery className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Carregador Turbo 20W</h3>
                <p className="text-zinc-400">Homologado Anatel. Carregue 50% em 30 minutos sem viciar a bateria.</p>
             </div>
             <div className="p-6 bg-black rounded-2xl border border-zinc-800 hover:border-purple-500 transition-colors">
                <Smartphone className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Capas Anti-Impacto</h3>
                <p className="text-zinc-400">Proteção militar para quinas e fundo de vidro. Transparente ou Colorida.</p>
             </div>
          </div>
       </div>
    </section>
  )
}

function BlockReviews() {
  return (
    <section className="py-20 bg-zinc-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-purple-900/5"></div>
        <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl font-black text-center mb-12">CLIENTES APPLE FELIZES</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { name: "Juliana M.", device: "iPhone 13 Pro", text: "Achei que tinha perdido meu iPhone no mar. Eles recuperaram a placa e as fotos. Incrível!" },
                    { name: "Pedro H.", device: "iPad Air 4", text: "Troca de vidro perfeita, nem parece que foi mexido. O Apple Pencil continua funcionando 100%." },
                    { name: "Larissa C.", device: "iPhone 11", text: "Bateria trocada em 40 minutos. Atendimento nota 10 e cafézinho top enquanto espera." }
                ].map((t, i) => (
                    <div key={i} className="bg-black p-8 rounded-3xl border border-zinc-800 relative">
                        <div className="flex items-center gap-1 text-yellow-500 mb-4">
                            {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                        </div>
                        <p className="text-zinc-300 mb-6 italic">"{t.text}"</p>
                        <div>
                            <div className="font-bold text-white">{t.name}</div>
                            <div className="text-xs text-purple-500 font-bold uppercase tracking-wider">{t.device}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  )
}

export default async function ReparoApplePage() {
  const allProducts = await getProducts()
  
  // Filtrar produtos relacionados a iphone pro
  const appleProducts = allProducts.filter(p => {
    const text = (p.name + " " + (p.description || "") + " " + p.category).toLowerCase()
    return text.includes('iphone') && text.includes('pro')
  })

  return (
    <div className="min-h-screen flex flex-col bg-black font-sans text-zinc-100">
      <Header />
      
      <main className="flex-1">
        {/* Bloco 1: Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-black z-0" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-sm font-medium mb-6 border border-zinc-700">
                <Wrench className="w-4 h-4" />
                <span>Laboratório Especializado Apple</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Seu iPhone ou iPad Novo de Novo. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Especialistas em Apple.</span>
              </h1>
              <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
                Reparos avançados de placa, troca de vidro, bateria e tela com peças de altíssima qualidade. 
                Técnicos certificados e laboratório de ponta em Campinas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="https://wa.me/5519993916723" target="_blank">
                  <button className="inline-flex items-center justify-center bg-white text-black hover:bg-zinc-200 px-8 h-12 text-lg rounded-md font-medium transition-colors w-full sm:w-auto">
                    <Phone className="w-5 h-5 mr-2" />
                    Orçamento Grátis
                  </button>
                </Link>
                <Link href="#servicos">
                  <button className="inline-flex items-center justify-center border border-zinc-700 text-zinc-100 hover:bg-zinc-800 h-12 text-lg px-8 rounded-md font-medium transition-colors w-full sm:w-auto">
                    Ver Serviços
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Bloco 2: Modelos Atendidos */}
        <section className="py-12 border-y border-zinc-800 bg-zinc-900/30">
          <div className="container mx-auto px-4 text-center">
            <p className="text-zinc-500 mb-6 text-sm uppercase tracking-wider font-semibold">Atendemos toda a linha</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base text-zinc-300">
              {['iPhone 15 Pro Max', 'iPhone 15/15 Pro', 'iPhone 14 Series', 'iPhone 13 Series', 'iPhone 12 Series', 'iPhone 11', 'iPhone XR/XS', 'iPad Pro', 'iPad Air'].map((model) => (
                <span key={model} className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800">
                  {model}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Bloco 3: Principais Serviços */}
        <section id="servicos" className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Serviços Realizados</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 transition-all group rounded-xl overflow-hidden shadow-sm">
                <div className="p-6">
                  <Smartphone className="w-10 h-10 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Troca de Tela e Vidro</h3>
                  <p className="text-zinc-400">
                    Substituição de displays quebrados, com manchas ou touch falhando. Opções de telas Originais Recondicionadas ou Premium.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 transition-all group rounded-xl overflow-hidden shadow-sm">
                <div className="p-6">
                  <Battery className="w-10 h-10 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Troca de Bateria</h3>
                  <p className="text-zinc-400">
                    Seu iPhone descarrega rápido? Trocamos sua bateria por uma nova com saúde 100% e garantia de performance.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 transition-all group rounded-xl overflow-hidden shadow-sm">
                <div className="p-6">
                  <Cpu className="w-10 h-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Reparo de Placa</h3>
                  <p className="text-zinc-400">
                    Recuperação de aparelhos que não ligam, molhados, erro de carga (Tristar), falha de áudio e curto-circuito.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 transition-all group rounded-xl overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="w-10 h-10 text-yellow-500 mb-4 flex items-center justify-center font-bold text-xl border-2 border-yellow-500 rounded-lg">ID</div>
                  <h3 className="text-xl font-bold mb-2">Face ID e Câmeras</h3>
                  <p className="text-zinc-400">
                    Reparo do sistema TrueDepth (Face ID) que parou de funcionar e troca de lentes e módulos de câmera.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 transition-all group rounded-xl overflow-hidden shadow-sm">
                <div className="p-6">
                  <Wifi className="w-10 h-10 text-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Sinal e Conectividade</h3>
                  <p className="text-zinc-400">
                    Correção de problemas de Wi-Fi cinza, Bluetooth, GPS e falhas de sinal de operadora (Sem Serviço).
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 transition-all group rounded-xl overflow-hidden shadow-sm">
                <div className="p-6">
                  <ShieldCheck className="w-10 h-10 text-zinc-300 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Tampa Traseira</h3>
                  <p className="text-zinc-400">
                    Troca do vidro traseiro quebrado com acabamento perfeito, mantendo a estética original do seu iPhone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bloco 4: Carrossel de Produtos (Filtrado por iPhone Pro) */}
        <section className="bg-zinc-900 py-16 border-y border-zinc-800">
          <div className="container mx-auto px-4">
             <ProductCarousel 
                title="iPhones Pro e Acessórios" 
                products={appleProducts} 
                isDark={true}
             />
             <div className="mt-8 text-center">
                <Link href="/busca?q=iphone">
                  <button className="inline-flex items-center justify-center border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-10 px-4 py-2 rounded-md font-medium transition-colors">
                    Ver todos os produtos Apple
                  </button>
                </Link>
             </div>
          </div>
        </section>

        <BlockAccessories />

        {/* Bloco 5: Diferenciais do Laboratório */}
        <section className="py-20 bg-black">
           <div className="container mx-auto px-4">
             <div className="flex flex-col md:flex-row items-center gap-12">
               <div className="flex-1 space-y-8">
                 <h2 className="text-3xl font-bold">Laboratório de Alta Precisão</h2>
                 <p className="text-zinc-400 text-lg">
                   Não entregue seu Apple na mão de curiosos. Utilizamos microscópios trinoculares, 
                   ferramentas de precisão e insumos de primeira linha para garantir que o reparo seja duradouro.
                 </p>
                 <ul className="space-y-4">
                   <li className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-purple-500" />
                     <span>Técnicos certificados e em constante atualização</span>
                   </li>
                   <li className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-purple-500" />
                     <span>Peças com qualidade Original e Premium</span>
                   </li>
                   <li className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-purple-500" />
                     <span>Garantia de 90 dias a 1 ano (dependendo do serviço)</span>
                   </li>
                   <li className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-purple-500" />
                     <span>Backup de dados (opcional e seguro)</span>
                   </li>
                 </ul>
               </div>
               <div className="flex-1">
                 {/* Placeholder visual para imagem de laboratório */}
                 <div className="aspect-video bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center">
                    <Wrench className="w-20 h-20 text-zinc-700" />
                    <span className="ml-4 text-zinc-600 font-bold">Laboratório Técnico</span>
                 </div>
               </div>
             </div>
           </div>
        </section>

        <BlockReviews />

        {/* Bloco 6: Como Funciona */}
        <section className="py-20 bg-zinc-900/50">
           <div className="container mx-auto px-4 text-center">
             <h2 className="text-3xl font-bold mb-12">Processo de Reparo Transparente</h2>
             <div className="grid md:grid-cols-4 gap-8">
               {[
                 { step: '01', title: 'Orçamento', desc: 'Traga seu aparelho ou envie por correio. Analisamos o defeito gratuitamente.' },
                 { step: '02', title: 'Aprovação', desc: 'Enviamos o diagnóstico e valor. Você decide se faz o serviço.' },
                 { step: '03', title: 'Reparo', desc: 'Executamos o conserto com agilidade e precisão técnica.' },
                 { step: '04', title: 'Entrega', desc: 'Seu Apple pronto, testado e com garantia.' }
               ].map((item) => (
                 <div key={item.step} className="relative p-6">
                   <span className="text-6xl font-black text-zinc-800 absolute top-0 left-0 -z-10 select-none">{item.step}</span>
                   <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                   <p className="text-zinc-400">{item.desc}</p>
                 </div>
               ))}
             </div>
           </div>
        </section>

        {/* Bloco 7: SEO Nacional - Envio por Correio */}
        <section className="py-20 bg-black border-y border-zinc-800">
          <div className="container mx-auto px-4">
             <div className="max-w-4xl mx-auto text-center bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
               <MapPin className="w-12 h-12 text-purple-500 mx-auto mb-6" />
               <h2 className="text-3xl font-bold mb-4">Mora longe? Envie seu Apple via Correios</h2>
               <p className="text-zinc-400 mb-8">
                 Atendemos clientes de todo o Brasil. Você envia seu iPhone ou iPad, nós consertamos e enviamos de volta com seguro.
                 Todo o processo é registrado e você acompanha o status online.
               </p>
               <button className="inline-flex items-center justify-center border border-purple-500 text-purple-400 hover:bg-purple-500/10 h-10 px-4 py-2 rounded-md font-medium transition-colors">
                 Ver Instruções de Envio
               </button>
             </div>
          </div>
        </section>

        {/* Bloco 8: FAQ */}
        <section className="py-20 bg-zinc-900">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold mb-12 text-center">Perguntas Frequentes</h2>
            <div className="space-y-4">
              {[
                { q: "Perco meus dados no conserto?", a: "Na maioria dos reparos (tela, bateria, câmera) seus dados são preservados. Em reparos de software ou placa grave, pode haver perda, por isso recomendamos backup sempre que possível." },
                { q: "A peça é original Apple?", a: "Trabalhamos com peças de qualidade Original (retiradas) e Premium. Sempre informamos a procedência e qualidade da peça no orçamento." },
                { q: "Quanto tempo demora a troca de tela?", a: "Geralmente realizamos a troca de tela e bateria em até 1 hora, mediante agendamento prévio." },
                { q: "Vocês consertam Face ID?", a: "Sim, somos especialistas em reparo de Face ID que parou de funcionar após queda ou contato com líquido." }
              ].map((item, i) => (
                <div key={i} className="bg-black border border-zinc-800 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 text-zinc-200">{item.q}</h3>
                  <p className="text-zinc-400">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bloco 9: Disclaimer */}
        <section className="py-8 bg-black text-center border-t border-zinc-800">
          <div className="container mx-auto px-4">
            <p className="text-zinc-600 text-xs max-w-3xl mx-auto">
              A Balão da Informática é uma assistência técnica independente e não tem vínculo oficial com a Apple Inc. 
              Apple, iPhone, iPad e Mac são marcas registradas da Apple Inc.
            </p>
          </div>
        </section>

        {/* Bloco 10: CTA Final */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-purple-900/10" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-4xl font-bold mb-6">Recupere seu Apple Hoje Mesmo</h2>
            <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
              Qualidade, transparência e preço justo. Fale com nossos técnicos agora.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <button className="inline-flex items-center justify-center bg-green-600 text-white hover:bg-green-700 text-lg px-8 h-12 rounded-full font-medium transition-colors">
                 <Phone className="w-5 h-5 mr-2" />
                 Chamar no WhatsApp
               </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
