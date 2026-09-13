import { randomUUID } from "crypto";
import { turso, isTursoActive } from "./turso";

// ============================================================
// Captura de contato do site.
//
// Até agora quem entrava no site e não comprava sumia para sempre: não havia
// formulário, newsletter nem qualquer forma de saber quem passou por aqui. Os
// livros eram entregues sem pedir nada em troca.
//
// A troca é só o WhatsApp — de propósito. Pedir nome, e-mail e telefone afasta
// mais gente do que traz: cada campo a mais derruba o número de cadastros. Com
// o WhatsApp o vendedor já consegue falar com a pessoa, que é o que importa.
// ============================================================

export interface ContatoCapturado {
  whatsapp: string;
  origem: string;
  material?: string | null;
  nome?: string | null;
}

/**
 * Telefone brasileiro reduzido a dígitos, com DDI.
 *
 * Devolve null quando não dá para usar — número inválido gravado é lead morto
 * ocupando lugar, e pior: o vendedor perde tempo tentando falar.
 */
export function normalizarWhatsApp(bruto: string): string | null {
  const digitos = String(bruto || "").replace(/\D/g, "");
  if (!digitos) return null;

  // 10 ou 11 dígitos: DDD + número, sem DDI.
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  // 12 ou 13 com 55 na frente: já veio completo.
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) return digitos;

  return null;
}

/**
 * Guarda o contato. Cria a tabela na primeira vez.
 *
 * O `CREATE TABLE IF NOT EXISTS` está aqui porque não há passo de migração
 * neste projeto — sem isso, a captura só começaria a funcionar depois de
 * alguém rodar um script à mão, e o primeiro visitante seria perdido.
 */
export async function salvarContato(contato: ContatoCapturado): Promise<{ ok: boolean; novo: boolean }> {
  if (!isTursoActive()) return { ok: false, novo: false };

  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS contatos_capturados (
        id VARCHAR(64) PRIMARY KEY,
        whatsapp VARCHAR(20) NOT NULL,
        nome VARCHAR(120) NULL,
        origem VARCHAR(80) NOT NULL,
        material VARCHAR(120) NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_whatsapp_material (whatsapp, material)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const antes = await turso.execute({
      sql: "SELECT id FROM contatos_capturados WHERE whatsapp = ? LIMIT 1",
      args: [contato.whatsapp],
    });

    await turso.execute({
      sql: `INSERT INTO contatos_capturados (id, whatsapp, nome, origem, material)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE origem = VALUES(origem), nome = COALESCE(VALUES(nome), nome)`,
      args: [
        randomUUID(),
        contato.whatsapp,
        contato.nome || null,
        contato.origem,
        contato.material || null,
      ],
    });

    return { ok: true, novo: antes.rows.length === 0 };
  } catch (error) {
    console.error("[captura] Não consegui guardar o contato:", error);
    return { ok: false, novo: false };
  }
}

/**
 * Manda o material pelo WhatsApp da loja.
 *
 * Duas coisas de uma vez: a pessoa recebe o que pediu no aplicativo que ela
 * usa, e a conversa nasce na caixa do CRM — o vendedor vê o interessado
 * aparecer onde ele já trabalha, em vez de numa lista que ninguém abre.
 *
 * É "se der": o download no navegador nunca espera por isto. Servidor de
 * WhatsApp fora do ar não pode impedir alguém de baixar um livro.
 */
