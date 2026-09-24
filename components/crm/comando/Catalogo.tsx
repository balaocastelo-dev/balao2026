"use client";

import { useCallback, useEffect, useState } from "react";
import { Secao, Vazio } from "./graficos";

// Catálogo dentro do CRM.
//
// Fala direto com a API do próprio site (mesma origem, então a sessão do
// painel viaja junto) — não com o servidor da VPS, que só tem um espelho de
// leitura do catálogo. Editar aqui muda o preço no site na mesma hora, por
// isso cada alteração pede confirmação mostrando o valor velho e o novo.

type Produto = {
  id: string;
  name: string;
  price: string | number;
  image?: string;
  category?: string;
  description?: string;
  cost?: string | number | null;
  slug?: string;
};

const PAGINA = 40;

export default function Catalogo() {
  const [itens, setItens] = useState<Produto[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [editando, setEditando] = useState<Produto | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const p = new URLSearchParams({ page: String(pagina), limit: String(PAGINA), sort: "price_asc" });
      if (buscaAplicada) p.set("search", buscaAplicada);
      const r = await fetch(`/api/products?${p.toString()}`);
      const j = await r.json();
      setItens(j.products || []);
      setTotal(j.total || 0);
      setErro("");
    } catch {
      setErro("Não consegui carregar o catálogo.");
    } finally {
      setCarregando(false);
    }
  }, [pagina, buscaAplicada]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const salvar = async () => {
    if (!editando) return;
    const original = itens.find((i) => i.id === editando.id);
    const precoMudou = original && String(original.price) !== String(editando.price);
    if (
      precoMudou &&
      !confirm(
        `Mudar o preço de "${editando.name}" de R$ ${original?.price} para R$ ${editando.price}?\n\nO valor muda no site e no CRM na mesma hora.`
      )
    ) {
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      const r = await fetch(`/api/products/${encodeURIComponent(editando.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editando.name,
          price: String(editando.price).replace(",", "."),
          category: editando.category || "",
          description: editando.description || "",
          cost: editando.cost === "" || editando.cost === null ? null : editando.cost,
        }),
      });
      if (r.status === 401) {
        throw new Error("Sua sessão do painel expirou. Entre de novo em /crm e tente outra vez.");
      }
      if (!r.ok) throw new Error(`O site respondeu ${r.status}`);
      setAviso(`"${editando.name}" atualizado.`);
      setEditando(null);
      carregar();
      setTimeout(() => setAviso(""), 4000);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui salvar o produto.");
    } finally {
      setSalvando(false);
    }
  };

  const paginas = Math.max(1, Math.ceil(total / PAGINA));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#0f9d58]/30 bg-[#e7f6ec] px-4 py-2.5 text-xs text-[#0a6e3d]">
        O que você mudar aqui vale <strong>no site e no CRM na mesma hora</strong>. Só quem entrou com
        a senha do painel consegue alterar.
      </div>

      {erro && (
        <div className="rounded-xl border border-[#c2571a]/40 bg-[#fdf1e8] p-3 text-xs text-[#a8471a]">{erro}</div>
      )}
      {aviso && (
        <div className="rounded-xl border border-[#0f9d58]/40 bg-[#e7f6ec] p-3 text-xs font-semibold text-[#0a6e3d]">
          ✓ {aviso}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#e3e3e3] bg-white p-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setBuscaAplicada(busca.trim());
              setPagina(1);
            }
          }}
          placeholder="Buscar produto pelo nome…"
          className="min-w-[220px] flex-1 rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs outline-none focus:border-[#0f9d58]"
        />
        <button
          type="button"
          onClick={() => {
            setBuscaAplicada(busca.trim());
            setPagina(1);
          }}
          className="cursor-pointer rounded-lg bg-[#0f9d58] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a6e3d]"
        >
          Buscar
        </button>
        {buscaAplicada && (
          <button
            type="button"
            onClick={() => {
              setBusca("");
              setBuscaAplicada("");
              setPagina(1);
            }}
            className="cursor-pointer text-xs font-semibold text-[#c2571a] hover:underline"
          >
            Limpar
          </button>
        )}
      </div>

      <Secao
        titulo={`Produtos (${total.toLocaleString("pt-BR")})`}
        ajuda="Do mais barato para o mais caro. Clique em Editar para mudar nome, preço, custo, categoria ou descrição."
      >
        {carregando && itens.length === 0 ? (
          <Vazio texto="Carregando…" />
        ) : itens.length === 0 ? (
          <Vazio texto="Nenhum produto encontrado." />
        ) : (
          <ul className="divide-y divide-[#f0f2f5]">
            {itens.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-lg border border-[#e3e3e3] object-contain"
                  />
                ) : (
                  <span className="h-10 w-10 shrink-0 rounded-lg border border-[#e3e3e3] bg-[#f0f2f5]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[#202124]">{p.name}</p>
                  <p className="text-[11px] text-[#5f6368]">
                    {p.category || "sem categoria"}
                    {p.cost ? ` · custo R$ ${p.cost}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold tabular-nums text-[#0a6e3d]">
                  R$ {p.price}
                </span>
                <button
                  type="button"
                  onClick={() => setEditando({ ...p })}
                  className="shrink-0 cursor-pointer rounded-lg border border-[#e3e3e3] px-2 py-1 text-[11px] font-semibold text-[#5f6368] hover:bg-[#f0f2f5]"
                >
                  Editar
                </button>
              </li>
            ))}
          </ul>
        )}

        {paginas > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs">
            <button
              type="button"
              disabled={pagina <= 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              className="cursor-pointer rounded-lg border border-[#e3e3e3] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹ Anterior
            </button>
            <span className="tabular-nums text-[#5f6368]">
              {pagina} de {paginas}
            </span>
            <button
              type="button"
              disabled={pagina >= paginas}
              onClick={() => setPagina((p) => p + 1)}
              className="cursor-pointer rounded-lg border border-[#e3e3e3] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Próxima ›
            </button>
          </div>
        )}
      </Secao>

      {editando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setEditando(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-base font-bold text-[#202124]">Editar produto</h3>
            <div className="space-y-2">
              <Campo rotulo="Nome">
                <input
                  value={editando.name}
                  onChange={(e) => setEditando({ ...editando, name: e.target.value })}
                  className="w-full rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs outline-none focus:border-[#0f9d58]"
                />
              </Campo>
              <div className="flex gap-2">
                <Campo rotulo="Preço de venda (R$)">
                  <input
                    value={String(editando.price)}
                    onChange={(e) => setEditando({ ...editando, price: e.target.value })}
                    inputMode="decimal"
                    className="w-full rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs tabular-nums outline-none focus:border-[#0f9d58]"
                  />
                </Campo>
                <Campo rotulo="Custo (R$)">
                  <input
                    value={editando.cost === null || editando.cost === undefined ? "" : String(editando.cost)}
                    onChange={(e) => setEditando({ ...editando, cost: e.target.value })}
                    inputMode="decimal"
                    className="w-full rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs tabular-nums outline-none focus:border-[#0f9d58]"
                  />
                </Campo>
              </div>
              <Campo rotulo="Categoria">
                <input
                  value={editando.category || ""}
                  onChange={(e) => setEditando({ ...editando, category: e.target.value })}
                  className="w-full rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs outline-none focus:border-[#0f9d58]"
                />
              </Campo>
              <Campo rotulo="Descrição">
                <textarea
                  value={editando.description || ""}
                  onChange={(e) => setEditando({ ...editando, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-[#e3e3e3] px-3 py-2 text-xs outline-none focus:border-[#0f9d58]"
                />
              </Campo>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="cursor-pointer rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs font-semibold text-[#5f6368]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvar}
                disabled={salvando}
                className="cursor-pointer rounded-lg bg-[#0f9d58] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#0a6e3d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salvando ? "Salvando…" : "Salvar no site"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#5f6368]">
        {rotulo}
      </span>
      {children}
    </label>
  );
}
