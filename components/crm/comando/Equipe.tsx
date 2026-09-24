"use client";

import { useCallback, useEffect, useState } from "react";
import type { PonteComando } from "./tipos";
import { Secao, Vazio } from "./graficos";

type Vendedor = {
  id: string;
  nome: string;
  cargo: string;
  assinatura: string;
  temPin: boolean;
  protegido: boolean;
  conversas: number;
};

export default function Equipe({ ponte }: { ponte: PonteComando }) {
  const [itens, setItens] = useState<Vendedor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState<Partial<Vendedor> & { pin?: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const r = await ponte.chamar<{ itens: Vendedor[] }>("/api/comando/equipe");
      setItens(r.itens || []);
      setErro("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui carregar a equipe.");
    } finally {
      setCarregando(false);
    }
  }, [ponte]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const salvar = async () => {
    if (!editando?.nome?.trim()) return;
    setSalvando(true);
    setErro("");
    try {
      await ponte.chamar("/api/comando/equipe", {
        method: "POST",
        body: JSON.stringify({
          id: editando.id,
          nome: editando.nome,
          cargo: editando.cargo || "",
          assinatura: editando.assinatura || "",
          pin: editando.pin || null,
        }),
      });
      setEditando(null);
      carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const remover = async (v: Vendedor) => {
    if (!confirm(`Remover ${v.nome} da equipe? O funil pessoal dele também sai.`)) return;
    try {
      await ponte.chamar(`/api/comando/equipe/${encodeURIComponent(v.id)}`, { method: "DELETE" });
      carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui remover.");
    }
  };

  return (
    <div className="space-y-4">
      {erro && (
        <div className="rounded-xl border border-[#c2571a]/40 bg-[#fdf1e8] p-3 text-xs text-[#a8471a]">{erro}</div>
      )}

      <Secao
        titulo="Equipe"
        ajuda="Quem atende pelo CRM. O PIN é o que o vendedor digita para assumir o atendimento no painel."
        acao={
          <button
            type="button"
            onClick={() => setEditando({ nome: "", cargo: "", assinatura: "", pin: "" })}
            className="cursor-pointer rounded-lg bg-[#0f9d58] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a6e3d]"
          >
            + Novo vendedor
          </button>
        }
      >
        {carregando ? (
          <Vazio texto="Carregando…" />
        ) : itens.length === 0 ? (
          <Vazio texto="Nenhum vendedor cadastrado." />
        ) : (
          <ul className="divide-y divide-[#f0f2f5]">
            {itens.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#202124]">{v.nome}</span>
                    {v.cargo && <span className="text-[11px] text-[#5f6368]">{v.cargo}</span>}
                    {v.protegido && (
                      <span
                        className="rounded bg-[#e7f6ec] px-1.5 text-[10px] font-semibold text-[#0a6e3d]"
                        title="Entra pela página pessoal do site (ex.: balao.info/brendon)"
                      >
                        página pessoal
                      </span>
                    )}
                    {!v.temPin && (
                      <span className="rounded bg-[#fdf1e8] px-1.5 text-[10px] font-semibold text-[#a8471a]">
                        sem PIN
                      </span>
                    )}
                  </div>
                  {v.assinatura && (
                    <p className="mt-0.5 truncate text-[11px] text-[#5f6368]">✍️ {v.assinatura}</p>
                  )}
                  <p className="mt-0.5 text-[10px] text-[#5f6368]">
                    {v.conversas} conversa(s) atribuída(s)
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => setEditando({ ...v, pin: "" })}
                    className="cursor-pointer rounded-lg border border-[#e3e3e3] px-2 py-1 text-[11px] font-semibold text-[#5f6368] hover:bg-[#f0f2f5]"
                  >
                    Editar
                  </button>
                  {!v.protegido && (
                    <button
                      type="button"
                      onClick={() => remover(v)}
                      className="cursor-pointer rounded-lg border border-[#c2571a]/40 px-2 py-1 text-[11px] font-semibold text-[#a8471a] hover:bg-[#fdf1e8]"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {editando && (
          <div className="mt-3 space-y-2 rounded-xl border border-[#0f9d58]/40 bg-[#e7f6ec] p-3">
            <div className="flex flex-wrap gap-2">
              <input
                value={editando.nome || ""}
                onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                placeholder="Nome"
                className="min-w-[160px] flex-1 rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs outline-none focus:border-[#0f9d58]"
              />
              <input
                value={editando.cargo || ""}
                onChange={(e) => setEditando({ ...editando, cargo: e.target.value })}
                placeholder="Cargo (ex.: Vendas)"
                className="w-40 rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs outline-none focus:border-[#0f9d58]"
              />
              <input
                value={editando.pin || ""}
                onChange={(e) => setEditando({ ...editando, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                placeholder={editando.id ? "PIN (deixe vazio p/ manter)" : "PIN (4 a 6 números)"}
                inputMode="numeric"
                className="w-52 rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs outline-none focus:border-[#0f9d58]"
              />
            </div>
            <input
              value={editando.assinatura || ""}
              onChange={(e) => setEditando({ ...editando, assinatura: e.target.value })}
              placeholder="Assinatura que vai no fim das mensagens (ex.: — Júlia | Balão da Informática)"
              className="w-full rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs outline-none focus:border-[#0f9d58]"
            />
            <p className="text-[10px] text-[#5f6368]">
              O PIN é pessoal: quem sabe o PIN atende como aquela pessoa e o histórico fica no nome
              dela. Ao editar, deixar o campo vazio mantém o PIN que já existe.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="cursor-pointer rounded-lg border border-[#e3e3e3] bg-white px-3 py-1.5 text-xs font-semibold text-[#5f6368]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvar}
                disabled={salvando || !editando.nome?.trim()}
                className="cursor-pointer rounded-lg bg-[#0f9d58] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a6e3d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salvando ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        )}
      </Secao>
    </div>
  );
}
