// O que a fase 1 do WhatsApp acrescentou ao balão da mensagem: reação,
// "editada", "apagada", o trecho citado, a linha de ligação e a barra de
// envio do arquivo. Fica aqui, e não no CrmWhatsAppClient.tsx (6 mil linhas),
// para o painel mudar o mínimo e para as regras darem para testar sozinhas.
//
// O servidor (whatsapp-server) manda esses campos junto da mensagem e, quando
// algo muda numa mensagem que já está na tela, um whatsapp:message-update
// { id, chatId, patch }. As funções puras abaixo são o "como juntar".

import type { CrmMensagem } from "@/types/crm";

type Extras = Pick<CrmMensagem, "seq" | "reacoes" | "editadaEm" | "apagada" | "citada" | "ligacao" | "videoRecado">;

/** Os campos novos que vêm do servidor, só os que vieram (para não apagar o que a tela já tinha). */
export function extrasDaMensagem(sm: Record<string, unknown> | null | undefined): Partial<Extras> {
  const saida: Partial<Extras> = {};
  if (!sm) return saida;
  if (typeof sm.seq === "number") saida.seq = sm.seq;
  if (Array.isArray(sm.reacoes)) saida.reacoes = sm.reacoes as Extras["reacoes"];
  if (typeof sm.editadaEm === "number") saida.editadaEm = sm.editadaEm;
  if (sm.apagada === true) saida.apagada = true;
  if (sm.citada && typeof sm.citada === "object") saida.citada = sm.citada as Extras["citada"];
  if (sm.ligacao && typeof sm.ligacao === "object") saida.ligacao = sm.ligacao as Extras["ligacao"];
  if (sm.videoRecado === true) saida.videoRecado = true;
  return saida;
}

/** O maior seq visto até agora (o painel pede o que veio depois dele ao voltar). */
export function maiorSeq(atual: number, ...valores: unknown[]): number {
  let m = atual;
  for (const v of valores) if (typeof v === "number" && Number.isFinite(v) && v > m) m = v;
  return m;
}

export type MudancaDeMensagem = { id?: string; chatId?: string | null; patch?: Partial<CrmMensagem> & { seq?: number } };

/**
 * Aplica um whatsapp:message-update. Devolve o MESMO array quando a mensagem
 * não está na tela (o React não redesenha nada à toa).
 */
export function aplicarMudanca(mensagens: CrmMensagem[], mudanca: MudancaDeMensagem): CrmMensagem[] {
  const id = mudanca?.id;
  const patch = mudanca?.patch;
  if (!id || !patch || typeof patch !== "object") return mensagens;
  const i = mensagens.findIndex((m) => m.id === id);
  if (i < 0) return mensagens;
  const copia = mensagens.slice();
  copia[i] = { ...copia[i], ...patch };
  return copia;
}

/** A data da mensagem mais antiga que a tela tem desta conversa (para "carregar mais antigas"). */
export function maisAntiga(mensagens: { timestamp: number }[]): number | null {
  let menor: number | null = null;
  for (const m of mensagens) if (Number.isFinite(m.timestamp) && (menor === null || m.timestamp < menor)) menor = m.timestamp;
  return menor;
}

// ------------------------------------------------------------------
// Desenho
// ------------------------------------------------------------------

/** "Respondendo a…": a citação que veio do WhatsApp (ou a resposta montada no painel). */
export function TrechoCitado({ m }: { m: CrmMensagem }) {
  const autor = m.citada ? (m.citada.deMim ? "Loja" : m.citada.deMim === false ? "Cliente" : "Mensagem citada") : m.replyTo?.author;
  const texto = m.citada ? m.citada.trecho : m.replyTo?.body;
  if (!m.citada && !m.replyTo) return null;
  return (
    <div className="bg-black/5 border-l-3 border-[#0f9d58] p-1.5 mb-2 rounded text-[11px] text-[#5f6368]">
      <div className="font-bold text-[#0a6e3d]">{autor}</div>
      <div className="line-clamp-2">{texto || "…"}</div>
    </div>
  );
}

/** Mensagem apagada para todos: o aviso no lugar do conteúdo (o texto continua guardado no servidor). */
export function AvisoApagada({ m }: { m: CrmMensagem }) {
  return (
    <p className="italic text-[#5f6368]" title="O texto continua guardado no banco da loja">
      🚫 {m.direction === "in" ? "Mensagem apagada pelo cliente" : "Mensagem apagada"}
    </p>
  );
}

/** O texto da mensagem, com o "editada" quando o cliente (ou a loja) editou. */
export function CorpoDaMensagem({ m }: { m: CrmMensagem }) {
  return (
    <>
      <p>{m.body}</p>
      {m.editadaEm ? (
        <span
          className="block text-[10px] italic text-[#5f6368]"
          title={`Editada em ${new Date(m.editadaEm).toLocaleString("pt-BR")}`}
        >
          editada
        </span>
      ) : null}
    </>
  );
}

const ESTADO_DA_LIGACAO: Record<string, string> = {
  tocando: "tocando…",
  atendida: "atendida",
  encerrada: "encerrada",
  perdida: "perdida",
  recusada: "recusada",
};

/** Ligação recebida, como uma linha na conversa. */
export function LinhaDeLigacao({ m }: { m: CrmMensagem }) {
  if (!m.ligacao) return null;
  const perdida = m.ligacao.estado === "perdida" || m.ligacao.estado === "recusada";
  return (
    <p className={`font-semibold ${perdida ? "text-red-600" : "text-[#0a6e3d]"}`}>
      {m.ligacao.video ? "📹 Ligação de vídeo" : "📞 Ligação de voz"} · {ESTADO_DA_LIGACAO[m.ligacao.estado] || m.ligacao.estado}
    </p>
  );
}

/** As reações embaixo do balão (uma por pessoa). */
export function Reacoes({ m }: { m: CrmMensagem }) {
  if (!m.reacoes?.length) return null;
  return (
    <div className="flex gap-1 mt-1">
      {m.reacoes.map((r) => (
        <span
          key={`${r.de}-${r.emoji}`}
          title={r.de === "loja" ? "Reação da loja" : "Reação do cliente"}
          className="text-xs bg-white border border-[#e3e3e3] rounded-full px-1.5 leading-5"
        >
          {r.emoji}
        </span>
      ))}
    </div>
  );
}

/** Barra de progresso do arquivo que está subindo (upload direto). */
export function BarraDeEnvio({ valor }: { valor?: number }) {
  if (typeof valor !== "number" || valor >= 100) return null;
  return (
    <div className="mt-1 h-1.5 w-full rounded bg-black/10 overflow-hidden" title={`Enviando… ${valor}%`}>
      <div className="h-full bg-[#0f9d58] transition-all" style={{ width: `${Math.max(2, valor)}%` }} />
    </div>
  );
}
