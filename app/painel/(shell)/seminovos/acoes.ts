"use server";

// ============================================================
// Ações do painel de seminovos (/painel/seminovos). Cada uma confere a
// sessão do painel aqui dentro: uma ação de servidor pode ser chamada direto.
// ============================================================

import { revalidatePath, revalidateTag } from "next/cache";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import {
  apagarSeminovo,
  lerEstoque,
  lerLeads,
  marcarLead,
  mudarSituacao,
  salvarSeminovo,
  urlDaFoto,
  type DadosDoSeminovo,
} from "@/lib/seminovos/dados";
import type { LeadSeminovo, Seminovo, Situacao, StatusDoLead } from "@/lib/seminovos/tipos";
import { TAG_SEMINOVOS } from "@/lib/seminovos/vitrine";

type Resultado<T = undefined> = { ok: true; dados?: T } | { ok: false; erro: string };

async function comSessao<T>(fn: () => Promise<T>): Promise<Resultado<T>> {
  if (!(await isPainelAuthenticated())) return { ok: false, erro: "Sessão do painel vencida. Entre de novo." };
  try {
    return { ok: true, dados: await fn() };
  } catch (e) {
    return { ok: false, erro: (e as Error).message || "Falhou" };
  }
}

/** A página pública mostra a mudança na hora. */
function mexeuNaVitrine() {
  try {
    revalidateTag(TAG_SEMINOVOS, { expire: 0 });
    revalidatePath("/seminovos");
  } catch (e) {
    console.warn("[seminovos] não consegui renovar a página:", (e as Error).message);
  }
}

export type SeminovoDoPainel = Seminovo & { urls: string[] };

export async function carregarPainel(): Promise<Resultado<{ estoque: SeminovoDoPainel[]; leads: LeadSeminovo[] }>> {
  return comSessao(async () => {
    const [estoque, leads] = await Promise.all([lerEstoque(), lerLeads(3)]);
    return { estoque: estoque.map((s) => ({ ...s, urls: s.fotos.map(urlDaFoto) })), leads };
  });
}

export async function salvarAparelho(d: DadosDoSeminovo) {
  const r = await comSessao(() => salvarSeminovo(d));
  if (r.ok) mexeuNaVitrine();
  return r;
}

export async function trocarSituacao(id: string, situacao: Situacao) {
  const r = await comSessao(() => mudarSituacao(id, situacao));
  if (r.ok) mexeuNaVitrine();
  return r;
}

export async function apagarAparelho(id: string) {
  const r = await comSessao(() => apagarSeminovo(id));
  if (r.ok) mexeuNaVitrine();
  return r;
}

export async function marcarStatusDoLead(id: string, criadoEm: string, status: StatusDoLead, nota?: string) {
  return comSessao(() => marcarLead(id, criadoEm, status, nota));
}
