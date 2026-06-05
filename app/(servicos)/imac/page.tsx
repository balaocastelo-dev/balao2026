import { Metadata } from 'next'
import HeroSection from '@/components/servicos/HeroSection'
import Differentiators from '@/components/servicos/Differentiators'
import ServicesList from '@/components/servicos/ServicesList'
import Gallery from '@/components/servicos/Gallery'
import Testimonials from '@/components/servicos/Testimonials'
import FAQ from '@/components/servicos/FAQ'
import CTASection from '@/components/servicos/CTASection'

export const metadata: Metadata = {
  title: 'Conserto de iMac em Campinas | Assistência Técnica Apple Especializada | Balão da Informática',
  description: 'Assistência Técnica Especializada em iMac em Campinas. Troca de tela, SSD, placa de vídeo e reparo de placa. Peças premium e garantia confiável.',
  keywords: [
    'conserto imac campinas',
    'assistência técnica imac',
    'troca tela imac',
    'reparo imac',
    'loja imac campinas'
  ],
  alternates: { canonical: "https://www.balao.info/(servicos)/imac" },
}

const imacServices = [
  { title: 'Troca de Tela', desc: 'Substituição de displays quebrados, com manchas ou backlight falhando no seu iMac.' },
  { title: 'Troca de SSD', desc: 'Upgrade de SSD para aumentar a velocidade e capacidade de armazenamento do seu iMac.' },
  { title: 'Upgrade RAM', desc: 'Aumente a memória RAM do seu iMac para melhor performance (modelos compatíveis).' },
  { title: 'Placa de Vídeo', desc: 'Reparo ou substituição de placa de vídeo com problemas no iMac.' },
  { title: 'Fonte de Alimentação', desc: 'Conserto de fonte com problemas de energia ou que não liga mais.' },
  { title: 'Reparo de Placa', desc: 'Recuperação de iMac que não liga, molhados ou com problemas de vídeo.' },
]

const faqItems = [
  { q: 'Vocês atendem iMac com chip Intel e Apple Silicon?', a: 'Sim, atendemos todos os modelos de iMac, incluindo Intel e M1/M2/M3.' },
  { q: 'Quanto tempo demora o upgrade de SSD no iMac?', a: 'Upgrade de SSD em iMac geralmente é realizado em até 1 dia útil, dependendo do modelo.' },
  { q: 'Qual a garantia do serviço?', a: 'Nossos serviços contam com garantia de 3 a 12 meses, dependendo do tipo de reparo.' },
  { q: 'O orçamento é gratuito?', a: 'Sim! O diagnóstico completo do seu iMac é gratuito e sem compromisso.' },
]

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1601524909162-be87252be298?w=800', alt: 'Laboratório de reparo' },
  { src: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800', alt: 'iMac' },
  { src: 'https://images.unsplash.com/photo-1575575828821-e2e53976b4e6?w=800', alt: 'Ferramentas de precisão' },
]

export default function iMacPage() {
  const whatsappMessage = 'Olá! Quero orçamento para reparo do meu iMac em Campinas.'

  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        device="iMac"
        subtitle="Reparo em até 1 dia útil"
        description="Assistência técnica especializada em iMac em Campinas. Troca de tela, SSD, placa de vídeo e reparo de placa com peças de alta qualidade e garantia confiável."
        imageUrl="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"
        whatsappMessage={whatsappMessage}
      />
      <Differentiators />
      <ServicesList
        device="iMac"
        services={imacServices}
        whatsappMessage={whatsappMessage}
      />
      <Gallery images={galleryImages} />
      <Testimonials />
      <FAQ items={faqItems} />
      <CTASection
        device="iMac"
        whatsappMessage={whatsappMessage}
      />
    </div>
  )
}
