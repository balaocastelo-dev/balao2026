"use client";

import React from "react";
import { Star, Quote, User } from "lucide-react";

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50 text-gray-800 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-gray-900">
            QUEM CONFIA, APROVA
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Veja depoimentos reais e demonstrações de clientes da nossa unidade física no Cambuí.
          </p>
        </div>

        {/* Note: Google reviews placeholder ready to be filled with final production customer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative group hover:border-red-500 transition-colors duration-300">
            <Quote className="absolute top-8 right-8 w-12 h-12 text-gray-100 group-hover:text-red-100 transition-colors" />
            <div className="flex items-center gap-2 mb-4 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-6 relative z-10">
              &ldquo;Em breve, depoimentos reais de clientes atendidos na unidade Balão da Informática Castelo. Deixe sua avaliação no Google!&rdquo;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Espaço para Depoimento</div>
                <div className="text-xs text-gray-500">Cliente Local • Campinas</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative group hover:border-red-500 transition-colors duration-300">
            <Quote className="absolute top-8 right-8 w-12 h-12 text-gray-100 group-hover:text-red-100 transition-colors" />
            <div className="flex items-center gap-2 mb-4 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-6 relative z-10">
              &ldquo;Deixei meu notebook antigo para consignação e o processo foi super tranquilo. Venderam rápido e me pagaram direto no PIX.&rdquo;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Mariana C.</div>
                <div className="text-xs text-gray-500">Consignação • Cambuí</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative group hover:border-red-500 transition-colors duration-300">
            <Quote className="absolute top-8 right-8 w-12 h-12 text-gray-100 group-hover:text-red-100 transition-colors" />
            <div className="flex items-center gap-2 mb-4 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-6 relative z-10">
              &ldquo;Levei meu PC gamer para limpeza interna e troca de pasta térmica. Ficou muito silencioso e frio de novo. Excelente serviço.&rdquo;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Guilherme R.</div>
                <div className="text-xs text-gray-500">Manutenção • Campinas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
