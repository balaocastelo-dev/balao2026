// ============================================================
// Arena: os dados (pilotos, regras, lançamentos…) guardados na gaveta.
//
// Antes (PR #47, 12/10 de manhã) tudo ia direto para o MySQL da Hostinger.
// Quando a cota de conexões do banco estourou, a Arena parou junto com o
// site. Agora a Arena guarda documentos JSON na gaveta (lib/arena/gaveta.ts):
// Vercel Blob quando existe, o banco só como reserva. Ver docs/arena.md.
// ============================================================

import { createHash, randomBytes, randomUUID, timingSafeEqual } from "crypto";
import { atualizar, gravar, gravarArquivo, guardaArquivos, ler, ConflitoDeVersao, tipoDaGaveta } from "./gaveta";
import { hojeNaLoja, somarDias } from "./periodos";
import {
  centavos,
  normalizarRegras,
  REGRAS_PADRAO,
  valorar,
  valorarDoSistema,
  type DocumentoDoBling,
  type DocumentoDoSistema,
  type RegrasDeValor,
  type Valoracao,
} from "./valores";
import { importarConfig } from "./migracao";
import {
  CORES_DE_KART,
  CORRIDA_PADRAO,
  KARTS,
  PREMIO_PADRAO,
  WHATSAPP_PADRAO,
  type AjustesDaCorrida,
  type AjustesDoWhatsApp,
  type FuncaoDoPiloto,
  type Lancamento,
  type ModeloDeKart,
  type Piloto,
  type Premio,
  type SituacaoDaSincronia,
  type StatusGravado,
} from "./tipos";

// ---------------------------------------------------------------- config

/**
 * versao 3 (12/10, tarde): tudo em reais. A versão 2 contava pontos; ao ler uma
 * configuração antiga, as metas dos pilotos (que eram em pontos) são apagadas,
 * a meta da equipe vira R$ 63 mil / R$ 250 mil e os lançamentos são refeitos.
 */
export interface ConfigDaArena {
  versao: 3;
  pilotos: Piloto[];
  regras: RegrasDeValor;
  corrida: AjustesDaCorrida;
  premio: Premio;
  whatsapp: AjustesDoWhatsApp;
  /** Vendedores do Bling: só para mostrar o histórico (a Arena leu o Bling até 24/10/2026). */
  vendedoresBling: { id: string; nome: string }[];
  /** Vendedores do MEU BLING (GET /vendedores do /sistema), anotados a cada leitura. */
  vendedoresSistema: { id: string; nome: string }[];
  /** Resumo (sha256) da chave do PC da loja (antes "chave do vigia"): abre /api/pc/sistema/*. */
  chaveHash: string | null;
  varrerDesde: string | null;
  /** O banco antigo estava fora do ar na primeira vez: tentar copiar de novo. */
  importacaoPendente?: boolean;
  criadoEm: string;
}

export function configVazia(): ConfigDaArena {
  return {
    versao: 3,
    pilotos: [],
    regras: { ...REGRAS_PADRAO },
    corrida: { ...CORRIDA_PADRAO },
    premio: { ...PREMIO_PADRAO },
    whatsapp: { ...WHATSAPP_PADRAO },
    vendedoresBling: [],
    vendedoresSistema: [],
    chaveHash: null,
    varrerDesde: null,
    criadoEm: new Date().toISOString(),
  };
}

/** Completa o que faltar (documento antigo, campo novo). */
function completar(c: Partial<ConfigDaArena> | null): ConfigDaArena {
  const base = configVazia();
  const antiga = Boolean(c) && Number((c as { versao?: number }).versao ?? 2) < 3;
  const x = { ...base, ...(c ?? {}) } as ConfigDaArena & { turbo?: unknown };
  delete x.turbo;
  x.regras = normalizarRegras(x.regras);
  x.corrida = normalizarCorrida(antiga ? { ...x.corrida, metaGlobalSemana: CORRIDA_PADRAO.metaGlobalSemana, metaGlobalMes: CORRIDA_PADRAO.metaGlobalMes } : x.corrida);
  x.premio = normalizarPremio(x.premio);
  x.whatsapp = normalizarWhatsApp(x.whatsapp);
  x.vendedoresSistema = Array.isArray(x.vendedoresSistema) ? x.vendedoresSistema : [];
  // As metas da versão 2 eram em pontos: não valem como reais.
  x.pilotos = (x.pilotos ?? []).map((p, i) => completarPiloto(antiga ? { ...p, metaSemana: null, metaMes: null } : p, i));
  x.versao = 3;
  return x;
}

function completarPiloto(p: Partial<Piloto>, i: number): Piloto {
  const kart = String(p.kart ?? "");
  return {
    id: String(p.id ?? randomUUID()),
    slug: String(p.slug || slugDe(p.apelido || p.nome || `piloto-${i + 1}`)),
    nome: String(p.nome ?? ""),
    apelido: p.apelido ? String(p.apelido) : null,
    foto: p.foto ? String(p.foto) : null,
    cor: p.cor && /^#[0-9a-f]{6}$/i.test(p.cor) ? p.cor : CORES_DE_KART[i % CORES_DE_KART.length],
    kart: (KARTS as readonly string[]).includes(kart) ? (kart as ModeloDeKart) : KARTS[i % KARTS.length],
    numero: Number(p.numero) > 0 ? Number(p.numero) : i + 1,
    blingVendedorId: p.blingVendedorId ? String(p.blingVendedorId) : null,
    sistemaVendedorId: p.sistemaVendedorId ? String(p.sistemaVendedorId) : null,
    sistemaLigadoPor: p.sistemaLigadoPor === "auto" || p.sistemaLigadoPor === "manual" ? p.sistemaLigadoPor : null,
    funcao: p.funcao === "tecnico" ? "tecnico" : "vendedor",
    metaSemana: p.metaSemana != null && Number(p.metaSemana) > 0 ? Number(p.metaSemana) : null,
    metaMes: p.metaMes != null && Number(p.metaMes) > 0 ? Number(p.metaMes) : null,
    ativo: p.ativo !== false,
  };
}

export function slugDe(texto: string): string {
  return (
    String(texto)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "piloto"
  );
}

function slugLivre(base: string, pilotos: Piloto[], ignorarId: string | null): string {
  const usados = new Set(pilotos.filter((p) => p.id !== ignorarId).map((p) => p.slug));
  let s = slugDe(base);
  for (let n = 2; usados.has(s); n++) s = `${slugDe(base)}-${n}`;
  return s;
}

let ultimaTentativaDeImportar = 0;

