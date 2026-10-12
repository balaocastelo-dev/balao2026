// ============================================================
// Arena: ligar o vigia do PC sem arquivo de chave (pareamento).
//
// Em 12/10 a chave baixada pelo painel caiu no computador errado (o Chrome
// do Thiago estava em outra máquina). Agora o vigia pede para entrar:
//
//   1. vigia → POST /api/arena/vigia/parear {maquina}
//      ← {pedido, token, codigo}   (o token fica só com o vigia)
//   2. o painel mostra "DESKTOP-… quer ligar o vigia · código 4821 · Aprovar"
//   3. aprovar gera a chave nova e a deixa guardada para aquele pedido
//   4. vigia → GET /api/arena/vigia/parear?pedido=… (Bearer token)
//      ← {chave} uma vez só; o pedido é apagado
//
// Um pedido por vez, vale 15 minutos. A chave só sai para quem tem o token
// do pedido, e o token só existe no vigia que pediu.
// ============================================================

import { createHash, randomBytes, randomInt, timingSafeEqual } from "crypto";
import { atualizar, ler } from "./gaveta";
import { gerarChaveDoVigia } from "./dados";

const VALIDADE_MS = 15 * 60_000;

interface Pedido {
  id: string;
  tokenHash: string;
  codigo: string;
  maquina: string;
  criadoEm: string;
  aprovadoEm: string | null;
  chave: string | null;
}

interface DocDePareamento {
  pedido: Pedido | null;
}

const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const vivo = (p: Pedido | null, agora = Date.now()) => Boolean(p && agora - Date.parse(p.criadoEm) < VALIDADE_MS);

export interface PedidoPublico {
  id: string;
  codigo: string;
  maquina: string;
  criadoEm: string;
  aprovado: boolean;
}

/** O vigia pede para entrar. Substitui qualquer pedido anterior. */
export async function pedirPareamento(maquina: string): Promise<{ pedido: string; token: string; codigo: string }> {
  const token = randomBytes(24).toString("hex");
  const p: Pedido = {
    id: randomBytes(8).toString("hex"),
    tokenHash: hash(token),
    codigo: String(randomInt(1000, 10000)),
    maquina: String(maquina || "computador").replace(/[^\w .-]/g, "").slice(0, 40) || "computador",
    criadoEm: new Date().toISOString(),
    aprovadoEm: null,
    chave: null,
  };
  await atualizar<DocDePareamento>("pareamento", () => ({ pedido: null }), () => ({ pedido: p }));
  return { pedido: p.id, token, codigo: p.codigo };
}

/** O que o painel mostra (sem token nem chave). */
export async function pedidoPendente(): Promise<PedidoPublico | null> {
  const p = (await ler<DocDePareamento>("pareamento")).dados?.pedido ?? null;
  if (!p || !vivo(p) || p.chave) return null;
  return { id: p.id, codigo: p.codigo, maquina: p.maquina, criadoEm: p.criadoEm, aprovado: Boolean(p.aprovadoEm) };
}

/** O painel aprova: gera a chave nova (a anterior para de valer) e guarda para o vigia buscar. */
export async function aprovarPareamento(id: string, codigo: string): Promise<void> {
  const atual = (await ler<DocDePareamento>("pareamento")).dados?.pedido ?? null;
  if (!atual || atual.id !== id || !vivo(atual)) throw new Error("O pedido do computador venceu. Rode o instalador de novo.");
  if (String(codigo).trim() !== atual.codigo) throw new Error("O código não confere com o que apareceu no computador.");
  const chave = await gerarChaveDoVigia();
  await atualizar<DocDePareamento>("pareamento", () => ({ pedido: null }), (doc) => {
    if (!doc.pedido || doc.pedido.id !== id) throw new Error("Chegou outro pedido no meio. Aprove o novo.");
    doc.pedido.aprovadoEm = new Date().toISOString();
    doc.pedido.chave = chave;
    return doc;
  });
}

export async function recusarPareamento() {
  await atualizar<DocDePareamento>("pareamento", () => ({ pedido: null }), () => ({ pedido: null }));
}

/** O vigia busca a chave (uma vez só). null = ainda não aprovado. */
export async function buscarChavePareada(id: string, token: string): Promise<{ chave: string } | { erro: string } | null> {
  const atual = (await ler<DocDePareamento>("pareamento")).dados?.pedido ?? null;
  if (!atual || atual.id !== id || !vivo(atual)) return { erro: "Pedido vencido ou trocado. Rode de novo." };
  const a = Buffer.from(hash(token || ""));
  const b = Buffer.from(atual.tokenHash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { erro: "Token do pedido inválido." };
  if (!atual.chave) return null;
  const chave = atual.chave;
  await atualizar<DocDePareamento>("pareamento", () => ({ pedido: null }), () => ({ pedido: null }));
  return { chave };
}
