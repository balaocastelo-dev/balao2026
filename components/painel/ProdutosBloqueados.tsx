"use client";

// Produtos excluídos no painel que vieram de uma fonte: ficam bloqueados na
// entrada e não voltam na atualização. "Desbloquear" deixa voltar na próxima
// leitura da fonte (lib/precos/bloqueio.ts).

import { useCallback, useEffect, useState } from "react";
import { Ban, Loader2 } from "lucide-react";

interface Bloqueado {
  id: string;
  nome: string;
  preco: string | null;
  imagem: string | null;
  fornecedor: string | null;
  motivo: string | null;
  bloqueado_em: string;
}

const data = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

export default function ProdutosBloqueados() {
  const [lista, setLista] = useState<Bloqueado[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");

  const carregar = useCallback(async () => {
    try {
      const r = await fetch("/api/precos/bloqueados", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok || d?.ok === false) throw new Error(d?.erro || `O servidor respondeu ${r.status}`);
      setLista(d.bloqueados);
    } catch (e) {
      setErro((e as Error).message);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function desbloquear(b: Bloqueado) {
    setOcupado(b.id);
    try {
      const r = await fetch("/api/precos/bloqueados", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: b.id }),
      });
      const d = await r.json();
      if (!r.ok || d?.ok === false) throw new Error(d?.erro || `O servidor respondeu ${r.status}`);
      setAviso(`${b.nome}: desbloqueado. Volta ao site na próxima atualização da fonte.`);
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setOcupado(null);
    }
  }

  const visiveis = (lista || []).filter((b) => !filtro || b.nome.toLowerCase().includes(filtro.toLowerCase()));

  return (
    <section className="rounded-lg border border-gray-200 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="flex flex-1 items-center gap-2 text-base font-bold text-gray-900">
          <Ban size={18} className="text-[#E60012]" /> Produtos bloqueados {lista ? `(${lista.length})` : ""}
        </h3>
        {lista && lista.length > 5 && (
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Procurar…"
            className="w-48 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
          />
        )}
      </div>
      <p className="mt-1 max-w-3xl text-sm text-gray-600">
        Produto da KaBuM! ou de fornecedor excluído em Produtos fica bloqueado aqui: a atualização não traz ele de volta. Para
        voltar a vender, clique em Desbloquear — ele reaparece na próxima leitura da fonte.
      </p>
      {aviso && <p className="mt-2 text-sm text-green-800">{aviso}</p>}
      {erro && <p className="mt-2 text-sm text-red-700">{erro}</p>}
      {!lista && !erro && (
        <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={14} className="animate-spin" /> Carregando…
        </p>
      )}
      {lista && lista.length === 0 && <p className="mt-3 text-sm text-gray-500">Nenhum produto bloqueado.</p>}
      {visiveis.length > 0 && (
        <div className="mt-3 max-h-[420px] overflow-auto rounded-md border border-gray-200">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-3 py-2">Produto</th>
                <th className="px-3 py-2">Fornecedor</th>
                <th className="px-3 py-2 text-right">Preço quando saiu</th>
                <th className="px-3 py-2">Bloqueado</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {visiveis.map((b) => (
                <tr key={b.id} className="border-t border-gray-100">
                  <td className="px-3 py-1.5 text-gray-800">{b.nome}</td>
                  <td className="px-3 py-1.5 text-gray-600">{b.fornecedor || "—"}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-gray-600">{b.preco ? `R$ ${String(b.preco).replace(/^R\$\s*/, "")}` : "—"}</td>
                  <td className="px-3 py-1.5 text-xs text-gray-500">
                    {data(b.bloqueado_em)}
                    {b.motivo ? ` · ${b.motivo}` : ""}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <button
                      type="button"
                      onClick={() => desbloquear(b)}
                      disabled={ocupado === b.id}
                      className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                    >
                      {ocupado === b.id ? "…" : "Desbloquear"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