/**
 * Lê a configuração. Na primeira vez (gaveta vazia), copia o que já existia:
 * da gaveta do banco (se o Blob acabou de ser criado) ou das tabelas da
 * primeira versão. Se o banco estiver fora do ar, começa vazia e tenta de
 * novo depois (só o painel e o vigia tentam; o telão nunca espera o banco).
 */
export async function lerConfig(opcoes: { tentarImportar?: boolean } = {}): Promise<ConfigDaArena> {
  const { dados } = await ler<ConfigDaArena>("config");
  if (!dados) {
    const importada = await importarConfig().catch(() => null);
    const nova = completar(importada?.config ?? null);
    if (!importada) {
      nova.importacaoPendente = tipoDaGaveta() !== "banco" && tipoDaGaveta() !== "memoria";
    }
    if (!importada?.trouxeLancamentos) nova.varrerDesde = primeiroDiaDeTresMesesAtras();
    try {
      await gravar("config", nova, null);
    } catch (e) {
      if (!(e instanceof ConflitoDeVersao)) throw e;
      return completar((await ler<ConfigDaArena>("config")).dados);
    }
    return nova;
  }
  if (Number((dados as { versao?: number }).versao ?? 2) < 3) return migrarParaReais();
  const c = completar(dados);
  if (c.importacaoPendente && opcoes.tentarImportar && Date.now() - ultimaTentativaDeImportar > 5 * 60_000) {
    ultimaTentativaDeImportar = Date.now();
    const importada = await importarConfig().catch(() => null);
    if (importada) {
      return mudarConfig((atual) => {
        const i = completar(importada.config);
        atual.importacaoPendente = false;
        // Só traz o que ainda não foi refeito à mão no Blob.
        if (atual.pilotos.length === 0) atual.pilotos = i.pilotos;
        if (!atual.chaveHash) atual.chaveHash = i.chaveHash;
        if (!atual.premio.titulo && !atual.premio.imagem) atual.premio = i.premio;
        if (atual.vendedoresBling.length === 0) atual.vendedoresBling = i.vendedoresBling;
        return atual;
      });
    }
  }
  return c;
}

/**
 * 12/10 (tarde): a Arena deixou de contar pontos e passou a contar reais.
 * Grava a configuração na versão 3 e refaz os lançamentos guardados.
 */
async function migrarParaReais(): Promise<ConfigDaArena> {
  const r = await atualizar<ConfigDaArena>("config", configVazia, (c) =>
    Number((c as { versao?: number }).versao ?? 2) < 3 ? completar(c) : undefined
  );
  await recalcularTudo(completar(r)).catch((e) => console.error("[arena:reais]", (e as Error).message));
  return completar(r);
}

function primeiroDiaDeTresMesesAtras() {
  const hoje = hojeNaLoja();
  let [a, m] = hoje.split("-").map(Number);
  m -= 3;
  while (m < 1) {
    m += 12;
    a -= 1;
  }
  return `${a}-${String(m).padStart(2, "0")}-01`;
}

export async function mudarConfig(fn: (c: ConfigDaArena) => ConfigDaArena | undefined | Promise<ConfigDaArena | undefined>) {
  await lerConfig(); // garante que existe
  const r = await atualizar<ConfigDaArena>("config", configVazia, async (c) => {
    const novo = await fn(completar(c));
    return novo === undefined ? undefined : completar(novo);
  });
  return completar(r);
}

// ---------------------------------------------------------------- normalizações

export function normalizarCorrida(e: unknown): AjustesDaCorrida {
  const o = (e && typeof e === "object" ? e : {}) as Record<string, unknown>;
  const n = (v: unknown, p: number) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.min(Number(v), 100_000_000) : p);
  const P = CORRIDA_PADRAO;
  return {
    titulo: String(o.titulo ?? P.titulo).slice(0, 80) || P.titulo,
    periodoTelao: o.periodoTelao === "semana" || o.periodoTelao === "mes" ? o.periodoTelao : "alternar",
    metaGlobalSemana: n(o.metaGlobalSemana, P.metaGlobalSemana),
    metaGlobalMes: n(o.metaGlobalMes, P.metaGlobalMes),
    som: typeof o.som === "boolean" ? o.som : P.som,
  };
}

export function normalizarPremio(e: unknown): Premio {
  const o = (e && typeof e === "object" ? e : {}) as Record<string, unknown>;
  const s = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
  const url = (v: unknown) => {
    const u = s(v, 1000);
    return /^https:\/\//i.test(u) ? u : "";
  };
  return {
    ativo: Boolean(o.ativo),
    titulo: s(o.titulo, 120),
    link: url(o.link),
    imagem: url(o.imagem),
    local: s(o.local, 120),
    descricao: s(o.descricao, 400),
    periodo: o.periodo === "semana" ? "semana" : "mes",
  };
}

/** Grupo (…@g.us) ou número com DDI; qualquer outra coisa vira vazio. */
export function destinoValido(v: unknown): string {
  const s = String(v ?? "").trim();
  if (/^[0-9-]{10,40}@g\.us$/.test(s)) return s;
  const d = s.replace(/\D/g, "");
  return d.length >= 12 && d.length <= 13 && d.startsWith("55") ? d : "";
}

export function normalizarWhatsApp(e: unknown): AjustesDoWhatsApp {
  const o = (e && typeof e === "object" ? e : {}) as Record<string, unknown>;
  const b = (v: unknown, p: boolean) => (typeof v === "boolean" ? v : p);
  const P = WHATSAPP_PADRAO;
  const destino = destinoValido(o.destino);
  return {
    ativo: Boolean(o.ativo) && Boolean(destino),
    destino,
    nomeDestino: String(o.nomeDestino ?? "").slice(0, 80),
    meta: b(o.meta, P.meta),
    equipe: b(o.equipe, P.equipe),
    lideranca: b(o.lideranca, P.lideranca),
  };
}

// ---------------------------------------------------------------- pilotos

export interface DadosDoPiloto {
  nome: string;
  apelido?: string | null;
  foto?: string | null;
  cor?: string | null;
  kart?: string | null;
  numero?: number | null;
  /** Sem o campo (undefined), fica o que já estava: o painel não mexe mais na ligação com o Bling. */
  blingVendedorId?: string | null;
  /** Vendedor do MEU BLING. Undefined = fica o que estava. */
  sistemaVendedorId?: string | null;
  funcao?: FuncaoDoPiloto | null;
  metaSemana?: number | null;
  metaMes?: number | null;
  ativo?: boolean;
}

const resumo = (s: string | Buffer) => createHash("sha1").update(s).digest("hex");

/**
 * Foto: link https, ou a imagem já reduzida no navegador (data URL, ~15 KB).
 * Com o Blob, a imagem vira arquivo e o piloto guarda "gaveta:fotos/…".
 */
