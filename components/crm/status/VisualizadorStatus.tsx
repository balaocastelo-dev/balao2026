"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PonteStatus, StatusRecebido } from "./tipos";
import { formatarQuando, tempoRelativo } from "./util";

const DURACAO_MS = 6000; // texto e foto; vídeo usa a duração do próprio vídeo

interface Grupo {
  autor: string;
  nome: string;
  itens: StatusRecebido[];
  temNovo: boolean;
  ultimo: string;
}

function Avatar({ fontes, nome, anel }: { fontes: string[]; nome: string; anel: "novo" | "visto" }) {
  const [falhou, setFalhou] = useState<string[]>([]);
  const src = fontes.find((f) => !falhou.includes(f));
  return (
    <span
      className={`shrink-0 rounded-full p-[2px] ${anel === "novo" ? "bg-gradient-to-tr from-[#0f9d58] to-[#34d399]" : "bg-[#c4c7c5]"}`}
    >
      <span className="w-11 h-11 rounded-full border-2 border-white overflow-hidden bg-[#0f9d58] text-white font-bold flex items-center justify-center">
        {src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={src} alt="" className="w-full h-full object-cover" onError={() => setFalhou((f) => [...f, src])} />
        ) : (
          (nome || "?").charAt(0).toUpperCase()
        )}
      </span>
    </span>
  );
}

