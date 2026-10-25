// ============================================================
// Arena ← MEU BLING (/sistema): as vendas da corrida.
//
// Pedido do Thiago (25/10/2026): "desconecta de vez o Bling e conecta de vez o
// MEU BLING". Até 24/10 as vendas vinham do Bling pelo vigia do PC
// (scripts/arena-vigia → /api/arena/bling). O vigia foi desligado e não volta:
// agora o próprio site lê as vendas no MEU BLING, pela porta do site
// (lib/pdv/sistema.ts → chamarSistema), a cada 5 minutos (/api/cron/arena-sistema)
// ou quando o painel pede ("Ler agora").
//
// Cada leitura: hoje e ontem; na primeira do dia, desde o começo do mês; e,
// se o painel pediu "buscar desde" (config.varrerDesde), desde essa data.
// A lista do sistema não traz itens: os itens (para as licenças) vêm do
// detalhe GET /vendas/:id, só das vendas novas ou mudadas, poucas por volta.
//
// Nada aqui toca o MySQL: a Arena mora no Vercel Blob (lib/arena/gaveta.ts).
// ============================================================

import { chamarSistema, ErroDoSistema, type NotaResumo } from "@/lib/pdv/sistema";
import {
  assinarVendaDoSistema,
  numeroDe,
  gravarDocumentosDoSistema,
  gravarVendedoresDoSistema,
  idDaVendaDoSistema,
  lerConfig,
  lerSincronia,
  ligarVendedoresPeloNome,
  pedirVarredura,
  registrarSincronia,
  vendasDoSistemaGuardadas,
  type DocumentoDoSistemaParaGravar,
} from "./dados";
import { hojeNaLoja, janela, somarDias } from "./periodos";
import { centavos, type DocumentoDoSistema } from "./valores";
import type { Lancamento, SituacaoDaSincronia } from "./tipos";

/** O MEU BLING aceita no máximo 92 dias por pedido (?de=&ate=). */
export const MAX_DIAS_POR_PEDIDO = 92;
/** Quantos detalhes (GET /vendas/:id, para ler os itens) por volta, no máximo. */
export const DETALHES_POR_VOLTA = 15;

/** Uma linha de GET /vendas (forma do contrato, docs/arena.md). */
export interface VendaDaLista {
  id: number;
  numero: number;
  /** AAAA-MM-DD. Na forma antiga (?dia=) não vem: vale o dia pedido. */
  data?: string;
  criadaEm: string;
  origem: string;
  pdvId: string | null;
  cliente: string | null;
  vendedor: { id: number; nome: string } | null;
  total: number;
  situacao: { id: number; nome: string; final: boolean; cancelamento: boolean } | null;
  cancelada: boolean;
  nota: NotaResumo | null;
}

const DIA = /^\d{4}-\d{2}-\d{2}$/;

/** Dias de `de` até `ate`, inclusive. */
export function diasEntre(de: string, ate: string): string[] {
  const out: string[] = [];
  for (let d = de; d <= ate && out.length < 400; d = somarDias(d, 1)) out.push(d);
  return out;
}

/** Corta o período em pedaços de até 92 dias (do mais recente para o mais antigo). */
export function pedacosDoPeriodo(de: string, ate: string, max = MAX_DIAS_POR_PEDIDO): { de: string; ate: string }[] {
  const out: { de: string; ate: string }[] = [];
  let fim = ate;
  while (fim >= de && out.length < 10) {
    const inicio = somarDias(fim, -(max - 1)) < de ? de : somarDias(fim, -(max - 1));
    out.push({ de: inicio, ate: fim });
    fim = somarDias(inicio, -1);
  }
  return out;
}

// O MEU BLING com a forma ?de=&ate= chega num deploy depois deste. Enquanto ele
// responder 400 para essa forma, lê dia a dia (?dia=); tenta a forma nova de novo
// de hora em hora.
let periodoRecusadoEm = 0;
/** Só para os testes. */
export function _esquecerFormaDoPeriodo() {
  periodoRecusadoEm = 0;
}

export interface LeituraDoSistema {
  vendas: VendaDaLista[];
  modo: "periodo" | "por-dia";
  /** O período inteiro foi lido (no dia a dia pode parar no meio, por tempo). */
  completo: boolean;
  /** Incompleto: o primeiro dia que faltou ler (do mais antigo para o mais novo); a próxima volta continua dele. */
  continuarDe: string | null;
}

/**
 * Lê as vendas do período no MEU BLING (até 92 dias por pedido). Se o sistema
 * ainda não conhece ?de=&ate= (400), lê dia a dia até `limiteMs`: primeiro
 * hoje e ontem (sempre), depois do mais antigo para o mais novo, para a volta
 * seguinte continuar de onde parou.
 */
