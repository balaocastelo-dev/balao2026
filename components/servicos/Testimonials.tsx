import { Star } from 'lucide-react'

interface Testimonial {
  name: string
  location: string
  device: string
  text: string
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    { name: 'Juliana M.', location: 'Cambuí', device: 'iPhone 13 Pro', text: 'Achei que tinha perdido meu iPhone no mar. Eles recuperaram a placa e as fotos. Incrível!' },
    { name: 'Pedro H.', location: 'Anchieta', device: 'iPad Air 4', text: 'Troca de vidro perfeita, nem parece que foi mexido. O Apple Pencil continua funcionando 100%.' },
    { name: 'Larissa C.', location: 'Mansões Santo Antônio', device: 'iPhone 11', text: 'Bateria trocada em 40 minutos. Atendimento nota 10!' },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">O que nossos clientes dizem?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Satisfação e confiança em mais de 15.000 reparos</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-1 text-yellow-500 mb-4">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-gray-600 mb-6 italic">"{t.text}"</p>
              <div>
                <div className="font-bold text-gray-900">{t.name}</div>
                <div className="text-xs text-[#E60012] font-bold uppercase tracking-wider">{t.location} • {t.device}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
