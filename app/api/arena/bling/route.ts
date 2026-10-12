// ============================================================
// Entrada do vigia da Arena (scripts/arena-vigia, no PC do Thiago).
//
// O token do Bling só existe no PC (a sentinela do Bionic é quem renova), então
// o site não busca no Bling: o vigia busca e entrega aqui. A porta pede a
// chave do vigia, gerada no painel (/painel/arena → Conexão com o Bling); a
// gaveta guarda só o resumo dela. Nada aqui toca o MySQL (ver lib/arena/gaveta.ts).
// ============================================================

import { NextResponse } from "next/server";
import { chaveConfere, gravarDocumentos, gravarVendedoresDoBling, lerConfig, pedirVarredura, registrarVigia } from "@/lib/arena/dados";
import { reconstruirTelao } from "@/lib/arena/estado";
import type { DocumentoDoBling } from "@/lib/arena/valores";
import { lerDocumento } from "@/lib/arena/entrada";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_DOCUMENTOS = 500;

function chaveDoPedido(req: Request): string | null {
  const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

async function porta(req: Request) {
  try {
    const config = await lerConfig({ tentarImportar: true });
    if (!chaveConfere(chaveDoPedido(req), config.chaveHash)) {
      return {
        erro: NextResponse.json({ erro: "Chave do vigia inválida. Gere outra em /painel/arena → Conexão com o Bling." }, { status: 401 }),
      };
    }
    return { config };
  } catch (e) {
    console.error("[arena:bling]", (e as Error).message);
    return { erro: NextResponse.json({ erro: "Arena sem acesso à gaveta agora; o vigia tenta de novo." }, { status: 503 }) };
  }
}

/** O vigia confere a ligação e se há varredura pedida no painel. */
export async function GET(req: Request) {
  const p = await porta(req);
  if (p.erro) return p.erro;
  return NextResponse.json({ ok: true, varrerDesde: p.config.varrerDesde });
}

export async function POST(req: Request) {
  const p = await porta(req);
  if (p.erro) return p.erro;
  const config = p.config;

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
    if (Array.isArray(corpo.vendedores)) await gravarVendedoresDoBling(corpo.vendedores as { id: string; nome: string }[]);
    const { gravados, novos } = await gravarDocumentos(docs);
    await registrarVigia({
      versao: vigiaInfo.versao ? String(vigiaInfo.versao).slice(0, 20) : null,
      maquina: vigiaInfo.maquina ? String(vigiaInfo.maquina).slice(0, 60) : null,
      ultimoLote: gravados,
      ultimoErro: vigiaInfo.erro ? String(vigiaInfo.erro).slice(0, 300) : null,
    });

    // A varredura pedida no painel terminou: limpa o pedido.
    let varrerDesde = config.varrerDesde;
    if (varrerDesde && corpo.varreduraFeita === varrerDesde) {
      await pedirVarredura(null);
      varrerDesde = null;
    }

    if (gravados > 0) await reconstruirTelao();
    return NextResponse.json({ ok: true, recebidos: docs.length, gravados, novos, varrerDesde });
  } catch (e) {
    console.error("[arena:bling]", (e as Error).message);
    return NextResponse.json({ erro: "Falha ao gravar; o vigia manda de novo na próxima volta." }, { status: 503 });
  }
}
