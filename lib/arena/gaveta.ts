// ============================================================
// Arena: a "gaveta" — onde a Arena guarda tudo, fora do MySQL.
//
// Pedido do Thiago (12/10/2026): a Arena não pode depender do banco da
// Hostinger, que tem cota de 500 conexões por hora e para o site inteiro
// quando estoura. A Arena guarda documentos JSON pequenos:
//
//   config        pilotos, regras, metas, prêmio, avisos, chave do vigia
//   vigia         última conversa do vigia do PC
//   lanc-AAAA-MM  vendas, orçamentos e OS do mês (um documento por mês)
//   telao         a corrida já calculada, pronta para o telão
//   avisos        o que já foi avisado no WhatsApp
//   fotos/<nome>  fotos dos pilotos
//
// Onde fica, na ordem:
//   1. Vercel Blob (privado) — quando existe BLOB_STORE_ID (Blob ligado ao
//      projeto pelo painel da Vercel, com login OIDC, o jeito novo) ou
//      BLOB_READ_WRITE_TOKEN (o jeito antigo, com chave);
//   2. uma pasta (ARENA_GAVETA_DIR) — testes e desenvolvimento;
//   3. o MySQL (tabela arena_ajustes) — só enquanto o Blob não for criado;
//   4. memória — sem nada configurado (testes).
//
// Toda gravação é condicional à versão lida (`atualizar`): se duas escritas
// se cruzam (vigia e painel ao mesmo tempo), a segunda relê e refaz.
// ============================================================

import { createHash } from "crypto";
import { get, head, put, BlobNotFoundError, BlobPreconditionFailedError } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

export type TipoDeGaveta = "blob" | "pasta" | "banco" | "memoria";

export interface Lido<T> {
  dados: T | null;
  versao: string | null;
}

export class ConflitoDeVersao extends Error {
  constructor(chave: string) {
    super(`A gaveta "${chave}" mudou enquanto era gravada`);
  }
}

interface Backend {
  tipo: TipoDeGaveta;
  ler(chave: string): Promise<Lido<string>>;
  /** versao null = só grava se ainda não existir; "*" = grava por cima, sem conferir. */
  gravar(chave: string, texto: string, versao: string | null, tipoConteudo?: string): Promise<string>;
  lerArquivo?(chave: string): Promise<{ corpo: Buffer; tipo: string } | null>;
  gravarArquivo?(chave: string, corpo: Buffer, tipo: string): Promise<void>;
}

const POR_CIMA = "*";
const resumo = (texto: string) => createHash("sha1").update(texto).digest("hex");
const valida = (chave: string) => {
  if (!/^[a-z0-9][a-z0-9/_.-]{0,120}$/i.test(chave) || chave.includes("..")) throw new Error(`Chave inválida: ${chave}`);
  return chave;
};

// ---------------------------------------------------------------- Vercel Blob

function backendBlob(): Backend {
  const caminho = (c: string) => `arena/${valida(c)}${c.startsWith("fotos/") ? "" : ".json"}`;
  return {
    tipo: "blob",
    async ler(chave) {
      // A versão vem do head(): é a mesma etag que o put() confere no ifMatch.
      // A etag do download (get) é outra — com ela toda gravação dava conflito
      // e o painel mostrava "muitas escritas ao mesmo tempo" (12/10).
      let versao: string;
      try {
        versao = (await head(caminho(chave))).etag;
      } catch (e) {
        if (e instanceof BlobNotFoundError) return { dados: null, versao: null };
        throw e;
      }
      const r = await get(caminho(chave), { access: "private", useCache: false });
      if (!r || r.statusCode !== 200) return { dados: null, versao: null };
      const texto = await new Response(r.stream).text();
      return { dados: texto, versao };
    },
    async gravar(chave, texto, versao, tipoConteudo = "application/json") {
      try {
        const r = await put(caminho(chave), texto, {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: versao !== null,
          ...(versao && versao !== POR_CIMA ? { ifMatch: versao } : {}),
          contentType: tipoConteudo,
          cacheControlMaxAge: 60,
        });
        return r.etag;
      } catch (e) {
        const msg = String((e as Error)?.message || "");
        if (e instanceof BlobPreconditionFailedError || /already exists/i.test(msg)) {
          throw new ConflitoDeVersao(chave);
        }
        console.error(`[arena:gaveta] falha ao gravar "${chave}" no Blob:`, msg);
        throw e;
      }
    },
    async lerArquivo(chave) {
      const r = await get(caminho(chave), { access: "private" });
      if (!r || r.statusCode !== 200) return null;
      return { corpo: Buffer.from(await new Response(r.stream).arrayBuffer()), tipo: r.blob.contentType };
    },
    async gravarArquivo(chave, corpo, tipo) {
      await put(caminho(chave), corpo, { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: tipo });
    },
  };
}

// ---------------------------------------------------------------- pasta (testes)

