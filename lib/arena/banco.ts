// ============================================================
// Arena: o que fica no banco (MySQL da Hostinger, via lib/turso).
//
//  - arena_vendedores   → os pilotos (tabela antiga, ganhou colunas novas:
//                          vendedor do Bling, cor, kart, número, metas)
//  - arena_lancamentos  → cada venda e orçamento que veio do Bling, e os
//                          pontos lançados à mão no painel
//  - arena_ajustes      → regras de pontos, metas globais, prêmio, vigia
//
// O projeto não roda migração no deploy: a estrutura é conferida e criada na
// primeira chamada (mesmo jeito de lib/precos/banco.ts).
// ============================================================

import { createHash, randomBytes, randomUUID, timingSafeEqual } from "crypto";
import { turso, isTursoActive } from "@/lib/turso";
import { hojeNaLoja, somarDias } from "./periodos";
import { normalizarRegras, REGRAS_PADRAO, type DocumentoDoBling, type RegrasDePontos } from "./pontos";
import { pontuarLote, type OrcamentoConhecido } from "./lote";
import {
  CORES_DE_KART,
  CORRIDA_PADRAO,
  KARTS,
  PREMIO_PADRAO,
  type AjustesDaCorrida,
  type Lancamento,
  type ModeloDeKart,
  type Piloto,
  type Premio,
  type SituacaoDoVigia,
  type StatusGravado,
} from "./tipos";

type Linha = Record<string, unknown>;

const agoraIso = () => new Date().toISOString();
const txt = (v: unknown) => (v === null || v === undefined || v === "" ? null : String(v));
const num = (v: unknown, padrao = 0) => (Number.isFinite(Number(v)) ? Number(v) : padrao);

export function bancoAtivo() {
  return isTursoActive();
}

// ---------------------------------------------------------------- estrutura

let pronta: Promise<void> | null = null;

