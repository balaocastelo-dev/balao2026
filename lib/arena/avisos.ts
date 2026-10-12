// ============================================================
// Arena: o que avisar no WhatsApp, comparando a corrida antes e depois.
//
// Pedido do Thiago (12/10/2026): avisar no grupo quando alguém cruza a linha
// de chegada. Também: a equipe bater a meta e troca de líder da semana (se
// ligado). Cada aviso sai uma vez só (a chave fica guardada no documento
// "avisos" da gaveta). Desde 12/10 (tarde) os valores são em reais.
// ============================================================

import { atualizar } from "./gaveta";
import { reais } from "./valores";
import type { AjustesDoWhatsApp, EstadoDoTelao, PlacarDoPeriodo } from "./tipos";

export interface Aviso {
  chave: string;
  texto: string;
}

const nome = (l: PlacarDoPeriodo["linhas"][number]) => l.piloto.apelido || l.piloto.nome.split(" ")[0];
const RODAPE = "\n\nwww.balao.info/arena";

export function avisosEntre(antes: EstadoDoTelao | null, depois: EstadoDoTelao, w: AjustesDoWhatsApp): Aviso[] {
  if (!antes || !w.ativo || !w.destino) return [];
  const out: Aviso[] = [];
  for (const per of ["semana", "mes"] as const) {
    const a = antes[per];
    const d = depois[per];
    if (!a || !d || a.inicio !== d.inicio) continue; // virou o período: nada a comparar
    const qual = per === "semana" ? "da semana" : "do mês";
    const anterior = new Map(a.linhas.map((l) => [l.piloto.id, l]));

    if (w.meta) {
      for (const l of d.linhas) {
        const x = anterior.get(l.piloto.id);
        if (x && !x.chegou && l.chegou) {
          out.push({
            chave: `meta:${per}:${d.inicio}:${l.piloto.id}`,
            texto: `🏁 *${nome(l)}* cruzou a linha de chegada! Bateu a meta ${qual}: ${reais(l.valor)} de ${reais(l.meta)}.${RODAPE}`,
          });
        }
      }
    }

    if (w.equipe && a.equipe.progresso < 1 && d.equipe.progresso >= 1) {
      const premio = depois.premio && depois.premio.periodo === per ? depois.premio : null;
      const viagem = premio ? ` A viagem${premio.titulo || premio.local ? ` (${premio.titulo || premio.local})` : ""} é de vocês! ✈️` : "";
      out.push({
        chave: `equipe:${per}:${d.inicio}`,
        texto: `🏆 *A equipe bateu a meta ${qual}!* ${reais(d.equipe.valor)} no total.${viagem}${RODAPE}`,
      });
    }

    if (w.lideranca && per === "semana") {
      const liderAntes = a.linhas.find((l) => l.posicao === 1);
      const liderAgora = d.linhas.find((l) => l.posicao === 1);
      if (liderAntes && liderAgora && liderAntes.piloto.id !== liderAgora.piloto.id && liderAgora.valor > 0 && liderAntes.valor > 0) {
        out.push({
          chave: `lider:${d.inicio}:${liderAgora.piloto.id}:${depois.geradoEm.slice(0, 10)}`,
          texto: `🥇 *${nome(liderAgora)}* assumiu a liderança da semana! ${nome(liderAntes)} está logo atrás.${RODAPE}`,
        });
      }
    }
  }
  return out;
}

interface DocDeAvisos {
  enviados: Record<string, string>;
  ultimoErro: string | null;
  ultimoEnvio: string | null;
}

export async function lerAvisos(): Promise<DocDeAvisos> {
  const { ler } = await import("./gaveta");
  return (await ler<DocDeAvisos>("avisos")).dados ?? { enviados: {}, ultimoErro: null, ultimoEnvio: null };
}

/**
 * Manda os avisos ainda não mandados. A chave é marcada antes do envio (para
 * duas gravações ao mesmo tempo não mandarem duas vezes); se o envio falhar,
 * o erro aparece no painel.
 */
export async function dispararAvisos(lista: Aviso[], destino: string, enviar: (destino: string, texto: string) => Promise<void>) {
  if (!lista.length) return;
  let novos: Aviso[] = [];
  await atualizar<DocDeAvisos>("avisos", () => ({ enviados: {}, ultimoErro: null, ultimoEnvio: null }), (doc) => {
    novos = lista.filter((a) => !doc.enviados[a.chave]);
    if (!novos.length) return undefined;
    const agora = new Date().toISOString();
    for (const a of novos) doc.enviados[a.chave] = agora;
    // Guarda só os últimos 300.
    const ordem = Object.entries(doc.enviados).sort((x, y) => y[1].localeCompare(x[1])).slice(0, 300);
    doc.enviados = Object.fromEntries(ordem);
    return doc;
  });
  let erro: string | null = null;
  for (const a of novos) {
    try {
      await enviar(destino, a.texto);
    } catch (e) {
      erro = (e as Error).message;
    }
  }
  if (novos.length) {
    await atualizar<DocDeAvisos>("avisos", () => ({ enviados: {}, ultimoErro: null, ultimoEnvio: null }), (doc) => ({
      ...doc,
      ultimoErro: erro,
      ultimoEnvio: erro ? doc.ultimoEnvio : new Date().toISOString(),
    })).catch(() => {});
  }
}
