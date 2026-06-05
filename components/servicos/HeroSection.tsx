import Link from 'next/link'
import { Phone, Calendar, Wrench } from 'lucide-react'
import Image from 'next/image'

interface HeroSectionProps {
  device: string
  subtitle: string
  description: string
  imageUrl: string
  whatsappMessage: string
  agendamentoLink?: boolean
}

export default function HeroSection({
  device, subtitle, description, imageUrl, whatsappMessage, agendamentoLink = true }: HeroSectionProps) {
  const whatsappUrl = `https://wa.me/5519987510267?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold border border-gray-200">
              <Wrench className="w-4 h-4 text-[#E60012]" />
              <span>Laboratório Especializado Apple</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Assistência Técnica Especializada em <span className="text-[#E60012]">{device}</span> em Campinas
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {agendamentoLink ? (
                <Link href="/reparoapple/agendamento" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-[#E60012] text-white font-semibold hover:bg-[#C81920] transition-colors">
                  <Calendar className="w-5 h-5" />
                  Agendar Diagnóstico Grátis
                </Link>
              ) : null}
              <Link href={whatsappUrl} target="_blank" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 border-[#E60012] text-[#E60012] font-semibold hover:bg-[#E60012] hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
                Falar no WhatsApp
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600 font-medium">Reparo em até 40 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600 font-medium">Garantia confiável</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src={imageUrl}
                alt={`Reparo de ${device}`}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E60012]/10 flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-[#E60012]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">+15.000</div>
                  <div className="text-sm text-gray-600">iPhones Reparados</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
