// ============================================================
// PDV: o Bling (API v3) chamado pelo site, com o access_token que o vigia do
// PC entrega (lib/pdv/acesso.ts). Nunca renova token.
//
// As armadilhas conferidas contra a conta real em 15/09 valem aqui:
// situação é `situacao.id`; filtro de lista usa `chave[]`; o vendedor só vem
// no detalhe do pedido; item a R$ 0,00 entra como venda válida (recusado
// antes de chamar). Limite da conta: 3 chamadas por segundo.
// ============================================================

import { gravar, ler } from "@/lib/arena/gaveta";
import { marcarRecusado, tokenAtual } from "./acesso";
import { centavos, soDigitos } from "./calculos";
import type { ClienteDaVenda, FormaDePagamento } from "./tipos";

const API = "https://api.bling.com.br/Api/v3";
const ESPACO_MS = 360;

export class SemAcessoAoBling extends Error {
  constructor(motivo: string) {
    super(motivo);
    this.name = "SemAcessoAoBling";
  }
}

export class ErroDoBling extends Error {
  constructor(public status: number, mensagem: string, public corpo: string = "") {
    super(mensagem);
    this.name = "ErroDoBling";
  }
}

/** O Bling explica o erro num JSON; o balcão precisa ler a explicação, não o código. */
export function mensagemDoBling(status: number, corpo: string): string {
  try {
    const j = JSON.parse(corpo) as { error?: { description?: string; message?: string; fields?: { msg?: string; element?: string }[] } };
    const e = j.error ?? {};
    const partes = [e.description || e.message || "", ...(e.fields ?? []).map((f) => f.msg || f.element || "")].filter(Boolean);
    if (partes.length) return `Bling recusou (${status}): ${partes.join("; ")}`.slice(0, 400);
  } catch {
    /* corpo não é JSON */
  }
  return `Bling respondeu ${status}`;
}