export async function lerVendasDoSistema(de: string, ate: string, opcoes: { limiteMs?: number } = {}): Promise<LeituraDoSistema> {
  if (!DIA.test(de) || !DIA.test(ate) || de > ate) throw new Error("Período inválido.");
  const inicio = Date.now();
  const limiteMs = opcoes.limiteMs ?? 40_000;

  if (Date.now() - periodoRecusadoEm > 3600_000) {
    try {
      const vendas: VendaDaLista[] = [];
      for (const p of pedacosDoPeriodo(de, ate)) {
        const r = await chamarSistema<{ vendas?: VendaDaLista[] }>("GET", `/vendas?de=${p.de}&ate=${p.ate}`);
        vendas.push(...(r.vendas ?? []));
      }
      periodoRecusadoEm = 0;
      return { vendas, modo: "periodo", completo: true, continuarDe: null };
    } catch (e) {
      if (!(e instanceof ErroDoSistema) || e.status !== 400) throw e;
      periodoRecusadoEm = Date.now();
    }
  }

  const vendas: VendaDaLista[] = [];
  const todos = diasEntre(de, ate);
  const recentes = todos.slice(-2).reverse();
  const antigos = todos.slice(0, -2);
  const lerDia = async (dia: string) => {
    const r = await chamarSistema<{ vendas?: VendaDaLista[] }>("GET", `/vendas?dia=${dia}`);
    for (const v of r.vendas ?? []) vendas.push({ ...v, data: v.data && DIA.test(v.data.slice(0, 10)) ? v.data.slice(0, 10) : dia });
  };
  for (const dia of recentes) await lerDia(dia);
  for (const dia of antigos) {
    if (Date.now() - inicio > limiteMs) return { vendas, modo: "por-dia", completo: false, continuarDe: dia };
    await lerDia(dia);
  }
  return { vendas, modo: "por-dia", completo: true, continuarDe: null };
}

/** O dia da venda: o campo `data`; sem ele, o dia de `criadaEm` no relógio da loja. */
export function diaDaVenda(v: Pick<VendaDaLista, "data" | "criadaEm">): string | null {
  if (v.data && DIA.test(v.data.slice(0, 10))) return v.data.slice(0, 10);
  const t = Date.parse(v.criadaEm);
  return Number.isNaN(t) ? null : hojeNaLoja(new Date(t));
}

/** Uma linha da lista do sistema → documento da Arena (sem itens). null se faltar o essencial. */
export function documentoDaVenda(v: VendaDaLista): DocumentoDoSistema | null {
  if (!v || typeof v !== "object") return null;
  const id = Number(v.id);
  const data = diaDaVenda(v);
  if (!Number.isInteger(id) || id <= 0 || !data) return null;
  const vendedorId = v.vendedor && Number(v.vendedor.id) > 0 ? String(v.vendedor.id) : null;
  const total = Number(v.total);
  return {
    sistemaId: String(id),
    numero: v.numero != null ? String(v.numero).slice(0, 32) : "",
    data,
    vendedorId,
    vendedorNome: vendedorId ? String(v.vendedor?.nome ?? "").trim().slice(0, 120) || null : null,
    contatoNome: v.cliente ? String(v.cliente).slice(0, 190) : null,
    total: Number.isFinite(total) ? centavos(total) : 0,
    situacaoId: v.situacao && Number.isFinite(Number(v.situacao.id)) ? Number(v.situacao.id) : null,
    situacao: v.situacao?.nome ? String(v.situacao.nome).slice(0, 60) : null,
    cancelada: Boolean(v.situacao ? v.situacao.cancelamento : v.cancelada),
    itens: [],
  };
}

async function itensDaVenda(id: string): Promise<DocumentoDoSistema["itens"]> {
  const r = await chamarSistema<{ venda?: { itens?: { nome: string; quantidade: number; valor: number }[] } }>("GET", `/vendas/${id}`);
  return (r.venda?.itens ?? []).slice(0, 80).map((i) => ({
    descricao: String(i?.nome ?? "").slice(0, 200),
    quantidade: Number.isFinite(Number(i?.quantidade)) ? Number(i.quantidade) : 1,
    valor: Number.isFinite(Number(i?.valor)) ? Number(i.valor) : 0,
  }));
}

