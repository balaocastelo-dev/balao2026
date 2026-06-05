import Link from 'next/link'
import { Phone, Calendar } from 'lucide-react'

interface CTASectionProps {
  device: string
  whatsappMessage: string
}

export default function CTASection({ device, whatsappMessage }: CTASectionProps) {
  const whatsappUrl = `https://wa.me/5519987510267?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <section className="py-20 bg-[#E60012]">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Recupere seu {device} Hoje Mesmo</h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Qualidade, transparência e preço justo. Fale com nossos técnicos agora.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href={whatsappUrl} target="_blank" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-white text-[#E60012] font-bold hover:bg-gray-100 transition-colors">
            <Phone className="w-5 h-5" />
            Chamar no WhatsApp
          </Link>
          <Link href="/(servicos)/agendamento" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 border-white text-white font-bold hover:bg-white hover:text-[#E60012] transition-colors">
            <Calendar className="w-5 h-5" />
            Agendar Diagnóstico
          </Link>
        </div>
      </div>
    </section>
  )
}
