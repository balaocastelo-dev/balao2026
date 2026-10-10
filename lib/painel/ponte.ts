"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PonteComando } from "@/components/crm/comando/tipos";

// ============================================================
// A ponte entre o painel e o servidor do WhatsApp.
//
// Os módulos de gestão do CRM (números do atendimento, clientes, equipe,
// respostas e etiquetas) nasceram dentro da tela de atendimento e recebiam
// dela a "ponte" — o jeito de falar com o servidor da loja já com o ingresso
// do painel. Aqui a mesma ponte existe sozinha, para esses módulos abrirem
// como áreas do /painel, sem carregar o atendimento inteiro por trás.
//
// O ingresso é o mesmo de sempre (/api/painel/socket-ticket): só sai para
// quem já entrou no painel.
// ============================================================

const SERVIDOR = (process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL || "http://localhost:4100").replace(
  /\/$/,
  ""
);

type Ingresso = { ticket: string; exp: number };

export function usePonteDoPainel(opcoes: { comNomesDaEquipe?: boolean } = {}): {
  ponte: PonteComando;
  /** Falso só enquanto os nomes da equipe (quando pedidos) ainda não chegaram. */
  pronta: boolean;
} {
  const ingressoRef = useRef<Ingresso | null>(null);
  const [nomes, setNomes] = useState<Record<string, string>>({});
  const [pronta, setPronta] = useState(!opcoes.comNomesDaEquipe);

  const obterIngresso = useCallback(async (): Promise<string> => {
    const atual = ingressoRef.current;
    // Renova com folga de uma hora, para não vencer no meio de uma gravação.
    if (atual && atual.exp * 1000 - Date.now() > 60 * 60 * 1000) return atual.ticket;

    const res = await fetch("/api/painel/socket-ticket", { cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (res.status === 401) {
      throw new Error("A sessão do painel venceu. Recarregue a página e entre de novo.");
    }
    if (!res.ok || !json?.ticket) {
      throw new Error(json?.erro || "Não consegui o acesso ao servidor do WhatsApp.");
    }
    ingressoRef.current = { ticket: json.ticket, exp: json.exp };
    return json.ticket;
  }, []);

  const chamar = useCallback(
    async <T,>(caminho: string, init: RequestInit = {}): Promise<T> => {
      const ticket = await obterIngresso();

      let resposta: Response;
      try {
        resposta = await fetch(`${SERVIDOR}${caminho}`, {
          ...init,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ticket}`,
            ...((init.headers as Record<string, string>) || {}),
          },
        });
      } catch {
        throw new Error(
          "O servidor do WhatsApp não respondeu. Se o atendimento também estiver fora do ar, é o servidor da loja (VPS) que precisa de atenção."
        );
      }

      const json = await resposta.json().catch(() => ({}));
      if (resposta.status === 404) {
        throw new Error(
          "O servidor da loja ainda não recebeu esta atualização. Rode o deploy na VPS e recarregue a página."
        );
      }
      if (!resposta.ok || json?.ok === false) {
        throw new Error(json?.erro || `O servidor respondeu ${resposta.status}`);
      }
      return json as T;
    },
    [obterIngresso]
  );

  // Nome de quem atende, para os gráficos não mostrarem só o identificador.
  useEffect(() => {
    if (!opcoes.comNomesDaEquipe) return;
    let vivo = true;
    chamar<{ itens: { id: string; nome: string }[] }>("/api/comando/equipe")
      .then((r) => {
        if (!vivo) return;
        setNomes(Object.fromEntries((r.itens || []).map((v) => [String(v.id), v.nome])));
      })
      .catch(() => {
        // Sem os nomes a área abre do mesmo jeito, mostrando o identificador.
      })
      .finally(() => {
        if (vivo) setPronta(true);
      });
    return () => {
      vivo = false;
    };
  }, [chamar, opcoes.comNomesDaEquipe]);

  const ponte = useMemo<PonteComando>(
    () => ({
      chamar,
      // Clicar num cliente leva para o atendimento com a conversa aberta.
      abrirConversa: (chatId: string) => {
        window.location.href = `/painel/crm?conversa=${encodeURIComponent(chatId)}`;
      },
      nomeDoVendedor: (id: string | null) => (id ? nomes[String(id)] || id : null),
    }),
    [chamar, nomes]
  );

  return { ponte, pronta };
}
