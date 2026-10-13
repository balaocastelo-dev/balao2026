"use client";

import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { trackEvent, trackWhatsAppClick } from "@/lib/tracking";
import { montarMensagem } from "@/lib/landing/rede";
import type { Assistente } from "@/lib/landing/tipos";

/**
 * O orçamento em três toques: a pessoa responde duas ou três perguntas com
 * botões e a mensagem do WhatsApp já sai escrita, com o que o atendente
 * precisa para responder de primeira (modelo, defeito, uso, orçamento).
 * Quem não quer responder pode chamar direto a qualquer momento.
 */
export default function AssistenteDeOrcamento({ assistente, origem }: { assistente: Assistente; origem: string }) {
  const { perguntas } = assistente;
  const [passo, setPasso] = useState(0);
  const [respostas, setRespostas] = useState<(string | string[])[]>(() => perguntas.map((p) => (p.varias ? [] : "")));

  const terminou = passo >= perguntas.length;
  const atual = perguntas[Math.min(passo, perguntas.length - 1)];

  const mensagem = useMemo(
    () =>
      montarMensagem(
        assistente.abertura,
        perguntas.map((p, i) => ({ rotulo: p.rotulo, valor: respostas[i] })),
        assistente.fecho
      ),
    [assistente.abertura, assistente.fecho, perguntas, respostas]
  );
  const link = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(mensagem)}`;

  const escolher = (opcao: string) => {
    const novas = [...respostas];
    if (atual.varias) {
      const lista = Array.isArray(novas[passo]) ? [...(novas[passo] as string[])] : [];
      novas[passo] = lista.includes(opcao) ? lista.filter((o) => o !== opcao) : [...lista, opcao];
      setRespostas(novas);
      return;
    }
    novas[passo] = opcao;
    setRespostas(novas);
    trackEvent("assistente_resposta", { page_path: `/${origem}`, source: `assistente_${origem}`, label: `${atual.rotulo}: ${opcao}` });
    setPasso(passo + 1);
  };

  const marcada = (opcao: string) => {
    const r = respostas[passo];
    return Array.isArray(r) ? r.includes(opcao) : r === opcao;
  };

  const enviar = (tipo: "completo" | "direto") =>
    trackWhatsAppClick({
      page_path: `/${origem}`,
      source: `assistente_${origem}`,
      label: tipo === "completo" ? "Assistente completo" : `Assistente parado na pergunta ${passo + 1}`,
    });

  const progresso = Math.round((Math.min(passo, perguntas.length) / perguntas.length) * 100);

  return (
    <div className="cpt-assistente" id="orcamento">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="cpt-h3">{assistente.titulo}</p>
          <p className="mt-1 text-[0.9375rem] leading-snug text-[var(--cpt-texto-3)]">{assistente.texto}</p>
        </div>
        <p className="shrink-0 text-[0.8125rem] font-semibold text-[var(--cpt-texto-3)]" aria-live="polite">
          {terminou ? "Pronto" : `${passo + 1} de ${perguntas.length}`}
        </p>
      </div>

      <div className="cpt-progresso mt-4" aria-hidden>
        <span style={{ width: `${terminou ? 100 : progresso}%` }} />
      </div>

      {!terminou ? (
        <fieldset className="mt-5">
          <legend className="text-[1.0625rem] font-bold leading-snug">{atual.pergunta}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {atual.opcoes.map((opcao) => (
              <button
                key={opcao}
                type="button"
                className="cpt-opcao"
                aria-pressed={marcada(opcao)}
                onClick={() => escolher(opcao)}
              >
                {opcao}
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            {passo > 0 ? (
              <button type="button" className="text-sm font-semibold text-[var(--cpt-texto-3)] underline-offset-4 hover:underline" onClick={() => setPasso(passo - 1)}>
                Voltar
              </button>
            ) : (
              <span />
            )}
            {atual.varias ? (
              <button type="button" className="cpt-botao cpt-botao--linha !min-h-[2.75rem] !py-2" onClick={() => setPasso(passo + 1)}>
                Continuar
              </button>
            ) : (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => enviar("direto")}
                className="text-sm font-semibold text-[var(--cpt-texto-2)] underline underline-offset-4 hover:text-white"
              >
                Prefiro falar direto
              </a>
            )}
          </div>
        </fieldset>
      ) : (
        <div className="mt-5">
          <p className="text-[0.875rem] font-semibold text-[var(--cpt-texto-3)]">A mensagem que vai para o WhatsApp</p>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-2xl bg-[var(--cpt-carbono)] p-4 font-[inherit] text-[0.9375rem] leading-relaxed text-[var(--cpt-texto-2)]">
            {mensagem}
          </pre>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => enviar("completo")}
            className="cpt-botao cpt-botao--acao mt-4 w-full"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            {assistente.botao}
          </a>
          <button
            type="button"
            className="mt-3 w-full text-sm font-semibold text-[var(--cpt-texto-3)] underline-offset-4 hover:underline"
            onClick={() => setPasso(0)}
          >
            Mudar as respostas
          </button>
        </div>
      )}
    </div>
  );
}
