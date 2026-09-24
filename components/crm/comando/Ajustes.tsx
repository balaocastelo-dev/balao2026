"use client";

import { useCallback, useEffect, useState } from "react";
import type { PonteComando, Etiqueta, RespostaRapida } from "./tipos";
import { Secao, Vazio } from "./graficos";

const CORES = ["#0f9d58", "#3b6fd4", "#c2571a", "#7b1fa2", "#00838f", "#5f6368", "#d93025", "#f9a825"];

export default function Ajustes({ ponte }: { ponte: PonteComando }) {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [respostas, setRespostas] = useState<RespostaRapida[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [e, r] = await Promise.all([
        ponte.chamar<{ itens: Etiqueta[] }>("/api/comando/etiquetas"),
        ponte.chamar<{ itens: RespostaRapida[] }>("/api/comando/respostas"),
      ]);
      setEtiquetas(e.itens || []);
      setRespostas(r.itens || []);
      setErro("");
    } catch (ex) {
      setErro(ex instanceof Error ? ex.message : "Não consegui carregar os ajustes.");
    } finally {
      setCarregando(false);
    }
  }, [ponte]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#0f9d58]/30 bg-[#e7f6ec] px-4 py-2.5 text-xs text-[#0a6e3d]">
        O que está nesta tela agora é <strong>da loja</strong>, guardado no servidor: qualquer vendedor,
        em qualquer computador, vê a mesma coisa. Antes, resposta rápida e etiqueta ficavam salvas só
        no navegador de quem criou.
      </div>

      {erro && (
        <div className="rounded-xl border border-[#c2571a]/40 bg-[#fdf1e8] p-3 text-xs text-[#a8471a]">{erro}</div>
      )}

      <RespostasRapidas
        ponte={ponte}
        itens={respostas}
        carregando={carregando}
        aoMudar={carregar}
      />
      <Etiquetas ponte={ponte} itens={etiquetas} carregando={carregando} aoMudar={carregar} />
    </div>
  );
}