async function criar() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS arena_vendedores (
      id VARCHAR(64) PRIMARY KEY,
      nome VARCHAR(190) NOT NULL,
      avatar_url TEXT NULL,
      veiculo_emoji VARCHAR(16) NULL,
      meta_valor DOUBLE NOT NULL DEFAULT 0,
      vendas_atual DOUBLE NOT NULL DEFAULT 0,
      criado_em VARCHAR(40) NULL
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  const cols = await turso.execute(
    "SELECT COLUMN_NAME AS nome FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'arena_vendedores'"
  );
  const tem = new Set(cols.rows.map((r) => String((r as Linha).nome).toLowerCase()));
  const novas: Record<string, string> = {
    bling_vendedor_id: "VARCHAR(32) NULL",
    apelido: "VARCHAR(60) NULL",
    cor: "VARCHAR(16) NULL",
    kart: "VARCHAR(32) NULL",
    numero: "INT NULL",
    meta_semana: "DOUBLE NULL",
    meta_mes: "DOUBLE NULL",
    ativo: "TINYINT NOT NULL DEFAULT 1",
  };
  for (const [c, tipo] of Object.entries(novas)) {
    if (!tem.has(c)) await turso.execute(`ALTER TABLE arena_vendedores ADD COLUMN ${c} ${tipo}`);
  }

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS arena_lancamentos (
      id VARCHAR(80) PRIMARY KEY,
      tipo VARCHAR(16) NOT NULL,
      origem VARCHAR(16) NOT NULL DEFAULT 'bling',
      bling_id VARCHAR(32) NULL,
      numero VARCHAR(32) NULL,
      bling_vendedor_id VARCHAR(32) NULL,
      piloto_id VARCHAR(64) NULL,
      contato_id VARCHAR(32) NULL,
      contato_nome VARCHAR(190) NULL,
      data VARCHAR(10) NOT NULL,
      registrado_em VARCHAR(40) NOT NULL,
      atualizado_em VARCHAR(40) NULL,
      historico TINYINT NOT NULL DEFAULT 0,
      total DOUBLE NOT NULL DEFAULT 0,
      situacao_id INT NULL,
      situacao VARCHAR(60) NULL,
      itens MEDIUMTEXT NULL,
      licencas INT NOT NULL DEFAULT 0,
      pontos DOUBLE NOT NULL DEFAULT 0,
      detalhe TEXT NULL,
      status VARCHAR(16) NOT NULL DEFAULT 'valido',
      motivo VARCHAR(300) NULL,
      anulado_manual TINYINT NOT NULL DEFAULT 0,
      pontos_manual DOUBLE NULL,
      assinatura VARCHAR(64) NULL,
      INDEX idx_arena_lanc_data (data),
      INDEX idx_arena_lanc_contato (contato_id),
      INDEX idx_arena_lanc_registro (registrado_em)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS arena_ajustes (
      chave VARCHAR(64) PRIMARY KEY,
      valor MEDIUMTEXT NULL,
      atualizado_em VARCHAR(40) NULL
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export function garantirEstrutura(): Promise<void> {
  if (!isTursoActive()) return Promise.reject(new Error("Banco de dados não configurado"));
  if (!pronta) {
    pronta = criar().catch((e) => {
      pronta = null;
      throw e;
    });
  }
  return pronta;
}

// ---------------------------------------------------------------- ajustes

async function lerAjuste<T>(chave: string): Promise<T | null> {
  await garantirEstrutura();
  const r = await turso.execute({ sql: "SELECT valor FROM arena_ajustes WHERE chave = ? LIMIT 1", args: [chave] });
  const v = r.rows[0] ? (r.rows[0] as Linha).valor : null;
  if (v == null) return null;
  try {
    return JSON.parse(String(v)) as T;
  } catch {
    return null;
  }
}

async function gravarAjuste(chave: string, valor: unknown) {
  await garantirEstrutura();
  await turso.execute({
    sql: `INSERT INTO arena_ajustes (chave, valor, atualizado_em) VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE valor = VALUES(valor), atualizado_em = VALUES(atualizado_em)`,
    args: [chave, JSON.stringify(valor), agoraIso()],
  });
}

/** Corrida, prêmio e vigia numa consulta só (o telão pergunta sempre; o banco tem cota). */
export async function lerAjustesDoTelao(): Promise<{ corrida: AjustesDaCorrida; premio: Premio; vigia: SituacaoDoVigia }> {
  await garantirEstrutura();
  const r = await turso.execute("SELECT chave, valor FROM arena_ajustes WHERE chave IN ('corrida', 'premio', 'vigia')");
  const m = new Map<string, unknown>();
  for (const x of r.rows as Linha[]) {
    try {
      m.set(String(x.chave), JSON.parse(String(x.valor)));
    } catch {
      /* valor estragado: fica o padrão */
    }
  }
  const v = (m.get("vigia") ?? {}) as Partial<SituacaoDoVigia>;
  return {
    corrida: normalizarCorrida(m.get("corrida")),
    premio: { ...PREMIO_PADRAO, ...normalizarPremio(m.get("premio") ?? PREMIO_PADRAO) },
    vigia: { ultimaVez: v.ultimaVez ?? null, versao: v.versao ?? null, maquina: v.maquina ?? null, ultimoLote: num(v.ultimoLote), ultimoErro: v.ultimoErro ?? null },
  };
}

export async function lerRegras(): Promise<RegrasDePontos> {
  return normalizarRegras((await lerAjuste<unknown>("regras")) ?? REGRAS_PADRAO);
}
export async function gravarRegras(r: unknown) {
  await gravarAjuste("regras", normalizarRegras(r));
}

export function normalizarCorrida(e: unknown): AjustesDaCorrida {
  const o = (e && typeof e === "object" ? e : {}) as Record<string, unknown>;
  const n = (v: unknown, p: number) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Math.min(Number(v), 1_000_000) : p);
  const P = CORRIDA_PADRAO;
  return {
    titulo: String(o.titulo ?? P.titulo).slice(0, 80) || P.titulo,
    periodoTelao: o.periodoTelao === "semana" || o.periodoTelao === "mes" ? o.periodoTelao : "alternar",
    metaGlobalSemana: n(o.metaGlobalSemana, P.metaGlobalSemana),
    metaGlobalMes: n(o.metaGlobalMes, P.metaGlobalMes),
    metaPadraoSemana: Math.max(1, n(o.metaPadraoSemana, P.metaPadraoSemana)),
    metaPadraoMes: Math.max(1, n(o.metaPadraoMes, P.metaPadraoMes)),
    som: typeof o.som === "boolean" ? o.som : P.som,
  };
}
export async function lerCorrida(): Promise<AjustesDaCorrida> {
  return normalizarCorrida(await lerAjuste<unknown>("corrida"));
}
export async function gravarCorrida(c: unknown) {
  await gravarAjuste("corrida", normalizarCorrida(c));
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
export async function lerPremio(): Promise<Premio> {
  return { ...PREMIO_PADRAO, ...normalizarPremio((await lerAjuste<unknown>("premio")) ?? PREMIO_PADRAO) };
}
export async function gravarPremio(p: unknown) {
  await gravarAjuste("premio", normalizarPremio(p));
}

export async function lerVigia(): Promise<SituacaoDoVigia> {
  const v = await lerAjuste<Partial<SituacaoDoVigia>>("vigia");
  return {
    ultimaVez: v?.ultimaVez ?? null,
    versao: v?.versao ?? null,
    maquina: v?.maquina ?? null,
    ultimoLote: num(v?.ultimoLote),
    ultimoErro: v?.ultimoErro ?? null,
  };
}
export async function gravarVigia(v: SituacaoDoVigia) {
  await gravarAjuste("vigia", v);
}

export async function lerVendedoresDoBling(): Promise<{ id: string; nome: string }[]> {
  return (await lerAjuste<{ id: string; nome: string }[]>("bling_vendedores")) ?? [];
}
export async function gravarVendedoresDoBling(lista: { id: string; nome: string }[]) {
  const limpa = lista
    .map((v) => ({ id: String(v.id).replace(/\D/g, "").slice(0, 32), nome: String(v.nome ?? "").slice(0, 120) }))
    .filter((v) => v.id)
    .slice(0, 200);
  if (limpa.length) await gravarAjuste("bling_vendedores", limpa);
}

/** O painel pede ao vigia uma varredura desde uma data (ele lê na próxima volta). */
export async function pedirVarredura(desde: string | null) {
  await gravarAjuste("varrer_desde", desde);
}
export async function lerVarredura(): Promise<string | null> {
  const v = await lerAjuste<string | null>("varrer_desde");
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

// ---------------------------------------------------------------- chave do vigia

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

/** Gera a chave do vigia. O banco guarda só o resumo; a chave aparece uma vez. */
export async function gerarChaveDoVigia(): Promise<string> {
  const chave = `arena_${randomBytes(24).toString("hex")}`;
  await gravarAjuste("vigia_chave", hash(chave));
  return chave;
}

export async function conferirChaveDoVigia(recebida: string | null): Promise<boolean> {
  if (!recebida || recebida.length < 20) return false;
  const guardada = await lerAjuste<string>("vigia_chave");
  if (!guardada) return false;
  const a = Buffer.from(hash(recebida));
  const b = Buffer.from(guardada);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function existeChaveDoVigia(): Promise<boolean> {
  return Boolean(await lerAjuste<string>("vigia_chave"));
}

// ---------------------------------------------------------------- pilotos

function paraPiloto(r: Linha, i: number): Piloto {
  const kart = String(r.kart ?? "");
  return {
    id: String(r.id),
    nome: String(r.nome ?? ""),
    apelido: txt(r.apelido),
    foto: txt(r.avatar_url),
    cor: txt(r.cor) ?? CORES_DE_KART[i % CORES_DE_KART.length],
    kart: (KARTS as readonly string[]).includes(kart) ? (kart as ModeloDeKart) : KARTS[i % KARTS.length],
    numero: num(r.numero, i + 1) || i + 1,
    blingVendedorId: txt(r.bling_vendedor_id),
    metaSemana: r.meta_semana == null ? null : num(r.meta_semana),
    metaMes: r.meta_mes == null ? null : num(r.meta_mes),
    ativo: r.ativo == null ? true : Boolean(Number(r.ativo)),
  };
}

export async function listarPilotos(): Promise<Piloto[]> {
  await garantirEstrutura();
  const r = await turso.execute("SELECT * FROM arena_vendedores ORDER BY COALESCE(numero, 999), nome");
  return (r.rows as Linha[]).map(paraPiloto);
}

export interface DadosDoPiloto {
  nome: string;
  apelido?: string | null;
  foto?: string | null;
  cor?: string | null;
  kart?: string | null;
  numero?: number | null;
  blingVendedorId?: string | null;
  metaSemana?: number | null;
  metaMes?: number | null;
  ativo?: boolean;
}

function limparPiloto(d: DadosDoPiloto) {
  const nome = String(d.nome ?? "").trim().slice(0, 120);
  if (!nome) throw new Error("O piloto precisa de um nome.");
  // Foto: link (https) ou a própria imagem, já reduzida no navegador do painel
  // (data:image/jpeg;base64, até ~45 KB — a coluna é TEXT, 64 KB).
  const f = d.foto ? String(d.foto) : "";
  const foto = /^(https:\/\/|\/[^/])/.test(f)
    ? f.slice(0, 1000)
    : /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(f) && f.length <= 60000
      ? f
      : null;
  if (f && !foto) throw new Error("Foto inválida ou grande demais.");
  const cor = d.cor && /^#[0-9a-f]{6}$/i.test(d.cor) ? d.cor : null;
  const kart = d.kart && (KARTS as readonly string[]).includes(d.kart) ? d.kart : null;
  const meta = (v: unknown) => (v === null || v === undefined || v === "" || !(Number(v) > 0) ? null : Math.min(Number(v), 1_000_000));
  return {
    nome,
    apelido: d.apelido ? String(d.apelido).trim().slice(0, 60) || null : null,
    foto,
    cor,
    kart,
    numero: d.numero && Number(d.numero) > 0 ? Math.min(99, Math.round(Number(d.numero))) : null,
    bling: d.blingVendedorId ? String(d.blingVendedorId).replace(/\D/g, "").slice(0, 32) || null : null,
    metaSemana: meta(d.metaSemana),
    metaMes: meta(d.metaMes),
    ativo: d.ativo === false ? 0 : 1,
  };
}

export async function salvarPiloto(id: string | null, d: DadosDoPiloto): Promise<string> {
  await garantirEstrutura();
  const p = limparPiloto(d);
  if (p.bling) {
    const dono = await turso.execute({
      sql: "SELECT id, nome FROM arena_vendedores WHERE bling_vendedor_id = ? AND id <> ? LIMIT 1",
      args: [p.bling, id ?? ""],
    });
    if (dono.rows[0]) throw new Error(`Esse vendedor do Bling já está ligado a ${(dono.rows[0] as Linha).nome}.`);
  }
  if (id) {
    await turso.execute({
      sql: `UPDATE arena_vendedores SET nome = ?, apelido = ?, avatar_url = ?, cor = ?, kart = ?, numero = ?,
              bling_vendedor_id = ?, meta_semana = ?, meta_mes = ?, ativo = ? WHERE id = ?`,
      args: [p.nome, p.apelido, p.foto, p.cor, p.kart, p.numero, p.bling, p.metaSemana, p.metaMes, p.ativo, id],
    });
    return id;
  }
  const novo = randomUUID();
  await turso.execute({
    sql: `INSERT INTO arena_vendedores (id, nome, apelido, avatar_url, veiculo_emoji, meta_valor, vendas_atual, criado_em,
            cor, kart, numero, bling_vendedor_id, meta_semana, meta_mes, ativo)
          VALUES (?, ?, ?, ?, '🏎️', 0, 0, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [novo, p.nome, p.apelido, p.foto, agoraIso(), p.cor, p.kart, p.numero, p.bling, p.metaSemana, p.metaMes, p.ativo],
  });
  return novo;
}

/** A foto guardada no banco (data URL), para a rota /api/arena/foto/[id]. */
export async function fotoDoPiloto(id: string): Promise<string | null> {
  await garantirEstrutura();
  const r = await turso.execute({ sql: "SELECT avatar_url FROM arena_vendedores WHERE id = ? LIMIT 1", args: [id] });
  return txt((r.rows[0] as Linha | undefined)?.avatar_url);
}

export async function removerPiloto(id: string) {
  await garantirEstrutura();
  await turso.execute({ sql: "DELETE FROM arena_vendedores WHERE id = ?", args: [id] });
}

export async function gravarMetas(metas: { id: string; metaSemana: number | null; metaMes: number | null }[]) {
  await garantirEstrutura();
  for (const m of metas.slice(0, 100)) {
    const v = (x: number | null) => (x && x > 0 ? Math.min(x, 1_000_000) : null);
    await turso.execute({
      sql: "UPDATE arena_vendedores SET meta_semana = ?, meta_mes = ? WHERE id = ?",
      args: [v(m.metaSemana), v(m.metaMes), m.id],
    });
  }
}

// ---------------------------------------------------------------- lançamentos

function paraLancamento(r: Linha): Lancamento {
  const json = <T>(v: unknown, padrao: T): T => {
    if (v == null) return padrao;
    try {
      return JSON.parse(String(v)) as T;
    } catch {
      return padrao;
    }
  };
  return {
    id: String(r.id),
    tipo: String(r.tipo) as Lancamento["tipo"],
    origem: String(r.origem) === "manual" ? "manual" : "bling",
    blingId: txt(r.bling_id),
    numero: txt(r.numero),
    blingVendedorId: txt(r.bling_vendedor_id),
    pilotoId: txt(r.piloto_id),
    contatoId: txt(r.contato_id),
    contatoNome: txt(r.contato_nome),
    data: String(r.data),
    registradoEm: String(r.registrado_em),
    historico: Boolean(Number(r.historico)),
    total: num(r.total),
    situacaoId: r.situacao_id == null ? null : num(r.situacao_id),
    situacao: txt(r.situacao),
    itens: json(r.itens, []),
    licencas: num(r.licencas),
    pontos: num(r.pontos),
    detalhe: json(r.detalhe, null),
    status: String(r.status) as StatusGravado,
    motivo: txt(r.motivo),
    anuladoManual: Boolean(Number(r.anulado_manual)),
    pontosManual: r.pontos_manual == null ? null : num(r.pontos_manual),
  };
}

export async function lancamentosEntre(inicio: string, fim: string, limite = 5000): Promise<Lancamento[]> {
  await garantirEstrutura();
  const r = await turso.execute({
    sql: "SELECT * FROM arena_lancamentos WHERE data >= ? AND data <= ? ORDER BY data DESC, registrado_em DESC LIMIT ?",
    args: [inicio, fim, limite],
  });
  return (r.rows as Linha[]).map(paraLancamento);
}

/** Os mais recentes que entraram (para o telão comemorar e o painel listar). */
export async function lancamentosRecentes(limite = 15): Promise<Lancamento[]> {
  await garantirEstrutura();
  const r = await turso.execute({
    sql: `SELECT * FROM arena_lancamentos WHERE status = 'valido' AND historico = 0
          ORDER BY registrado_em DESC LIMIT ?`,
    args: [Math.min(100, Math.max(1, limite))],
  });
  return (r.rows as Linha[]).map(paraLancamento);
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
  await garantirEstrutura();
  const cond = ["data >= ?", "data <= ?"];
  const args: unknown[] = [f.inicio, f.fim];
  if (f.tipo && ["venda", "orcamento", "manual"].includes(f.tipo)) {
    cond.push("tipo = ?");
    args.push(f.tipo);
  }
  if (f.status && ["valido", "cancelado", "pendente", "ignorado", "anulado"].includes(f.status)) {
    cond.push("status = ?");
    args.push(f.status);
  }
  if (f.busca && f.busca.trim()) {
    cond.push("(numero LIKE ? OR contato_nome LIKE ? OR motivo LIKE ?)");
    const b = `%${f.busca.trim().slice(0, 60)}%`;
    args.push(b, b, b);
  }
  args.push(Math.min(1000, Math.max(1, f.limite ?? 300)));
  const r = await turso.execute({
    sql: `SELECT * FROM arena_lancamentos WHERE ${cond.join(" AND ")} ORDER BY data DESC, registrado_em DESC LIMIT ?`,
    args,
  });
  return (r.rows as Linha[]).map(paraLancamento);
}

async function orcamentosConhecidos(contatos: string[], desde: string): Promise<OrcamentoConhecido[]> {
  if (contatos.length === 0) return [];
  const unicos = [...new Set(contatos)].slice(0, 500);
  const r = await turso.execute({
    sql: `SELECT bling_id, contato_id, bling_vendedor_id, data, total, status FROM arena_lancamentos
          WHERE tipo = 'orcamento' AND data >= ? AND contato_id IN (${unicos.map(() => "?").join(",")})`,
    args: [desde, ...unicos],
  });
  return (r.rows as Linha[]).map((x) => ({
    blingId: String(x.bling_id),
    contatoId: txt(x.contato_id),
    vendedorBlingId: txt(x.bling_vendedor_id),
    data: String(x.data),
    total: num(x.total),
    status: String(x.status),
  }));
}

function assinar(d: DocumentoDoBling, regras: RegrasDePontos) {
  return hash(JSON.stringify([d, regras])).slice(0, 64);
}

const itensCurtos = (d: DocumentoDoBling) =>
  JSON.stringify(
    d.itens.slice(0, 40).map((i) => ({
      descricao: String(i.descricao ?? "").slice(0, 160),
      quantidade: num(i.quantidade, 1),
      valor: num(i.valor),
    }))
  );

/**
 * Grava um lote vindo do vigia. Devolve quantos documentos novos ou mudados
 * entraram. Documento igual ao gravado é pulado; ajuste feito à mão no painel
 * (anular, trocar os pontos) nunca é desfeito pelo Bling.
 */
export async function gravarDocumentos(docs: DocumentoDoBling[], agora = new Date()): Promise<{ gravados: number; novos: number }> {
  await garantirEstrutura();
  if (docs.length === 0) return { gravados: 0, novos: 0 };
  const regras = await lerRegras();
  const hoje = hojeNaLoja(agora);

  const ids = docs.map((d) => `${d.tipo}:${d.blingId}`);
  const existentes = new Map<string, Linha>();
  for (let i = 0; i < ids.length; i += 200) {
    const fatia = ids.slice(i, i + 200);
    const r = await turso.execute({
      sql: `SELECT id, assinatura, anulado_manual, pontos_manual, registrado_em FROM arena_lancamentos
            WHERE id IN (${fatia.map(() => "?").join(",")})`,
      args: fatia,
    });
    for (const x of r.rows as Linha[]) existentes.set(String(x.id), x);
  }

  const mudados = docs.filter((d) => {
    const e = existentes.get(`${d.tipo}:${d.blingId}`);
    return !e || String(e.assinatura ?? "") !== assinar(d, regras);
  });
  if (mudados.length === 0) return { gravados: 0, novos: 0 };

  const menorData = mudados.reduce((m, d) => (d.data < m ? d.data : m), mudados[0].data);
  const conhecidos = await orcamentosConhecidos(
    mudados.map((d) => d.contatoId).filter((c): c is string => Boolean(c)),
    somarDias(menorData, -Math.round(regras.conversaoDias) - 1)
  );
  const pontos = pontuarLote(mudados, conhecidos, regras);

  let novos = 0;
  const agoraTxt = agora.toISOString();
  const comandos = mudados.map((d) => {
    const id = `${d.tipo}:${d.blingId}`;
    const e = existentes.get(id);
    const p = pontos.get(id)!;
    const anulado = e ? Boolean(Number(e.anulado_manual)) : false;
    const manual = e && e.pontos_manual != null ? num(e.pontos_manual) : null;
    let status: StatusGravado = p.status;
    let valor = p.pontos;
    if (anulado) {
      status = "anulado";
      valor = 0;
    } else if (manual != null && p.status === "valido") {
      valor = manual;
    }
    if (!e) novos++;
    // O que chega com data de mais de um dia atrás entra como histórico: conta
    // no placar, mas o telão não faz festa (senão a primeira carga viraria
    // cem comemorações seguidas).
    const historico = !e && d.data < somarDias(hoje, -1) ? 1 : 0;
    return {
      sql: `INSERT INTO arena_lancamentos (id, tipo, origem, bling_id, numero, bling_vendedor_id, contato_id, contato_nome,
              data, registrado_em, atualizado_em, historico, total, situacao_id, situacao, itens, licencas, pontos, detalhe,
              status, motivo, assinatura)
            VALUES (?, ?, 'bling', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE numero = VALUES(numero), bling_vendedor_id = VALUES(bling_vendedor_id),
              contato_id = VALUES(contato_id), contato_nome = VALUES(contato_nome), data = VALUES(data),
              atualizado_em = VALUES(atualizado_em), total = VALUES(total), situacao_id = VALUES(situacao_id),
              situacao = VALUES(situacao), itens = VALUES(itens), licencas = VALUES(licencas), pontos = VALUES(pontos),
              detalhe = VALUES(detalhe), status = VALUES(status), motivo = VALUES(motivo), assinatura = VALUES(assinatura)`,
      args: [
        id, d.tipo, d.blingId, d.numero, d.vendedorBlingId, d.contatoId, d.contatoNome ? d.contatoNome.slice(0, 190) : null,
        d.data, agoraTxt, agoraTxt, historico, d.total, d.situacaoId, d.situacao ? d.situacao.slice(0, 60) : null,
        itensCurtos(d), p.licencas, valor, JSON.stringify(p.detalhe), status,
        anulado ? "Anulado no painel" : p.motivo, assinar(d, regras),
      ],
    };
  });
  for (let i = 0; i < comandos.length; i += 50) {
    await turso.batch(comandos.slice(i, i + 50), "write");
  }
  return { gravados: mudados.length, novos };
}

/** Refaz os pontos de tudo o que veio do Bling com as regras atuais. */
export async function recalcularTudo(): Promise<number> {
  await garantirEstrutura();
  const regras = await lerRegras();
  const r = await turso.execute("SELECT * FROM arena_lancamentos WHERE origem = 'bling' ORDER BY data");
  const lancs = (r.rows as Linha[]).map(paraLancamento);
  const docs: DocumentoDoBling[] = lancs.map((l) => ({
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
  }));
  const pontos = pontuarLote(docs, [], regras);
  const comandos: { sql: string; args: unknown[] }[] = [];
  for (const l of lancs) {
    const p = pontos.get(l.id);
    if (!p) continue;
    let status: StatusGravado = p.status;
    let valor = p.pontos;
    if (l.anuladoManual) {
      status = "anulado";
      valor = 0;
    } else if (l.pontosManual != null && p.status === "valido") {
      valor = l.pontosManual;
    }
    if (status === l.status && valor === l.pontos && p.licencas === l.licencas) continue;
    comandos.push({
      sql: "UPDATE arena_lancamentos SET pontos = ?, status = ?, licencas = ?, detalhe = ?, motivo = ?, atualizado_em = ? WHERE id = ?",
      args: [valor, status, p.licencas, JSON.stringify(p.detalhe), l.anuladoManual ? "Anulado no painel" : p.motivo, agoraIso(), l.id],
    });
  }
  for (let i = 0; i < comandos.length; i += 50) await turso.batch(comandos.slice(i, i + 50), "write");
  return comandos.length;
}

/** Ajuste à mão: anular/reativar ou trocar os pontos de um lançamento do Bling. */
export async function ajustarLancamento(id: string, acao: { anular?: boolean; pontosManual?: number | null }) {
  await garantirEstrutura();
  if (acao.anular === true) {
    await turso.execute({
      sql: "UPDATE arena_lancamentos SET anulado_manual = 1, status = 'anulado', pontos = 0, motivo = 'Anulado no painel', atualizado_em = ? WHERE id = ?",
      args: [agoraIso(), id],
    });
  } else if (acao.anular === false) {
    await turso.execute({
      sql: "UPDATE arena_lancamentos SET anulado_manual = 0, assinatura = NULL, atualizado_em = ? WHERE id = ?",
      args: [agoraIso(), id],
    });
  }
  if (acao.pontosManual !== undefined) {
    const v = acao.pontosManual == null || !Number.isFinite(Number(acao.pontosManual)) ? null : Number(acao.pontosManual);
    await turso.execute({
      sql: "UPDATE arena_lancamentos SET pontos_manual = ?, assinatura = NULL, atualizado_em = ? WHERE id = ?",
      args: [v, agoraIso(), id],
    });
  }
  // Reativar ou trocar pontos: refaz a conta deste e dos vizinhos.
  if (acao.anular === false || acao.pontosManual !== undefined) await recalcularTudo();
}

/** Pontos lançados à mão (bônus por um bom atendimento, penalidade…). */
export async function lancarManual(pilotoId: string, pontos: number, motivo: string, data?: string) {
  await garantirEstrutura();
  const p = Number(pontos);
  if (!Number.isFinite(p) || p === 0 || Math.abs(p) > 100000) throw new Error("Pontos inválidos.");
  const m = String(motivo ?? "").trim().slice(0, 300);
  if (!m) throw new Error("Diga o motivo do lançamento.");
  const dia = data && /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : hojeNaLoja();
  const agora = agoraIso();
  await turso.execute({
    sql: `INSERT INTO arena_lancamentos (id, tipo, origem, piloto_id, data, registrado_em, atualizado_em, historico,
            total, pontos, status, motivo)
          VALUES (?, 'manual', 'manual', ?, ?, ?, ?, 0, 0, ?, 'valido', ?)`,
    args: [`manual:${randomUUID()}`, pilotoId, dia, agora, agora, p, m],
  });
}

export async function apagarManual(id: string) {
  await garantirEstrutura();
  if (!id.startsWith("manual:")) throw new Error("Só lançamento manual pode ser apagado; os do Bling se anulam.");
  await turso.execute({ sql: "DELETE FROM arena_lancamentos WHERE id = ? AND origem = 'manual'", args: [id] });
}

/** Vendedores do Bling que aparecem nos lançamentos e ainda não têm piloto. */
export async function vendedoresSemPiloto(): Promise<{ id: string; documentos: number }[]> {
  await garantirEstrutura();
  const r = await turso.execute(`
    SELECT l.bling_vendedor_id AS id, COUNT(*) AS n FROM arena_lancamentos l
    LEFT JOIN arena_vendedores v ON v.bling_vendedor_id = l.bling_vendedor_id
    WHERE l.bling_vendedor_id IS NOT NULL AND l.bling_vendedor_id <> '' AND l.bling_vendedor_id <> '0' AND v.id IS NULL
    GROUP BY l.bling_vendedor_id ORDER BY n DESC LIMIT 50
  `);
  return (r.rows as Linha[]).map((x) => ({ id: String(x.id), documentos: num(x.n) }));
}
