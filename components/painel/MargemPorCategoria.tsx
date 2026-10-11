"use client";

// Margem por categoria de uma fonte (qualquer fornecedor: KaBuM!, TechSupri,
// Robson...). Campo vazio = margem automática da fonte (regra escalonada ou
// margem única). Número = margem fixa para a categoria, que vale antes de tudo.

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface Linha {
  categoria: string;
  produtos: number;
  margem: number | null;
  automaticaMin: number;
  automaticaMax: number;
  precoMin: number;
  precoMax: number;
}

const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: v < 100 ? 2 : 0 });
const faixa = (a: number, b: number, fmt: (v: number) => string) => (Math.abs(a - b) < 0.05 ? fmt(a) : `${fmt(a)} a ${fmt(b)}`);
const pct = (v: number) => `${Math.round(v * 10) / 10}%`;

export default function MargemPorCategoria({
  fonteId,
  margensAtuais,
  onSalvo,
}: {
  fonteId: string;
  margensAtuais: Record<string, number> | null | undefined;
  onSalvo: (texto: string) => void;
}) {
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/precos/fontes/${fonteId}/categorias`, { cache: "no-store" });
        const dados = await r.json();
        if (!r.ok || dados?.ok === false) throw new Error(dados?.erro || `O servidor respondeu ${r.status}`);
        setLinhas(dados.categorias);
        setValores(Object.fromEntries((dados.categorias as Linha[]).map((l) => [l.categoria, l.margem == null ? "" : String(l.margem)])));
      } catch (e) {
        setErro((e as Error).message);
      }
    })();
  }, [fonteId]);

  const mudou = (linhas || []).some((l) => (l.margem == null ? "" : String(l.margem)) !== (valores[l.categoria] ?? "").replace(",", ".").trim());

  async function salvar() {
    const margens: Record<string, number> = { ...(margensAtuais || {}) };
    for (const l of linhas || []) {
      const texto = (valores[l.categoria] ?? "").replace(",", ".").trim();
      if (texto === "") {
        delete margens[l.categoria];
        continue;
      }
      const n = Number(texto);
      if (!Number.isFinite(n) || n < 0 || n > 500) {
        setErro(`${l.categoria}: a margem precisa ser um número entre 0 e 500.`);
        return;
      }
      margens[l.categoria] = n;
    }
    setSalvando(true);
    setErro(null);
    try {
      const r = await fetch(`/api/precos/fontes/${fonteId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ margens_categoria: margens }),
      });
      const dados = await r.json();
      if (!r.ok || dados?.ok === false) throw new Error(dados?.erro || `O servidor respondeu ${r.status}`);
      setLinhas((atual) => (atual || []).map((l) => ({ ...l, margem: margens[l.categoria] ?? null })));
      onSalvo(`Margens por categoria salvas. ${dados.reprecificados ?? 0} produtos com preço novo no site e no CRM.`);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  if (erro && !linhas) return <p className="text-sm text-red-700">{erro}</p>;
  if (!linhas) {
    return (
      <p className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 size={14} className="animate-spin" /> Carregando categorias…
      </p>
    );
  }
  if (linhas.length === 0) return <p className="text-sm text-gray-500">Esta fonte ainda não tem produtos no site.</p>;

  const visiveis = linhas.filter((l) => !filtro || l.categoria.toLowerCase().includes(filtro.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="flex-1 text-xs text-gray-600">
          Deixe vazio para a margem automática da fonte. Um número fixa a margem de toda a categoria (vale antes da regra). As fontes
          de notebook continuam entre R$ 119 e R$ 199.
        </p>
        <input
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Filtrar categoria…"
          className="w-48 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
        />
      </div>
      <div className="max-h-[420px] overflow-auto rounded-md border border-gray-200">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-3 py-2">Categoria no site</th>
              <th className="px-3 py-2 text-right">Produtos</th>
              <th className="px-3 py-2 text-right">Preço do fornecedor</th>
              <th className="px-3 py-2 text-right">Automática</th>
              <th className="px-3 py-2 text-right">Margem fixa (%)</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((l) => (
              <tr key={l.categoria} className="border-t border-gray-100">
                <td className="px-3 py-1.5 text-gray-800">{l.categoria}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{l.produtos}</td>
                <td className="px-3 py-1.5 text-right tabular-nums text-gray-600">{faixa(l.precoMin, l.precoMax, reais)}</td>
                <td className="px-3 py-1.5 text-right tabular-nums text-gray-600">{faixa(l.automaticaMin, l.automaticaMax, pct)}</td>
                <td className="px-3 py-1.5 text-right">
                  <input
                    aria-label={`Margem fixa de ${l.categoria}`}
                    inputMode="decimal"
                    value={valores[l.categoria] ?? ""}
                    placeholder="auto"
                    onChange={(e) => setValores((v) => ({ ...v, [l.categoria]: e.target.value }))}
                    className={`w-20 rounded-md border px-2 py-1 text-right text-sm font-bold tabular-nums ${
                      (valores[l.categoria] ?? "") !== "" ? "border-[#E60012] bg-red-50 text-gray-900" : "border-gray-300 bg-white text-gray-900"
                    }`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {erro && <p className="text-sm text-red-700">{erro}</p>}
      <button
        type="button"
        onClick={salvar}
        disabled={!mudou || salvando}
        className="inline-flex items-center gap-2 rounded-md bg-[#E60012] px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-40"
      >
        {salvando && <Loader2 size={14} className="animate-spin" />} Salvar margens por categoria
      </button>
    </div>
  );
}
