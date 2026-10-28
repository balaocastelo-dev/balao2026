"use client";

import { useState } from "react";
import Image from "next/image";

/** Foto grande + miniaturas (rolagem horizontal no celular). */
export default function GaleriaDoConsignado({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const [atual, setAtual] = useState(0);

  if (!fotos.length) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-slate-800 bg-[#0c1220] text-sm text-slate-400">
        Foto a caminho — peça no WhatsApp
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-800 bg-[#0c1220]">
        <Image
          src={fotos[atual]}
          alt={`${titulo} — foto ${atual + 1} de ${fotos.length}`}
          fill
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-contain"
          priority={atual === 0}
        />
      </div>
      {fotos.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Fotos do aparelho">
          {fotos.map((foto, n) => (
            <li key={foto + n} className="flex-none">
              <button
                type="button"
                onClick={() => setAtual(n)}
                aria-label={`Ver foto ${n + 1}`}
                aria-current={n === atual}
                className={`relative block h-16 w-20 overflow-hidden rounded-xl border-2 bg-[#0c1220] transition-colors sm:h-20 sm:w-24 ${
                  n === atual ? "border-[#E60012]" : "border-slate-800 hover:border-slate-500"
                }`}
              >
                <Image src={foto} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
