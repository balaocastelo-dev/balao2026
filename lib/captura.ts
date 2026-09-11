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
