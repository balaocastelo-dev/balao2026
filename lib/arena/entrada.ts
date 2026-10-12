// Arena: confere e limpa cada documento que o vigia manda (nada confiado de olhos fechados).
import type { DocumentoDoBling } from "./pontos";

const id = (v: unknown) => {
  const s = String(v ?? "").replace(/\D/g, "").slice(0, 32);
  return s && s !== "0" ? s : null;
};

export function lerDocumento(bruto: unknown): DocumentoDoBling | null {
  if (!bruto || typeof bruto !== "object") return null;
  const o = bruto as Record<string, unknown>;
  const tipo = o.tipo === "venda" || o.tipo === "orcamento" ? o.tipo : null;
  const blingId = id(o.blingId);
  const data = String(o.data ?? "");
  if (!tipo || !blingId || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return null;
  const itens = Array.isArray(o.itens)
    ? o.itens.slice(0, 80).map((i) => {
        const x = (i ?? {}) as Record<string, unknown>;
        return {
          descricao: String(x.descricao ?? "").slice(0, 200),
          quantidade: Number.isFinite(Number(x.quantidade)) ? Number(x.quantidade) : 1,
          valor: Number.isFinite(Number(x.valor)) ? Number(x.valor) : 0,
        };
      })
    : [];
  const total = Number(o.total);
  return {
    tipo,
    blingId,
    numero: String(o.numero ?? "").slice(0, 32),
    data,
    vendedorBlingId: id(o.vendedorBlingId),
    contatoId: id(o.contatoId),
    contatoNome: o.contatoNome ? String(o.contatoNome).slice(0, 190) : null,
    total: Number.isFinite(total) ? total : 0,
    situacaoId: o.situacaoId == null || !Number.isFinite(Number(o.situacaoId)) ? null : Number(o.situacaoId),
    situacao: o.situacao ? String(o.situacao).slice(0, 60) : null,
    itens,
  };
}

