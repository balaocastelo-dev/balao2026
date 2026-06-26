"use client";

import React from "react";
import { MapPin, Phone, MessageCircle, Mail, Clock, Navigation } from "lucide-react";
import { BUSINESS_INFO, WA_HREF } from "@/lib/business-info";

interface StoreInfoProps {
  className?: string;
}

export default function StoreInfo({ className = "" }: StoreInfoProps) {
  return (
    <div className={`bg-white rounded-3xl border border-gray-100 shadow-xl p-8 max-w-4xl mx-auto ${className}`}>
      <h3 className="text-2xl font-black text-gray-900 mb-6 border-b pb-4 border-gray-100">
        Balão da Informática Castelo
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-gray-600">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="text-[#E60012] shrink-0 mt-1" size={20} />
            <div>
              <p className="font-bold text-gray-800">Endereço Oficial</p>
              <p>{BUSINESS_INFO.address}</p>
              <p className="text-sm text-gray-500">CEP: {BUSINESS_INFO.postalCode}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="text-[#E60012] shrink-0 mt-1" size={20} />
            <div>
              <p className="font-bold text-gray-800">Telefone Fixo</p>
              <p>{BUSINESS_INFO.phone.display}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="text-[#E60012] shrink-0 mt-1" size={20} />
            <div>
              <p className="font-bold text-gray-800">E-mail</p>
              <p>{BUSINESS_INFO.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="text-[#E60012] shrink-0 mt-1" size={20} />
            <div>
              <p className="font-bold text-gray-800">Horário Presencial</p>
              <p>{BUSINESS_INFO.openingHours.weekdays}</p>
              <p>{BUSINESS_INFO.openingHours.saturday}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageCircle className="text-emerald-500 shrink-0 mt-1" size={20} />
            <div>
              <p className="font-bold text-gray-800">WhatsApp 24 Horas</p>
              <p>{BUSINESS_INFO.whatsapp.display}</p>
              <p className="text-sm text-gray-500">{BUSINESS_INFO.whatsappSupport}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={WA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-full transition-all active:scale-95 shadow-md shadow-emerald-600/10 cursor-pointer"
        >
          <MessageCircle size={20} className="fill-current shrink-0" />
          <span>Falar no WhatsApp 24h</span>
        </a>
        <a
          href="https://maps.google.com/?q=Av.+Anchieta,+789+-+Cambuí,+Campinas+-+SP"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-[#E60012] hover:text-[#E60012] text-gray-700 font-bold px-6 py-3 rounded-full transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <Navigation size={20} className="shrink-0" />
          <span>Como Chegar (Google Maps)</span>
        </a>
      </div>
    </div>
  );
}
