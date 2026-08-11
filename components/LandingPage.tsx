"use client";

import React from "react";
import { MessageCircle, MapPin, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

import { SITE_CONFIG } from "@/lib/config";

interface LandingPageProps {
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  ctaText?: string;
  icon?: React.ReactNode;
}

export default function LandingPage({
  title,
  subtitle,
  description,
  benefits,
  ctaText = "Falar com Especialista no WhatsApp",
  icon,
}: LandingPageProps) {
  const whatsappLink = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
    `Olá, gostaria de saber mais sobre ${title}`
  )}`;
  const mapLink = "https://goo.gl/maps/y1q8J9jX7k72";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100 pb-12 pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {icon && (
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-50 rounded-full text-[#E60012]">
                {icon}
              </div>
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {title}
          </h1>
          <p className="text-xl text-[#E60012] font-semibold mb-6">
            {subtitle}
          </p>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={whatsappLink}
              target="_blank"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 w-full sm:w-auto justify-center text-lg"
            >
              <MessageCircle size={24} />
              {ctaText}
            </Link>
            <Link
              href={mapLink}
              target="_blank"
              className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-[#E60012] text-gray-700 hover:text-[#E60012] font-bold py-4 px-8 rounded-full shadow-sm hover:shadow-md transition-all w-full sm:w-auto justify-center text-lg"
            >
              <MapPin size={24} />
              Visitar Loja Física
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            {SITE_CONFIG.address}
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-10 text-center">
            Por que escolher a Balão da Informática?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div className="mt-1 text-[#E60012] shrink-0">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-gray-700 font-medium text-lg">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-[#E60012] py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          Pronto para começar?
        </h2>
        <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
          Fale agora com nossa equipe especializada e garanta o melhor negócio.
        </p>
        <Link
          href={whatsappLink}
          target="_blank"
          className="inline-flex items-center gap-2 bg-white text-[#E60012] hover:bg-gray-100 font-bold py-4 px-10 rounded-full shadow-lg transition-colors text-lg"
        >
          Chamar no WhatsApp
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}
