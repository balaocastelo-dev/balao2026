"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ConversaDoAgente, PonteComando, SugestaoDoAgente } from "@/components/crm/comando/tipos";

// Selo da JUL.IA no cabeçalho da conversa: se ela está atendendo, se saiu
// (vendedor respondeu, pediu ajuda) e, no modo copiloto, a sugestão dela para
// o vendedor aprovar. Fica num arquivo próprio para não engordar a tela do
// atendimento: se der erro aqui, o atendimento segue.

// Motivos de "não agora" que, para o vendedor, querem dizer "ela está cuidando".
const EM_ATENDIMENTO = ["já respondida", "esperando o cliente terminar", "o PC já está pensando nesta", "a última mensagem é da loja"];

type Props = {
  ponte: PonteComando;
  chatId: string;
  /** Muda quando chega evento "whatsapp:agente" pelo socket: recarrega na hora. */
  sinal?: number;
  produtoNome?: (id: string) => string | null;
};

export default function SeloDoAgente({ ponte, chatId, sinal = 0, produtoNome }: Props) {
  const [conversa, setConversa] = useState<ConversaDoAgente | null>(null);
  const [sugestoes, setSugestoes] = useState<SugestaoDoAgente[]>([]);
  const [aberto, setAberto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const atual = useRef(chatId);
  atual.current = chatId;

  const carregar = useCallback(async () => {
    try {
      const r = await ponte.chamar<{ conversa: ConversaDoAgente; sugestoes: SugestaoDoAgente[] }>(
        `/api/comando/agente/conversas/${encodeURIComponent(chatId)}`
      );
      if (atual.current !== chatId) return;
      setConversa(r.conversa);
      setSugestoes(r.sugestoes || []);
    } catch {
      // Servidor sem o agente (antes do deploy) ou fora do ar: o selo some.
      if (atual.current === chatId) setConversa(null);
    }
  }, [ponte, chatId]);

  useEffect(() => {
    setConversa(null);
    setSugestoes([]);
    setAberto(false);
    carregar();
    const t = setInterval(carregar, 15000);
    return () => clearInterval(t);
  }, [carregar]);

  useEffect(() => {
    if (sinal) carregar();
  }, [sinal, carregar]);

  useEffect(() => {
    if (sugestoes.length) setAberto(true);
  }, [sugestoes.length]);

  const fazer = async (caminho: string) => {
    setOcupado(true);
    setErro("");
    try {
      await ponte.chamar(caminho, { method: "POST", body: "{}" });
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu certo.");
    } finally {
      setOcupado(false);
    }
  };

  if (!conversa || conversa.modo === "desligado") return null;

  const fora = conversa.situacao !== "ativo";
  const atendendo = !fora && conversa.respondida;
  const rotulo = sugestoes.length
    ? `🤖 Sugestão da JUL.IA`
    : fora
      ? `🤖 JUL.IA fora${conversa.motivo ? `: ${conversa.motivo}` : ""}`
      : atendendo
        ? "🤖 JUL.IA atendendo"
        : "🤖 JUL.IA";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        title={conversa.motivo || "Vendedora digital"}
        data-testid="selo-agente"
        className={`max-w-[220px] cursor-pointer truncate rounded-lg border px-3 py-1 text-xs font-bold transition-colors ${
          sugestoes.length
            ? "border-[#f9ab00] bg-[#fef7e0] text-[#8a5300]"
            : atendendo
              ? "border-[#0f9d58]/40 bg-[#e7f6ec] text-[#0a6e3d]"
              : "border-[#e3e3e3] bg-white text-[#5f6368] hover:bg-[#f0f2f5]"
        }`}
      >
        {rotulo}
      </button>

      {aberto && (
        <div className="absolute right-0 top-full z-30 mt-1 w-80 rounded-xl border border-[#e3e3e3] bg-white p-3 text-xs shadow-lg">
          {erro && <div className="mb-2 rounded-lg bg-[#fdf1e8] p-2 text-[#a8471a]">{erro}</div>}

          {sugestoes.map((s) => (
            <div key={s.id} className="mb-3 rounded-lg border border-[#f9ab00]/50 bg-[#fffbf0] p-2">
              <div className="mb-1 font-bold text-[#8a5300]">A JUL.IA sugere responder:</div>
              {s.respostas.map((r, i) => (
                <p key={i} className="mb-1 whitespace-pre-wrap text-[#202124]">
                  {r.tipo === "texto" ? r.texto : `🏷️ ${r.nome || produtoNome?.(r.produtoId) || `produto ${r.produtoId}`} (foto, preço e link)`}
                </p>
              ))}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => fazer(`/api/comando/agente/sugestoes/${encodeURIComponent(s.id)}/enviar`)}
                  className="cursor-pointer rounded-lg bg-[#0f9d58] px-3 py-1 font-bold text-white disabled:opacity-60"
                >
                  Enviar
                </button>
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => fazer(`/api/comando/agente/sugestoes/${encodeURIComponent(s.id)}/descartar`)}
                  className="cursor-pointer rounded-lg border border-[#e3e3e3] px-3 py-1 font-bold text-[#5f6368] disabled:opacity-60"
                >
                  Descartar
                </button>
              </div>
            </div>
          ))}

          <p className="mb-2 text-[#5f6368]">
            {fora
              ? "A JUL.IA não responde esta conversa agora."
              : conversa.pode || !conversa.motivo || EM_ATENDIMENTO.includes(conversa.motivo)
                ? atendendo
                  ? "A JUL.IA está atendendo e responde a próxima mensagem do cliente."
                  : "A JUL.IA responde a próxima mensagem do cliente."
                : `A JUL.IA não vai responder agora (${conversa.motivo}).`}{" "}
            Se você responder ou pegar a conversa, ela sai na hora.
          </p>
          {fora ? (
            <button
              type="button"
              disabled={ocupado}
              onClick={() => fazer(`/api/comando/agente/conversas/${encodeURIComponent(chatId)}/retomar`)}
              className="cursor-pointer rounded-lg border border-[#0f9d58]/40 px-3 py-1 font-bold text-[#0a6e3d] disabled:opacity-60"
            >
              Devolver à JUL.IA
            </button>
          ) : (
            <button
              type="button"
              disabled={ocupado}
              onClick={() => fazer(`/api/comando/agente/conversas/${encodeURIComponent(chatId)}/pausar`)}
              className="cursor-pointer rounded-lg border border-[#e3e3e3] px-3 py-1 font-bold text-[#5f6368] disabled:opacity-60"
            >
              Pausar nesta conversa
            </button>
          )}
        </div>
      )}
    </div>
  );
}
