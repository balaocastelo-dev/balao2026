"use client";

// Editor da margem escalonada de uma fonte: quanto mais barato o produto no
// fornecedor, maior a margem. Ex.: Robson Atacado, 500% até R$ 10 caindo até
// 100% a partir de R$ 200 (pedido do Thiago em 11/10: produto barato e
// entrega de motoboy).

import { useState } from "react";
import type { RegraDeMargem } from "@/lib/precos/margem";

const numero = (t: string) => Number(String(t).replace(",", ".").trim());

export default function RegraEscalonada({
  margem,
  regra,
  ocupada,
  onSalvar,
}: {
  margem: number;
  regra: RegraDeMargem | null | undefined;
  ocupada: boolean;
  onSalvar: (mudanca: Record<string, unknown>, texto: string) => void;
}) {
  const base: RegraDeMargem = regra || {
    tipo: "escalonada",
    minima: margem,
    maxima: Math.min(500, Math.round(margem * 2)),
    precoDaMaxima: 20,
    precoDaMinima: 400,
    fixasNaMinima: [],
  };
  const [aberta, setAberta] = useState(false);
  const [v, setV] = useState({
    maxima: String(base.maxima),
    precoDaMaxima: String(base.precoDaMaxima),
    minima: String(base.minima),
    precoDaMinima: String(base.precoDaMinima),
  });

  function salvar() {
    const maxima = numero(v.maxima), minima = numero(v.minima), pMax = numero(v.precoDaMaxima), pMin = numero(v.precoDaMinima);
    if (![maxima, minima].every((n) => n >= 0 && n <= 500)) return alertar("As margens precisam ficar entre 0 e 500%.");
    if (minima > maxima) return alertar("A margem dos produtos caros não pode ser maior que a dos baratos.");
    if (!(pMax >= 0) || !(pMin > pMax)) return alertar("O preço da margem menor precisa ser maior que o da margem maior.");
    onSalvar(
      { regra_margem: { ...base, tipo: "escalonada", maxima, minima, precoDaMaxima: pMax, precoDaMinima: pMin } },
      `Margem escalonada salva: ${maxima}% até R$ ${pMax}, caindo até ${minima}% a partir de R$ ${pMin}.`
    );
    setAberta(false);
  }
  const [aviso, setAviso] = useState<string | null>(null);
  function alertar(t: string) {
    setAviso(t);
  }

  const campo = (k: keyof typeof v, rotulo: string, prefixo?: string) => (
    <label className="text-xs font-semibold text-gray-600">
      <span className="mb-1 block">{rotulo}</span>
      <span className="flex items-center gap-1">
        {prefixo && <span className="text-gray-500">{prefixo}</span>}
        <input
          inputMode="decimal"
          value={v[k]}
          onChange={(e) => setV((a) => ({ ...a, [k]: e.target.value }))}
          className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-right text-sm font-bold tabular-nums text-gray-900"
        />
      </span>
    </label>
  );

  if (!aberta) {
    return (
      <button
        type="button"
        disabled={ocupada}
        onClick={() => setAberta(true)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
      >
        {regra ? "Editar margem escalonada" : "Usar margem escalonada"}
      </button>
    );
  }

  return (
    <div className="w-full space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs text-gray-600">Quanto mais barato no fornecedor, maior a margem. Entre os dois preços a margem cai aos poucos.</p>
      <div className="flex flex-wrap items-end gap-4">
        {campo("maxima", "Margem dos baratos (%)")}
        {campo("precoDaMaxima", "até o preço", "R$")}
        {campo("minima", "Margem dos caros (%)")}
        {campo("precoDaMinima", "a partir de", "R$")}
      </div>
      {aviso && <p className="text-xs text-red-700">{aviso}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={salvar} disabled={ocupada} className="rounded-md bg-[#E60012] px-3 py-1.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-40">
          Salvar e recalcular
        </button>
        {regra && (
          <button
            type="button"
            disabled={ocupada}
            onClick={() => {
              onSalvar({ regra_margem: null, margem: regra.minima }, `Margem única de ${regra.minima}% para a fonte toda.`);
              setAberta(false);
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Trocar por margem única ({regra.minima}%)
          </button>
        )}
        <button type="button" onClick={() => setAberta(false)} className="text-sm text-gray-600 underline">
          Cancelar
        </button>
      </div>
    </div>
  );
}
