"use client";
import { useState } from "react";
import { MessageCircle, Bell } from "lucide-react";

export default function WhatsAppNewsletter() {
  const [phone, setPhone] = useState("");
  function handle() {
    const msg = `Olá! Quero receber ofertas no WhatsApp. Meu número: ${phone}`;
    window.open(`https://wa.me/5519987510267?text=${encodeURIComponent(msg)}`, "_blank");
  }
  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 sm:p-6">
      <div className="flex items-center gap-2 text-emerald-700 font-black text-sm"><Bell className="w-4 h-4"/> Newsletter WhatsApp</div>
      <div className="mt-2 font-black text-slate-900 text-lg leading-tight">Receba ofertas antes de todo mundo</div>
      <p className="text-sm text-slate-600 mt-1">Promoções relâmpago direto no seu WhatsApp — sem spam, só curadoria Balão.</p>
      <div className="mt-4 flex gap-2">
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(19) 9xxxx-xxxx" className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
        <button onClick={handle} className="bg-[#25D366] hover:bg-[#128C7E] text-white font-black px-5 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap"><MessageCircle className="w-4 h-4"/> Quero ofertas</button>
      </div>
      <div className="text-[11px] text-slate-500 mt-2">Ao clicar você abre o WhatsApp da Balão e confirma o cadastro.</div>
    </div>
  );
}
