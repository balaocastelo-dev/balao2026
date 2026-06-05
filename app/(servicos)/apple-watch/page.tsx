import { Metadata } from 'next'
import HeroSection from '@/components/servicos/HeroSection'
import Differentiators from '@/components/servicos/Differentiators'
import ServicesList from '@/components/servicos/ServicesList'
import Gallery from '@/components/servicos/Gallery'
import Testimonials from '@/components/servicos/Testimonials'
import FAQ from '@/components/servicos/FAQ'
import CTASection from '@/components/servicos/CTASection'

export const metadata: Metadata = {
  title: 'Conserto de Apple Watch em Campinas | Assistência Técnica Apple Especializada | Balão da Informática',
  description: 'Assistência Técnica Especializada em Apple Watch em Campinas. Troca de tela, bateria, reparo de placa e mais. Peças premium e garantia confiável.',
  keywords: [
    'conserto apple watch campinas',
    'assistência técnica apple watch',
    'troca tela apple watch',
    'reparo apple watch',
    'loja apple watch campinas'
  ],
  alternates: { canonical: "https://www.balao.info/(servicos)/apple-watch" },
}

const appleWatchServices = [
  { title: 'Troca de Tela', desc: 'Substituição de displays quebrados, com manchas ou touch falhando no seu Apple Watch.' },
  { title: 'Troca de Bateria', desc: 'Seu Apple Watch descarrega rápido? Trocamos sua bateria por uma nova com saúde 100%.' },
  { title: 'Reparo de Placa', desc: 'Recuperação de Apple Watch que não liga, molhados ou com problemas de carga.' },
  { title: 'Digital Crown', desc: 'Reparo da coroa digital que não gira, trava ou não funciona corretamente.' },
  { title: 'Botão Lateral', desc: 'Conserto do botão lateral que não funciona, trava ou está com defeito.' },
  { title: 'Sensor Coração', desc: 'Reparo dos sensores de frequência cardíaca e saúde que pararam de funcionar.' },
]

const faqItems = [
  { q: 'Quanto tempo demora o reparo do Apple Watch?', a: 'Muitos reparos de Apple Watch são realizados em até 1 hora, dependendo da complexidade do problema.' },
  { q: 'Vocês consertam Apple Watch Series Ultra?', a: 'Sim, atendemos todas as séries do Apple Watch, incluindo o Ultra e Ultra 2.' },
  { q: 'Qual a garantia do serviço?', a: 'Nossos serviços contam com garantia de 3 a 12 meses, dependendo do tipo de reparo.' },
  { q: 'O orçamento é gratuito?', a: 'Sim! O diagnóstico completo do seu Apple Watch é gratuito e sem compromisso.' },
]

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1601524909162-be87252be298?w=800', alt: 'Laboratório de reparo' },
  { src: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800', alt: 'Apple Watch' },
  { src: 'https://images.unsplash.com/photo-1575575828821-e2e53976b4e6?w=800', alt: 'Ferramentas de precisão' },
]

export default function AppleWatchPage() {
  const whatsappMessage = 'Olá! Quero orçamento para reparo do meu Apple Watch em Campinas.'

  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        device="Apple Watch"
        subtitle="Reparo em até 1 hora"
        description="Assistência técnica especializada em Apple Watch em Campinas. Troca de tela, bateria, reparo de placa e mais com peças de alta qualidade e garantia confiável."
        imageUrl="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"
        whatsappMessage={whatsappMessage}
      />
      <Differentiators />
      <ServicesList
        device="Apple Watch"
        services={appleWatchServices}
        whatsappMessage={whatsappMessage}
      />
      <Gallery images={galleryImages} />
      <Testimonials />
      <FAQ items={faqItems} />
      <CTASection
        device="Apple Watch"
        whatsappMessage={whatsappMessage}
      />
    </div>
  )
}
