// ============================================================
// PDV → /sistema (MEU BLING, o ERP próprio da loja).
//
// Pedido do Thiago (22/10/2026): o /pdv manda as vendas para o /sistema e não
// mais para o Bling. Quem chama é o servidor do site, nunca o navegador, pela
// porta do site no MEU BLING (/api/v1/integracoes/site/*, código no repositório
// balaocastelo-dev/meu-bling, apps/api/src/modules/site/routes.ts).
//
// Variáveis na Vercel:
//   MEU_BLING_CHAVE  a mesma SITE_CHAVE_INTEGRACAO do /etc/meu-bling.env da VPS
//                    (o deploy do MEU BLING copia para a área de transferência)
//   MEU_BLING_URL    opcional; padrão https://srv1963897.hstgr.cloud/sistema
//
// Sem a chave, com a VPS fora ou com o sistema reiniciando, a venda fica gravada
// no site ("aguardando o sistema") e segue sozinha depois — nada se perde.
// ============================================================

import { createHmac, timingSafeEqual } from "crypto";
import { gravar, ler } from "@/lib/arena/gaveta";
import { soDigitos } from "./calculos";
import type { ClienteDaVenda, FormaDePagamento } from "./tipos";

const BASE = (process.env.MEU_BLING_URL || "https://srv1963897.hstgr.cloud/sistema").replace(/\/$/, "");
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.balao.info").replace(/\/$/, "");

const chave = () => (process.env.MEU_BLING_CHAVE || "").trim();

/** O sistema não respondeu (fora do ar, sem chave, chave errada): a venda espera e tenta de novo. */
export class SemAcessoAoSistema extends Error {
  constructor(motivo: string) {
    super(motivo);
    this.name = "SemAcessoAoSistema";
  }
}

/** O sistema respondeu e recusou (dados da venda, o que falta para a nota…): a mensagem é para o balcão ler. */
export class ErroDoSistema extends Error {
  constructor(public status: number, mensagem: string) {
    super(mensagem);
    this.name = "ErroDoSistema";
  }
}

type Buscar = typeof fetch;
let buscar: Buscar = (...a) => fetch(...a);
/** Só para os testes. */
export function _trocarRede(f: Buscar) {
  buscar = f;
}