async function guardarFoto(pilotoId: string, foto: string | null | undefined, atual: string | null): Promise<string | null> {
  const f = String(foto ?? "");
  if (!f) return null;
  if (f === atual) return atual;
  if (/^https:\/\//.test(f)) return f.slice(0, 1000);
  if (f.startsWith("gaveta:")) return f;
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(f);
  if (!m || f.length > 60000) throw new Error("Foto inválida ou grande demais.");
  if (!guardaArquivos()) return f; // reserva (banco): fica dentro da configuração
  const corpo = Buffer.from(m[2], "base64");
  const chave = `fotos/${slugDe(pilotoId)}-${resumo(corpo).slice(0, 10)}.${m[1] === "jpeg" ? "jpg" : m[1]}`;
  await gravarArquivo(chave, corpo, `image/${m[1]}`);
  return `gaveta:${chave}`;
}

export async function listarPilotos(): Promise<Piloto[]> {
  return (await lerConfig()).pilotos;
}

export async function salvarPiloto(id: string | null, d: DadosDoPiloto): Promise<string> {
  const nome = String(d.nome ?? "").trim().slice(0, 120);
  if (!nome) throw new Error("O piloto precisa de um nome.");
  const idLimpo = (v: string | null | undefined) => (v ? String(v).replace(/\D/g, "").slice(0, 32) || null : null);
  const meta = (v: unknown) => (v === null || v === undefined || v === "" || !(Number(v) > 0) ? null : Math.min(Number(v), 100_000_000));
  const novoId = id ?? randomUUID();
  const atual = (await lerConfig()).pilotos.find((p) => p.id === novoId);
  const foto = await guardarFoto(novoId, d.foto, atual?.foto ?? null);

  await mudarConfig((c) => {
    const i = c.pilotos.findIndex((p) => p.id === novoId);
    const anterior = i >= 0 ? c.pilotos[i] : null;
    const bling = d.blingVendedorId === undefined ? anterior?.blingVendedorId ?? null : idLimpo(d.blingVendedorId);
    const sistema = d.sistemaVendedorId === undefined ? anterior?.sistemaVendedorId ?? null : idLimpo(d.sistemaVendedorId);
    if (bling) {
      const dono = c.pilotos.find((p) => p.blingVendedorId === bling && p.id !== novoId);
      if (dono) throw new Error(`Esse vendedor do Bling já está ligado a ${dono.nome}.`);
    }
    if (sistema) {
      const dono = c.pilotos.find((p) => p.sistemaVendedorId === sistema && p.id !== novoId);
      if (dono) throw new Error(`Esse vendedor do sistema já está ligado a ${dono.nome}.`);
    }
    // Ligação escolhida no painel é "manual": a ligação automática por nome nunca mexe nela
    // (nem quando foi desfeita de propósito). Sem mudança, fica como estava.
    const ligadoPor: Piloto["sistemaLigadoPor"] =
      d.sistemaVendedorId === undefined || sistema === (anterior?.sistemaVendedorId ?? null)
        ? anterior?.sistemaLigadoPor ?? null
        : sistema || anterior?.sistemaVendedorId
          ? "manual"
          : null;
    const apelido = d.apelido ? String(d.apelido).trim().slice(0, 60) || null : null;
    const piloto: Piloto = completarPiloto(
      {
        id: novoId,
        slug: anterior?.slug && (anterior.apelido || anterior.nome) === (apelido || nome) ? anterior.slug : slugLivre(apelido || nome, c.pilotos, novoId),
        nome,
        apelido,
        foto,
        cor: d.cor && /^#[0-9a-f]{6}$/i.test(d.cor) ? d.cor : anterior?.cor,
        kart: (d.kart as ModeloDeKart) ?? anterior?.kart,
        numero: d.numero && Number(d.numero) > 0 ? Math.min(99, Math.round(Number(d.numero))) : anterior?.numero ?? c.pilotos.length + 1,
        blingVendedorId: bling,
        sistemaVendedorId: sistema,
        sistemaLigadoPor: ligadoPor,
        funcao: d.funcao ?? anterior?.funcao ?? "vendedor",
        metaSemana: d.metaSemana === undefined ? anterior?.metaSemana ?? null : meta(d.metaSemana),
        metaMes: d.metaMes === undefined ? anterior?.metaMes ?? null : meta(d.metaMes),
        ativo: d.ativo !== false,
      },
      i >= 0 ? i : c.pilotos.length
    );
    if (i >= 0) c.pilotos[i] = piloto;
    else c.pilotos.push(piloto);
    return c;
  });
  return novoId;
}

export async function removerPiloto(id: string) {
  await mudarConfig((c) => ({ ...c, pilotos: c.pilotos.filter((p) => p.id !== id) }));
}

export async function gravarMetas(metas: { id: string; metaSemana: number | null; metaMes: number | null }[]) {
  const v = (x: number | null) => (x && x > 0 ? Math.min(x, 100_000_000) : null);
  await mudarConfig((c) => {
    for (const m of metas.slice(0, 100)) {
      const p = c.pilotos.find((x) => x.id === m.id);
      if (p) {
        p.metaSemana = v(m.metaSemana);
        p.metaMes = v(m.metaMes);
      }
    }
    return c;
  });
}

// ---------------------------------------------------------------- ajustes

export async function gravarCorrida(x: unknown) {
  await mudarConfig((c) => ({ ...c, corrida: normalizarCorrida(x) }));
}
export async function gravarPremio(x: unknown) {
  await mudarConfig((c) => ({ ...c, premio: normalizarPremio(x) }));
}
export async function gravarWhatsApp(x: unknown) {
  return (await mudarConfig((c) => ({ ...c, whatsapp: normalizarWhatsApp(x) }))).whatsapp;
}
export async function gravarRegras(r: unknown) {
  await mudarConfig((c) => ({ ...c, regras: normalizarRegras(r) }));
}

/** Vendedores do MEU BLING (GET /vendedores do /sistema). Só grava se a lista mudou. */
export async function gravarVendedoresDoSistema(lista: { id: string | number; nome: string }[]) {
  const limpa = lista
    .map((v) => ({ id: String(v.id).replace(/\D/g, "").slice(0, 32), nome: String(v.nome ?? "").trim().slice(0, 120) }))
    .filter((v) => v.id)
    .slice(0, 200);
  if (!limpa.length) return;
  await mudarConfig((c) => (JSON.stringify(c.vendedoresSistema) === JSON.stringify(limpa) ? undefined : { ...c, vendedoresSistema: limpa }));
}

export async function pedirVarredura(desde: string | null) {
  await mudarConfig((c) => (c.varrerDesde === desde ? undefined : { ...c, varrerDesde: desde }));
}

// ---------------------------------------------------------------- chave do PC da loja
//
// Nasceu como "chave do vigia" (o script do PC que trazia as vendas do Bling).
// Desde 25/10/2026 o vigia não roda mais, e a mesma chave abre as rotas do PC
// da loja (/api/pc/sistema/*: JUL.IA e relatórios do Telegram).

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

export async function gerarChaveDoVigia(): Promise<string> {
  const chave = `arena_${randomBytes(24).toString("hex")}`;
  await mudarConfig((c) => ({ ...c, chaveHash: hash(chave) }));
  return chave;
}

export function chaveConfere(recebida: string | null, guardada: string | null): boolean {
  if (!recebida || recebida.length < 20 || !guardada) return false;
  const a = Buffer.from(hash(recebida));
  const b = Buffer.from(guardada);
  return a.length === b.length && timingSafeEqual(a, b);
}

// ---------------------------------------------------------------- leitura do MEU BLING

const SINCRONIA_VAZIA: SituacaoDaSincronia = {
  ultimaVez: null,
  ultimoOk: null,
  vendasLidas: 0,
  gravadas: 0,
  ultimoErro: null,
  de: null,
  ate: null,
  varreduraDoMesEm: null,
  modo: null,
  semItens: 0,
  continuarDe: null,
};

export async function lerSincronia(): Promise<SituacaoDaSincronia> {
  return { ...SINCRONIA_VAZIA, ...((await ler<SituacaoDaSincronia>("sincronia-sistema")).dados ?? {}) };
}

/**
 * Anota a leitura do MEU BLING. O agendador roda a cada 5 minutos: para não
 * gravar no Blob toda vez (cada gravação conta), só grava se passaram 10 min,
 * se algo foi gravado, se o erro mudou ou se a varredura do mês terminou.
 */
export async function registrarSincronia(info: Omit<SituacaoDaSincronia, "ultimaVez">, agora = new Date(), forcar = false) {
  const atual = await ler<SituacaoDaSincronia>("sincronia-sistema");
  const v = { ...SINCRONIA_VAZIA, ...(atual.dados ?? {}) };
  const velho = !v.ultimaVez || agora.getTime() - Date.parse(v.ultimaVez) > 10 * 60_000;
  const igual =
    info.gravadas === 0 &&
    (info.ultimoErro ?? null) === (v.ultimoErro ?? null) &&
    info.varreduraDoMesEm === v.varreduraDoMesEm &&
    info.modo === v.modo &&
    info.semItens === v.semItens &&
    (info.continuarDe ?? null) === (v.continuarDe ?? null);
  if (!forcar && !velho && igual) return v;
  const novo: SituacaoDaSincronia = { ...info, ultimaVez: agora.toISOString() };
  try {
    await gravar("sincronia-sistema", novo, atual.versao);
  } catch (e) {
    if (!(e instanceof ConflitoDeVersao)) throw e;
  }
  return novo;
}

// ---------------------------------------------------------------- lançamentos

interface DocDoMes {
  versao: 1;
  itens: Record<string, Lancamento>;
}

const mesDe = (data: string) => data.slice(0, 7);
const chaveDoMes = (mes: string) => `lanc-${mes}`;

function mesesEntre(inicio: string, fim: string): string[] {
  const out: string[] = [];
  let [a, m] = inicio.slice(0, 7).split("-").map(Number);
  const [af, mf] = fim.slice(0, 7).split("-").map(Number);
  while ((a < af || (a === af && m <= mf)) && out.length < 36) {
    out.push(`${a}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      a++;
    }
  }
  return out;
}

async function lerMes(mes: string) {
  const r = await ler<DocDoMes>(chaveDoMes(mes));
  return { mes, versao: r.versao, doc: r.dados ?? { versao: 1 as const, itens: {} } };
}

export async function lancamentosEntre(inicio: string, fim: string): Promise<Lancamento[]> {
  const meses = await Promise.all(mesesEntre(inicio, fim).map(lerMes));
  const out: Lancamento[] = [];
  for (const m of meses) for (const l of Object.values(m.doc.itens)) if (l.data >= inicio && l.data <= fim) out.push(completarLancamento(l));
  return out.sort((a, b) => (b.data === a.data ? b.registradoEm.localeCompare(a.registradoEm) : b.data.localeCompare(a.data)));
}

/**
 * Lançamento guardado na versão 2 (pontos) ainda sem "valor": o valor sai do
 * próprio documento até o "Recalcular" gravar a versão nova.
 */
function completarLancamento(l: Lancamento): Lancamento {
  if (typeof l.valor === "number") return { ...l, valorLicencas: l.valorLicencas ?? 0, valorManual: l.valorManual ?? null };
  const velho = l as Lancamento & { pontos?: number; pontosManual?: number | null; detalhe?: unknown; turbo?: number };
  const { pontos: _p, pontosManual: _pm, detalhe: _d, turbo: _t, ...resto } = velho;
  void _p; void _pm; void _d; void _t;
  const base = { ...resto, valorLicencas: 0, valorManual: null } as Lancamento;
  if (l.origem === "manual") {
    return { ...base, valor: 0, status: "anulado", anuladoManual: true, motivo: `Lançado em pontos (${_p ?? 0}), antes da Arena contar em reais` };
  }
  return { ...base, valor: l.status === "valido" && l.tipo === "venda" ? centavos(l.total) : 0 };
}

export interface FiltroDeLancamentos {
  inicio: string;
  fim: string;
  tipo?: string;
  status?: string;
  busca?: string;
  limite?: number;
}

export async function buscarLancamentos(f: FiltroDeLancamentos): Promise<Lancamento[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.inicio) || !/^\d{4}-\d{2}-\d{2}$/.test(f.fim)) throw new Error("Datas inválidas.");
  let lista = await lancamentosEntre(f.inicio, f.fim);
  if (f.tipo) lista = lista.filter((l) => l.tipo === f.tipo);
  if (f.status) lista = lista.filter((l) => l.status === f.status);
  if (f.busca?.trim()) {
    const b = f.busca.trim().toLowerCase();
    lista = lista.filter((l) => [l.numero, l.contatoNome, l.motivo].some((x) => x && x.toLowerCase().includes(b)));
  }
  return lista.slice(0, Math.min(1000, Math.max(1, f.limite ?? 300)));
}

const assinar = (d: DocumentoDoBling) => resumo(JSON.stringify(d)).slice(0, 40);

const itensCurtos = (d: DocumentoDoBling) =>
  d.itens.slice(0, 40).map((i) => ({
    descricao: String(i.descricao ?? "").slice(0, 160),
    quantidade: Number(i.quantidade) || 1,
    valor: Number(i.valor) || 0,
  }));

function docDoLancamento(l: Lancamento): DocumentoDoBling {
  return {
    tipo: l.tipo === "orcamento" ? "orcamento" : "venda",
    blingId: l.blingId ?? l.id.split(":")[1],
    numero: l.numero ?? "",
    data: l.data,
    vendedorBlingId: l.blingVendedorId,
    contatoId: l.contatoId,
    contatoNome: l.contatoNome,
    total: l.total,
    situacaoId: l.situacaoId,
    situacao: l.situacao,
    itens: l.itens,
  };
}

/** Valor final: o do documento, ou o que foi mexido à mão no painel. */
function aplicarAjustes(l: Pick<Lancamento, "anuladoManual" | "valorManual">, v: Valoracao) {
  let status: StatusGravado = v.status;
  let valor = v.valor;
  let motivo = v.motivo;
  if (l.anuladoManual) {
    status = "anulado";
    valor = 0;
    motivo = "Anulado no painel";
  } else if (l.valorManual != null && v.status === "valido") {
    valor = l.valorManual;
  }
  return { status, valor: centavos(valor), motivo, licencas: v.licencas, valorLicencas: v.valorLicencas };
}

/**
 * Grava um lote de documentos do Bling (o vigia do PC mandava até 24/10/2026;
 * hoje só os testes e o histórico usam). Documento igual ao gravado é pulado;
 * ajuste feito à mão no painel (anular, trocar o valor) nunca é desfeito.
 */
export async function gravarDocumentos(docs: DocumentoDoBling[], agora = new Date()): Promise<{ gravados: number; novos: number }> {
  if (docs.length === 0) return { gravados: 0, novos: 0 };
  const config = await lerConfig({ tentarImportar: true });
  const regras = config.regras;
  const hoje = hojeNaLoja(agora);

  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const menor = docs.reduce((m, d) => (d.data < m ? d.data : m), docs[0].data);
    const maior = docs.reduce((m, d) => (d.data > m ? d.data : m), docs[0].data);
    // Um mês para trás: o pedido que mudou de data no Bling sai do mês antigo.
    const meses = await Promise.all(mesesEntre(somarDias(menor, -31), maior).map(lerMes));
    const porMes = new Map(meses.map((m) => [m.mes, m]));
    const existente = (id: string) => {
      for (const m of meses) if (m.doc.itens[id]) return m.doc.itens[id];
      return null;
    };

    const mudados = docs.filter((d) => existente(`${d.tipo}:${d.blingId}`)?.assinatura !== assinar(d));
    if (mudados.length === 0) return { gravados: 0, novos: 0 };

    const agoraTxt = agora.toISOString();
    let novos = 0;
    const tocados = new Set<string>();

    for (const d of mudados) {
      const id = `${d.tipo}:${d.blingId}`;
      const e = existente(id) ? completarLancamento(existente(id)!) : null;
      if (!e) novos++;
      // O que chega com data de mais de um dia atrás entra como histórico:
      // conta no placar, mas o telão não comemora.
      const historico = e ? e.historico : d.data < somarDias(hoje, -1);
      const base = { anuladoManual: e?.anuladoManual ?? false, valorManual: e?.valorManual ?? null };
      const v = aplicarAjustes(base, valorar(d, regras));
      const l: Lancamento = {
        id,
        tipo: d.tipo,
        origem: "bling",
        blingId: d.blingId,
        numero: d.numero,
        blingVendedorId: d.vendedorBlingId,
        pilotoId: null,
        contatoId: d.contatoId,
        contatoNome: d.contatoNome ? d.contatoNome.slice(0, 190) : null,
        data: d.data,
        registradoEm: e?.registradoEm ?? agoraTxt,
        historico,
        total: d.total,
        situacaoId: d.situacaoId,
        situacao: d.situacao ? d.situacao.slice(0, 60) : null,
        itens: itensCurtos(d),
        ...base,
        ...v,
        assinatura: assinar(d),
      };
      // Mudou de mês no Bling: sai do mês antigo.
      for (const m of meses) {
        if (m.mes !== mesDe(d.data) && m.doc.itens[id]) {
          delete m.doc.itens[id];
          tocados.add(m.mes);
        }
      }
      let alvo = porMes.get(mesDe(d.data));
      if (!alvo) {
        alvo = { mes: mesDe(d.data), versao: null, doc: { versao: 1, itens: {} } };
        porMes.set(alvo.mes, alvo);
        meses.push(alvo);
      }
      alvo.doc.itens[id] = l;
      tocados.add(alvo.mes);
    }

    try {
      for (const mes of tocados) {
        const m = porMes.get(mes)!;
        m.versao = await gravar(chaveDoMes(mes), m.doc, m.versao);
      }
      return { gravados: mudados.length, novos };
    } catch (e) {
      if (!(e instanceof ConflitoDeVersao)) throw e;
      await new Promise((r) => setTimeout(r, 150 + Math.random() * 300));
    }
  }
  throw new Error("Muitas gravações ao mesmo tempo na Arena; o vigia manda de novo na próxima volta.");
}

// ---------------------------------------------------------------- vendas do MEU BLING

/** Id do lançamento de uma venda do MEU BLING ("mb" separa dos ids do Bling, que eram só números). */
export const idDaVendaDoSistema = (sistemaId: string) => `venda:mb${sistemaId}`;

/**
 * Resumo do que a LISTA do sistema traz (sem os itens): se mudar, a venda é
 * gravada de novo e os itens são relidos.
 */
export function assinarVendaDoSistema(d: DocumentoDoSistema): string {
  const base = [d.sistemaId, d.numero, d.data, d.vendedorId, centavos(d.total), d.situacaoId, d.cancelada ? 1 : 0, d.contatoNome];
  return `mb:${resumo(JSON.stringify(base)).slice(0, 37)}`;
}

export const numeroDe = (n: string | null | undefined) => {
  const s = String(n ?? "").replace(/\D/g, "").replace(/^0+/, "");
  return s || null;
};

export interface DocumentoDoSistemaParaGravar extends DocumentoDoSistema {
  /** Os itens vieram (do detalhe GET /vendas/:id). Sem eles, a venda grava sem licenças e os itens são lidos depois. */
  itensLidos: boolean;
}

/**
 * Grava as vendas lidas do MEU BLING. Venda igual à gravada é pulada; ajuste à
 * mão no painel (anular, trocar o valor) nunca é desfeito pelo sistema.
 *
 * Os pedidos antigos do Bling foram migrados para o MEU BLING com o mesmo
 * número: se a Arena já tem o pedido do Bling com esse número, a venda do
 * sistema fica guardada como "ignorada" (já contou pelo Bling), sem contar duas vezes.
 *
 * `tudoHistorico`: na primeira leitura de todas, nada é comemorado no telão.
 */
export async function gravarDocumentosDoSistema(
  docs: DocumentoDoSistemaParaGravar[],
  agora = new Date(),
  opcoes: { tudoHistorico?: boolean } = {}
): Promise<{ gravados: number; novos: number; duplicados: number }> {
  if (docs.length === 0) return { gravados: 0, novos: 0, duplicados: 0 };
  const config = await lerConfig();
  const regras = config.regras;
  const hoje = hojeNaLoja(agora);

  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const menor = docs.reduce((m, d) => (d.data < m ? d.data : m), docs[0].data);
    const maior = docs.reduce((m, d) => (d.data > m ? d.data : m), docs[0].data);
    // Um mês para trás: a venda que mudou de data sai do mês antigo.
    const meses = await Promise.all(mesesEntre(somarDias(menor, -31), maior).map(lerMes));
    const porMes = new Map(meses.map((m) => [m.mes, m]));
    const existente = (id: string) => {
      for (const m of meses) if (m.doc.itens[id]) return m.doc.itens[id];
      return null;
    };
    const numerosDoBling = new Set<string>();
    for (const m of meses) {
      for (const l of Object.values(m.doc.itens)) {
        if (l.origem === "bling" && l.tipo === "venda") {
          const n = numeroDe(l.numero);
          if (n) numerosDoBling.add(n);
        }
      }
    }

    const mudados = docs.filter((d) => {
      const e = existente(idDaVendaDoSistema(d.sistemaId));
      if (!e) return true;
      if (e.assinatura !== assinarVendaDoSistema(d)) return true;
      return d.itensLidos && Boolean(e.semItens);
    });
    if (mudados.length === 0) return { gravados: 0, novos: 0, duplicados: 0 };

    const agoraTxt = agora.toISOString();
    let novos = 0;
    let duplicados = 0;
    const tocados = new Set<string>();

    for (const d of mudados) {
      const id = idDaVendaDoSistema(d.sistemaId);
      const e = existente(id) ? completarLancamento(existente(id)!) : null;
      if (!e) novos++;
      // Itens: os do detalhe; sem eles, os que já estavam guardados (se havia).
      const itens = d.itensLidos ? d.itens : e?.itens ?? [];
      const semItens = !d.itensLidos && !(e && !e.semItens && e.itens.length > 0);
      const historico = e ? e.historico : Boolean(opcoes.tudoHistorico) || d.data < somarDias(hoje, -1);
      const base = { anuladoManual: e?.anuladoManual ?? false, valorManual: e?.valorManual ?? null };
      const n = numeroDe(d.numero);
      const duplicado = Boolean(n && numerosDoBling.has(n));
      if (duplicado) duplicados++;
      const v: ReturnType<typeof aplicarAjustes> = duplicado
        ? { status: "ignorado", valor: 0, motivo: "Mesmo pedido que já veio do Bling (migrado para o sistema)", licencas: 0, valorLicencas: 0 }
        : aplicarAjustes(base, valorarDoSistema({ total: d.total, cancelada: d.cancelada, itens }, regras));
      const l: Lancamento = {
        id,
        tipo: "venda",
        origem: "sistema",
        blingId: null,
        numero: d.numero || null,
        blingVendedorId: null,
        sistemaVendedorId: d.vendedorId,
        pilotoId: null,
        contatoId: null,
        contatoNome: d.contatoNome ? d.contatoNome.slice(0, 190) : null,
        data: d.data,
        registradoEm: e?.registradoEm ?? agoraTxt,
        historico,
        total: centavos(d.total),
        situacaoId: d.situacaoId,
        situacao: d.situacao ? d.situacao.slice(0, 60) : null,
        itens: itens.slice(0, 40).map((i) => ({
          descricao: String(i.descricao ?? "").slice(0, 160),
          quantidade: Number(i.quantidade) || 1,
          valor: Number(i.valor) || 0,
        })),
        ...base,
        ...v,
        assinatura: assinarVendaDoSistema(d),
        canceladoNaOrigem: d.cancelada,
        duplicadoDoBling: duplicado,
        semItens,
      };
      for (const m of meses) {
        if (m.mes !== mesDe(d.data) && m.doc.itens[id]) {
          delete m.doc.itens[id];
          tocados.add(m.mes);
        }
      }
      let alvo = porMes.get(mesDe(d.data));
      if (!alvo) {
        alvo = { mes: mesDe(d.data), versao: null, doc: { versao: 1, itens: {} } };
        porMes.set(alvo.mes, alvo);
        meses.push(alvo);
      }
      alvo.doc.itens[id] = l;
      tocados.add(alvo.mes);
    }

    try {
      for (const mes of tocados) {
        const m = porMes.get(mes)!;
        m.versao = await gravar(chaveDoMes(mes), m.doc, m.versao);
      }
      return { gravados: mudados.length, novos, duplicados };
    } catch (e) {
      if (!(e instanceof ConflitoDeVersao)) throw e;
      await new Promise((r) => setTimeout(r, 150 + Math.random() * 300));
    }
  }
  throw new Error("Muitas gravações ao mesmo tempo na Arena; a próxima leitura do sistema tenta de novo.");
}

/**
 * Vendas do sistema guardadas perto das datas (para saber quais já têm itens)
 * e os números dos pedidos do Bling (o pedido migrado não pede detalhe à toa).
 */
export async function vendasDoSistemaGuardadas(inicio: string, fim: string): Promise<{ vendas: Map<string, Lancamento>; numerosDoBling: Set<string> }> {
  const vendas = new Map<string, Lancamento>();
  const numerosDoBling = new Set<string>();
  for (const l of await lancamentosEntre(somarDias(inicio, -31), fim)) {
    if (l.origem === "sistema") vendas.set(l.id, l);
    else if (l.origem === "bling" && l.tipo === "venda") {
      const n = numeroDe(l.numero);
      if (n) numerosDoBling.add(n);
    }
  }
  return { vendas, numerosDoBling };
}

/**
 * Refaz os valores dos últimos 6 meses com as regras atuais (mantém os ajustes
 * à mão). Também passa para reais o que ainda estava em pontos.
 */
export async function recalcularTudo(configPronta?: ConfigDaArena): Promise<number> {
  const config = configPronta ?? (await lerConfig());
  const hoje = hojeNaLoja();
  for (let tentativa = 0; tentativa < 4; tentativa++) {
    const meses = await Promise.all(mesesEntre(somarDias(hoje, -186), hoje).map(lerMes));
    const tocados = new Set<string>();
    let mudou = 0;
    for (const m of meses) {
      for (const [id, cru] of Object.entries(m.doc.itens)) {
        const l = completarLancamento(cru);
        const antigo = typeof cru.valor !== "number";
        let novo: Lancamento = l;
        if (l.origem === "bling") {
          novo = { ...l, ...aplicarAjustes(l, valorar(docDoLancamento(l), config.regras)) };
        } else if (l.origem === "sistema") {
          if (l.duplicadoDoBling) continue;
          novo = { ...l, ...aplicarAjustes(l, valorarDoSistema({ total: l.total, cancelada: Boolean(l.canceladoNaOrigem), itens: l.itens }, config.regras)) };
        } else if (l.origem === "assistencia") {
          novo = { ...l, ...aplicarAjustes(l, { status: l.total > 0 ? "valido" : "ignorado", valor: l.total, motivo: l.total > 0 ? null : "OS sem valor", licencas: 0, valorLicencas: 0 }) };
        }
        if (!antigo && novo.status === cru.status && novo.valor === cru.valor && novo.licencas === cru.licencas && novo.valorLicencas === cru.valorLicencas) continue;
        m.doc.itens[id] = novo;
        tocados.add(m.mes);
        mudou++;
      }
    }
    try {
      for (const m of meses) if (tocados.has(m.mes)) await gravar(chaveDoMes(m.mes), m.doc, m.versao);
      return mudou;
    } catch (e) {
      if (!(e instanceof ConflitoDeVersao)) throw e;
    }
  }
  throw new Error("Não consegui recalcular agora (gravações ao mesmo tempo). Tente de novo.");
}

async function mudarLancamento(id: string, data: string | null, fn: (l: Lancamento) => Lancamento | null) {
  // Sem a data, procura nos últimos 6 meses.
  const hoje = hojeNaLoja();
  const meses = data ? [mesDe(data)] : mesesEntre(somarDias(hoje, -186), hoje).reverse();
  for (const mes of meses) {
    let achou = false;
    await atualizar<DocDoMes>(chaveDoMes(mes), () => ({ versao: 1, itens: {} }), (doc) => {
      const l = doc.itens[id];
      if (!l) return undefined;
      achou = true;
      const novo = fn(completarLancamento(l));
      if (novo) doc.itens[id] = novo;
      else delete doc.itens[id];
      return doc;
    });
    if (achou) return true;
  }
  return false;
}

/** Ajuste à mão: anular/reativar ou trocar o valor de uma venda (do sistema ou do Bling) ou de uma OS. */
export async function ajustarLancamento(id: string, acao: { anular?: boolean; valorManual?: number | null; data?: string }) {
  const ok = await mudarLancamento(id, acao.data ?? null, (l) => {
    if (acao.anular !== undefined) l.anuladoManual = acao.anular;
    if (acao.valorManual !== undefined) {
      const v = acao.valorManual;
      l.valorManual = v == null || !Number.isFinite(Number(v)) ? null : centavos(Number(v));
    }
    l.assinatura = null; // o próximo recálculo refaz
    return l;
  });
  if (!ok) throw new Error("Lançamento não encontrado.");
  await recalcularTudo();
}

function lancamentoVazio(id: string, tipo: Lancamento["tipo"], origem: Lancamento["origem"], dia: string): Lancamento {
  return {
    id,
    tipo,
    origem,
    blingId: null,
    numero: null,
    blingVendedorId: null,
    pilotoId: null,
    contatoId: null,
    contatoNome: null,
    data: dia,
    registradoEm: new Date().toISOString(),
    historico: false,
    total: 0,
    situacaoId: null,
    situacao: null,
    itens: [],
    licencas: 0,
    valorLicencas: 0,
    valor: 0,
    status: "valido",
    motivo: null,
    anuladoManual: false,
    valorManual: null,
  };
}

/** Valor lançado à mão (venda fora do sistema, acerto…). Negativo desconta. */
export async function lancarManual(pilotoId: string, valor: number, motivo: string, data?: string) {
  const v = centavos(Number(valor));
  if (!Number.isFinite(v) || v === 0 || Math.abs(v) > 10_000_000) throw new Error("Valor inválido.");
  const m = String(motivo ?? "").trim().slice(0, 300);
  if (!m) throw new Error("Diga o motivo do lançamento.");
  const dia = data && /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : hojeNaLoja();
  const l = { ...lancamentoVazio(`manual:${randomUUID()}`, "manual", "manual", dia), pilotoId, total: v, valor: v, motivo: m };
  await atualizar<DocDoMes>(chaveDoMes(mesDe(dia)), () => ({ versao: 1, itens: {} }), (doc) => {
    doc.itens[l.id] = l;
    return doc;
  });
}

export async function apagarManual(id: string, data?: string) {
  if (!id.startsWith("manual:")) throw new Error("Só lançamento manual pode ser apagado; as vendas e as OS se anulam.");
  if (!(await mudarLancamento(id, data ?? null, () => null))) throw new Error("Lançamento não encontrado.");
}

// ---------------------------------------------------------------- ordens de serviço

/** Uma OS do Fechamento da assistência (tabela weekly_orders). */
export interface OrdemDeServico {
  id: string;
  numero: string | null;
  data: string;
  /** Mão de obra + peças cobradas do cliente. */
  valor: number;
  tecnicoId: string | null;
  status: string | null;
}

/** Tira a OS de qualquer mês dos últimos 7 (e do mês dela), sem gravar mês que não mudou. */
async function tirarOS(id: string, menos: string | null) {
  const hoje = hojeNaLoja();
  const meses = new Set(mesesEntre(somarDias(hoje, -215), somarDias(hoje, 31)));
  for (const mes of meses) {
    if (mes === menos) continue;
    await atualizar<DocDoMes>(chaveDoMes(mes), () => ({ versao: 1, itens: {} }), (doc) => {
      if (!doc.itens[id]) return undefined;
      delete doc.itens[id];
      return doc;
    });
  }
}

/**
 * Grava (ou atualiza) a OS na corrida: o valor vai para o técnico dela. OS sem
 * técnico fica guardada, mas não conta para ninguém até alguém ser escolhido.
 */
export async function registrarOS(os: OrdemDeServico, agora = new Date()) {
  if (!os.id || !/^\d{4}-\d{2}-\d{2}$/.test(os.data)) return;
  const id = `os:${String(os.id).slice(0, 80)}`;
  const mes = mesDe(os.data);
  const valor = centavos(Math.max(0, Number(os.valor) || 0));
  await tirarOS(id, mes);
  const hoje = hojeNaLoja(agora);
  await atualizar<DocDoMes>(chaveDoMes(mes), () => ({ versao: 1, itens: {} }), (doc) => {
    const e = doc.itens[id] ? completarLancamento(doc.itens[id]) : null;
    const base = lancamentoVazio(id, "os", "assistencia", os.data);
    const ajustes = { anuladoManual: e?.anuladoManual ?? false, valorManual: e?.valorManual ?? null };
    const v = aplicarAjustes(ajustes, {
      status: valor > 0 ? "valido" : "ignorado",
      valor,
      motivo: valor > 0 ? null : "OS sem valor",
      licencas: 0,
      valorLicencas: 0,
    });
    doc.itens[id] = {
      ...base,
      ...ajustes,
      ...v,
      numero: os.numero ? String(os.numero).slice(0, 40) : null,
      // Técnico escolhido no painel da Arena não se perde se a OS vier de novo sem técnico.
      pilotoId: os.tecnicoId || e?.pilotoId || null,
      total: valor,
      situacao: os.status ? String(os.status).slice(0, 40) : null,
      registradoEm: e?.registradoEm ?? agora.toISOString(),
      historico: e ? e.historico : os.data < somarDias(hoje, -1),
      motivo: v.motivo ?? (os.tecnicoId || e?.pilotoId ? null : "OS sem técnico"),
    };
    return doc;
  });
}

/** A OS foi apagada no Fechamento: sai da corrida. */
export async function apagarOS(osId: string) {
  await tirarOS(`os:${String(osId).slice(0, 80)}`, null);
}

/** Troca (ou escolhe) o técnico de uma OS direto no painel da Arena. */
export async function trocarTecnicoDaOS(id: string, tecnicoId: string | null, data?: string) {
  if (!id.startsWith("os:")) throw new Error("Só OS tem técnico.");
  const ok = await mudarLancamento(id, data ?? null, (l) => {
    l.pilotoId = tecnicoId || null;
    l.motivo = l.status === "valido" && !tecnicoId ? "OS sem técnico" : l.status === "valido" ? null : l.motivo;
    return l;
  });
  if (!ok) throw new Error("OS não encontrada.");
}

/** Técnicos (pilotos com função técnico), para o Fechamento da assistência. */
export async function listarTecnicos(): Promise<{ id: string; nome: string }[]> {
  return (await lerConfig()).pilotos
    .filter((p) => p.ativo && p.funcao === "tecnico")
    .map((p) => ({ id: p.id, nome: p.apelido || p.nome }));
}

/** Vendedores do MEU BLING que aparecem nas vendas e ainda não têm piloto. */
export async function vendedoresSemPiloto(pilotos: Piloto[], lancs: Lancamento[]): Promise<{ id: string; documentos: number }[]> {
  const ligados = new Set(pilotos.map((p) => p.sistemaVendedorId).filter(Boolean));
  const conta = new Map<string, number>();
  for (const l of lancs) {
    if (l.origem !== "sistema" || !l.sistemaVendedorId || ligados.has(l.sistemaVendedorId)) continue;
    conta.set(l.sistemaVendedorId, (conta.get(l.sistemaVendedorId) ?? 0) + 1);
  }
  return [...conta.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50).map(([id, documentos]) => ({ id, documentos }));
}

// ---------------------------------------------------------------- ligação automática pelo nome

/** "JÚLIA  Souza" → "julia souza". */
export function nomeNormalizado(s: string | null | undefined): string {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
const primeiroDe = (s: string) => s.split(" ")[0] || "";

/**
 * Para cada vendedor do sistema ainda sem piloto, acha o piloto pelo nome:
 * o nome completo igual (sem acento, sem caixa); senão o primeiro nome, se só
 * um piloto e só um vendedor tiverem esse primeiro nome. Nunca mexe em piloto
 * que já tem vendedor do sistema nem em ligação feita (ou desfeita) à mão.
 */
export function ligacoesPeloNome(pilotos: Piloto[], vendedores: { id: string; nome: string }[]): { pilotoId: string; vendedorId: string }[] {
  const ocupados = new Set(pilotos.map((p) => p.sistemaVendedorId).filter(Boolean) as string[]);
  const livre = (p: Piloto) => !p.sistemaVendedorId && p.sistemaLigadoPor !== "manual";
  const semDono = vendedores.filter((v) => v.id && !ocupados.has(v.id) && nomeNormalizado(v.nome));
  const usados = new Set<string>();
  const ligados = new Set<string>();
  const out: { pilotoId: string; vendedorId: string }[] = [];

  // 1) nome completo (ou o nome no telão) igual
  for (const v of semDono) {
    const nv = nomeNormalizado(v.nome);
    const achados = pilotos.filter((p) => nomeNormalizado(p.nome) === nv || (p.apelido && nomeNormalizado(p.apelido) === nv));
    if (achados.length !== 1 || !livre(achados[0]) || usados.has(achados[0].id)) continue;
    out.push({ pilotoId: achados[0].id, vendedorId: v.id });
    usados.add(achados[0].id);
    ligados.add(v.id);
  }
  // 2) primeiro nome único dos dois lados
  for (const v of semDono) {
    if (ligados.has(v.id)) continue;
    const pv = primeiroDe(nomeNormalizado(v.nome));
    if (!pv) continue;
    if (vendedores.filter((x) => primeiroDe(nomeNormalizado(x.nome)) === pv).length !== 1) continue;
    const achados = pilotos.filter((p) => primeiroDe(nomeNormalizado(p.nome)) === pv || (p.apelido && primeiroDe(nomeNormalizado(p.apelido)) === pv));
    if (achados.length !== 1 || !livre(achados[0]) || usados.has(achados[0].id)) continue;
    out.push({ pilotoId: achados[0].id, vendedorId: v.id });
    usados.add(achados[0].id);
    ligados.add(v.id);
  }
  return out;
}

/** Faz (e grava) as ligações automáticas pelo nome. Devolve quantas fez. */
export async function ligarVendedoresPeloNome(vendedores: { id: string; nome: string }[]): Promise<number> {
  const config = await lerConfig();
  if (ligacoesPeloNome(config.pilotos, vendedores).length === 0) return 0;
  let feitas = 0;
  await mudarConfig((c) => {
    feitas = 0;
    for (const { pilotoId, vendedorId } of ligacoesPeloNome(c.pilotos, vendedores)) {
      const p = c.pilotos.find((x) => x.id === pilotoId);
      if (!p || p.sistemaVendedorId || p.sistemaLigadoPor === "manual") continue;
      p.sistemaVendedorId = vendedorId;
      p.sistemaLigadoPor = "auto";
      feitas++;
    }
    return feitas ? c : undefined;
  });
  return feitas;
}

export { tipoDaGaveta };
