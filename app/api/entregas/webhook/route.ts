import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { mudarSituacao } from "@/lib/entregas/registro";
import { situacaoDaParceira } from "@/lib/entregas/regras";

// Avisos da 99 sobre cada corrida (entregador aceitou, coletou, entregou…).
//
// O formato exato chega com a documentação da 99. Por ora aceita os nomes de
// campo mais prováveis e exige o segredo combinado (ENTREGA99_WEBHOOK_SEGREDO)
// no cabeçalho x-balao-segredo ou em ?segredo= na URL cadastrada na 99.
// Sem o segredo configurado, a rota fica fechada.

export const dynamic = "force-dynamic";

function segredoConfere(req: Request) {
  const esperado = process.env.ENTREGA99_WEBHOOK_SEGREDO || "";
  if (!esperado) return false;
  const recebido = req.headers.get("x-balao-segredo") || new URL(req.url).searchParams.get("segredo") || "";
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

type Corpo = Record<string, unknown> & { data?: Record<string, unknown>; driver?: Record<string, unknown> };

export async function POST(req: Request) {
  if (!segredoConfere(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const corpo = (await req.json().catch(() => null)) as Corpo | null;
  if (!corpo) return NextResponse.json({ ok: false, erro: "Corpo inválido" }, { status: 400 });

  const fonte: Corpo = (corpo.data as Corpo) ?? corpo;
  const id = String(fonte.order_id ?? fonte.orderId ?? fonte.delivery_id ?? fonte.id ?? "");
  const situacao = situacaoDaParceira(fonte.status ?? fonte.state ?? fonte.event ?? corpo.event);
  if (!id || !situacao) {
    console.warn("[entregas:webhook] aviso não reconhecido:", JSON.stringify(corpo).slice(0, 800));
    // 200 para a 99 não repetir sem fim; fica no log para ajustar o tradutor.
    return NextResponse.json({ ok: true, ignorado: true });
  }

  const motorista = (fonte.driver ?? corpo.driver) as Record<string, unknown> | undefined;
  const { entrega, mudou } = await mudarSituacao(id, situacao, {
    observacao: `99: ${String(fonte.status ?? fonte.state ?? fonte.event ?? "")}`,
    entregador: motorista
      ? {
          nome: motorista.name ? String(motorista.name) : undefined,
          placa: motorista.plate ? String(motorista.plate) : undefined,
          telefone: motorista.phone ? String(motorista.phone) : undefined,
        }
      : undefined,
    linkDeAcompanhamento: typeof fonte.tracking_url === "string" ? fonte.tracking_url : undefined,
  });
  return NextResponse.json({ ok: true, encontrada: Boolean(entrega), mudou });
}
