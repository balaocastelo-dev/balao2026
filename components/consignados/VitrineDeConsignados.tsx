"use client";

import { useMemo, useState } from "react";
import CartaoDeConsignado from "./CartaoDeConsignado";
import { ROTULO_DO_TIPO, TIPOS_DE_CONSIGNADO, type ItemConsignado, type TipoDeConsignado } from "@/lib/consignados";

/** Grade da /consignados com os filtros por tipo (só aparecem os tipos que têm aparelho). */
export default function VitrineDeConsignados({ itens }: { itens: ItemConsignado[] }) {
  const [tipo, setTipo] = useState<TipoDeConsignado | "TODOS">("TODOS");

  const tipos = useMemo(() => TIPOS_DE_CONSIGNADO.filter((t) => itens.some((i) => i.tipo === t)), [itens]);
  const visiveis = tipo === "TODOS" ? itens : itens.filter((i) => i.tipo === tipo);

  const chip = (ativo: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
      ativo ? "border-[#E60012] bg-[#E60012] text-white" : "border-slate-700 bg-[#111827] text-slate-200 hover:border-[#E60012]"
    }`;

  return (
    <div>
      {tipos.length > 1 && (
        <div role="group" aria-label="Filtrar por tipo" className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button type="button" aria-pressed={tipo === "TODOS"} onClick={() => setTipo("TODOS")} className={chip(tipo === "TODOS")}>
            Todos ({itens.length})
          </button>
          {tipos.map((t) => (
            <button key={t} type="button" aria-pressed={tipo === t} onClick={() => setTipo(t)} className={chip(tipo === t)}>
              {ROTULO_DO_TIPO[t]} ({itens.filter((i) => i.tipo === t).length})
            </button>
          ))}
        </div>
      )}
      <ul className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
        {visiveis.map((item, n) => (
          <li key={item.numero}>
            <CartaoDeConsignado item={item} prioridade={n < 3} />
          </li>
        ))}
      </ul>
    </div>
  );
}