export async function chamarSistema<T>(metodo: "GET" | "POST", rota: string, corpo?: unknown, opcoes: { bruto?: boolean } = {}): Promise<T> {
  const k = chave();
  if (!k) throw new SemAcessoAoSistema("Falta ligar o PDV ao /sistema: cadastre MEU_BLING_CHAVE na Vercel (o deploy do MEU BLING copia a chave).");
  let r: Response;
  try {
    r = await buscar(`${BASE}/api/v1/integracoes/site${rota}`, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${k}`,
        Accept: opcoes.bruto ? "application/pdf" : "application/json",
        ...(corpo !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
  } catch (e) {
    throw new SemAcessoAoSistema(`O /sistema não respondeu (${(e as Error).name === "TimeoutError" ? "demorou demais" : "sem conexão"}).`);
  }
  if (opcoes.bruto && r.ok) return r as unknown as T;
  const texto = await r.text();
  let j: { erro?: string } & Record<string, unknown> = {};
  try {
    j = texto ? JSON.parse(texto) : {};
  } catch {
    /* resposta sem JSON (proxy, página de erro) */
  }
  if (r.ok) return j as T;
  const msg = String(j.erro || `O /sistema respondeu ${r.status}.`);
  if (r.status === 401 || r.status === 503 || r.status >= 500 || r.status === 404 && !j.erro) throw new SemAcessoAoSistema(msg);
  throw new ErroDoSistema(r.status, msg);
}

// ---------------------------------------------------------------- vendedores

export interface VendedorDoSistema {
  id: string;
  nome: string;
}

let vendedoresEmMemoria: { em: number; lista: VendedorDoSistema[] } | null = null;

/** Vendedores ativos do /sistema. Guarda uma cópia para o balcão abrir mesmo com o sistema fora. */
export async function vendedores(): Promise<{ lista: VendedorDoSistema[]; doSistema: boolean }> {
  if (vendedoresEmMemoria && Date.now() - vendedoresEmMemoria.em < 5 * 60_000) return { lista: vendedoresEmMemoria.lista, doSistema: true };
  try {
    const r = await chamarSistema<{ vendedores: { id: number; nome: string }[] }>("GET", "/vendedores");
    const lista = (r.vendedores ?? []).map((v) => ({ id: String(v.id), nome: String(v.nome || "").trim() || `Vendedor ${v.id}` }));
    vendedoresEmMemoria = { em: Date.now(), lista };
    await gravar("pdv/vendedores-sistema", { em: new Date().toISOString(), lista }, "*").catch(() => undefined);
    return { lista, doSistema: true };
  } catch (e) {
    const copia = (await ler<{ lista: VendedorDoSistema[] }>("pdv/vendedores-sistema").catch(() => ({ dados: null }))).dados;
    if (copia?.lista?.length) return { lista: copia.lista, doSistema: false };
    throw e;
  }
}

export async function statusDoSistema(): Promise<{ ligado: boolean; motivo: string | null }> {
  try {
    await chamarSistema("GET", "/status");
    return { ligado: true, motivo: null };
  } catch (e) {
    return { ligado: false, motivo: (e as Error).message };
  }
}

// ---------------------------------------------------------------- clientes

export async function buscarClientePorDocumento(documento: string): Promise<ClienteDaVenda | null> {
  const r = await chamarSistema<{ cliente: (ClienteDaVenda & { sistemaId: number }) | null }>("GET", `/clientes?documento=${soDigitos(documento)}`);
  return r.cliente ?? null;
}

// ---------------------------------------------------------------- vendas

export interface NotaResumo {
  id: number;
  numero: number;
  serie: number;
  modelo: number;
  situacao: string;
  chave: string | null;
  motivo: string | null;
  cStat: string | null;
  autorizadaEm: string | null;
}

export interface VendaDoSistema {
  id: number;
  numero: number;
  data: string;
  criadaEm: string;
  origem: string;
  pdvId: string | null;
  situacao: { id: number; nome: string; final: boolean; cancelamento: boolean };
  cancelada: boolean;
  vendedor: { id: number; nome: string } | null;
  cliente: ClienteDaVenda & { sistemaId: number };
  itens: { nome: string; codigo: string | null; quantidade: number; valor: number; total: number; siteId: string | null; foto: string | null }[];
  totalProdutos: number;
  desconto: number;
  total: number;
  pagamentos: { forma: string; tipo: string | null; valor: number; observacao: string | null }[];
  observacoes: string | null;
  nota: NotaResumo | null;
}

export interface NovaVendaNoSistema {
  pdvId: string;
  data: string; // AAAA-MM-DD
  operador: string;
  vendedorId: number | null;
  cliente: ClienteDaVenda;
  itens: { siteId: string | null; nome: string; foto: string | null; quantidade: number; valor: number }[];
  descontoEmReais: number;
  pagamentos: { forma: FormaDePagamento; valor: number; parcelas?: number | null }[];
  observacoes: string;
  observacoesInternas: string;
}

/** Cria a venda no /sistema. Repetir com o mesmo pdvId devolve a mesma venda (nunca duplica). */
export async function enviarVenda(v: NovaVendaNoSistema): Promise<VendaDoSistema> {
  const r = await chamarSistema<{ venda: VendaDoSistema }>("POST", "/vendas", v);
  return r.venda;
}

export async function vendaDoSistema(id: number): Promise<VendaDoSistema> {
  return (await chamarSistema<{ venda: VendaDoSistema }>("GET", `/vendas/${id}`)).venda;
}

export interface LinhaDoSistema {
  id: number;
  numero: number;
  criadaEm: string;
  origem: string;
  pdvId: string | null;
  cliente: string;
  vendedor: { id: number; nome: string } | null;
  total: number;
  situacao: { id: number; nome: string; final: boolean; cancelamento: boolean };
  cancelada: boolean;
  nota: NotaResumo | null;
}

export async function vendasDoDiaNoSistema(dia: string): Promise<LinhaDoSistema[]> {
  return (await chamarSistema<{ vendas: LinhaDoSistema[] }>("GET", `/vendas?dia=${dia}`)).vendas ?? [];
}

/** Gera e transmite a NF-e (modelo 55). Com `cliente`, ele passa a ser o cliente da venda antes da nota. */
export async function emitirNota(vendaId: number, cliente?: ClienteDaVenda | null): Promise<NotaResumo | null> {
  return (await chamarSistema<{ nota: NotaResumo | null }>("POST", `/vendas/${vendaId}/nfe`, cliente ? { cliente } : {})).nota;
}

export async function consultarNota(notaId: number): Promise<NotaResumo | null> {
  return (await chamarSistema<{ nota: NotaResumo | null }>("POST", `/notas/${notaId}/consultar`, {})).nota;
}

export async function pdfDoDanfe(notaId: number): Promise<Response> {
  return chamarSistema<Response>("GET", `/notas/${notaId}/danfe`, undefined, { bruto: true });
}

// ---------------------------------------------------------------- link público do DANFE (o QR do cupom)

function assinatura(notaId: number): string | null {
  const k = chave();
  if (!k) return null;
  return createHmac("sha256", k).update(`danfe:${notaId}`).digest("hex").slice(0, 32);
}

/** Link que o cliente abre pelo QR do cupom, sem senha: só serve para esta nota. */
export function linkDoDanfe(notaId: number | null | undefined): string | null {
  if (!notaId) return null;
  const t = assinatura(notaId);
  return t ? `${SITE}/api/pdv/danfe/${notaId}?t=${t}` : null;
}

export function assinaturaConfere(notaId: number, t: string | null | undefined): boolean {
  const esperada = assinatura(notaId);
  if (!esperada || !t || t.length !== esperada.length) return false;
  return timingSafeEqual(Buffer.from(esperada), Buffer.from(t));
}
