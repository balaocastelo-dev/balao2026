'use client'

import { useState } from 'react'
import { Phone, Calendar, Smartphone, Monitor, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function AgendamentoPage() {
  const [formData, setFormData] = useState({
    device: '',
    issue: '',
    name: '',
    whatsapp: '',
    date: '',
    time: '',
    message: ''
  })

  const [submitted, setSubmitted] = useState(false)

  const devices = [
    'iPhone',
    'MacBook',
    'iPad',
    'Apple Watch',
    'iMac',
    'Mac Mini',
    'Outro dispositivo Apple'
  ]

  const issues = [
    'Tela quebrada/racha',
    'Bateria descarrega rápido',
    'Não liga',
    'Problema de carga',
    'Face ID/Touch ID não funciona',
    'Câmera com defeito',
    'Água/água',
    'Outro problema'
  ]

  const times = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const whatsappMessage = `Olá! Quero agendar um horário para reparo:\n\nDispositivo: ${formData.device}\nProblema: ${formData.issue}\nNome: ${formData.name}\nWhatsApp: ${formData.whatsapp}\nData: ${formData.date}\nHorário: ${formData.time}\n\nMensagem: ${formData.message}`
  const whatsappUrl = `https://wa.me/5519987510267?text=${encodeURIComponent(whatsappMessage)}`

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agendamento Pronto!</h2>
          <p className="text-gray-600 mb-8">Agora é só confirmar o seu agendamento no WhatsApp.</p>
          <Link
            href={whatsappUrl}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
          >
            <Phone className="w-5 h-5" />
            Confirmar no WhatsApp
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full mt-4 px-6 py-4 rounded-lg border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
          >
            Voltar para Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E60012]/10 text-[#E60012] text-sm font-semibold mb-4">
              <Calendar className="w-4 h-4" />
              Agendamento Rápido
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Agende o seu reparo em Campinas</h1>
            <p className="text-gray-600">Preencha o formulário abaixo e receba um horário para o seu reparo Apple.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Dispositivo</label>
              <select
                name="device"
                value={formData.device}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] transition-colors"
                required
              >
                <option value="">Selecione o dispositivo</option>
                {devices.map(device => (
                  <option key={device} value={device}>{device}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Problema</label>
              <select
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] transition-colors"
                required
              >
                <option value="">Selecione o problema</option>
                {issues.map(issue => (
                  <option key={issue} value={issue}>{issue}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Nome completo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">WhatsApp</label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="(19) 99999-9999"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] transition-colors"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Data preferida</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Horário preferido</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] transition-colors"
                  required
                >
                  <option value="">Selecione o horário</option>
                  {times.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Mensagem adicional (opcional)</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Descreva mais detalhes do problema do seu dispositivo"
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-[#E60012] text-white font-bold hover:bg-[#c81920] transition-colors"
            >
              <Clock className="w-5 h-5" />
              Agendar agora
            </button>
          </form>
        </div>
        <div className="mt-8 bg-gray-50 rounded-2xl border border-gray-100 p-6 text-center">
          <Smartphone className="w-10 h-10 text-[#E60012] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Prefere falar diretamente?</h3>
          <p className="text-gray-600 mb-4">Entre em contato conosco diretamente no WhatsApp.</p>
          <Link
            href="https://wa.me/5519987510267"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#E60012] text-[#E60012] font-bold hover:bg-[#E60012] hover:text-white transition-colors"
          >
            <Phone className="w-5 h-5" />
            Chamar no WhatsApp
          </Link>
        </div>
      </div>
    </div>
  )
}
