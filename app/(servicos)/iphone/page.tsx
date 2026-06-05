import { Metadata } from 'next'
import HeroSection from '@/components/servicos/HeroSection'
import Differentiators from '@/components/servicos/Differentiators'
import ServicesList from '@/components/servicos/ServicesList'
import Gallery from '@/components/servicos/Gallery'
import Testimonials from '@/components/servicos/Testimonials'
import FAQ from '@/components/servicos/FAQ'
import CTASection from '@/components/servicos/CTASection'

export const metadata: Metadata = {
  title: 'Conserto de iPhone em Campinas | Assistência Técnica Apple Especializada | Balão da Informática',
  description: 'Assistência Técnica Especializada em iPhone em Campinas. Troca de tela, bateria, reparo de placa, Face ID e mais. Peças premium e garantia confiável.',
  keywords: [
    'conserto iphone campinas',
    'assistência técnica iphone',
    'troca tela iphone campinas',
    'reparo placa iphone',
    'face id iphone',
    'loja apple campinas',
    'manutenção iphone'
  ],
  alternates: { canonical: "https://www.balao.info/(servicos)/iphone" },
}

const iphoneServices = [
  { title: 'Troca de Tela e Vidro', desc: 'Substituição de displays quebrados, com manchas ou touch falhando. Opções de telas Originais Recondicionadas ou Premium.' },
  { title: 'Troca de Bateria', desc: 'Seu iPhone descarrega rápido? Trocamos sua bateria por uma nova com saúde 100% e garantia de performance.' },
  { title: 'Reparo de Placa Avançado', desc: 'Recuperação de aparelhos que não ligam, molhados, erro de carga, falha de áudio e curto-circuito.' },
  { title: 'Troca de Vidro Traseiro (Laser)', desc: 'Troca do vidro traseiro quebrado com acabamento perfeito, mantendo a estética original do seu iPhone.' },
  { title: 'Face ID e Câmeras', desc: 'Reparo do sistema TrueDepth que parou de funcionar e troca de lentes e módulos de câmera.' },
  { title: 'Sinal e Conectividade', desc: 'Correção de problemas de Wi-Fi cinza, Bluetooth, GPS e falhas de sinal de operadora.' },
]

const faqItems = [
  { q: 'Quanto tempo demora a troca de tela do iPhone?', a: 'Geralmente realizamos a troca de tela e bateria em até 40 minutos, mediante agendamento prévio.' },
  { q: 'Perco meus dados no conserto?', a: 'Na maioria dos reparos (tela, bateria, câmera) seus dados são preservados. Recomendamos backup sempre que possível.' },
  { q: 'Qual a garantia do serviço?', a: 'Nossos serviços contam com garantia de 3 a 12 meses, dependendo do tipo de reparo e peça utilizada.' },
  { q: 'O orçamento é gratuito?', a: 'Sim! O diagnóstico completo do seu iPhone é gratuito e sem compromisso de reparo.' },
]

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1601524909162-be87252be298?w=800', alt: 'Laboratório de reparo' },
  { src: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800', alt: 'Reparo de iPhone' },
  { src: 'https://images.unsplash.com/photo-1575575828821-e2e53976b4e6?w=800', alt: 'Ferramentas de precisão' },
]

export default function IphonePage() {
  const whatsappMessage = 'Olá! Quero orçamento para reparo do meu iPhone em Campinas.'

  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        device="iPhone"
        subtitle="Reparo em até 40 minutos"
        description="Assistência técnica especializada em iPhone em Campinas. Troca de tela, bateria, reparo de placa e Face ID com peças de alta qualidade e garantia confiável."
        imageUrl="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800"
        whatsappMessage={whatsappMessage}
      />
      <Differentiators />
      <ServicesList
        device="iPhone"
        services={iphoneServices}
        whatsappMessage={whatsappMessage}
      />
      <Gallery images={galleryImages} />
      <Testimonials />
      <FAQ items={faqItems} />
      <CTASection
        device="iPhone"
        whatsappMessage={whatsappMessage}
      />
    </div>
  )
}
