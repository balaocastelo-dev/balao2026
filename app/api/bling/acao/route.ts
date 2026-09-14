import { NextResponse } from "next/server";
import { criarContato, criarPedido } from "@/lib/bling";

export const dynamic = "force-dynamic";

/**
 * Escrita no Bling. Rota separada da consulta de propósito.
 *
 * Consulta e escrita numa porta só significa que qualquer descuido de
 * parâmetro vira lançamento no ERP. Aqui é POST, é rota própria, e são duas
 * operações: criar contato e emitir pedido de venda.
 *
 * `confirmar: true` é obrigatório no corpo. Quem chama isto hoje é um modelo
 * de linguagem conversando com o Thiago — e o passo entre "acho que ele quer
 * um pedido" e "emiti um pedido" precisa ser explícito, não implícito.
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

export async function POST(req: Request) {
  if (!tokenConfere(req)) {
    return NextResponse.json({ ok: false, erro: "não autorizado" }, { status: 401 });
  }

  let corpo: Record<string, unknown>;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "corpo inválido" }, { status: 400 });
  }

  if (corpo.confirmar !== true) {
    return NextResponse.json(
      {
        ok: false,
        erro: "escrita no Bling exige confirmar: true — confirme com o Thiago antes",
      },
      { status: 400 }
    );
  }

  const acao = String(corpo.acao || "");

  try {
    switch (acao) {
      case "criar-contato": {
        const r = await criarContato({
          nome: String(corpo.nome || ""),
          telefone: corpo.telefone ? String(corpo.telefone) : undefined,
          email: corpo.email ? String(corpo.email) : undefined,
          documento: corpo.documento ? String(corpo.documento) : undefined,
        });
        return NextResponse.json({ ok: r.ok, contato: r.dados, erro: r.erro });
      }

      case "criar-pedido": {
        const r = await criarPedido({
          contatoId: String(corpo.contatoId || ""),
          itens: Array.isArray(corpo.itens) ? (corpo.itens as NovoItem[]) : [],
          observacoes: corpo.observacoes ? String(corpo.observacoes) : undefined,
        });
        return NextResponse.json({ ok: r.ok, pedido: r.dados, erro: r.erro });
      }

      default:
        return NextResponse.json({ ok: false, erro: `ação desconhecida: ${acao}` }, { status: 400 });
    }
  } catch (erro) {
    return NextResponse.json({ ok: false, erro: (erro as Error).message }, { status: 502 });
  }
}

interface NovoItem {
  produtoId?: string;
  descricao: string;
  quantidade: number;
  valor: number;
}
