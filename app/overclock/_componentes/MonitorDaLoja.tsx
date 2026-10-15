"use client";

import { useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";
import estilos from "../overclock.module.css";
import { CASO_GOOGLE_ADS } from "../_dados/oferta";

/**
 * O "monitor de sensores" do topo da página, no jeito dos programas que todo
 * dono de loja de informática conhece (temperatura, clock, ventoinha). O único
 * movimento automático da página: o gasto com anúncio esfria de R$ 169 por
 * dia até zero e as outras linhas acendem "OK".
 */

const LINHAS = [
  { rotulo: "Loja virtual", valor: "No ar desde março de 2026" },
  { rotulo: "Preços da KaBuM", valor: "Atualizados a cada 10 min" },
  { rotulo: "WhatsApp da equipe", valor: "1 número, todos atendendo" },
  { rotulo: "Assistência técnica", valor: "OS com foto e aprovação online" },
];

const INICIO = CASO_GOOGLE_ADS.mediaDiaMaiorMes;
const DURACAO_MS = 2200;

export default function MonitorDaLoja() {
  const [valor, setValor] = useState(INICIO);
  const [acesas, setAcesas] = useState(0);
  const quadro = useRef<number | null>(null);

  useEffect(() => {
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (semMovimento) {
      setValor(0);
      setAcesas(LINHAS.length);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const comeco = setTimeout(() => {
      const t0 = performance.now();
      const passo = (agora: number) => {
        const p = Math.min(1, (agora - t0) / DURACAO_MS);
        const suave = 1 - Math.pow(1 - p, 3);
        setValor(Math.round(INICIO * (1 - suave)));
        if (p < 1) {
          quadro.current = requestAnimationFrame(passo);
        } else {
          LINHAS.forEach((_, i) => {
            timers.push(setTimeout(() => setAcesas(i + 1), 160 * (i + 1)));
          });
        }
      };
      quadro.current = requestAnimationFrame(passo);
    }, 700);
    timers.push(comeco);
    return () => {
      timers.forEach(clearTimeout);
      if (quadro.current) cancelAnimationFrame(quadro.current);
    };
  }, []);

  const frio = valor === 0;
  const fracao = valor / INICIO;

  return (
    <figure
      className="relative overflow-hidden rounded-2xl border border-(--oc-linha) bg-(--oc-painel) shadow-[0_30px_80px_-40px_rgba(255,122,31,0.45)]"
      aria-label="Monitor da loja Balão da Informática"
    >
      <div className="flex items-center justify-between gap-3 border-b border-(--oc-linha) bg-(--oc-painel-2) px-5 py-3">
        <div className="flex items-center gap-2 text-base font-bold">
          <Activity className="h-5 w-5 text-(--oc-laranja)" aria-hidden />
          Monitor da loja
        </div>
        <span className="text-sm text-(--oc-suave)">Balão da Informática, Campinas-SP</span>
      </div>

      <div className="px-5 pt-5 pb-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-lg font-bold">Anúncio no Google</span>
          <span className="text-base text-(--oc-suave)">
            antes: <s>R$ {INICIO} por dia</s>
          </span>
        </div>
        <div className="mt-2 flex items-end justify-between gap-4">
          <p
            className={`${estilos.numero} text-[3.25rem] leading-none sm:text-[4rem] ${frio ? "text-(--oc-verde)" : "text-(--oc-laranja)"}`}
            aria-live="off"
          >
            R$ {valor}
            <span className="ml-2 align-baseline text-xl font-bold text-(--oc-suave)">por dia</span>
          </p>
          <span
            className={`mb-1 rounded-md px-3 py-1 text-base font-bold transition-colors duration-500 ${
              frio ? "bg-(--oc-verde) text-(--oc-fundo)" : "bg-(--oc-laranja)/15 text-(--oc-laranja-claro)"
            }`}
          >
            {frio ? "OK" : "Quente"}
          </span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-(--oc-fundo)" aria-hidden>
          <div
            className={`${estilos.escalaTermica} h-full rounded-full`}
            style={{ width: `${Math.max(fracao * 100, 0)}%`, backgroundSize: `${100 / Math.max(fracao, 0.01)}% 100%` }}
          />
        </div>
        <p className="mt-2 text-base text-(--oc-suave)">
          Desde {CASO_GOOGLE_ADS.semAnuncioDesde}, a loja não paga anúncio.
        </p>
      </div>

      <ul className="border-t border-(--oc-linha)">
        {LINHAS.map((linha, i) => {
          const acesa = i < acesas;
          return (
            <li
              key={linha.rotulo}
              className="flex items-center justify-between gap-3 border-b border-(--oc-linha) px-5 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="font-bold leading-tight">{linha.rotulo}</p>
                <p className="text-base leading-snug text-(--oc-suave)">{linha.valor}</p>
              </div>
              <span
                className={`flex shrink-0 items-center gap-2 text-base font-bold transition-colors duration-300 ${
                  acesa ? "text-(--oc-verde)" : "text-(--oc-linha)"
                }`}
              >
                <span
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    acesa ? "bg-(--oc-verde) shadow-[0_0_10px_var(--oc-verde)]" : "bg-(--oc-linha)"
                  }`}
                  aria-hidden
                />
                OK
              </span>
            </li>
          );
        })}
      </ul>
      <figcaption className="border-t border-(--oc-linha) px-5 py-3 text-sm text-(--oc-suave)">
        Resultados da loja Balão da Informática; cada loja tem seu resultado.
      </figcaption>
    </figure>
  );
}
