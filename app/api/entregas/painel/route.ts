import { NextResponse } from "next/server";
import { getOrder } from "@/lib/db";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import {
  avancarSimulada,
  cancelarEntrega,
  chamarMotoboy,
  cotarEntrega,
  listarEntregas,
  modoAtual,
} from "@/lib/entregas/registro";

// Painel das entregas por motoboy (99). Protegida no proxy.ts
// (API_PROTEGIDA_SEMPRE) e conferida de novo aqui.

export const dynamic = "force-dynamic";

const negado = () => NextResponse.json({ ok: false, erro: "Acesso negado. Entre no painel do Balão." }, { status: 401 });

export async function GET() {
  if (!(await isPainelAuthenticated())) return negado();
  try {
    return NextResponse.json({
      ok: true,
      modo: modoAtual(),
      avisoInterno: Boolean(process.env.ENTREGA_AVISO_INTERNO),
      entregas: await listarEntregas(),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, erro: (e as Error).message }, { status: 500 });
  }
}

/** Valor dos produtos do pedido (sem o frete), que é o que a 99 limita. */
function valorDosProdutos(order: NonNullable<Awaited<ReturnType<typeof getOrder>>>) {
  const itens = order.items ?? [];
  if (itens.length) return itens.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 1), 0);
  const frete = Number((order.address as { shipping?: { cost?: number } })?.shipping?.cost || 0);
  return Math.max(0, Number(order.total || 0) - frete);
}

async function dadosDoPedido(pedidoId: string) {
  const order = await getOrder(pedidoId);
  if (!order) throw new Error("Pedido não encontrado.");
  const a = order.address || {};
  return {
    pedidoId: order.id,
    cliente: { nome: order.customer_name || "Cliente", whatsapp: order.customer_whatsapp || "" },
    destino: {
      cep: a.cep || "",
      rua: a.street,
      numero: a.number,
      complemento: a.complement,
      cidade: a.city,
      uf: a.state,
    },
    valorDosProdutos: valorDosProdutos(order),
  };
}

export async function POST(req: Request) {
  if (!(await isPainelAuthenticated())) return negado();
  const b = (await req.json().catch(() => ({}))) as { acao?: string; pedidoId?: string; id?: string };
  try {
    switch (b.acao) {
      case "cotar": {
        if (!b.pedidoId) throw new Error("Falta o pedido.");
        const d = await dadosDoPedido(b.pedidoId);
        return NextResponse.json({ ok: true, ...(await cotarEntrega({ destino: d.destino, valorDosProdutos: d.valorDosProdutos })) });
      }
      case "chamar": {
        if (!b.pedidoId) throw new Error("Falta o pedido.");
        return NextResponse.json({ ok: true, entrega: await chamarMotoboy(await dadosDoPedido(b.pedidoId)) });
      }
      case "cancelar":
        if (!b.id) throw new Error("Falta a entrega.");
        return NextResponse.json({ ok: true, entrega: await cancelarEntrega(b.id) });
      case "avancar":
        if (!b.id) throw new Error("Falta a entrega.");
        return NextResponse.json({ ok: true, entrega: await avancarSimulada(b.id) });
      default:
        return NextResponse.json({ ok: false, erro: "Ação desconhecida." }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ ok: false, erro: (e as Error).message }, { status: 400 });
  }
}
