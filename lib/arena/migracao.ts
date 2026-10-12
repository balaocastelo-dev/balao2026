// ============================================================
// Arena: na primeira vez que a gaveta nova é usada, traz o que já existia.
//
//  1. Se o Blob acabou de ser criado e a Arena vinha guardando na gaveta do
//     banco (tabela arena_ajustes, chaves "g:…"), copia tudo de lá.
//  2. Senão, lê as tabelas da primeira versão (PR #47): arena_vendedores,
//     arena_ajustes (regras, corrida, prêmio, chave do vigia) e os pontos
//     lançados à mão. As vendas e orçamentos do Bling não são copiados: o
//     vigia manda tudo de novo (a configuração nova pede a varredura).
//
// Devolve null se o banco estiver fora do ar (a Arena começa vazia e tenta de
// novo depois), e uma configuração vazia se não houver nada para trazer.
// ============================================================

import { gavetaDoBanco, gravar, ConflitoDeVersao } from "./gaveta";
import type { ConfigDaArena } from "./dados";
import type { Lancamento, Piloto } from "./tipos";

type Linha = Record<string, unknown>;

export interface Importacao {
  config: Partial<ConfigDaArena>;
  trouxeLancamentos: boolean;
}

const naoExiste = (e: unknown) => /doesn't exist|no such table|Unknown column/i.test(String((e as Error)?.message || e));

function bancoConfigurado() {
  return Boolean(process.env.MYSQL_HOST && process.env.MYSQL_DATABASE && process.env.MYSQL_USER && process.env.MYSQL_PASSWORD);
}

function mesesRecentes(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    out.push(x.toISOString().slice(0, 7));
  }
  return out;
}

async function copiarDaGavetaDoBanco(): Promise<Importacao | null | "nada"> {
  const antiga = gavetaDoBanco();
  if (!antiga) return "nada";
  const config = await antiga.ler<ConfigDaArena>("config");
  if (!config) return "nada";
  for (const chave of ["vigia", "avisos", ...mesesRecentes(7).map((m) => `lanc-${m}`)]) {
    const doc = await antiga.ler<unknown>(chave);
    if (doc == null) continue;
    try {
      await gravar(chave, doc, null);
    } catch (e) {
      if (!(e instanceof ConflitoDeVersao)) throw e; // já existe no Blob: fica o do Blob
    }
  }
  return { config, trouxeLancamentos: true };
}

async function lerTabelasDaPrimeiraVersao(): Promise<Importacao> {
  const { turso } = await import("@/lib/turso");
  const config: Partial<ConfigDaArena> = {};

  // Ajustes (chave/valor em JSON)
  try {
    const r = await turso.execute(
      "SELECT chave, valor FROM arena_ajustes WHERE chave IN ('regras','corrida','premio','vigia_chave','bling_vendedores')"
    );
    for (const x of r.rows as Linha[]) {
      let v: unknown = null;
      try {
        v = JSON.parse(String(x.valor));
      } catch {
        continue;
      }
      const k = String(x.chave);
      if (k === "regras") config.regras = v as ConfigDaArena["regras"];
      if (k === "corrida") config.corrida = v as ConfigDaArena["corrida"];
      if (k === "premio") config.premio = v as ConfigDaArena["premio"];
      if (k === "vigia_chave" && typeof v === "string") config.chaveHash = v;
      if (k === "bling_vendedores" && Array.isArray(v)) config.vendedoresBling = v as ConfigDaArena["vendedoresBling"];
    }
  } catch (e) {
    if (!naoExiste(e)) throw e;
  }

  // Pilotos
  try {
    const r = await turso.execute("SELECT * FROM arena_vendedores");
    config.pilotos = (r.rows as Linha[]).map(
      (x, i) =>
        ({
          id: String(x.id),
          nome: String(x.nome ?? ""),
          apelido: x.apelido ? String(x.apelido) : null,
          foto: x.avatar_url ? String(x.avatar_url) : null,
          cor: x.cor ? String(x.cor) : undefined,
          kart: x.kart ? String(x.kart) : undefined,
          numero: x.numero != null ? Number(x.numero) : i + 1,
          blingVendedorId: x.bling_vendedor_id ? String(x.bling_vendedor_id) : null,
          metaSemana: x.meta_semana != null ? Number(x.meta_semana) : null,
          metaMes: x.meta_mes != null ? Number(x.meta_mes) : null,
          ativo: x.ativo == null ? true : Boolean(Number(x.ativo)),
        }) as unknown as Piloto
    );
  } catch (e) {
    if (!naoExiste(e)) throw e;
  }

  // Pontos lançados à mão
  try {
    const r = await turso.execute("SELECT * FROM arena_lancamentos WHERE origem = 'manual'");
    const porMes = new Map<string, Record<string, Lancamento>>();
    for (const x of r.rows as Linha[]) {
      const l = {
        id: String(x.id),
        tipo: "manual",
        origem: "manual",
        blingId: null,
        numero: null,
        blingVendedorId: null,
        pilotoId: x.piloto_id ? String(x.piloto_id) : null,
        contatoId: null,
        contatoNome: null,
        data: String(x.data),
        registradoEm: String(x.registrado_em ?? new Date().toISOString()),
        historico: false,
        total: 0,
        situacaoId: null,
        situacao: null,
        itens: [],
        licencas: 0,
        pontos: Number(x.pontos) || 0,
        detalhe: null,
        turbo: 1,
        status: String(x.status ?? "valido"),
        motivo: x.motivo ? String(x.motivo) : null,
        anuladoManual: false,
        pontosManual: null,
      } as Lancamento;
      const mes = l.data.slice(0, 7);
      porMes.set(mes, { ...(porMes.get(mes) ?? {}), [l.id]: l });
    }
    for (const [mes, itens] of porMes) {
      try {
        await gravar(`lanc-${mes}`, { versao: 1, itens }, null);
      } catch (e) {
        if (!(e instanceof ConflitoDeVersao)) throw e;
      }
    }
  } catch (e) {
    if (!naoExiste(e)) throw e;
  }

  return { config, trouxeLancamentos: false };
}

export async function importarConfig(): Promise<Importacao | null> {
  if (!bancoConfigurado()) return { config: {}, trouxeLancamentos: false };
  try {
    const daGaveta = await copiarDaGavetaDoBanco();
    if (daGaveta && daGaveta !== "nada") return daGaveta;
    return await lerTabelasDaPrimeiraVersao();
  } catch (e) {
    console.warn("[arena:migracao] banco antigo fora do ar; tento de novo depois:", (e as Error).message);
    return null;
  }
}
