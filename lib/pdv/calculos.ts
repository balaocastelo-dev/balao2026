// ============================================================
// PDV: as contas da venda. Funções puras, usadas no balcão (para mostrar) e na
// API (para gravar). O servidor refaz tudo: o total que vai para o Bling e
// para a nota nunca é o que o navegador mandou, é o que estas contas dão.
// ============================================================

import type { Desconto, ItemDaVenda, Pagamento, ProdutoDoPdv, Tabela } from "./tipos";

export const centavos = (v: number) => Math.round((Number.isFinite(v) ? v : 0) * 100) / 100;

export function precoNaTabela(p: Pick<ProdutoDoPdv, "precoVista" | "precoCartao">, tabela: Tabela): number {
  if (tabela === "cartao" && p.precoCartao && p.precoCartao > 0) return p.precoCartao;
  return p.precoVista;
}

export function subtotalDe(itens: Pick<ItemDaVenda, "quantidade" | "valor">[]): number {
  return centavos(itens.reduce((s, i) => s + centavos(i.valor) * i.quantidade, 0));
}

/** Desconto em reais, nunca maior que o subtotal nem negativo. */
export function valorDoDesconto(subtotal: number, d: Desconto | null | undefined): number {
  if (!d || !Number.isFinite(d.valor) || d.valor <= 0) return 0;
  const bruto = d.tipo === "percentual" ? (subtotal * Math.min(d.valor, 100)) / 100 : d.valor;
  return centavos(Math.min(Math.max(bruto, 0), subtotal));
}

export interface Totais {
  subtotal: number;
  desconto: number;
  total: number;
  pago: number;
  falta: number;
  troco: number;
}

export function totaisDa(venda: {
  itens: Pick<ItemDaVenda, "quantidade" | "valor">[];
  desconto: Desconto | null;
  pagamentos: Pagamento[];
}): Totais {
  const subtotal = subtotalDe(venda.itens);
  const desconto = valorDoDesconto(subtotal, venda.desconto);
  const total = centavos(subtotal - desconto);
  const pago = centavos(venda.pagamentos.reduce((s, p) => s + centavos(p.valor), 0));
  // Troco só sai do dinheiro: quem paga em cartão não recebe troco.
  const troco = centavos(
    venda.pagamentos
      .filter((p) => p.forma === "dinheiro" && p.recebido && p.recebido > p.valor)
      .reduce((s, p) => s + (p.recebido! - p.valor), 0)
  );
  return { subtotal, desconto, total, pago, falta: centavos(Math.max(0, total - pago)), troco };
}

/** Com crédito no meio, a venda usa a tabela do cartão do site. */
export function tabelaPelosPagamentos(pagamentos: Pick<Pagamento, "forma">[]): Tabela {
  return pagamentos.some((p) => p.forma === "credito") ? "cartao" : "vista";
}

export function soDigitos(v: string | null | undefined): string {
  return String(v ?? "").replace(/\D/g, "");
}

function cpfValido(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const dv = (base: string, peso: number) => {
    const s = base.split("").reduce((a, n, i) => a + Number(n) * (peso - i), 0);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(cpf.slice(0, 9), 10) === Number(cpf[9]) && dv(cpf.slice(0, 10), 11) === Number(cpf[10]);
}

function cnpjValido(cnpj: string): boolean {
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const dv = (base: string) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const s = base.split("").reduce((a, n, i) => a + Number(n) * pesos[i], 0);
    const r = s % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return dv(cnpj.slice(0, 12)) === Number(cnpj[12]) && dv(cnpj.slice(0, 13)) === Number(cnpj[13]);
}

export function documentoValido(doc: string): boolean {
  const d = soDigitos(doc);
  return d.length === 11 ? cpfValido(d) : d.length === 14 ? cnpjValido(d) : false;
}

export function formatarDocumento(doc: string): string {
  const d = soDigitos(doc);
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return doc;
}

export const reais = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(centavos(v));

/** "R$ 1.234,56" (como o site guarda o preço) → 1234.56. */
export function lerPreco(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const s = String(v ?? "").replace(/[^\d,.-]/g, "");
  if (!s) return 0;
  const normal = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = Number(normal);
  return Number.isFinite(n) ? n : 0;
}

export interface ProblemaDaVenda {
  campo: string;
  mensagem: string;
}

/** O que falta para fechar a venda (e, com nota, para a Sefaz aceitar). */
export function conferirVenda(v: {
  itens: ItemDaVenda[];
  desconto: Desconto | null;
  pagamentos: Pagamento[];
  pedirNota: boolean;
  cliente: { nome: string; documento: string; cep: string; endereco: string; numero: string; bairro: string; cidade: string; uf: string };
}): ProblemaDaVenda[] {
  const p: ProblemaDaVenda[] = [];
  if (v.itens.length === 0) p.push({ campo: "itens", mensagem: "Coloque pelo menos um produto na venda." });
  for (const i of v.itens) {
    if (!(i.quantidade > 0) || !Number.isInteger(i.quantidade)) p.push({ campo: "itens", mensagem: `Quantidade inválida em "${i.nome}".` });
    if (!(i.valor > 0)) p.push({ campo: "itens", mensagem: `"${i.nome}" está sem valor. Item a R$ 0,00 entra no Bling como venda válida.` });
  }
  const t = totaisDa(v);
  if (t.total <= 0 && v.itens.length) p.push({ campo: "desconto", mensagem: "O desconto não pode zerar a venda." });
  if (v.pagamentos.length === 0) p.push({ campo: "pagamentos", mensagem: "Escolha a forma de pagamento." });
  if (Math.abs(t.pago - t.total) > 0.009) {
    p.push({
      campo: "pagamentos",
      mensagem: t.pago < t.total ? `Faltam ${reais(t.total - t.pago)} nos pagamentos.` : `Os pagamentos passam do total em ${reais(t.pago - t.total)}.`,
    });
  }
  for (const pg of v.pagamentos) {
    if (pg.forma === "dinheiro" && pg.recebido != null && pg.recebido > 0 && pg.recebido < pg.valor) {
      p.push({ campo: "pagamentos", mensagem: "O dinheiro recebido é menor que o valor em dinheiro." });
    }
  }
  const c = v.cliente;
  const doc = soDigitos(c.documento);
  if (doc && !documentoValido(doc)) p.push({ campo: "cliente", mensagem: "CPF/CNPJ inválido." });
  if (v.pedirNota) {
    if (!doc) p.push({ campo: "cliente", mensagem: "Para emitir a nota, informe o CPF ou CNPJ do cliente." });
    if (!c.nome.trim()) p.push({ campo: "cliente", mensagem: "Para emitir a nota, informe o nome do cliente." });
    if (soDigitos(c.cep).length !== 8 || !c.endereco.trim() || !c.numero.trim() || !c.bairro.trim() || !c.cidade.trim() || c.uf.trim().length !== 2) {
      p.push({ campo: "cliente", mensagem: "Para emitir a nota, complete o endereço (CEP, rua, número, bairro, cidade e UF)." });
    }
  }
  return p;
}

/** PDV-AAMMDD-XXXX: curto para o comprovante, único sem consultar ninguém. */
export function novoIdDeVenda(dia: string, aleatorio: () => number = Math.random): string {
  const [a, m, d] = dia.split("-");
  const letras = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += letras[Math.floor(aleatorio() * letras.length) % letras.length];
  return `PDV-${a.slice(2)}${m}${d}-${s}`;
}
