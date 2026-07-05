"use client";

import { useEffect, useMemo, useState } from "react";

const START_AT = new Date("2026-07-06T00:00:00-03:00").getTime();
const END_AT = new Date("2026-07-13T23:59:59-03:00").getTime();

function getCountdown(now: number) {
  if (now < START_AT) {
    const diff = START_AT - now;
    return { label: "Começa em", diff };
  }

  const diff = Math.max(END_AT - now, 0);
  return { label: "Termina em", diff };
}

function splitTime(diff: number) {
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export default function PremiumPromoCountdown() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdown = useMemo(() => getCountdown(now), [now]);
  const parts = useMemo(() => splitTime(countdown.diff), [countdown.diff]);

  return (
    <div className="rounded-[28px] border border-red-400/20 bg-[linear-gradient(180deg,rgba(230,0,18,0.16),rgba(0,0,0,0.32))] p-5 backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.26em] text-red-200">
            Promoção Premium 50% OFF
          </div>
          <div className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
            Campanha válida de 06 a 13 de julho de 2026
          </div>
          <div className="mt-2 text-sm text-zinc-200">
            Todos os preços desta página exibem o valor promocional com metade do preço original.
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "Dias", value: parts.days },
            { label: "Horas", value: parts.hours },
            { label: "Min", value: parts.minutes },
            { label: "Seg", value: parts.seconds },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3">
              <div className="text-2xl font-black text-white">{String(item.value).padStart(2, "0")}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-red-100">
        {countdown.label}
      </div>
    </div>
  );
}