export default function VisualizadorStatus({ ponte, itens, recarregar }: { ponte: PonteStatus; itens: StatusRecebido[]; recarregar: () => void }) {
  const [vistosLocais, setVistosLocais] = useState<Set<string>>(new Set());
  const grupos = useMemo<Grupo[]>(() => {
    const mapa = new Map<string, Grupo>();
    for (const s of itens) {
      const g = mapa.get(s.autor) || {
        autor: s.autor,
        nome: ponte.nomeDoContato(s.autor) || s.autorNome || "Contato",
        itens: [],
        temNovo: false,
        ultimo: s.recebidoEm,
      };
      g.itens.push(s);
      if (!s.vistoEm && !vistosLocais.has(s.id)) g.temNovo = true;
      if (s.recebidoEm > g.ultimo) g.ultimo = s.recebidoEm;
      mapa.set(s.autor, g);
    }
    // Não vistos primeiro, depois os mais recentes.
    return [...mapa.values()].sort((a, b) => Number(b.temNovo) - Number(a.temNovo) || b.ultimo.localeCompare(a.ultimo));
  }, [itens, ponte, vistosLocais]);

  const [aberto, setAberto] = useState<{ grupo: number; item: number } | null>(null);
  const [pausado, setPausado] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [resposta, setResposta] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const grupo = aberto ? grupos[aberto.grupo] : null;
  const atual = grupo && aberto ? grupo.itens[aberto.item] : null;

  const marcarVisto = useCallback(
    (s: StatusRecebido) => {
      if (s.vistoEm || vistosLocais.has(s.id)) return;
      setVistosLocais((v) => new Set(v).add(s.id));
      ponte.chamar("/api/status/recebidos/visto", { method: "POST", body: JSON.stringify({ ids: [s.id] }) }).catch(() => {});
    },
    [ponte, vistosLocais]
  );

  const abrir = (gi: number) => {
    const g = grupos[gi];
    const primeiroNovo = g.itens.findIndex((s) => !s.vistoEm && !vistosLocais.has(s.id));
    setAberto({ grupo: gi, item: primeiroNovo >= 0 ? primeiroNovo : 0 });
    setProgresso(0);
    setPausado(false);
  };

  const avancar = useCallback(() => {
    setProgresso(0);
    setAberto((a) => {
      if (!a) return a;
      const g = grupos[a.grupo];
      if (a.item + 1 < g.itens.length) return { grupo: a.grupo, item: a.item + 1 };
      // Terminou este contato: segue para o próximo que tem status.
      if (a.grupo + 1 < grupos.length) return { grupo: a.grupo + 1, item: 0 };
      return null;
    });
  }, [grupos]);

  const voltar = () => {
    setProgresso(0);
    setAberto((a) => {
      if (!a) return a;
      if (a.item > 0) return { grupo: a.grupo, item: a.item - 1 };
      if (a.grupo > 0) return { grupo: a.grupo - 1, item: grupos[a.grupo - 1].itens.length - 1 };
      return a;
    });
  };

  // Marca como visto no painel ao exibir e controla o avanço automático.
  useEffect(() => {
    if (!atual) return;
    marcarVisto(atual);
  }, [atual, marcarVisto]);

  useEffect(() => {
    if (!atual || pausado || atual.tipo === "video") return;
    const inicio = Date.now() - progresso * DURACAO_MS;
    const t = setInterval(() => {
      const p = Math.min(1, (Date.now() - inicio) / DURACAO_MS);
      setProgresso(p);
      if (p >= 1) {
        clearInterval(t);
        avancar();
      }
    }, 80);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atual?.id, pausado, avancar]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (pausado) v.pause();
    else v.play().catch(() => {});
  }, [pausado, atual?.id]);

  useEffect(() => {
    if (!aberto) return;
    const tecla = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowRight") avancar();
      else if (e.key === "ArrowLeft") voltar();
      else if (e.key === " ") {
        e.preventDefault();
        setPausado((p) => !p);
      } else if (e.key === "Escape") setAberto(null);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, avancar]);

  if (!grupos.length) {
    return (
      <div className="text-center py-16 text-sm text-[#5f6368]">
        <p className="font-semibold text-[#202124]">Nenhum status dos contatos nas últimas 24 h.</p>
        <p className="mt-1">Os status novos aparecem aqui sozinhos assim que os contatos publicam.</p>
        <button onClick={recarregar} className="mt-4 text-xs font-semibold text-[#0a6e3d] underline cursor-pointer">
          Atualizar
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-4 min-h-[480px]">
      <ul className="space-y-1 overflow-y-auto max-h-[70vh]" aria-label="Contatos com status">
        {grupos.map((g, i) => (
          <li key={g.autor}>
            <button
              onClick={() => abrir(i)}
              className={`w-full flex items-center gap-3 rounded-xl px-2 py-2 text-left cursor-pointer ${
                aberto?.grupo === i ? "bg-[#e7f6ec]" : "hover:bg-[#f0f2f5]"
              }`}
            >
              <Avatar fontes={ponte.fotoDoContato(g.autor)} nome={g.nome} anel={g.temNovo ? "novo" : "visto"} />
              <span className="min-w-0">
                <span className={`block truncate text-sm ${g.temNovo ? "font-bold text-[#202124]" : "text-[#3c4043]"}`}>{g.nome}</span>
                <span className="block text-[11px] text-[#5f6368]">
                  {g.itens.length} status · {tempoRelativo(g.ultimo)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl bg-[#111b21] text-white relative overflow-hidden flex flex-col min-h-[480px]">
        {!atual || !grupo || !aberto ? (
          <div className="m-auto text-center text-sm text-white/70 px-6">
            Escolha um contato para ver os status.
            <span className="block text-[11px] mt-2 text-white/50">← → navegam · espaço pausa · Esc fecha</span>
          </div>
        ) : (
          <>
            <div className="absolute top-2 left-3 right-3 flex gap-1 z-20" aria-hidden>
              {grupo.itens.map((s, i) => (
                <span key={s.id} className="flex-1 h-0.5 bg-white/30 rounded overflow-hidden">
                  <span
                    className="block h-full bg-white"
                    style={{ width: i < aberto.item ? "100%" : i === aberto.item ? `${progresso * 100}%` : "0%" }}
                  />
                </span>
              ))}
            </div>
            <div className="absolute top-5 left-3 right-3 flex items-center gap-2 z-20">
              <Avatar fontes={ponte.fotoDoContato(grupo.autor)} nome={grupo.nome} anel="visto" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{grupo.nome}</div>
                <div className="text-[11px] text-white/70">{formatarQuando(atual.recebidoEm)}</div>
              </div>
              <button
                onClick={() => setPausado((p) => !p)}
                aria-label={pausado ? "Continuar" : "Pausar"}
                className="rounded-full bg-white/15 hover:bg-white/25 w-8 h-8 cursor-pointer"
              >
                {pausado ? "▶" : "❚❚"}
              </button>
              <button onClick={() => setAberto(null)} aria-label="Fechar" className="rounded-full bg-white/15 hover:bg-white/25 w-8 h-8 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="flex-1 relative flex items-center justify-center pt-16 pb-2">
              {atual.tipo === "texto" ? (
                <p className="px-8 text-center text-xl leading-snug whitespace-pre-wrap">{atual.texto}</p>
              ) : atual.tipo === "video" ? (
                <video
                  key={atual.id}
                  ref={videoRef}
                  src={ponte.urlMidia(atual.midia)}
                  autoPlay
                  playsInline
                  className="max-h-[60vh] max-w-full"
                  onTimeUpdate={(e) => {
                    const v = e.currentTarget;
                    if (v.duration) setProgresso(v.currentTime / v.duration);
                  }}
                  onEnded={avancar}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={atual.id} src={ponte.urlMidia(atual.midia)} alt="" className="max-h-[60vh] max-w-full object-contain" />
              )}
              {/* Toque na esquerda volta, na direita avança */}
              <button aria-label="Status anterior" onClick={voltar} className="absolute inset-y-0 left-0 w-1/3 cursor-pointer" />
              <button aria-label="Próximo status" onClick={avancar} className="absolute inset-y-0 right-0 w-1/3 cursor-pointer" />
            </div>

            {atual.tipo !== "texto" && atual.texto && (
              <p className="px-4 pb-2 text-center text-sm text-white/90 whitespace-pre-wrap">{atual.texto}</p>
            )}

            <form
              className="flex gap-2 p-3 border-t border-white/10"
              onSubmit={(e) => {
                e.preventDefault();
                if (!resposta.trim()) return;
                ponte.responderStatus(atual, resposta.trim());
                setResposta("");
                setPausado(false);
              }}
            >
              <input
                id="status-resposta"
                value={resposta}
                onFocus={() => setPausado(true)}
                onChange={(e) => setResposta(e.target.value)}
                placeholder={`Responder a ${grupo.nome.split(" ")[0]}…`}
                className="flex-1 rounded-full bg-white/10 px-4 py-2 text-sm outline-none placeholder:text-white/50 focus:bg-white/15"
              />
              <button type="submit" className="rounded-full bg-[#00a884] hover:bg-[#008f6f] px-4 text-sm font-bold cursor-pointer">
                Enviar
              </button>
            </form>
          </>
        )}
      </div>
      <p className="md:col-span-2 text-[11px] text-[#5f6368]">
        Para receber os status, o WhatsApp da loja marca como visto todo status que chega — os contatos veem a loja entre quem visualizou. O
        “novo/visto” desta tela é do painel.
      </p>
    </div>
  );
}
