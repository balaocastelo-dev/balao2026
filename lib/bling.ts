import { supabaseAdmin, hasSupabaseAdmin } from "./supabase";

// ============================================================
// Bling — ERP da loja.
//
// Aqui mora TODA a conversa com o Bling. Os agentes (Carla, Rafa, Beto) e o
// servidor MCP consomem estas funções; nenhum deles fala com o Bling direto.
// É de propósito: o token é um só, o limite de requisição é um só, e o dia em
// que o Bling mudar um caminho, muda num lugar.
//
// O Bling não tem MCP oficial. O que existe é esta API v3, com OAuth 2.0:
//   https://developer.bling.com.br/bling-api
//
// Três coisas que a API impõe e o código precisa respeitar:
//  - 3 requisições por segundo, 120.000 por dia (developer.bling.com.br/limites)
//  - o `code` do OAuth expira em 1 minuto
//  - cada refresh devolve um refresh_token NOVO; o anterior morre na hora
// ============================================================

// São DOIS hosts, e confundi-los custa um 403 com a resposta certa dentro:
//
//   "A URL 'www.bling.com.br' está bloqueada para requisições de API.
//    Por favor, utilize o endpoint oficial: 'api.bling.com.br'."
//
// O `www` serve o fluxo OAuth — a tela de autorização precisa ser uma página
// de verdade, com o lojista logado — e o `api` serve os dados. Descoberto ao
// conectar a conta real em 14/09: a troca de token passou no www e a primeira
// consulta de pedidos voltou 403.
const BASE_OAUTH = "https://www.bling.com.br/Api/v3";
const BASE_API = "https://api.bling.com.br/Api/v3";

export const URL_AUTORIZACAO = `${BASE_OAUTH}/oauth/authorize`;
export const URL_TOKEN = `${BASE_OAUTH}/oauth/token`;

const CLIENT_ID = process.env.BLING_CLIENT_ID || "";
const CLIENT_SECRET = process.env.BLING_CLIENT_SECRET || "";

/** Margem antes de considerar o token vencido. Um refresh a mais não custa
 *  nada; uma requisição que falha no meio do fechamento do dia custa. */
const MARGEM_MS = 5 * 60 * 1000;

export function blingConfigurado(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET && hasSupabaseAdmin());
}

/** O que falta para o Bling funcionar, em português, para o painel mostrar. */
export function blingPendencias(): string[] {
  const faltas: string[] = [];
  if (!CLIENT_ID) faltas.push("BLING_CLIENT_ID não configurado");
  if (!CLIENT_SECRET) faltas.push("BLING_CLIENT_SECRET não configurado");
  if (!hasSupabaseAdmin()) faltas.push("SUPABASE_SERVICE_ROLE_KEY não configurada");
  return faltas;
}

/* ---------------------------------------------------------------- *
 * Token
 * ---------------------------------------------------------------- */

interface TokenGuardado {
  access_token: string | null;
  refresh_token: string | null;
  expira_em: string | null;
  conectado_em: string | null;
  ultimo_erro: string | null;
}

async function lerToken(): Promise<TokenGuardado | null> {
  const { data, error } = await supabaseAdmin
    .from("integracao_bling")
    .select("access_token, refresh_token, expira_em, conectado_em, ultimo_erro")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    console.error("[bling] não consegui ler o token:", error.message);
    return null;
  }
  return (data as TokenGuardado) || null;
}

async function gravarToken(resposta: Record<string, unknown>, escopo?: string) {
  const segundos = Number(resposta.expires_in) || 3600;
  await supabaseAdmin.from("integracao_bling").upsert({
    id: 1,
    access_token: String(resposta.access_token || ""),
    refresh_token: String(resposta.refresh_token || ""),
    expira_em: new Date(Date.now() + segundos * 1000).toISOString(),
    escopo: escopo || (resposta.scope ? String(resposta.scope) : null),
    conectado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
    ultimo_erro: null,
  });
}