function RespostasRapidas({
  ponte,
  itens,
  carregando,
  aoMudar,
}: {
  ponte: PonteComando;
  itens: RespostaRapida[];
  carregando: boolean;
  aoMudar: () => void;
}) {
  const [editando, setEditando] = useState<Partial<RespostaRapida> | null>(null);

  const salvar = async () => {
    if (!editando?.titulo?.trim() || !editando?.texto?.trim()) return;
    await ponte
      .chamar("/api/comando/respostas", { method: "POST", body: JSON.stringify(editando) })
      .catch(() => {});
    setEditando(null);
    aoMudar();
  };

  const excluir = async (id: string) => {
    if (!confirm("Apagar esta resposta rápida para toda a equipe?")) return;
    await ponte.chamar(`/api/comando/respostas/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
    aoMudar();
  };

  return (
    <Secao
      titulo="Respostas rápidas da equipe"
      ajuda="O texto que todo mundo usa. Um atalho (ex.: /horario) deixa mais rápido no dia a dia."
      acao={
        <button
          type="button"
          onClick={() => setEditando({ titulo: "", texto: "", categoria: "", atalho: "" })}
          className="cursor-pointer rounded-lg bg-[#0f9d58] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a6e3d]"
        >
          + Nova resposta
        </button>
      }
    >
      {carregando ? (
        <Vazio texto="Carregando…" />
      ) : itens.length === 0 ? (
        <Vazio texto="Nenhuma resposta rápida cadastrada ainda." />
      ) : (
        <ul className="divide-y divide-[#f0f2f5]">
          {itens.map((r) => (
            <li key={r.id} className="flex items-start justify-between gap-3 py-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#202124]">{r.titulo}</span>
                  {r.atalho && (
                    <span className="rounded bg-[#f0f2f5] px-1.5 font-mono text-[10px] text-[#5f6368]">
                      {r.atalho}
                    </span>
                  )}
                  {r.categoria && (
                    <span className="rounded bg-[#e7f6ec] px-1.5 text-[10px] font-semibold text-[#0a6e3d]">
                      {r.categoria}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-[#5f6368]">{r.texto}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setEditando(r)}
                  className="cursor-pointer rounded-lg border border-[#e3e3e3] px-2 py-1 text-[10px] font-semibold text-[#5f6368] hover:bg-[#f0f2f5]"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => excluir(r.id)}
                  className="cursor-pointer rounded-lg border border-[#c2571a]/40 px-2 py-1 text-[10px] font-semibold text-[#a8471a] hover:bg-[#fdf1e8]"
                >
                  Apagar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editando && (
        <div className="mt-3 space-y-2 rounded-xl border border-[#0f9d58]/40 bg-[#e7f6ec] p-3">
          <div className="flex flex-wrap gap-2">
            <input
              value={editando.titulo || ""}
              onChange={(e) => setEditando({ ...editando, titulo: e.target.value })}
              placeholder="Título (ex.: Horário de funcionamento)"
              className="min-w-[200px] flex-1 rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs outline-none focus:border-[#0f9d58]"
            />
            <input
              value={editando.atalho || ""}
              onChange={(e) => setEditando({ ...editando, atalho: e.target.value })}
              placeholder="Atalho (/horario)"
              className="w-36 rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs outline-none focus:border-[#0f9d58]"
            />
            <input
              value={editando.categoria || ""}
              onChange={(e) => setEditando({ ...editando, categoria: e.target.value })}
              placeholder="Categoria"
              className="w-36 rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs outline-none focus:border-[#0f9d58]"
            />
          </div>
          <textarea
            value={editando.texto || ""}
            onChange={(e) => setEditando({ ...editando, texto: e.target.value })}
            rows={3}
            placeholder="A mensagem que vai ser enviada…"
            className="w-full rounded-lg border border-[#e3e3e3] px-3 py-2 text-xs outline-none focus:border-[#0f9d58]"
          />
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
              className="cursor-pointer rounded-lg bg-[#0f9d58] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a6e3d]"
            >
              Salvar
            </button>
          </div>
        </div>
      )}
    </Secao>
  );
}

function Etiquetas({
  ponte,
  itens,
  carregando,
  aoMudar,
}: {
  ponte: PonteComando;
  itens: Etiqueta[];
  carregando: boolean;
  aoMudar: () => void;
}) {
  const [editando, setEditando] = useState<Partial<Etiqueta> | null>(null);

  const salvar = async () => {
    if (!editando?.nome?.trim()) return;
    await ponte
      .chamar("/api/comando/etiquetas", {
        method: "POST",
        body: JSON.stringify({ id: editando.id, nome: editando.nome, cor: editando.cor || CORES[0] }),
      })
      .catch(() => {});
    setEditando(null);
    aoMudar();
  };

  const excluir = async (e: Etiqueta) => {
    const aviso = e.usos
      ? `Apagar a etiqueta "${e.nome}"? Ela sai de ${e.usos} cliente(s).`
      : `Apagar a etiqueta "${e.nome}"?`;
    if (!confirm(aviso)) return;
    await ponte.chamar(`/api/comando/etiquetas/${encodeURIComponent(e.id)}`, { method: "DELETE" }).catch(() => {});
    aoMudar();
  };

  return (
    <Secao
      titulo="Etiquetas"
      ajuda="Servem para marcar cliente à mão — VIP, orçamento parado, garantia. Os assuntos (PC gamer, notebook…) já são detectados sozinhos."
      acao={
        <button
          type="button"
          onClick={() => setEditando({ nome: "", cor: CORES[0] })}
          className="cursor-pointer rounded-lg bg-[#0f9d58] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a6e3d]"
        >
          + Nova etiqueta
        </button>
      }
    >
      {carregando ? (
        <Vazio texto="Carregando…" />
      ) : itens.length === 0 ? (
        <Vazio texto="Nenhuma etiqueta criada ainda." />
      ) : (
        <div className="flex flex-wrap gap-2">
          {itens.map((e) => (
            <span
              key={e.id}
              className="inline-flex items-center gap-2 rounded-lg border border-[#e3e3e3] bg-white py-1 pl-2 pr-1 text-xs"
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: e.cor }} />
              <span className="font-semibold text-[#202124]">{e.nome}</span>
              <span className="tabular-nums text-[10px] text-[#5f6368]">{e.usos}</span>
              <button
                type="button"
                onClick={() => setEditando(e)}
                className="cursor-pointer rounded px-1 text-[10px] text-[#5f6368] hover:bg-[#f0f2f5]"
              >
                ✎
              </button>
              <button
                type="button"
                onClick={() => excluir(e)}
                className="cursor-pointer rounded px-1 text-[10px] text-[#a8471a] hover:bg-[#fdf1e8]"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {editando && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#0f9d58]/40 bg-[#e7f6ec] p-3">
          <input
            value={editando.nome || ""}
            onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
            placeholder="Nome da etiqueta"
            className="min-w-[180px] flex-1 rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs outline-none focus:border-[#0f9d58]"
          />
          <div className="flex gap-1">
            {CORES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setEditando({ ...editando, cor: c })}
                className={`h-6 w-6 cursor-pointer rounded-full border-2 ${
                  editando.cor === c ? "border-[#202124]" : "border-white"
                }`}
                style={{ background: c }}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
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
            className="cursor-pointer rounded-lg bg-[#0f9d58] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a6e3d]"
          >
            Salvar
          </button>
        </div>
      )}
    </Secao>
  );
}
