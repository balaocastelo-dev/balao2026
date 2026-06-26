"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/business-info";

interface WhatsAppCTAProps {
  label: string;
  message?: string;
  variant?: "primary" | "secondary" | "outline" | "danger" | "success";
  className?: string;
}

export default function WhatsAppCTA({
  label,
  message,
  variant = "success",
  className = "",
}: WhatsAppCTAProps) {
  const defaultMsg = message || "Olá! Vim pelo site do Balão da Informática Castelo e gostaria de atendimento.";
  const url = buildWhatsAppUrl(defaultMsg);

  const baseStyles = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-md active:scale-95 text-center cursor-pointer select-none";
  const variants = {
    primary: "bg-[#E60012] hover:bg-red-700 text-white shadow-red-500/20",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
    outline: "border-2 border-[#E60012] text-[#E60012] hover:bg-red-50",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20",
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      <MessageCircle size={20} className="fill-current shrink-0" />
      <span>{label}</span>
    </a>
  );
}
