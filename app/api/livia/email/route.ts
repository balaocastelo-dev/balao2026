import { NextResponse } from "next/server";
import {
  decidir, estaSuprimido, jaTratado, registrar, suprimir,
  type EmailRecebido, type ItemDeCatalogo,
} from "@/lib/livia";
import { tokenDaVpsConfere } from "@/lib/livia-auth";
import { getCachedBusca } from "@/lib/cache";

export const dynamic = "force-dynamic";

/**
 * A VPS manda um e-mail que chegou; aqui se decide o que fazer com ele.
 *
 * O worker só fala IMAP. Classificar, redigir e decidir mora aqui porque é
 * onde estão o banco e as chaves — worker que pensa é worker que precisa de
 * credencial de banco na máquina mais exposta do conjunto.
 */
export async function POST(req: Request) {
  if (!tokenDaVpsConfere(req)) {
    return NextResponse.json({ ok: false, erro: "não autorizado" }, { status: 401 });
  }

  let corpo: Partial<EmailRecebido> & { modo?: string };
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "corpo inválido" }, { status: 400 });
  }

  const messageId = String(corpo.messageId || "").trim();
  const remetente = String(corpo.remetente || "").trim().toLowerCase();
  if (!messageId || !remetente) {
    return NextResponse.json(
      { ok: false, erro: "messageId e remetente são obrigatórios" },
      { status: 400 }
    );
  }

  // Idempotência primeiro. O IMAP reentrega a mesma mensagem por qualquer
  // motivo — reconexão, flag que não gravou, reindexação do Gmail — e sem
  // esta linha o cliente recebe a mesma resposta três vezes.
  if (await jaTratado(messageId)) {
    return NextResponse.json({ ok: true, acao: "nada", motivo: "já tratado antes" });
  }

  const email: EmailRecebido = {
    messageId,
    remetente,
    nome: corpo.nome ? String(corpo.nome) : null,
    assunto: String(corpo.assunto || ""),
    corpo: String(corpo.corpo || "").slice(0, 20_000),
    recebidoEm: corpo.recebidoEm ? String(corpo.recebidoEm) : null,
  };

  const decisao = await decidir(email, {
    modo: corpo.modo === "automatico" ? "automatico" : "rascunho",
    buscarNoCatalogo: async (termos): Promise<ItemDeCatalogo[]> => {
      const produtos = await getCachedBusca(termos, 5);
      return produtos.map((p) => ({ nome: p.name, preco: p.price, slug: p.slug }));
    },
  });

  if (decisao.acao === "suprimir") {
    await suprimir(remetente, "pediu descadastro por e-mail", "livia");
  }

  // Responder alguém que está na supressão é o erro que não se desfaz:
  // vale conferir mesmo quando este e-mail não é o pedido de saída.
  if ((decisao.acao === "responder" || decisao.acao === "rascunho")
      && await estaSuprimido(remetente)) {
    decisao.acao = "arquivar";
    decisao.resposta = undefined;
    decisao.motivo = "remetente está na supressão — arquiva sem responder";
  }

  await registrar(email, decisao);

  return NextResponse.json({
    ok: true,
    acao: decisao.acao,
    pasta: decisao.pasta,
    classificacao: decisao.classificacao,
    resposta: decisao.acao === "responder" ? decisao.resposta : undefined,
    leadPara: decisao.leadPara || null,
    telefone: decisao.telefone || null,
    motivo: decisao.motivo,
  });
}