/** A venda precisa dos itens (detalhe): nova, mudou desde a última leitura ou ainda sem itens. */
function precisaDeItens(d: DocumentoDoSistema, guardada: Lancamento | undefined, numerosDoBling: Set<string>): boolean {
  if (d.cancelada) return false;
  const n = numeroDe(d.numero);
  if (n && numerosDoBling.has(n)) return false; // mesmo pedido do Bling: não conta, não precisa de itens
  if (!guardada) return true;
  if (guardada.duplicadoDoBling) return false;
  return guardada.assinatura !== assinarVendaDoSistema(d) || Boolean(guardada.semItens);
}

export interface ResultadoDaSincronia {
  ok: boolean;
  de: string;
  ate: string;
  modo: string | null;
  vendasLidas: number;
  gravadas: number;
  novas: number;
  duplicadas: number;
  ligados: number;
  detalhes: number;
  semItens: number;
  varreduraFeita: boolean;
  erro: string | null;
}

/**
 * Uma volta da leitura: busca as vendas no MEU BLING, grava as novas e as
 * mudadas na gaveta, liga vendedores aos pilotos pelo nome e refaz o telão se
 * algo mudou. Nunca lança erro: o resultado diz o que deu errado.
 */
export async function sincronizarArena(
  opcoes: { agora?: Date; reconstruir?: () => Promise<unknown>; limiteMs?: number; novaVarredura?: boolean } = {}
): Promise<ResultadoDaSincronia> {
  const agora = opcoes.agora ?? new Date();
  const hoje = hojeNaLoja(agora);
  const ontem = somarDias(hoje, -1);
  const inicioDoMes = janela("mes", agora).inicio;
  let anterior: SituacaoDaSincronia | null = null;
  const res: ResultadoDaSincronia = {
    ok: false, de: ontem, ate: hoje, modo: null, vendasLidas: 0, gravadas: 0, novas: 0, duplicadas: 0, ligados: 0, detalhes: 0, semItens: 0, varreduraFeita: false, erro: null,
  };

  try {
    const [config, sinc] = await Promise.all([lerConfig(), lerSincronia()]);
    anterior = sinc;
    // Primeira volta do dia: desde o começo do mês. Pedido do painel ("buscar desde"): desde a data pedida.
    const doMes = sinc.varreduraDoMesEm !== hoje;
    let de = doMes && inicioDoMes < ontem ? inicioDoMes : ontem;
    const pedido = config.varrerDesde && DIA.test(config.varrerDesde) && config.varrerDesde <= hoje ? config.varrerDesde : null;
    if (pedido && pedido < de) de = pedido;
    // Leitura dia a dia que parou no meio na volta anterior: continua de onde parou (a não ser que o painel tenha pedido outra agora).
    const continuar = !opcoes.novaVarredura && sinc.continuarDe && DIA.test(sinc.continuarDe) && sinc.continuarDe > de && sinc.continuarDe <= hoje ? sinc.continuarDe : null;
    if (continuar) de = continuar;
    res.de = de;

    // Vendedores do sistema: nomes no painel e ligação automática pelo nome. Falhar aqui não para a leitura.
    let vendedores: { id: string; nome: string }[] = [];
    try {
      const r = await chamarSistema<{ vendedores?: { id: number; nome: string }[] }>("GET", "/vendedores");
      vendedores = (r.vendedores ?? []).map((v) => ({ id: String(v.id), nome: String(v.nome ?? "").trim() })).filter((v) => v.id);
      await gravarVendedoresDoSistema(vendedores);
    } catch (e) {
      if (!(e instanceof ErroDoSistema)) throw e;
    }

    const leitura = await lerVendasDoSistema(de, hoje, { limiteMs: opcoes.limiteMs });
    res.modo = leitura.modo;
    res.vendasLidas = leitura.vendas.length;
    const docs = leitura.vendas.map(documentoDaVenda).filter((d): d is DocumentoDoSistema => d !== null);

    // Vendedor que aparece na venda mas não veio na lista (inativo): entra na ligação pelo nome.
    for (const d of docs) {
      if (d.vendedorId && d.vendedorNome && !vendedores.some((v) => v.id === d.vendedorId)) vendedores.push({ id: d.vendedorId, nome: d.vendedorNome });
    }
    res.ligados = vendedores.length ? await ligarVendedoresPeloNome(vendedores) : 0;

    // Itens só das vendas novas, mudadas ou ainda sem itens; as mais novas primeiro; poucas por volta.
    const guardadas = docs.length
      ? await vendasDoSistemaGuardadas(docs.reduce((m, d) => (d.data < m ? d.data : m), docs[0].data), hoje)
      : { vendas: new Map<string, Lancamento>(), numerosDoBling: new Set<string>() };
    const precisam = docs
      .filter((d) => precisaDeItens(d, guardadas.vendas.get(idDaVendaDoSistema(d.sistemaId)), guardadas.numerosDoBling))
      .sort((a, b) => b.data.localeCompare(a.data) || Number(b.sistemaId) - Number(a.sistemaId));
    const comItens = new Map<string, DocumentoDoSistema["itens"]>();
    for (const d of precisam.slice(0, DETALHES_POR_VOLTA)) {
      try {
        comItens.set(d.sistemaId, await itensDaVenda(d.sistemaId));
        res.detalhes++;
      } catch {
        break; // o sistema engasgou: o resto fica para a próxima volta
      }
    }

    const paraGravar: DocumentoDoSistemaParaGravar[] = docs.map((d) =>
      comItens.has(d.sistemaId) ? { ...d, itens: comItens.get(d.sistemaId)!, itensLidos: true } : { ...d, itensLidos: false }
    );
    const g = await gravarDocumentosDoSistema(paraGravar, agora, { tudoHistorico: !sinc.ultimoOk });
    res.gravadas = g.gravados;
    res.novas = g.novos;
    res.duplicadas = g.duplicados;
    res.semItens = Math.max(0, precisam.length - res.detalhes);

    if (pedido && leitura.completo) {
      await pedirVarredura(null);
      res.varreduraFeita = true;
    }
    res.ok = true;
    await registrarSincronia(
      {
        ultimoOk: agora.toISOString(),
        vendasLidas: res.vendasLidas,
        gravadas: res.gravadas,
        ultimoErro: null,
        de,
        ate: hoje,
        varreduraDoMesEm: doMes && leitura.completo ? hoje : sinc.varreduraDoMesEm,
        modo: res.modo,
        semItens: res.semItens,
        // Dia a dia e sem tempo para tudo: a próxima volta continua de onde parou.
        continuarDe: leitura.completo ? null : leitura.continuarDe,
      },
      agora,
      !sinc.ultimoOk || res.varreduraFeita
    );
    if (res.gravadas > 0 || res.ligados > 0) await (opcoes.reconstruir ?? reconstruirPadrao)();
    return res;
  } catch (e) {
    res.erro = (e as Error).message || "Falhou";
    await registrarSincronia(
      {
        ultimoOk: anterior?.ultimoOk ?? null,
        vendasLidas: res.vendasLidas,
        gravadas: res.gravadas,
        ultimoErro: res.erro.slice(0, 300),
        de: res.de,
        ate: hoje,
        varreduraDoMesEm: anterior?.varreduraDoMesEm ?? null,
        modo: res.modo ?? anterior?.modo ?? null,
        semItens: anterior?.semItens ?? 0,
        continuarDe: anterior?.continuarDe ?? null,
      },
      agora
    ).catch(() => undefined);
    return res;
  }
}

