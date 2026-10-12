// ============================================================
// PDV: o acesso do site ao Bling.
//
// O token do Bling mora no PC do Thiago: a sentinela do Bionic é o ÚNICO
// programa que renova (cada renovação invalida o refresh_token dos outros).
// O vigia da Arena, que já roda no PC a cada 2 minutos e já tem chave do site,
// passou a trazer também o access_token (válido por 6 h) quando ele muda.
// Só o access_token: o refresh_token nunca sai do PC, então o site consegue
// usar o Bling, mas não consegue renovar nem derrubar a sentinela.
//
// Guardado cifrado (AES-256-GCM) na gaveta da Arena (Vercel Blob privado),
// com chave derivada da senha do painel. Trocar a senha do painel só faz o
// site pedir o acesso de novo ao vigia na volta seguinte.
// ============================================================

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { gravar, ler } from "@/lib/arena/gaveta";

const CHAVE = "pdv/acesso";
/** Margem para não usar token que vence no meio de uma venda. */
const FOLGA_MS = 3 * 60 * 1000;
const CACHE_MS = 60 * 1000;

interface Guardado {
  cifra: string;
  iv: string;
  tag: string;
  resumo: string;
  recebidoEm: string;
  expiraEm: string;
  maquina: string | null;
  /** O Bling recusou (401) este token: esperar o vigia trazer outro. */
  recusadoEm: string | null;
}

export interface SituacaoDoAcesso {
  ligado: boolean;
  motivo: string | null;
  recebidoEm: string | null;
  expiraEm: string | null;
  maquina: string | null;
}

function chaveDeCifra(): Buffer | null {
  const segredo = process.env.PAINEL_PASSWORD || "";
  if (!segredo) return null;
  return createHash("sha256").update(`pdv-bling-acesso:${segredo}:${process.env.BLOB_STORE_ID || ""}`).digest();
}

export const resumoDoToken = (token: string) => createHash("sha256").update(token).digest("hex").slice(0, 16);

let cache: { em: number; doc: Guardado | null; token: string | null } | null = null;

export function _limparCacheDoAcesso() {
  cache = null;
}

async function lerGuardado(): Promise<{ doc: Guardado | null; token: string | null }> {
  if (cache && Date.now() - cache.em < CACHE_MS) return cache;
  const { dados } = await ler<Guardado>(CHAVE);
  let token: string | null = null;
  const k = chaveDeCifra();
  if (dados && k) {
    try {
      const d = createDecipheriv("aes-256-gcm", k, Buffer.from(dados.iv, "base64"));
      d.setAuthTag(Buffer.from(dados.tag, "base64"));
      token = Buffer.concat([d.update(Buffer.from(dados.cifra, "base64")), d.final()]).toString("utf8");
    } catch {
      token = null; // senha do painel trocou: o vigia manda de novo
    }
  }
  cache = { em: Date.now(), doc: dados, token };
  return cache;
}

/** O vigia entrega o access_token. Devolve se mudou alguma coisa. */
export async function guardarAcesso(entrada: { token: string; expiraEm: string; maquina: string | null }): Promise<boolean> {
  const k = chaveDeCifra();
  if (!k) throw new Error("PAINEL_PASSWORD não configurada: o site não tem como guardar o acesso cifrado.");
  const token = entrada.token.trim();
  if (!/^[A-Za-z0-9._~+/=-]{20,400}$/.test(token)) throw new Error("Token em formato inesperado.");
  const expira = new Date(entrada.expiraEm);
  if (Number.isNaN(expira.getTime())) throw new Error("Data de validade inválida.");

  const atual = await lerGuardado();
  const resumo = resumoDoToken(token);
  if (atual.doc && atual.doc.resumo === resumo && !atual.doc.recusadoEm && atual.token === token) return false;

  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", k, iv);
  const cifra = Buffer.concat([c.update(token, "utf8"), c.final()]);
  const doc: Guardado = {
    cifra: cifra.toString("base64"),
    iv: iv.toString("base64"),
    tag: c.getAuthTag().toString("base64"),
    resumo,
    recebidoEm: new Date().toISOString(),
    expiraEm: expira.toISOString(),
    maquina: entrada.maquina,
    recusadoEm: null,
  };
  await gravar(CHAVE, doc, "*");
  cache = { em: Date.now(), doc, token };
  return true;
}

/** O token para chamar o Bling agora, ou null com o motivo. */
export async function tokenAtual(): Promise<{ token: string | null; motivo: string | null }> {
  const { doc, token } = await lerGuardado();
  if (!doc) return { token: null, motivo: "O vigia do PC ainda não trouxe o acesso ao Bling." };
  if (!token) return { token: null, motivo: "O acesso guardado não abre (a senha do painel mudou?). O vigia manda outro em até 2 minutos." };
  if (doc.recusadoEm) return { token: null, motivo: "O Bling recusou o acesso atual; esperando a sentinela do PC renovar (até 6 minutos)." };
  if (new Date(doc.expiraEm).getTime() - FOLGA_MS < Date.now()) {
    return { token: null, motivo: "O acesso ao Bling venceu; esperando a sentinela do PC renovar (até 6 minutos)." };
  }
  return { token, motivo: null };
}

/** O Bling respondeu 401 a este token: ninguém mais tenta com ele. */
export async function marcarRecusado(token: string): Promise<void> {
  const { doc } = await lerGuardado();
  if (!doc || doc.resumo !== resumoDoToken(token) || doc.recusadoEm) return;
  const novo = { ...doc, recusadoEm: new Date().toISOString() };
  await gravar(CHAVE, novo, "*");
  if (cache) cache = { ...cache, doc: novo };
}

/** Para o vigia: o site precisa de acesso novo? */
export async function precisaDeAcesso(): Promise<boolean> {
  try {
    const t = await tokenAtual();
    return !t.token;
  } catch {
    return true;
  }
}

export async function situacaoDoAcesso(): Promise<SituacaoDoAcesso> {
  const { doc } = await lerGuardado();
  const t = await tokenAtual();
  return {
    ligado: Boolean(t.token),
    motivo: t.motivo,
    recebidoEm: doc?.recebidoEm ?? null,
    expiraEm: doc?.expiraEm ?? null,
    maquina: doc?.maquina ?? null,
  };
}