export async function mandarMaterialPeloWhatsApp(
  whatsapp: string,
  texto: string
): Promise<boolean> {
  const servidor = (
    process.env.WHATSAPP_PANEL_SERVER_URL ||
    process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL ||
    ""
  ).replace(/\/$/, "");

  if (!servidor) return false;

  try {
    const resposta = await fetch(`${servidor}/api/enviar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: whatsapp, text: texto }),
      signal: AbortSignal.timeout(8000),
    });
    return resposta.ok;
  } catch {
    return false;
  }
}

export interface ContatoSalvo {
  id: string;
  whatsapp: string;
  nome: string | null;
  origem: string;
  material: string | null;
  criado_em: string | null;
}

export interface ResumoCaptura {
  total: number;
  pessoas: number;
  porOrigem: { origem: string; quantidade: number }[];
  porMaterial: { material: string; quantidade: number }[];
  porMes: { mes: string; quantidade: number }[];
  primeiro: string | null;
  ultimo: string | null;
}

/**
 * Lê os contatos capturados.
 *
 * Esta metade faltava. O formulário do site gravava desde sempre, mas só havia
 * `salvarContato` — nenhum caminho de leitura, em lugar nenhum do código. Quem
 * deixava o WhatsApp para baixar um material entrava na tabela e não era visto
 * por ninguém: nem vendedor, nem painel, nem relatório. Lead capturado e
 * esquecido é pior do que lead não capturado, porque a pessoa ficou esperando
 * um retorno que nunca ia chegar.
 *
 * `total` conta as linhas (a mesma pessoa aparece uma vez por material);
 * `pessoas` conta WhatsApps distintos, que é o número que interessa para saber
 * com quanta gente dá para falar.
 */
export async function listarContatos(opcoes: {
  limite?: number;
  desde?: string | null;
  origem?: string | null;
} = {}): Promise<ContatoSalvo[]> {
  if (!isTursoActive()) return [];

  const limite = Math.min(Math.max(opcoes.limite ?? 200, 1), 2000);
  const condicoes: string[] = [];
  const args: unknown[] = [];

  if (opcoes.desde) { condicoes.push("criado_em >= ?"); args.push(opcoes.desde); }
  if (opcoes.origem) { condicoes.push("origem = ?"); args.push(opcoes.origem); }

  const onde = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";

  try {
    const r = await turso.execute({
      sql: `SELECT id, whatsapp, nome, origem, material, criado_em
            FROM contatos_capturados ${onde}
            ORDER BY criado_em DESC
            LIMIT ${limite}`,
      args,
    });
    return (r.rows as unknown as ContatoSalvo[]) || [];
  } catch (erro) {
    // Tabela ainda não existe (ninguém se cadastrou) é caso normal, não falha.
    console.warn("[captura] listarContatos:", (erro as Error).message);
    return [];
  }
}

export async function resumirContatos(): Promise<ResumoCaptura> {
  const vazio: ResumoCaptura = {
    total: 0, pessoas: 0, porOrigem: [], porMaterial: [], porMes: [],
    primeiro: null, ultimo: null,
  };
  if (!isTursoActive()) return vazio;

  try {
    const geral = await turso.execute(`
      SELECT COUNT(*) AS total,
             COUNT(DISTINCT whatsapp) AS pessoas,
             MIN(criado_em) AS primeiro,
             MAX(criado_em) AS ultimo
      FROM contatos_capturados
    `);
    const origem = await turso.execute(`
      SELECT origem, COUNT(*) AS quantidade FROM contatos_capturados
      GROUP BY origem ORDER BY quantidade DESC LIMIT 30
    `);
    const material = await turso.execute(`
      SELECT COALESCE(material, '(sem material)') AS material, COUNT(*) AS quantidade
      FROM contatos_capturados GROUP BY material ORDER BY quantidade DESC LIMIT 30
    `);
    const mes = await turso.execute(`
      SELECT DATE_FORMAT(criado_em, '%Y-%m') AS mes, COUNT(*) AS quantidade
      FROM contatos_capturados GROUP BY mes ORDER BY mes DESC LIMIT 24
    `);

    const g = (geral.rows?.[0] || {}) as Record<string, unknown>;
    return {
      total: Number(g.total || 0),
      pessoas: Number(g.pessoas || 0),
      primeiro: g.primeiro ? String(g.primeiro) : null,
      ultimo: g.ultimo ? String(g.ultimo) : null,
      porOrigem: (origem.rows as unknown as { origem: string; quantidade: number }[]) || [],
      porMaterial: (material.rows as unknown as { material: string; quantidade: number }[]) || [],
      porMes: (mes.rows as unknown as { mes: string; quantidade: number }[]) || [],
    };
  } catch (erro) {
    console.warn("[captura] resumirContatos:", (erro as Error).message);
    return vazio;
  }
}
