"use client";

import { useState } from "react";

/** O endereço da página pessoal, com botão de copiar. Não carrega PIN. */
export default function LinkDoVendedor({ slug }: { slug: string }) {
  const [copiado, setCopiado] = useState(false);
  const caminho = `/${slug}`;
  const texto = `www.balao.info/${slug}`;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(`https://www.balao.info/${slug}`);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1500);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <a
        href={caminho}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] font-semibold text-[#0a6e3d] underline decoration-[#0f9d58]/40 underline-offset-2 hover:text-[#0f9d58]"
      >
        {texto}
      </a>
      <button
        type="button"
        onClick={copiar}
        className="rounded-md border border-[#e3e3e3] bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#202124] hover:bg-[#f0f2f5] cursor-pointer"
      >
        {copiado ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