async function anotarErro(mensagem: string) {
  await supabaseAdmin
    .from("integracao_bling")
    .upsert({ id: 1, ultimo_erro: mensagem, atualizado_em: new Date().toISOString() });
}

function credencialBasica(): string {
  return Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
}

/** Troca `code` ou `refresh_token` por um par de tokens novo. */
async function pedirToken(corpo: Record<string, string>): Promise<Record<string, unknown>> {
  const resposta = await fetch(URL_TOKEN, {
    method: "POST",
    headers: {
      Accept: "1.0",
      Authorization: `Basic ${credencialBasica()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(corpo).toString(),
    signal: AbortSignal.timeout(20_000),
  });

  const texto = await resposta.text();
  if (!resposta.ok) {
    throw new Error(`Bling recusou o token (${resposta.status}): ${texto.slice(0, 300)}`);
  }
  return JSON.parse(texto) as Record<string, unknown>;
}

/** Primeira conexão: troca o code da autorização pelo par de tokens. */
export async function trocarCodePorToken(code: string) {
  const dados = await pedirToken({ grant_type: "authorization_code", code });
  await gravarToken(dados);
  return dados;
}

// Um refresh de cada vez. Sem isto, duas requisições que vencem juntas pedem
// dois refresh, o Bling invalida o refresh_token do primeiro, e a conexão cai
// sozinha — erro que só aparece em produção, sob carga.
let refreshEmVoo: Promise<string | null> | null = null;

async function renovar(refreshToken: string): Promise<string | null> {
  try {
    const dados = await pedirToken({ grant_type: "refresh_token", refresh_token: refreshToken });
    await gravarToken(dados);
    return String(dados.access_token || "") || null;
  } catch (erro) {
    const mensagem = (erro as Error).message;
    console.error("[bling] refresh falhou:", mensagem);
    await anotarErro(mensagem);
    return null;
  }
}

/**
 * Devolve um access_token válido, renovando se preciso.
 *
 * null quer dizer "não dá para falar com o Bling agora" — nunca lança. Quem
 * chama decide o que fazer sem ERP: a Carla cai para os pedidos do site, o
 * Rafa manda o relatório dizendo que o Bling está fora.
 */
export async function tokenValido(): Promise<string | null> {
  if (!blingConfigurado()) return null;

  const guardado = await lerToken();
  if (!guardado?.refresh_token) return null;

  const vence = guardado.expira_em ? Date.parse(guardado.expira_em) : 0;
  if (guardado.access_token && vence - MARGEM_MS > Date.now()) return guardado.access_token;

  if (!refreshEmVoo) {
    refreshEmVoo = renovar(guardado.refresh_token).finally(() => {
      refreshEmVoo = null;
    });
  }
  return refreshEmVoo;
}

/* ---------------------------------------------------------------- *
 * Chamada
 * ---------------------------------------------------------------- */

// O Bling aceita 3 requisições por segundo. Estourar devolve 429 e, repetido,
// derruba o app. Uma fila simples com 350 ms entre chamadas fica abaixo do
// teto com folga e não exige coordenação entre processos.
const INTERVALO_MS = 350;
let ultimaChamada = 0;

async function respeitarRitmo() {
  const espera = ultimaChamada + INTERVALO_MS - Date.now();
  if (espera > 0) await new Promise((r) => setTimeout(r, espera));
  ultimaChamada = Date.now();
}

export interface RespostaBling<T = unknown> {
  ok: boolean;
  dados: T | null;
  erro: string | null;
  status: number;
}

/**
 * Chamada crua à API v3. É a única porta — as funções abaixo passam por aqui.
 *
 * `caminho` sem a base, começando com barra: "/pedidos/vendas".
 */
export async function chamarBling<T = unknown>(
  caminho: string,
  opcoes: {
    metodo?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    query?: Record<string, string | number | undefined>;
    corpo?: unknown;
    tentativa?: number;
  } = {}
): Promise<RespostaBling<T>> {
  const token = await tokenValido();
  if (!token) {
    return { ok: false, dados: null, erro: "Bling não conectado", status: 0 };
  }

  const parametros = new URLSearchParams();
  for (const [chave, valor] of Object.entries(opcoes.query || {})) {
    if (valor !== undefined && valor !== null && valor !== "") parametros.set(chave, String(valor));
  }
  const busca = parametros.toString();
  const url = `${BASE_API}${caminho}${busca ? `?${busca}` : ""}`;

  await respeitarRitmo();

  try {
    const resposta = await fetch(url, {
      method: opcoes.metodo || "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(opcoes.corpo ? { "Content-Type": "application/json" } : {}),
      },
      body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined,
      signal: AbortSignal.timeout(30_000),
    });

    // 429: passou do ritmo. Espera e tenta de novo, uma vez só — insistir em
    // cima de um limite estourado é o que transforma lentidão em bloqueio.
    if (resposta.status === 429 && (opcoes.tentativa || 0) < 1) {
      await new Promise((r) => setTimeout(r, 2000));
      return chamarBling<T>(caminho, { ...opcoes, tentativa: (opcoes.tentativa || 0) + 1 });
    }

    const texto = await resposta.text();
    if (!resposta.ok) {
      return {
        ok: false,
        dados: null,
        erro: `Bling ${resposta.status}: ${texto.slice(0, 300)}`,
        status: resposta.status,
      };
    }

    const json = texto ? JSON.parse(texto) : {};
    return { ok: true, dados: (json.data ?? json) as T, erro: null, status: resposta.status };
  } catch (erro) {
    return { ok: false, dados: null, erro: (erro as Error).message, status: 0 };
  }
}

/* ---------------------------------------------------------------- *
 * Leituras que os agentes usam
 *
 * Os caminhos e os nomes de campo abaixo seguem a referência da API v3
 * (developer.bling.com.br/referencia). Ainda NÃO foram exercitados contra uma
 * conta real — o aplicativo do Bling não estava criado quando isto foi
 * escrito. Por isso tudo aqui lê defensivamente: campo que não vier volta
 * nulo ou zero, nunca quebra. Ao conectar a conta, vale rodar
 * `chamarBling("/pedidos/vendas", { query: { limite: 1 } })` e conferir os
 * nomes antes de confiar nos números.
 * ---------------------------------------------------------------- */

const LIMITE_PAGINA = 100;

function numero(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function texto(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s || null;
}

function soDigitos(v: unknown): string {
  return String(v ?? "").replace(/\D/g, "");
}

/** Páginas até acabar ou até o teto. O teto existe porque uma conta com anos
 *  de histórico varreria o limite diário da API numa consulta só. */
async function paginar<T = Record<string, unknown>>(
  caminho: string,
  query: Record<string, string | number | undefined>,
  maxPaginas = 10
): Promise<{ linhas: T[]; erro: string | null }> {
  const linhas: T[] = [];
  for (let pagina = 1; pagina <= maxPaginas; pagina++) {
    const r = await chamarBling<T[]>(caminho, {
      query: { ...query, pagina, limite: LIMITE_PAGINA },
    });
    if (!r.ok) return { linhas, erro: r.erro };
    const lote = Array.isArray(r.dados) ? r.dados : [];
    linhas.push(...lote);
    if (lote.length < LIMITE_PAGINA) break;
  }
  return { linhas, erro: null };
}

export interface PedidoBling {
  id: string;
  numero: string | null;
  data: string | null;
  total: number;
  situacao: string | null;
  clienteNome: string | null;
  clienteId: string | null;
  vendedorId: string | null;
}

function lerPedido(p: Record<string, unknown>): PedidoBling {
  const contato = (p.contato || {}) as Record<string, unknown>;
  const situacao = (p.situacao || {}) as Record<string, unknown>;
  const vendedor = (p.vendedor || {}) as Record<string, unknown>;
  return {
    id: String(p.id ?? ""),
    numero: texto(p.numero),
    data: texto(p.data),
    total: numero(p.total),
    situacao: texto(situacao.valor ?? situacao.id ?? p.situacao),
    clienteNome: texto(contato.nome),
    clienteId: texto(contato.id),
    vendedorId: texto(vendedor.id),
  };
}

/** Pedidos de venda num intervalo. Datas em AAAA-MM-DD. */
export async function listarPedidos(opcoes: {
  dataInicial?: string;
  dataFinal?: string;
  maxPaginas?: number;
} = {}): Promise<{ pedidos: PedidoBling[]; erro: string | null }> {
  const { linhas, erro } = await paginar<Record<string, unknown>>(
    "/pedidos/vendas",
    { dataInicial: opcoes.dataInicial, dataFinal: opcoes.dataFinal },
    opcoes.maxPaginas ?? 10
  );
  return { pedidos: linhas.map(lerPedido), erro };
}

export interface ContaReceber {
  id: string;
  vencimento: string | null;
  valor: number;
  saldo: number;
  situacao: string | null;
  clienteNome: string | null;
  clienteId: string | null;
  historico: string | null;
}

function lerConta(c: Record<string, unknown>): ContaReceber {
  const contato = (c.contato || {}) as Record<string, unknown>;
  return {
    id: String(c.id ?? ""),
    vencimento: texto(c.vencimento ?? c.dataVencimento),
    valor: numero(c.valor),
    saldo: numero(c.saldo ?? c.valor),
    situacao: texto(c.situacao),
    clienteNome: texto(contato.nome),
    clienteId: texto(contato.id),
    historico: texto(c.historico),
  };
}

/**
 * Contas a receber em aberto, vencidas até a data de corte.
 *
 * É a fonte de cobrança da Carla: o dinheiro que a loja tem a receber está
 * aqui, não na tabela `orders` do site (que tem 9 linhas, a última de julho).
 */
export async function listarContasAReceber(opcoes: {
  dataInicial?: string;
  dataFinal?: string;
  situacao?: string | number;
  maxPaginas?: number;
} = {}): Promise<{ contas: ContaReceber[]; erro: string | null }> {
  const { linhas, erro } = await paginar<Record<string, unknown>>(
    "/contas/receber",
    {
      dataInicialVencimento: opcoes.dataInicial,
      dataFinalVencimento: opcoes.dataFinal,
      situacoes: opcoes.situacao,
    },
    opcoes.maxPaginas ?? 5
  );
  return { contas: linhas.map(lerConta), erro };
}

export interface ContatoBling {
  id: string;
  nome: string | null;
  documento: string | null;
  celular: string;
  telefone: string;
  email: string | null;
}

function lerContato(c: Record<string, unknown>): ContatoBling {
  return {
    id: String(c.id ?? ""),
    nome: texto(c.nome),
    documento: texto(c.numeroDocumento ?? c.documento),
    celular: soDigitos(c.celular),
    telefone: soDigitos(c.telefone),
    email: texto(c.email),
  };
}

export async function listarContatos(opcoes: {
  pesquisa?: string;
  maxPaginas?: number;
} = {}): Promise<{ contatos: ContatoBling[]; erro: string | null }> {
  const { linhas, erro } = await paginar<Record<string, unknown>>(
    "/contatos",
    { pesquisa: opcoes.pesquisa },
    opcoes.maxPaginas ?? 3
  );
  return { contatos: linhas.map(lerContato), erro };
}

/** Um contato pelo telefone, comparando só os dígitos. */
export async function contatoPorTelefone(whatsapp: string): Promise<ContatoBling | null> {
  const alvo = soDigitos(whatsapp).slice(-8); // ignora DDI/DDD: cadastro varia
  if (alvo.length < 8) return null;
  const { contatos } = await listarContatos({ pesquisa: alvo, maxPaginas: 1 });
  return (
    contatos.find((c) => c.celular.endsWith(alvo) || c.telefone.endsWith(alvo)) || null
  );
}

export interface ResumoDoDia {
  data: string;
  pedidos: number;
  faturamento: number;
  ticketMedio: number;
  clientes: number;
  porVendedor: { vendedorId: string | null; pedidos: number; total: number }[];
  maiores: { cliente: string | null; total: number }[];
  erro: string | null;
}

/**
 * Fechamento do dia — o que o Rafa manda às 19h.
 *
 * Devolve `erro` preenchido em vez de lançar: relatório com o número errado é
 * pior do que relatório dizendo "não consegui falar com o Bling".
 */
export async function resumoDoDia(data?: string): Promise<ResumoDoDia> {
  const dia = data || new Date().toISOString().slice(0, 10);
  const vazio: ResumoDoDia = {
    data: dia, pedidos: 0, faturamento: 0, ticketMedio: 0, clientes: 0,
    porVendedor: [], maiores: [], erro: null,
  };

  const { pedidos, erro } = await listarPedidos({ dataInicial: dia, dataFinal: dia });
  if (erro) return { ...vazio, erro };
  if (!pedidos.length) return vazio;

  const faturamento = pedidos.reduce((s, p) => s + p.total, 0);
  const clientes = new Set(pedidos.map((p) => p.clienteId || p.clienteNome || p.id)).size;

  const porVendedor = new Map<string, { pedidos: number; total: number }>();
  for (const p of pedidos) {
    const chave = p.vendedorId || "sem vendedor";
    const atual = porVendedor.get(chave) || { pedidos: 0, total: 0 };
    atual.pedidos += 1;
    atual.total += p.total;
    porVendedor.set(chave, atual);
  }

  return {
    data: dia,
    pedidos: pedidos.length,
    faturamento,
    ticketMedio: faturamento / pedidos.length,
    clientes,
    porVendedor: [...porVendedor.entries()]
      .map(([vendedorId, v]) => ({ vendedorId, ...v }))
      .sort((a, b) => b.total - a.total),
    maiores: [...pedidos]
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .map((p) => ({ cliente: p.clienteNome, total: p.total })),
    erro: null,
  };
}

/** Estado da conexão, para o painel do CRM. Nunca devolve o token. */
export async function estadoBling() {
  const pendencias = blingPendencias();
  if (pendencias.length) {
    return { configurado: false, conectado: false, pendencias, expiraEm: null, ultimoErro: null };
  }
  const guardado = await lerToken();
  return {
    configurado: true,
    conectado: Boolean(guardado?.refresh_token),
    pendencias: [],
    expiraEm: guardado?.expira_em || null,
    conectadoEm: guardado?.conectado_em || null,
    ultimoErro: guardado?.ultimo_erro || null,
  };
}

/* ---------------------------------------------------------------- *
 * Produtos, situações e nota
 * ---------------------------------------------------------------- */

export interface ProdutoBling {
  id: string;
  codigo: string | null;
  nome: string | null;
  preco: number;
  estoque: number | null;
  situacao: string | null;
}

function lerProduto(p: Record<string, unknown>): ProdutoBling {
  const estoque = (p.estoque || {}) as Record<string, unknown>;
  const saldo = estoque.saldoVirtualTotal ?? estoque.saldoFisicoTotal ?? p.saldo;
  return {
    id: String(p.id ?? ""),
    codigo: texto(p.codigo),
    nome: texto(p.nome),
    preco: numero(p.preco),
    estoque: saldo === undefined || saldo === null ? null : numero(saldo),
    situacao: texto(p.situacao),
  };
}

export async function listarProdutos(opcoes: {
  pesquisa?: string;
  codigo?: string;
  maxPaginas?: number;
} = {}): Promise<{ produtos: ProdutoBling[]; erro: string | null }> {
  const { linhas, erro } = await paginar<Record<string, unknown>>(
    "/produtos",
    { pesquisa: opcoes.pesquisa, codigo: opcoes.codigo },
    opcoes.maxPaginas ?? 3
  );
  return { produtos: linhas.map(lerProduto), erro };
}

/**
 * Situações de pedido de venda — os códigos que o Bling usa para "em aberto",
 * "atendido", "cancelado".
 *
 * Existe porque sem isto ninguém consegue ler o campo `situacao` dos pedidos:
 * o que vem lá é um id, e adivinhar o que cada id significa é o caminho curto
 * para um relatório contando pedido cancelado como venda.
 */
export async function listarSituacoes(): Promise<{ situacoes: unknown[]; erro: string | null }> {
  // Módulo 98310 é o de Pedidos de Venda na API v3.
  const r = await chamarBling<unknown[]>("/situacoes/modulos/98310");
  return { situacoes: Array.isArray(r.dados) ? r.dados : [], erro: r.erro };
}

/** Nota fiscal de um pedido, quando existe. */
export async function notaDoPedido(pedidoId: string): Promise<RespostaBling> {
  return chamarBling(`/nfe`, { query: { idPedidoVenda: pedidoId } });
}

/* ---------------------------------------------------------------- *
 * Escrita
 *
 * Duas operações e mais nada. Escrita em ERP é dinheiro e é obrigação
 * fiscal: cada função aqui precisa de uma razão concreta para existir, e
 * "para ficar completo" não é razão.
 * ---------------------------------------------------------------- */

export interface NovoContato {
  nome: string;
  telefone?: string;
  email?: string;
  documento?: string;
}

export async function criarContato(dados: NovoContato): Promise<RespostaBling> {
  if (!dados.nome?.trim()) {
    return { ok: false, dados: null, erro: "nome é obrigatório", status: 0 };
  }
  return chamarBling("/contatos", {
    metodo: "POST",
    corpo: {
      nome: dados.nome.trim(),
      tipo: "F",
      numeroDocumento: dados.documento || undefined,
      telefone: dados.telefone || undefined,
      email: dados.email || undefined,
    },
  });
}

export interface NovoPedido {
  contatoId: string;
  itens: { produtoId?: string; descricao: string; quantidade: number; valor: number }[];
  observacoes?: string;
}

/**
 * Emite um pedido de venda.
 *
 * Confere o básico ANTES de chamar o Bling: item sem quantidade ou com valor
 * zero entra no ERP como pedido válido de R$ 0,00, e alguém só descobre no
 * fechamento do mês. É mais barato recusar aqui.
 */
export async function criarPedido(dados: NovoPedido): Promise<RespostaBling> {
  if (!dados.contatoId) {
    return { ok: false, dados: null, erro: "contatoId é obrigatório", status: 0 };
  }
  if (!dados.itens?.length) {
    return { ok: false, dados: null, erro: "pedido sem itens", status: 0 };
  }
  for (const item of dados.itens) {
    if (!item.descricao?.trim()) {
      return { ok: false, dados: null, erro: "item sem descrição", status: 0 };
    }
    if (!(item.quantidade > 0)) {
      return { ok: false, dados: null, erro: `item "${item.descricao}" sem quantidade`, status: 0 };
    }
    if (!(item.valor > 0)) {
      return { ok: false, dados: null, erro: `item "${item.descricao}" com valor zero`, status: 0 };
    }
  }

  return chamarBling("/pedidos/vendas", {
    metodo: "POST",
    corpo: {
      contato: { id: Number(dados.contatoId) },
      itens: dados.itens.map((i) => ({
        codigo: i.produtoId || undefined,
        descricao: i.descricao,
        quantidade: i.quantidade,
        valor: i.valor,
      })),
      observacoes: dados.observacoes || undefined,
    },
  });
}
