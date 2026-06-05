import { Metadata } from 'next'
import HeroSection from '@/components/servicos/HeroSection'
import Differentiators from '@/components/servicos/Differentiators'
import ServicesList from '@/components/servicos/ServicesList'
import Gallery from '@/components/servicos/Gallery'
import Testimonials from '@/components/servicos/Testimonials'
import FAQ from '@/components/servicos/FAQ'
import CTASection from '@/components/servicos/CTASection'

export const metadata: Metadata = {
  title: 'Conserto de MacBook em Campinas | Assistência Técnica Apple Especializada | Balão da Informática',
  description: 'Assistência Técnica Especializada em MacBook em Campinas. Troca de tela, bateria, SSD, teclado e reparo de placa. Peças premium e garantia confiável.',
  keywords: [
    'conserto macbook campinas',
    'assistência técnica macbook',
    'troca tela macbook',
    'reparo placa macbook',
    'troca teclado macbook'
  ],
  alternates: { canonical: "https://www.balao.info/(servicos)/macbook" },
}

const macbookServices = [
  { title: 'Troca de Tela', desc: 'Substituição de displays quebrados, com manchas ou backlight falhando no seu MacBook.' },
  { title: 'Troca de Bateria', desc: 'Seu MacBook descarrega rápido ou inchado? Trocamos sua bateria por uma nova com garantia.' },
  { title: 'Upgrade SSD/RAM', desc: 'Aumente a performance do seu MacBook com upgrade de SSD e memória RAM (modelos compatíveis).' },
  { title: 'Troca de Teclado', desc: 'Conserto de teclado com teclas quebradas, borboleta ou não respondem.' },
  { title: 'Reparo de Placa', desc: 'Recuperação de MacBook que não liga, molhados ou com problemas de vídeo/carga.' },
  { title: 'Troca de Conector de Carga', desc: 'Reparo de portas de carga quebradas ou com mal contato MagSafe/USB-C.' },
]

const faqItems = [
  { q: 'Vocês atendem MacBook Air e Pro?', a: 'Sim, atendemos todos os modelos de MacBook Air e MacBook Pro, incluindo modelos com chip M1, M2 e M3.' },
  { q: 'Quanto tempo demora o upgrade de SSD?', a: 'Upgrade de SSD em modelos compatíveis geralmente é realizado em até 2 horas.' },
  { q: 'Qual a garantia do serviço?', a: 'Nossos serviços contam com garantia de 3 a 12 meses, dependendo do tipo de reparo.' },
  { q: 'O orçamento é gratuito?', a: 'Sim! O diagnóstico completo do seu MacBook é gratuito e sem compromisso.' },
]

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1601524909162-be87252be298?w=800', alt: 'Laboratório de reparo' },
  { src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', alt: 'MacBook' },
  { src: 'https://images.unsplash.com/photo-1575575828821-e2e53976b4e6?w=800', alt: 'Ferramentas de precisão' },
]

export default function MacBookPage() {
  const whatsappMessage = 'Olá! Quero orçamento para reparo do meu MacBook em Campinas.'

  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        device="MacBook"
        subtitle="Reparo em até 2 horas"
        description="Assistência técnica especializada em MacBook em Campinas. Troca de tela, bateria, SSD, teclado e reparo de placa com peças de alta qualidade e garantia confiável."
        imageUrl="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"
        whatsappMessage={whatsappMessage}
      />
      <Differentiators />
      <ServicesList
        device="MacBook"
        services={macbookServices}
        whatsappMessage={whatsappMessage}
      />
      <Gallery images={galleryImages} />
      <Testimonials />
      <FAQ items={faqItems} />
      <CTASection
        device="MacBook"
        whatsappMessage={whatsappMessage}
      />
    </div>
  )
}