function backendPasta(dir: string): Backend {
  const arq = (c: string) => path.join(dir, valida(c).replace(/\//g, "__") + (c.startsWith("fotos/") ? "" : ".json"));
  return {
    tipo: "pasta",
    async ler(chave) {
      try {
        const texto = await fs.readFile(arq(chave), "utf8");
        return { dados: texto, versao: resumo(texto) };
      } catch {
        return { dados: null, versao: null };
      }
    },
    async gravar(chave, texto, versao) {
      await fs.mkdir(dir, { recursive: true });
      const atual = await this.ler(chave);
      if (versao !== POR_CIMA && (versao ?? null) !== (atual.versao ?? null)) throw new ConflitoDeVersao(chave);
      await fs.writeFile(arq(chave), texto, "utf8");
      return resumo(texto);
    },
    async lerArquivo(chave) {
      try {
        return { corpo: await fs.readFile(arq(chave)), tipo: "image/jpeg" };
      } catch {
        return null;
      }
    },
    async gravarArquivo(chave, corpo) {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(arq(chave), corpo);
    },
  };
}

// ---------------------------------------------------------------- MySQL (reserva)

let tabelaPronta: Promise<void> | null = null;

async function turso() {
  return (await import("@/lib/turso")).turso;
}

function garantirTabela(): Promise<void> {
  if (!tabelaPronta) {
    tabelaPronta = (async () => {
      const db = await turso();
      await db.execute(`
        CREATE TABLE IF NOT EXISTS arena_ajustes (
          chave VARCHAR(64) PRIMARY KEY,
          valor MEDIUMTEXT NULL,
          atualizado_em VARCHAR(40) NULL
        ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      const cols = await db.execute(
        "SELECT COLUMN_NAME AS nome FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'arena_ajustes'"
      );
      const tem = new Set(cols.rows.map((r) => String((r as Record<string, unknown>).nome).toLowerCase()));
      if (!tem.has("versao")) await db.execute("ALTER TABLE arena_ajustes ADD COLUMN versao VARCHAR(40) NULL");
    })().catch((e) => {
      tabelaPronta = null;
      throw e;
    });
  }
  return tabelaPronta;
}

// Os documentos da gaveta convivem na tabela com as chaves da primeira versão
// (regras, corrida…); o prefixo "g:" separa as duas.
const chaveNoBanco = (c: string) => `g:${valida(c)}`.slice(0, 64);

function backendBanco(): Backend {
  return {
    tipo: "banco",
    async ler(chave) {
      await garantirTabela();
      const db = await turso();
      const r = await db.execute({ sql: "SELECT valor, versao FROM arena_ajustes WHERE chave = ? LIMIT 1", args: [chaveNoBanco(chave)] });
      const linha = r.rows[0] as Record<string, unknown> | undefined;
      if (!linha || linha.valor == null) return { dados: null, versao: null };
      return { dados: String(linha.valor), versao: linha.versao ? String(linha.versao) : resumo(String(linha.valor)) };
    },
    async gravar(chave, texto, versao) {
      await garantirTabela();
      const db = await turso();
      const nova = resumo(texto + Date.now());
      if (versao === null) {
        try {
          await db.execute({
            sql: "INSERT INTO arena_ajustes (chave, valor, versao, atualizado_em) VALUES (?, ?, ?, ?)",
            args: [chaveNoBanco(chave), texto, nova, new Date().toISOString()],
          });
        } catch (e) {
          if (/duplicate/i.test(String((e as Error).message))) throw new ConflitoDeVersao(chave);
          throw e;
        }
        return nova;
      }
      const r =
        versao === POR_CIMA
          ? await db.execute({
              sql: "UPDATE arena_ajustes SET valor = ?, versao = ?, atualizado_em = ? WHERE chave = ?",
              args: [texto, nova, new Date().toISOString(), chaveNoBanco(chave)],
            })
          : await db.execute({
              sql: "UPDATE arena_ajustes SET valor = ?, versao = ?, atualizado_em = ? WHERE chave = ? AND (versao = ? OR (versao IS NULL AND SHA1(valor) = ?))",
              args: [texto, nova, new Date().toISOString(), chaveNoBanco(chave), versao, versao],
            });
      if (!r.rowsAffected) throw new ConflitoDeVersao(chave);
      return nova;
    },
  };
}

// ---------------------------------------------------------------- memória

function backendMemoria(): Backend {
  const m = new Map<string, string>();
  const a = new Map<string, Buffer>();
  return {
    tipo: "memoria",
    async ler(chave) {
      const t = m.get(valida(chave));
      return t == null ? { dados: null, versao: null } : { dados: t, versao: resumo(t) };
    },
    async gravar(chave, texto, versao) {
      const atual = m.get(valida(chave));
      if (versao !== POR_CIMA && (versao ?? null) !== (atual == null ? null : resumo(atual))) throw new ConflitoDeVersao(chave);
      m.set(chave, texto);
      return resumo(texto);
    },
    async lerArquivo(chave) {
      const c = a.get(chave);
      return c ? { corpo: c, tipo: "image/jpeg" } : null;
    },
    async gravarArquivo(chave, corpo) {
      a.set(chave, corpo);
    },
  };
}

// ---------------------------------------------------------------- escolha

let escolhido: Backend | null = null;

function bancoConfigurado() {
  return Boolean(process.env.MYSQL_HOST && process.env.MYSQL_DATABASE && process.env.MYSQL_USER && process.env.MYSQL_PASSWORD);
}

export function tipoDaGaveta(): TipoDeGaveta {
  // Em 12/10 o Thiago ligou o Blob pelo painel: a Vercel criou só BLOB_STORE_ID
  // (o login é por OIDC, sem chave). A biblioteca do Blob entende os dois.
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) return "blob";
  if (process.env.ARENA_GAVETA_DIR) return "pasta";
  if (bancoConfigurado()) return "banco";
  return "memoria";
}

function backend(): Backend {
  const tipo = tipoDaGaveta();
  if (escolhido?.tipo === tipo) return escolhido;
  escolhido =
    tipo === "blob" ? backendBlob() : tipo === "pasta" ? backendPasta(process.env.ARENA_GAVETA_DIR!) : tipo === "banco" ? backendBanco() : backendMemoria();
  return escolhido;
}

/** A gaveta antiga (MySQL), para copiar quando o Blob passa a existir. */
export function gavetaDoBanco(): { ler<T>(chave: string): Promise<T | null> } | null {
  if (!bancoConfigurado() || tipoDaGaveta() === "banco") return null;
  const b = backendBanco();
  return {
    async ler<T>(chave: string) {
      const r = await b.ler(chave);
      return r.dados == null ? null : (JSON.parse(r.dados) as T);
    },
  };
}

/** Só para os testes: troca a gaveta por uma memória limpa. */
export function _gavetaDeTeste() {
  escolhido = backendMemoria();
  return escolhido;
}

// ---------------------------------------------------------------- uso

export async function ler<T>(chave: string): Promise<Lido<T>> {
  const r = await backend().ler(chave);
  if (r.dados == null) return { dados: null, versao: null };
  try {
    return { dados: JSON.parse(r.dados) as T, versao: r.versao };
  } catch {
    // Documento estragado: trata como vazio, mas guarda a versão para poder regravar.
    console.error(`[arena:gaveta] "${chave}" não é JSON válido`);
    return { dados: null, versao: r.versao };
  }
}

export async function gravar<T>(chave: string, dados: T, versao: string | null): Promise<string> {
  return backend().gravar(chave, JSON.stringify(dados), versao);
}

/**
 * Lê, muda e grava; se alguém gravou no meio, relê e refaz (até 6 vezes).
 * `mudar` devolve o documento novo, ou `undefined` para não gravar nada.
 */
export async function atualizar<T>(chave: string, padrao: () => T, mudar: (atual: T) => T | undefined | Promise<T | undefined>): Promise<T> {
  const TENTATIVAS = 6;
  for (let tentativa = 0; tentativa < TENTATIVAS; tentativa++) {
    const { dados, versao } = await ler<T>(chave);
    const atual = dados ?? padrao();
    const novo = await mudar(structuredClone(atual));
    if (novo === undefined) return atual;
    // Última volta: grava por cima, sem conferir a versão. Na Arena quem
    // escreve é o painel (uma pessoa) e o vigia (de 2 em 2 min); é melhor
    // gravar o que acabou de ser lido do que deixar o painel travado.
    const ultima = tentativa === TENTATIVAS - 1;
    try {
      await (ultima && versao ? gravarPorCima(chave, novo) : gravar(chave, novo, versao));
      if (ultima) console.warn(`[arena:gaveta] "${chave}" gravado sem conferir a versão depois de ${TENTATIVAS - 1} conflitos`);
      return novo;
    } catch (e) {
      if (!(e instanceof ConflitoDeVersao)) throw e;
      await new Promise((r) => setTimeout(r, 80 + Math.random() * 220 * (tentativa + 1)));
    }
  }
  throw new Error(`Não consegui gravar "${chave}": muitas escritas ao mesmo tempo. Tente de novo.`);
}

/** Gravação sem conferir a versão (só a última tentativa de `atualizar`). */
async function gravarPorCima<T>(chave: string, dados: T) {
  return backend().gravar(chave, JSON.stringify(dados), POR_CIMA);
}

export function guardaArquivos(): boolean {
  return Boolean(backend().gravarArquivo);
}

export async function gravarArquivo(chave: string, corpo: Buffer, tipo: string) {
  const b = backend();
  if (!b.gravarArquivo) throw new Error("Esta gaveta não guarda arquivos");
  await b.gravarArquivo(valida(chave), corpo, tipo);
}

export async function lerArquivo(chave: string) {
  const b = backend();
  return b.lerArquivo ? b.lerArquivo(valida(chave)) : null;
}
