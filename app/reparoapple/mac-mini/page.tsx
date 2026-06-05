import { Metadata } from 'next'
import HeroSection from '@/components/servicos/HeroSection'
import Differentiators from '@/components/servicos/Differentiators'
import ServicesList from '@/components/servicos/ServicesList'
import Gallery from '@/components/servicos/Gallery'
import Testimonials from '@/components/servicos/Testimonials'
import FAQ from '@/components/servicos/FAQ'
import CTASection from '@/components/servicos/CTASection'

export const metadata: Metadata = {
  title: 'Conserto de Mac Mini em Campinas | Assistência Técnica Apple Especializada | Balão da Informática',
  description: 'Assistência Técnica Especializada em Mac Mini em Campinas. Upgrade SSD/RAM, fonte e reparo de placa. Peças premium e garantia confiável.',
  keywords: [
    'conserto mac mini campinas',
    'assistência técnica mac mini',
    'upgrade mac mini',
    'reparo mac mini',
    'loja mac mini campinas'
  ],
  alternates: { canonical: "https://www.balao.info/reparoapple/mac-mini" },
}

const macMiniServices = [
  { title: 'Upgrade SSD', desc: 'Aumente a velocidade e capacidade do seu Mac Mini com SSD de alta performance.' },
  { title: 'Upgrade RAM', desc: 'Aumente a memória RAM do seu Mac Mini para melhorar a performance (modelos compatíveis).' },
  { title: 'Troca de Fonte', desc: 'Conserto ou substituição de fonte com problemas de energia no Mac Mini.' },
  { title: 'Reparo de Placa', desc: 'Recuperação de Mac Mini que não liga, molhados ou com problemas de vídeo.' },
  { title: 'Troca de Disco', desc: 'Substituição de disco rígido ou SSD com defeito no seu Mac Mini.' },
  { title: 'Formatação e Instalação', desc: 'Formatação, instalação de macOS e transferência de dados.' },
]

const faqItems = [
  { q: 'Vocês atendem Mac Mini com chip Intel e Apple Silicon?', a: 'Sim, atendemos todos os modelos de Mac Mini, incluindo Intel e M1/M2/M3.' },
  { q: 'Quanto tempo demora o upgrade de SSD no Mac Mini?', a: 'Upgrade de SSD em Mac Mini geralmente é realizado em até 2 horas, dependendo do modelo.' },
  { q: 'Qual a garantia do serviço?', a: 'Nossos serviços contam com garantia de 3 a 12 meses, dependendo do tipo de reparo.' },
  { q: 'O orçamento é gratuito?', a: 'Sim! O diagnóstico completo do seu Mac Mini é gratuito e sem compromisso.' },
]

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1601524909162-be87252be298?w=800', alt: 'Laboratório de reparo' },
  { src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', alt: 'Mac Mini' },
  { src: 'https://images.unsplash.com/photo-1575575828821-e2e53976b4e6?w=800', alt: 'Ferramentas de precisão' },
]

export default function MacMiniPage() {
  const whatsappMessage = 'Olá! Quero orçamento para reparo do meu Mac Mini em Campinas.'

  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        device="Mac Mini"
        subtitle="Reparo em até 2 horas"
        description="Assistência técnica especializada em Mac Mini em Campinas. Upgrade SSD/RAM, fonte e reparo de placa com peças de alta qualidade e garantia confiável."
        imageUrl="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"
        whatsappMessage={whatsappMessage}
      />
      <Differentiators />
      <ServicesList
        device="Mac Mini"
        services={macMiniServices}
        whatsappMessage={whatsappMessage}
      />
      <Gallery images={galleryImages} />
      <Testimonials />
      <FAQ items={faqItems} />
      <CTASection
        device="Mac Mini"
        whatsappMessage={whatsappMessage}
      />
    </div>
  )
}
