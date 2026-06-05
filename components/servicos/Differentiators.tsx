import { CheckCircle2, ShieldCheck, Zap, Award } from 'lucide-react'

export default function Differentiators() {
  const items = [
    { icon: Award, title: 'Técnicos Certificados', desc: 'Formação contínua e especialização em dispositivos Apple' },
    { icon: ShieldCheck, title: 'Peças Premium', desc: 'Peças de alta qualidade e compatibilidade garantida' },
    { icon: Zap, title: 'Reparo Express', desc: 'Serviços rápidos com qualidade premium' },
    { icon: CheckCircle2, title: 'Garantia Confiável', desc: 'Garantia de até 1 ano em nossos serviços' },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Por que escolher o Balão da Informática?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Mais de uma década de experiência em reparos Apple em Campinas</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <item.icon className="w-12 h-12 text-[#E60012] mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