async function reconstruirPadrao() {
  // Import tardio: estado.ts puxa avisos e WhatsApp, que a leitura em si não usa.
  const { reconstruirTelao } = await import("./estado");
  await reconstruirTelao();
}

// ---------------------------------------------------------------- totais (rotas do PC da loja)

export interface TotaisDasVendas {
  /** Vendas não canceladas. */
  quantidade: number;
  /** Soma das vendas não canceladas. */
  valor: number;
  canceladas: number;
  /** Sem as canceladas; "Sem vendedor" quando não tem; do maior valor para o menor. */
  porVendedor: { nome: string; quantidade: number; valor: number }[];
}

export function totaisDasVendas(vendas: Pick<VendaDaLista, "total" | "cancelada" | "situacao" | "vendedor">[]): TotaisDasVendas {
  let quantidade = 0;
  let valor = 0;
  let canceladas = 0;
  const por = new Map<string, { nome: string; quantidade: number; valor: number }>();
  for (const v of vendas) {
    if (v.cancelada || v.situacao?.cancelamento) {
      canceladas++;
      continue;
    }
    const t = Number(v.total) || 0;
    quantidade++;
    valor += t;
    const comVendedor = Boolean(v.vendedor && v.vendedor.id);
    const chave = comVendedor ? `id:${v.vendedor!.id}` : "sem";
    const nome = comVendedor ? String(v.vendedor!.nome ?? "").trim() || `Vendedor ${v.vendedor!.id}` : "Sem vendedor";
    const x = por.get(chave) ?? { nome, quantidade: 0, valor: 0 };
    x.quantidade++;
    x.valor += t;
    por.set(chave, x);
  }
  return {
    quantidade,
    valor: centavos(valor),
    canceladas,
    porVendedor: [...por.values()]
      .map((x) => ({ ...x, valor: centavos(x.valor) }))
      .sort((a, b) => b.valor - a.valor || b.quantidade - a.quantidade || a.nome.localeCompare(b.nome)),
  };
}
