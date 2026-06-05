import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface ServiceItem {
  title: string
  desc: string
  price?: string
}

interface ServicesListProps {
  device: string
  services: ServiceItem[]
  whatsappMessage: string
}

export default function ServicesList({ device, services, whatsappMessage }: ServicesListProps) {
  const whatsappUrl = `https://wa.me/5519987510267?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">O que consertamos em seu {device}?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Todos os serviços com diagnóstico gratuito</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-[#E60012] hover:shadow-lg transition-all group">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.desc}</p>
              {service.price && (
                <div className="text-2xl font-bold text-[#E60012] mb-4">
                  {service.price}
                </div>
              )}
              <Link href={whatsappUrl} target="_blank" className="inline-flex items-center gap-2 text-[#E60012] font-semibold group-hover:underline">
                Pedir Orçamento
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