export function montarConsulta(q: Record<string, unknown> | undefined): string {
  if (!q) return "";
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null || v === "") continue;
    // Lista só filtra com colchetes: situacoes[]=6 (armadilha 4).
    if (Array.isArray(v)) v.forEach((x) => p.append(k.endsWith("[]") ? k : `${k}[]`, String(x)));
    else p.append(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

type Buscar = typeof fetch;
let buscar: Buscar = (...a) => fetch(...a);
let esperar = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
let ultima = 0;

/** Só para os testes. */
export function _trocarRede(f: Buscar, dormir?: (ms: number) => Promise<void>) {
  buscar = f;
  if (dormir) esperar = dormir;
  ultima = 0;
}

export async function chamarBling<T = Record<string, unknown>>(
  metodo: "GET" | "POST" | "PUT" | "PATCH",
  caminho: string,
  opcoes: { consulta?: Record<string, unknown>; corpo?: unknown } = {}
): Promise<T> {
  const { token, motivo } = await tokenAtual();
  if (!token) throw new SemAcessoAoBling(motivo || "Sem acesso ao Bling.");
  const url = `${API}/${caminho.replace(/^\//, "")}${montarConsulta(opcoes.consulta)}`;

  for (let tentativa = 0; tentativa < 4; tentativa++) {
    const vez = Math.max(Date.now(), ultima + ESPACO_MS);
    ultima = vez;
    if (vez > Date.now()) await esperar(vez - Date.now());

    const r = await buscar(url, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(opcoes.corpo !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });
    const texto = await r.text();
    if (r.ok) {
      if (!texto) return {} as T;
      try {
        return JSON.parse(texto) as T;
      } catch {
        return {} as T;
      }
    }
    if (r.status === 429 && tentativa < 3) {
      await esperar(1200 * (tentativa + 1));
      continue;
    }
    if (r.status === 401) {
      await marcarRecusado(token).catch(() => undefined);
      throw new SemAcessoAoBling("O Bling recusou o acesso; esperando a sentinela do PC renovar (até 6 minutos).");
    }
    throw new ErroDoBling(r.status, mensagemDoBling(r.status, texto), texto.slice(0, 2000));
  }
  throw new ErroDoBling(429, "O Bling pediu para esperar (muitas chamadas). Tente de novo em instantes.");
}

const dados = <T>(r: unknown): T => ((r as { data?: T })?.data ?? (r as T));

// ---------------------------------------------------------------- vendedores

export interface VendedorDoBling {
  id: string;
  nome: string;
}

let vendedoresEmMemoria: { em: number; lista: VendedorDoBling[] } | null = null;

/** Vendedores ativos do Bling. Guarda uma cópia para o balcão abrir mesmo sem acesso. */
export async function vendedores(opcoes: { forcar?: boolean } = {}): Promise<{ lista: VendedorDoBling[]; doBling: boolean }> {
  if (!opcoes.forcar && vendedoresEmMemoria && Date.now() - vendedoresEmMemoria.em < 30 * 60_000) {
    return { lista: vendedoresEmMemoria.lista, doBling: true };
  }
  try {
    const r = await chamarBling("GET", "vendedores", { consulta: { limite: 100, situacaoContato: "A" } });
    const lista = dados<{ id: number; contato?: { nome?: string; situacao?: string } }[]>(r)
      .filter((v) => v.id && (v.contato?.situacao ?? "A") === "A")
      .map((v) => ({ id: String(v.id), nome: String(v.contato?.nome || "").trim() || `Vendedor ${v.id}` }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    vendedoresEmMemoria = { em: Date.now(), lista };
    await gravar("pdv/vendedores", { em: new Date().toISOString(), lista }, "*").catch(() => undefined);
    return { lista, doBling: true };
  } catch (e) {
    const copia = (await ler<{ lista: VendedorDoBling[] }>("pdv/vendedores").catch(() => ({ dados: null }))).dados;
    if (copia?.lista?.length) return { lista: copia.lista, doBling: false };
    throw e;
  }
}

// ---------------------------------------------------------------- formas de pagamento

export interface FormaDoBling {
  id: number;
  descricao: string;
  tipo: number;
  padrao: number;
}

let formasEmMemoria: { em: number; lista: FormaDoBling[] } | null = null;

export async function formasDePagamento(): Promise<FormaDoBling[]> {
  if (formasEmMemoria && Date.now() - formasEmMemoria.em < 60 * 60_000) return formasEmMemoria.lista;
  const r = await chamarBling("GET", "formas-pagamentos", { consulta: { limite: 100, situacao: 1 } });
  const lista = dados<{ id: number; descricao?: string; tipoPagamento?: number; padrao?: number; situacao?: number }[]>(r)
    .filter((f) => f.id && (f.situacao ?? 1) === 1)
    .map((f) => ({ id: f.id, descricao: String(f.descricao || ""), tipo: Number(f.tipoPagamento || 0), padrao: Number(f.padrao || 0) }));
  formasEmMemoria = { em: Date.now(), lista };
  return lista;
}

const TIPOS: Record<FormaDePagamento, { tipos: number[]; palavras: RegExp }> = {
  pix: { tipos: [17, 20], palavras: /pix/i },
  dinheiro: { tipos: [1], palavras: /dinheiro|esp[eé]cie/i },
  credito: { tipos: [3], palavras: /cr[eé]dito/i },
  debito: { tipos: [4], palavras: /d[eé]bito/i },
  boleto: { tipos: [15], palavras: /boleto/i },
  outro: { tipos: [99], palavras: /outro/i },
};

/** A forma do Bling para a forma do balcão: pelo tipo, depois pelo nome, depois a padrão. */
export function escolherForma(formas: FormaDoBling[], forma: FormaDePagamento): FormaDoBling | null {
  const alvo = TIPOS[forma];
  const porTipo = formas.filter((f) => alvo.tipos.includes(f.tipo));
  if (porTipo.length) return porTipo.find((f) => alvo.palavras.test(f.descricao)) ?? porTipo.find((f) => f.padrao === 1) ?? porTipo[0];
  return formas.find((f) => alvo.palavras.test(f.descricao)) ?? formas.find((f) => f.padrao === 1) ?? formas[0] ?? null;
}

// ---------------------------------------------------------------- contatos

interface ContatoDoBling {
  id: number;
  nome?: string;
  numeroDocumento?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  tipo?: string;
  situacao?: string;
  endereco?: { geral?: Record<string, string> };
  [k: string]: unknown;
}

export function clienteDoContato(c: ContatoDoBling): ClienteDaVenda {
  const g = c.endereco?.geral ?? {};
  return {
    blingId: String(c.id),
    nome: String(c.nome || ""),
    documento: soDigitos(c.numeroDocumento),
    email: String(c.email || ""),
    telefone: soDigitos(c.celular || c.telefone),
    cep: soDigitos(g.cep),
    endereco: String(g.endereco || ""),
    numero: String(g.numero || ""),
    complemento: String(g.complemento || ""),
    bairro: String(g.bairro || ""),
    cidade: String(g.municipio || ""),
    uf: String(g.uf || "").toUpperCase(),
  };
}

async function contatoDetalhado(id: string | number): Promise<ContatoDoBling | null> {
  const r = await chamarBling("GET", `contatos/${id}`);
  const c = dados<ContatoDoBling>(r);
  return c && c.id ? c : null;
}

export async function buscarClientePorDocumento(documento: string): Promise<ClienteDaVenda | null> {
  const doc = soDigitos(documento);
  if (doc.length !== 11 && doc.length !== 14) return null;
  const r = await chamarBling("GET", "contatos", { consulta: { numeroDocumento: doc, limite: 1 } });
  const achado = dados<ContatoDoBling[]>(r)[0];
  if (!achado?.id) return null;
  const det = await contatoDetalhado(achado.id);
  return det ? clienteDoContato(det) : clienteDoContato(achado);
}

function corpoDoContato(c: ClienteDaVenda, base: Partial<ContatoDoBling> = {}) {
  const doc = soDigitos(c.documento);
  const corpo: Record<string, unknown> = {
    ...base,
    nome: c.nome.trim().slice(0, 120) || base.nome || "Consumidor final",
    situacao: base.situacao || "A",
    tipo: doc.length === 14 ? "J" : "F",
  };
  delete corpo.id;
  if (doc) corpo.numeroDocumento = doc;
  if (c.email.trim()) corpo.email = c.email.trim();
  if (soDigitos(c.telefone)) corpo.celular = soDigitos(c.telefone).slice(-11);
  if (c.cep || c.endereco) {
    corpo.endereco = {
      ...((base.endereco as Record<string, unknown>) ?? {}),
      geral: {
        endereco: c.endereco.trim(),
        numero: c.numero.trim(),
        complemento: c.complemento.trim(),
        bairro: c.bairro.trim(),
        cep: soDigitos(c.cep),
        municipio: c.cidade.trim(),
        uf: c.uf.trim().toUpperCase(),
      },
    };
  }
  return corpo;
}

/** O contato do cliente no Bling: acha pelo documento, cria se não existir, completa o endereço se faltar. */
export async function contatoParaVenda(c: ClienteDaVenda): Promise<string> {
  const doc = soDigitos(c.documento);
  if (!doc) return contatoConsumidorFinal(c);

  let id: string | null = c.blingId ? String(c.blingId) : null;
  if (!id) {
    const r = await chamarBling("GET", "contatos", { consulta: { numeroDocumento: doc, limite: 1 } });
    const achado = dados<ContatoDoBling[]>(r)[0];
    id = achado?.id ? String(achado.id) : null;
  }
  if (!id) {
    const r = await chamarBling("POST", "contatos", { corpo: corpoDoContato(c) });
    return String(dados<{ id: number }>(r).id);
  }
  // Já existe. Se o balcão trouxe endereço e o Bling não tem (ou mudou), atualiza:
  // a nota sai com o endereço do contato.
  if (c.cep && c.endereco) {
    const det = await contatoDetalhado(id);
    if (det) {
      const g = det.endereco?.geral ?? {};
      const mudou =
        soDigitos(g.cep) !== soDigitos(c.cep) ||
        String(g.numero || "").trim() !== c.numero.trim() ||
        !String(g.endereco || "").trim() ||
        (!det.email && c.email.trim()) ||
        (!det.celular && !det.telefone && soDigitos(c.telefone));
      if (mudou) {
        await chamarBling("PUT", `contatos/${id}`, { corpo: corpoDoContato({ ...c, nome: c.nome || String(det.nome || "") }, det) });
      }
    }
  }
  return id;
}

/** Venda sem CPF: o contato "Consumidor final" (o Bling exige contato no pedido). */
async function contatoConsumidorFinal(c: ClienteDaVenda): Promise<string> {
  const nome = c.nome.trim();
  if (nome && soDigitos(c.telefone)) {
    // Sem CPF mas com nome e telefone: acha ou cria pelo telefone, para o cliente existir no Bling.
    const tel = soDigitos(c.telefone).slice(-11);
    const r = await chamarBling("GET", "contatos", { consulta: { telefone: tel, limite: 1 } });
    const achado = dados<ContatoDoBling[]>(r)[0];
    if (achado?.id) return String(achado.id);
    const novo = await chamarBling("POST", "contatos", { corpo: corpoDoContato(c) });
    return String(dados<{ id: number }>(novo).id);
  }
  const guardado = (await ler<{ id: string }>("pdv/consumidor-final").catch(() => ({ dados: null }))).dados;
  if (guardado?.id) return guardado.id;
  const r = await chamarBling("GET", "contatos", { consulta: { pesquisa: "Consumidor final", limite: 5 } });
  const achado = dados<ContatoDoBling[]>(r).find((x) => /consumidor\s+final/i.test(String(x.nome || "")) && !soDigitos(x.numeroDocumento));
  let id = achado?.id ? String(achado.id) : null;
  if (!id) {
    const novo = await chamarBling("POST", "contatos", { corpo: { nome: "Consumidor final", situacao: "A", tipo: "F" } });
    id = String(dados<{ id: number }>(novo).id);
  }
  await gravar("pdv/consumidor-final", { id }, "*").catch(() => undefined);
  return id;
}

// ---------------------------------------------------------------- pedidos

export interface ItemDoPedido {
  codigo: string;
  descricao: string;
  quantidade: number;
  valor: number;
}

export interface ParcelaDoPedido {
  forma: FormaDePagamento;
  valor: number;
  observacao?: string;
}

export interface NovoPedido {
  data: string; // AAAA-MM-DD
  contatoId: string;
  vendedorId: string | null;
  itens: ItemDoPedido[];
  descontoEmReais: number;
  parcelas: ParcelaDoPedido[];
  observacoes: string;
  observacoesInternas: string;
}

export function corpoDoPedido(p: NovoPedido, formas: FormaDoBling[]): Record<string, unknown> {
  for (const i of p.itens) {
    if (!(i.quantidade > 0) || !(i.valor > 0)) throw new Error(`Item inválido para o Bling: "${i.descricao}" (quantidade ou valor zerado).`);
  }
  const parcelas = p.parcelas
    .filter((x) => x.valor > 0)
    .map((x) => {
      const f = escolherForma(formas, x.forma);
      if (!f) throw new Error("O Bling não tem nenhuma forma de pagamento ativa.");
      return {
        dataVencimento: p.data,
        valor: centavos(x.valor),
        formaPagamento: { id: f.id },
        ...(x.observacao ? { observacoes: x.observacao.slice(0, 100) } : {}),
      };
    });
  return {
    data: p.data,
    dataSaida: p.data,
    dataPrevista: p.data,
    contato: { id: Number(p.contatoId) },
    itens: p.itens.map((i) => ({
      codigo: i.codigo.slice(0, 60),
      descricao: i.descricao.slice(0, 120),
      unidade: "UN",
      quantidade: i.quantidade,
      valor: centavos(i.valor),
    })),
    ...(p.descontoEmReais > 0 ? { desconto: { valor: centavos(p.descontoEmReais), unidade: "REAL" } } : {}),
    parcelas,
    ...(p.vendedorId ? { vendedor: { id: Number(p.vendedorId) } } : {}),
    observacoes: p.observacoes.slice(0, 1000),
    observacoesInternas: p.observacoesInternas.slice(0, 1000),
  };
}

export async function criarPedido(p: NovoPedido): Promise<{ id: string; numero: string | null }> {
  const formas = await formasDePagamento();
  const r = await chamarBling("POST", "pedidos/vendas", { corpo: corpoDoPedido(p, formas) });
  const id = String(dados<{ id: number }>(r).id);
  let numero: string | null = null;
  try {
    numero = String(dados<{ numero?: number | string }>(await chamarBling("GET", `pedidos/vendas/${id}`)).numero ?? "") || null;
  } catch {
    /* o número aparece na próxima leitura */
  }
  return { id, numero };
}

export interface PedidoDaLista {
  id: string;
  numero: string;
  data: string;
  total: number;
  contatoId: string | null;
  contatoNome: string;
  situacaoId: number | null;
}

export async function pedidosDoDia(dia: string): Promise<PedidoDaLista[]> {
  const lista: PedidoDaLista[] = [];
  for (let pagina = 1; pagina <= 5; pagina++) {
    const r = await chamarBling("GET", "pedidos/vendas", { consulta: { dataInicial: dia, dataFinal: dia, pagina, limite: 100 } });
    const d = dados<
      { id: number; numero?: number; data?: string; total?: number; contato?: { id?: number; nome?: string }; situacao?: { id?: number } }[]
    >(r);
    for (const x of d) {
      lista.push({
        id: String(x.id),
        numero: String(x.numero ?? ""),
        data: String(x.data || dia),
        total: Number(x.total || 0),
        contatoId: x.contato?.id ? String(x.contato.id) : null,
        contatoNome: String(x.contato?.nome || ""),
        situacaoId: x.situacao?.id != null ? Number(x.situacao.id) : null,
      });
    }
    if (d.length < 100) break;
  }
  return lista;
}

export interface PedidoDetalhado {
  id: string;
  numero: string;
  data: string;
  total: number;
  totalProdutos: number;
  desconto: number;
  situacaoId: number | null;
  vendedorId: string | null;
  contato: { id: string | null; nome: string; documento: string };
  itens: { codigo: string; descricao: string; quantidade: number; valor: number }[];
  parcelas: { valor: number; formaId: number | null; vencimento: string }[];
  notaId: string | null;
  observacoes: string;
}

export async function pedidoDetalhado(id: string): Promise<PedidoDetalhado> {
  const d = dados<Record<string, unknown>>(await chamarBling("GET", `pedidos/vendas/${id}`));
  const contato = (d.contato ?? {}) as { id?: number; nome?: string; numeroDocumento?: string };
  const desconto = (d.desconto ?? {}) as { valor?: number; unidade?: string };
  const totalProdutos = Number(d.totalProdutos || 0);
  const nota = (d.notaFiscal ?? {}) as { id?: number };
  return {
    id: String(d.id),
    numero: String(d.numero ?? ""),
    data: String(d.data || ""),
    total: Number(d.total || 0),
    totalProdutos,
    desconto: desconto.unidade === "PERCENTUAL" ? centavos((totalProdutos * Number(desconto.valor || 0)) / 100) : Number(desconto.valor || 0),
    situacaoId: (d.situacao as { id?: number })?.id != null ? Number((d.situacao as { id?: number }).id) : null,
    vendedorId: (d.vendedor as { id?: number })?.id ? String((d.vendedor as { id?: number }).id) : null,
    contato: { id: contato.id ? String(contato.id) : null, nome: String(contato.nome || ""), documento: soDigitos(contato.numeroDocumento) },
    itens: ((d.itens as Record<string, unknown>[]) ?? []).map((i) => ({
      codigo: String(i.codigo || ""),
      descricao: String(i.descricao || ""),
      quantidade: Number(i.quantidade || 1),
      valor: Number(i.valor || 0),
    })),
    parcelas: ((d.parcelas as Record<string, unknown>[]) ?? []).map((p) => ({
      valor: Number(p.valor || 0),
      formaId: (p.formaPagamento as { id?: number })?.id ?? null,
      vencimento: String(p.dataVencimento || ""),
    })),
    notaId: nota.id ? String(nota.id) : null,
    observacoes: String(d.observacoes || ""),
  };
}

/** Pedidos do mesmo cliente e valor no dia: evita pedido em dobro quando a resposta do Bling se perde. */
export async function acharPedidoIgual(dia: string, contatoId: string, total: number): Promise<string | null> {
  const r = await chamarBling("GET", "pedidos/vendas", { consulta: { dataInicial: dia, dataFinal: dia, idContato: contatoId, limite: 50 } });
  const achado = dados<{ id: number; total?: number }[]>(r).find((x) => Math.abs(Number(x.total || 0) - total) < 0.01);
  return achado ? String(achado.id) : null;
}

// ---------------------------------------------------------------- nota fiscal (NF-e, modelo 55 — a que a loja usa)

export async function gerarNota(pedidoId: string): Promise<string> {
  const r = await chamarBling<Record<string, unknown>>("POST", `pedidos/vendas/${pedidoId}/gerar-nfe`);
  const d = (r.data ?? r) as { idNotaFiscal?: number; id?: number };
  const id = d.idNotaFiscal ?? d.id;
  if (!id) throw new Error("O Bling não devolveu o número interno da nota gerada.");
  return String(id);
}

export async function enviarNota(notaId: string, enviarEmail: boolean): Promise<void> {
  await chamarBling("POST", `nfe/${notaId}/enviar`, { consulta: { enviarEmail: enviarEmail ? "true" : "false" } });
}

export interface NotaDoBling {
  id: string;
  numero: string | null;
  serie: string | null;
  situacao: number | null;
  chave: string | null;
  linkDanfe: string | null;
  linkPdf: string | null;
  valor: number;
}

export async function lerNota(notaId: string): Promise<NotaDoBling> {
  const d = dados<Record<string, unknown>>(await chamarBling("GET", `nfe/${notaId}`));
  return {
    id: String(d.id ?? notaId),
    numero: d.numero ? String(d.numero) : null,
    serie: d.serie != null ? String(d.serie) : null,
    situacao: d.situacao != null ? Number(d.situacao) : null,
    chave: d.chaveAcesso ? String(d.chaveAcesso) : null,
    linkDanfe: d.linkDanfe ? String(d.linkDanfe) : null,
    linkPdf: d.linkPDF ? String(d.linkPDF) : null,
    valor: Number(d.valorNota || 0),
  };
}

export async function dadosDaEmpresa(): Promise<{ nome: string; cnpj: string } | null> {
  const guardado = (await ler<{ nome: string; cnpj: string }>("pdv/empresa").catch(() => ({ dados: null }))).dados;
  if (guardado) return guardado;
  try {
    const d = dados<{ nome?: string; cnpj?: string }>(await chamarBling("GET", "empresas/me/dados-basicos"));
    if (!d?.cnpj) return null;
    const e = { nome: String(d.nome || ""), cnpj: String(d.cnpj) };
    await gravar("pdv/empresa", e, "*").catch(() => undefined);
    return e;
  } catch {
    return null;
  }
}
