"use client";
import { useEffect, useMemo, useState } from "react";
import { Timer, Clock } from "lucide-react";

function getNextMondayAt(hour: number, minute: number) {
  const now = new Date();
  const day = now.getDay(); // 0 Sun .. 6 Sat, Monday=1
  let diff = (1 - day + 7) % 7;
  // if today is Monday, check if already past target time -> next week
  const target = new Date(now);
  target.setDate(now.getDate() + diff);
  target.setHours(hour, minute, 59, 999);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 7);
  }
  return target.getTime();
}

function split(diff: number) {
  const s = Math.max(0, Math.floor(diff / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return { d, h, m, sec };
}

export default function MondayCountdown({ hour = 18, minute = 0, label = "Termina segunda às 18h", sublabel = "Retirada em 30 min no Cambuí" }: { hour?: number; minute?: number; label?: string; sublabel?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const target = useMemo(() => getNextMondayAt(hour, minute), []);
  const diff = target - now;
  const parts = split(diff);
  const ended = diff <= 0;
  return (
    <div className="rounded-2xl border border-amber-200/20 bg-gradient-to-r from-[#E60012]/20 via-black/40 to-amber-500/10 p-4 sm:p-5 backdrop-blur">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-amber-200"><Timer className="w-4 h-4"/> {label}</div>
          <div className="text-xs text-zinc-300 mt-1">{sublabel} • Oferta válida até segunda-feira {String(hour).padStart(2,"0")}:{String(minute).padStart(2,"0")}</div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center min-w-[260px]">
          {[
            { l: "Dias", v: parts.d },
            { l: "Horas", v: parts.h },
            { l: "Min", v: parts.m },
            { l: "Seg", v: parts.sec },
          ].map(i => (
            <div key={i.l} className="rounded-xl bg-black/40 border border-white/10 px-2 py-2">
              <div className="text-xl font-black text-white tabular-nums">{String(i.v).padStart(2,"0")}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{i.l}</div>
            </div>
          ))}
        </div>
      </div>
      {ended && <div className="mt-3 text-sm font-bold text-red-300 flex items-center gap-2"><Clock className="w-4 h-4"/> Oferta encerrada — chame no WhatsApp para garantir preço!</div>}
    </div>
  );
}
