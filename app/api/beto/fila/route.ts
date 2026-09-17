import { NextResponse } from "next/server";
import { pegarFila, estatisticas } from "@/lib/beto";

export const dynamic = "force-dynamic";

/**
 * Fila da VITOR.IA — a VPS chama isto para pegar o próximo prospect a contatar.
 *
 * O caminho continua /api/beto: o nome da rota é contrato com a VPS, que roda
 * em deploy separado. Renomear aqui derrubaria a prospecção até a VPS subir de
 * novo. A tabela chave -> nome mora em lib/agentes.json.
 *
 * Protegida por BETO_TOKEN no header Authorization: Bearer. Sem o token
 * configurado a porta fica FECHADA: a base tem telefone de cliente, e deixar
 * isso aberto por esquecimento de configuração seria o vazamento da loja.
 */
function tokenConfere(req: Request) {
  const esperado = (process.env.BETO_TOKEN || "").trim();
  if (!esperado) return false;
  const veio = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!veio || veio.length !== esperado.length) return false;
  let diferenca = 0;
  for (let i = 0; i < esperado.length; i++) {
    diferenca |= esperado.charCodeAt(i) ^ veio.charCodeAt(i);
  }
  return diferenca === 0;
}

export async function GET(req: Request) {
  if (!tokenConfere(req)) {
    return NextResponse.json({ ok: false, erro: "não autorizado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limite = Math.min(Number(url.searchParams.get("limite")) || 1, 5);

  const [fila, stats] = await Promise.all([pegarFila(limite), estatisticas()]);

  return NextResponse.json({
    ok: true,
    fila: fila.map((p) => ({
      whatsapp: p.whatsapp,
      nome: p.nome,
      empresa: p.empresa,
      segmento: p.segmento,
      origem: p.origem,
    })),
    stats,
  });
}
