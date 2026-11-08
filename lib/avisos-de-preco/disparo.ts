// ============================================================
// "Me avise se baixar" — conferência e envio, chamados pelo agendador de
// preços (app/api/cron/precos, a cada 10 minutos).
//
// O aviso sai pela linha da loja no servidor de WhatsApp da VPS
// (/api/enviar-foto: foto do produto + texto; se a foto falhar, /api/enviar
// só com o texto). As duas rotas registram a mensagem no CRM, então a equipe
// vê a conversa e responde dali. Nada aqui precisa de deploy na VPS.
// ============================================================

import { ticketDeServico, urlDoServidorWhatsApp } from "@/lib/whatsapp-ticket";
import { devoAvisar, ENVIOS_POR_RODADA, mensagemDoAviso, venceu } from "./regras";
import type { AvisoEsperando, ProdutoAgora } from "./banco";

const SITE = "https://www.balao.info";

export class WhatsAppDesconectado extends Error {}

async function chamarVps(caminho: string, corpo: Record<string, unknown>) {
  const ticket = ticketDeServico();
  if (!ticket) throw new WhatsAppDesconectado("Sem PAINEL_PASSWORD na Vercel: o site não fala com a VPS.");
  const r = await fetch(`${urlDoServidorWhatsApp()}${caminho}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ticket}` },
    body: JSON.stringify(corpo),
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  }).catch((e) => {
    throw new WhatsAppDesconectado(`Servidor do WhatsApp fora do ar (${(e as Error).message})`);
  });
  const j = (await r.json().catch(() => ({}))) as { ok?: boolean; erro?: string };
  if (!r.ok || j.ok === false) {
    const erro = j.erro || `Servidor do WhatsApp respondeu ${r.status}`;
    if (/não está conectado|nao esta conectado/i.test(erro)) throw new WhatsAppDesconectado(erro);
    throw new Error(erro);
  }
}

/** Manda o aviso pela linha da loja: foto + legenda; sem foto, só o texto. */
export async function enviarNoWhatsApp(telefone: string, texto: string, imagem?: string): Promise<void> {
  if (imagem && /^https?:\/\//i.test(imagem)) {
    try {
      await chamarVps("/api/enviar-foto", { chat: telefone, url: imagem, legenda: texto, nome: "produto.jpg" });
      return;
    } catch (e) {
      if (e instanceof WhatsAppDesconectado) throw e;
      console.warn("[avisos-de-preco] foto recusada, mando só o texto:", (e as Error).message);
    }
  }
  await chamarVps("/api/enviar", { chat: telefone, texto });
}

export interface Dependencias {
  conferir: () => Promise<{ avisos: AvisoEsperando[]; produtos: Map<string, ProdutoAgora> }>;
  enviar: (telefone: string, texto: string, imagem?: string) => Promise<void>;
  marcarAvisado: (id: string, preco: number) => Promise<void>;
  marcarFalha: (id: string, erro: string, tentativas: number) => Promise<void>;
  marcarVencidos: (ids: string[]) => Promise<void>;
}

export interface ResultadoDaRodada {
  esperando: number;
  enviados: number;
  vencidos: number;
  falhas: number;
  parouPor?: string;
}

/** Tempo máximo de envios por rodada: o agendador inteiro tem 60 s. */
export const PRAZO_DA_RODADA_MS = 15_000;

export async function dispararAvisos(
  deps: Dependencias,
  agora = new Date(),
  prazoMs = PRAZO_DA_RODADA_MS
): Promise<ResultadoDaRodada> {
  const fim = Date.now() + prazoMs;
  const { avisos, produtos } = await deps.conferir();
  const resultado: ResultadoDaRodada = { esperando: avisos.length, enviados: 0, vencidos: 0, falhas: 0 };
  if (avisos.length === 0) return resultado;

  const vencidos: string[] = [];
  for (const a of avisos) {
    if (venceu(a.criadoEm, agora)) {
      vencidos.push(a.id);
      continue;
    }
    const p = produtos.get(a.productId);
    if (!p || !(p.preco > 0) || !devoAvisar(a.precoQuandoPediu, p.preco)) continue;
    if (resultado.enviados >= ENVIOS_POR_RODADA || Date.now() > fim) {
      resultado.parouPor = "limite da rodada (o resto vai na próxima)";
      break;
    }

    const texto = mensagemDoAviso({
      nome: a.nome,
      produto: p.name || a.produtoNome,
      precoQuandoPediu: a.precoQuandoPediu,
      precoAgora: p.preco,
      link: `${SITE}/product/${encodeURIComponent(p.slug || p.id)}`,
    });
    try {
      await deps.enviar(a.telefone, texto, p.image);
      await deps.marcarAvisado(a.id, p.preco);
      resultado.enviados++;
    } catch (e) {
      if (e instanceof WhatsAppDesconectado) {
        // Linha fora do ar: não conta tentativa, tenta tudo na próxima rodada.
        resultado.parouPor = e.message;
        break;
      }
      resultado.falhas++;
      await deps.marcarFalha(a.id, (e as Error).message, a.tentativas);
    }
  }

  if (vencidos.length) {
    await deps.marcarVencidos(vencidos);
    resultado.vencidos = vencidos.length;
  }
  return resultado;
}
