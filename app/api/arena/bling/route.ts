// ============================================================
// Entrada do vigia da Arena (scripts/arena-vigia, no PC do Thiago).
//
// O token do Bling só existe no PC (a sentinela do Bionic é quem renova), então
// o site não busca no Bling: o vigia busca e entrega aqui. A porta pede a
// chave do vigia, gerada no painel (/painel/arena → Conexão com o Bling); o
// banco guarda só o resumo dela.
// ============================================================

import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  bancoAtivo,
  conferirChaveDoVigia,
  gravarDocumentos,
  gravarVendedoresDoBling,
  gravarVigia,
  lerVarredura,
  lerVigia,
  pedirVarredura,
} from "@/lib/arena/banco";
import { ETIQUETA_ARENA } from "@/lib/arena/estado";
import type { DocumentoDoBling } from "@/lib/arena/pontos";
import { lerDocumento } from "@/lib/arena/entrada";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_DOCUMENTOS = 500;

function chaveDoPedido(req: Request): string | null {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

async function porta(req: Request) {
  if (!bancoAtivo()) return NextResponse.json({ erro: "Banco de dados não configurado" }, { status: 503 });
  if (!(await conferirChaveDoVigia(chaveDoPedido(req)))) {
    return NextResponse.json({ erro: "Chave do vigia inválida. Gere outra em /painel/arena → Conexão com o Bling." }, { status: 401 });
  }
  return null;
}

/** O vigia confere a ligação (e o painel vê que ele está vivo). */
export async function GET(req: Request) {
  const barrado = await porta(req);
  if (barrado) return barrado;
  return NextResponse.json({ ok: true, varrerDesde: await lerVarredura() });
}

export async function POST(req: Request) {
  const barrado = await porta(req);
  if (barrado) return barrado;

  let corpo: Record<string, unknown>;
  try {
    corpo = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const brutos = Array.isArray(corpo.documentos) ? corpo.documentos : [];
  if (brutos.length > MAX_DOCUMENTOS) {
    return NextResponse.json({ erro: `No máximo ${MAX_DOCUMENTOS} documentos por vez` }, { status: 413 });
  }
  const docs = brutos.map(lerDocumento).filter((d): d is DocumentoDoBling => d !== null);
  const vigiaInfo = (corpo.vigia ?? {}) as Record<string, unknown>;

  try {
    if (Array.isArray(corpo.vendedores)) {
      await gravarVendedoresDoBling(corpo.vendedores as { id: string; nome: string }[]);
    }
    const { gravados, novos } = await gravarDocumentos(docs);
    const anterior = await lerVigia();
    await gravarVigia({
      ultimaVez: new Date().toISOString(),
      versao: vigiaInfo.versao ? String(vigiaInfo.versao).slice(0, 20) : anterior.versao,
      maquina: vigiaInfo.maquina ? String(vigiaInfo.maquina).slice(0, 60) : anterior.maquina,
      ultimoLote: gravados,
      ultimoErro: vigiaInfo.erro ? String(vigiaInfo.erro).slice(0, 300) : null,
    });

    // A varredura pedida no painel terminou: limpa o pedido.
    let varrerDesde = await lerVarredura();
    if (varrerDesde && corpo.varreduraFeita === varrerDesde) {
      await pedirVarredura(null);
      varrerDesde = null;
    }

    if (gravados > 0) revalidateTag(ETIQUETA_ARENA, { expire: 0 });
    return NextResponse.json({ ok: true, recebidos: docs.length, gravados, novos, varrerDesde });
  } catch (e) {
    console.error("[arena:bling]", (e as Error).message);
    return NextResponse.json({ erro: "Falha ao gravar" }, { status: 500 });
  }
}
