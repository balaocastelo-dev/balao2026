// ============================================================
// Arena: pontua um lote de documentos do Bling levando em conta os vizinhos.
//
// Dois pontos dependem de outros documentos:
//  - orçamento repetido (mesmo vendedor, cliente e dia): só o primeiro conta;
//  - venda depois de orçamento para o mesmo cliente: bônus de conversão.
// Por isso o lote é pontuado junto com os orçamentos que já estão no banco.
// Função pura: a gravação e o "Recalcular" do painel usam a mesma.
// ============================================================

import { somarDias } from "./periodos";
import { pontuar, type DocumentoDoBling, type Pontuacao, type RegrasDePontos } from "./pontos";

export interface OrcamentoConhecido {
  blingId: string;
  contatoId: string | null;
  vendedorBlingId: string | null;
  data: string;
  total: number;
  /** Status já gravado (só os que NÃO estão no lote). */
  status: string;
}

const numId = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
};

export function pontuarLote(
  docs: DocumentoDoBling[],
  conhecidos: OrcamentoConhecido[],
  regras: RegrasDePontos
): Map<string, Pontuacao> {
  const resultado = new Map<string, Pontuacao>();
  const noLote = new Set(docs.filter((d) => d.tipo === "orcamento").map((d) => d.blingId));

  // 1) orçamentos: quem passa do mínimo é candidato; no grupo, o menor id conta.
  type Cand = { blingId: string; contatoId: string | null; vendedorBlingId: string | null; data: string; valido: boolean };
  const candidatos: Cand[] = [];
  for (const c of conhecidos) {
    if (noLote.has(c.blingId)) continue;
    candidatos.push({ ...c, valido: c.status === "valido" });
  }
  const orcLote = docs.filter((d) => d.tipo === "orcamento");
  for (const d of orcLote) {
    const semVizinhos = pontuar(d, regras, {});
    candidatos.push({
      blingId: d.blingId,
      contatoId: d.contatoId,
      vendedorBlingId: d.vendedorBlingId,
      data: d.data,
      valido: semVizinhos.status === "valido",
    });
  }
  const primeiroDoGrupo = new Map<string, string>();
  for (const c of candidatos) {
    if (!c.valido || !c.contatoId) continue;
    const chave = `${c.contatoId}|${c.vendedorBlingId ?? ""}|${c.data}`;
    const atual = primeiroDoGrupo.get(chave);
    if (!atual || numId(c.blingId) < numId(atual)) primeiroDoGrupo.set(chave, c.blingId);
  }
  const orcValidos: Cand[] = [];
  for (const d of orcLote) {
    const chave = `${d.contatoId}|${d.vendedorBlingId ?? ""}|${d.data}`;
    const repetido = Boolean(d.contatoId) && primeiroDoGrupo.has(chave) && primeiroDoGrupo.get(chave) !== d.blingId;
    const p = pontuar(d, regras, { repetidoNoDia: repetido });
    resultado.set(`orcamento:${d.blingId}`, p);
  }
  for (const c of candidatos) {
    const p = noLote.has(c.blingId) ? resultado.get(`orcamento:${c.blingId}`) : null;
    const valido = p ? p.status === "valido" : c.valido;
    if (valido && c.contatoId) orcValidos.push(c);
  }

  // 2) vendas: conversão se o cliente teve orçamento válido na janela.
  const porContato = new Map<string, string[]>();
  for (const o of orcValidos) {
    const l = porContato.get(o.contatoId!) ?? [];
    l.push(o.data);
    porContato.set(o.contatoId!, l);
  }
  for (const d of docs) {
    if (d.tipo !== "venda") continue;
    let temOrcamentoAnterior = false;
    if (d.contatoId && regras.conversaoBonus > 0) {
      const desde = somarDias(d.data, -Math.round(regras.conversaoDias));
      temOrcamentoAnterior = (porContato.get(d.contatoId) ?? []).some((dt) => dt >= desde && dt <= d.data);
    }
    resultado.set(`venda:${d.blingId}`, pontuar(d, regras, { temOrcamentoAnterior }));
  }
  return resultado;
}
