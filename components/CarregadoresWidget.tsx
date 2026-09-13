"use client";
import { useState } from "react";
import { MessageCircle, Camera, Plug, Zap, Info } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

const TABELA = [
  { marca: "Dell (pino fino 7.4mm)", volts: "19.5V", amps: "3.34A / 4.62A", watts: "65W / 90W", plug: "7.4x5.0mm c/ pino" },
  { marca: "Dell USB-C", volts: "5-20V", amps: "3.25A", watts: "65W", plug: "USB-C PD" },
  { marca: "Lenovo (pino grosso)", volts: "20V", amps: "3.25A / 6.75A", watts: "65W / 135W", plug: "Retangular slim" },
  { marca: "HP (pino fino 4.5mm)", volts: "19.5V", amps: "2.31A / 3.33A", watts: "45W / 65W", plug: "4.5x3.0mm" },
  { marca: "Acer", volts: "19V", amps: "3.42A", watts: "65W", plug: "5.5x1.7mm" },
  { marca: "Asus", volts: "19V", amps: "3.42A / 6.32A", watts: "65W / 120W", plug: "4.0x1.35mm / 5.5x2.5mm" },
  { marca: "Samsung", volts: "19V", amps: "2.1A / 3.16A", watts: "40W / 60W", plug: "3.0x1.0mm" },
  { marca: "Apple MagSafe 2", volts: "14.5-20V", amps: "3A", watts: "45/60/85W", plug: "MagSafe 2" },
  { marca: "Apple USB-C", volts: "5-20V", amps: "3A / 5A", watts: "67W / 96W / 140W", plug: "USB-C PD + MagSafe 3" },
];

export default function CarregadoresWidget() {
  const [fileName, setFileName] = useState("");
  return (
    <div className="space-y-8">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2"><Camera className="w-6 h-6 text-[#E60012]" /> Não sabe qual fonte? Envie foto</h3>
          <span className="text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black px-3 py-1 rounded-full">Resposta em 2 min • Teste no balcão</span>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-sm text-slate-300">Tire foto do <b className="text-white">plug (conector)</b> + <b className="text-white">etiqueta debaixo do notebook</b> (volts/amps). Nosso técnico confirma compatibilidade e evita queima de placa.</p>
            <div>
              <label className="w-full bg-[#161f32] border-2 border-dashed border-slate-700 hover:border-[#E60012]/50 rounded-2xl p-6 flex flex-col items-center gap-2 cursor-pointer transition">
                <Plug className="w-8 h-8 text-[#E60012]" />
                <span className="text-sm font-bold text-white">Clique para enviar foto do plug + etiqueta</span>
                <span className="text-xs text-slate-400">JPG/PNG até 5MB • Também aceita foto do carregador antigo</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
              </label>
              {fileName && <p className="text-xs text-emerald-400 mt-2">Foto: {fileName} — clique em enviar via WhatsApp</p>}
            </div>
            <a href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Olá! Quero confirmar carregador compatível. Vou enviar foto do plug + etiqueta do meu notebook.")}`} target="_blank" rel="noopener noreferrer" className="w-full bg-[#E60012] hover:bg-red-700 text-white font-black py-3 px-6 rounded-2xl flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" /> Enviar Foto no WhatsApp
            </a>
          </div>
          <div className="bg-[#161f32] border border-slate-800 rounded-2xl p-5 space-y-3">
            <p className="text-sm font-black text-white flex items-center gap-2"><Zap className="w-4 h-4 text-[#E60012]" /> Dica rápida: não use 19V genérico em notebook 19.5V Dell — trava CPU e não carrega.</p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
              <li>Voltagem errada queima placa-mãe — confirme V e A na etiqueta.</li>
              <li>USB-C PD precisa chip E-Marker para 100W+.</li>
              <li>Teste gratuito no balcão do Cambuí antes de pagar.</li>
            </ul>
            <div className="flex items-center gap-2 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3"><Info className="w-4 h-4" /> Garantia 12 meses • 10% OFF PIX • Motoboy 60 min</div>
          </div>
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg sm:text-xl font-black text-white">Tabela de Voltagem por Marca (evita queima)</h3>
        <p className="text-xs text-slate-400">Confira antes de comprar. Voltagem incorreta = risco de placa. Envie foto que confirmamos.</p>
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-[#161f32] text-slate-400 text-xs uppercase tracking-wider">
              <tr><th className="px-4 py-3 text-left">Marca / Modelo</th><th className="px-4 py-3 text-left">Voltagem</th><th className="px-4 py-3 text-left">Amperagem</th><th className="px-4 py-3 text-left">Potência</th><th className="px-4 py-3 text-left">Plug</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {TABELA.map((r) => (
                <tr key={r.marca} className="text-slate-300">
                  <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{r.marca}</td>
                  <td className="px-4 py-3 text-[#E60012] font-black">{r.volts}</td>
                  <td className="px-4 py-3">{r.amps}</td>
                  <td className="px-4 py-3">{r.watts}</td>
                  <td className="px-4 py-3 text-xs">{r.plug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
