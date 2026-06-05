import { Metadata } from 'next'
import HeroSection from '@/components/servicos/HeroSection'
import Differentiators from '@/components/servicos/Differentiators'
import ServicesList from '@/components/servicos/ServicesList'
import Gallery from '@/components/servicos/Gallery'
import Testimonials from '@/components/servicos/Testimonials'
import FAQ from '@/components/servicos/FAQ'
import CTASection from '@/components/servicos/CTASection'

export const metadata: Metadata = {
  title: 'Conserto de iPad em Campinas | Assistência Técnica Apple Especializada | Balão da Informática',
  description: 'Assistência Técnica Especializada em iPad em Campinas. Troca de tela, bateria, conector de carga e reparo de placa. Peças premium e garantia confiável.',
  keywords: [
    'conserto ipad campinas',
    'assistência técnica ipad',
    'troca tela ipad',
    'reparo ipad',
    'loja ipad campinas'
  ],
  alternates: { canonical: "https://www.balao.info/(servicos)/ipad" },
}

const ipadServices = [
  { title: 'Troca de Tela', desc: 'Substituição de displays quebrados, com manchas ou touch falhando no seu iPad.' },
  { title: 'Troca de Bateria', desc: 'Seu iPad descarrega rápido? Trocamos sua bateria por uma nova com saúde 100%.' },
  { title: 'Reparo de Placa', desc: 'Recuperação de iPad que não liga, molhados ou com problemas de carga.' },
  { title: 'Conector de Carga', desc: 'Conserto de porta Lightning/USB-C quebrada ou com mal contato.' },
  { title: 'Botão Home/Touch ID', desc: 'Reparo do botão home ou Touch ID que parou de funcionar.' },
  { title: 'Câmeras e Alto-falante', desc: 'Troca de módulos de câmera traseira/frontal e alto-falante com defeito.' },
]

const faqItems = [
  { q: 'Vocês atendem iPad Pro e iPad Air?', a: 'Sim, atendemos todos os modelos de iPad, incluindo iPad Pro, iPad Air, iPad mini e iPad.' },
  { q: 'Quanto tempo demora a troca de tela do iPad?', a: 'Troca de tela no iPad geralmente é realizada em até 1 hora e meia, mediante agendamento prévio.' },
  { q: 'Qual a garantia do serviço?', a: 'Nossos serviços contam com garantia de 3 a 12 meses, dependendo do tipo de reparo.' },
  { q: 'O orçamento é gratuito?', a: 'Sim! O diagnóstico completo do seu iPad é gratuito e sem compromisso.' },
]

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1601524909162-be87252be298?w=800', alt: 'Laboratório de reparo' },
  { src: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', alt: 'iPad' },
  { src: 'https://images.unsplash.com/photo-1575575828821-e2e53976b4e6?w=800', alt: 'Ferramentas de precisão' },
]

export default function iPadPage() {
  const whatsappMessage = 'Olá! Quero orçamento para reparo do meu iPad em Campinas.'

  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        device="iPad"
        subtitle="Reparo em até 1h30"
        description="Assistência técnica especializada em iPad em Campinas. Troca de tela, bateria, conector de carga e reparo de placa com peças de alta qualidade e garantia confiável."
        imageUrl="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800"
        whatsappMessage={whatsappMessage}
      />
      <Differentiators />
      <ServicesList
        device="iPad"
        services={ipadServices}
        whatsappMessage={whatsappMessage}
      />
      <Gallery images={galleryImages} />
      <Testimonials />
      <FAQ items={faqItems} />
      <CTASection
        device="iPad"
        whatsappMessage={whatsappMessage}
      />
    </div>
  )
}
