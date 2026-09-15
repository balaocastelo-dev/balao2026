import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isPainelAuthenticated } from "@/lib/painel-auth";

export const dynamic = "force-dynamic";

/**
 * O que a LIV.IA fez, para o painel do /crm.
 *
 * Só atrás da senha do painel: aqui aparecem remetente e assunto de e-mail de
 * cliente. Nenhum corpo de mensagem sai daqui — o rascunho inteiro fica no
 * Gmail, que é onde o Thiago vai revisar e soltar de qualquer jeito.
 */
export async function GET() {
  if (!(await isPainelAuthenticated())) {
    return NextResponse.json({ ok: false, erro: "não autorizado" }, { status: 401 });
  }

  const desde = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [recentes, semana, supressao] = await Promise.all([
    supabaseAdmin
      .from("livia_emails")
      .select("message_id, remetente, assunto, classificacao, acao, lead_para, visto_em")
      .order("visto_em", { ascending: false })
      .limit(20),
    supabaseAdmin
      .from("livia_emails")
      .select("classificacao, acao")
      .gte("visto_em", desde),
    supabaseAdmin
      .from("livia_supressao")
      .select("email", { count: "exact", head: true }),
  ]);

  const linhas = semana.data || [];
  const porClassificacao: Record<string, number> = {};
  for (const l of linhas) {
    const chave = l.classificacao || "outro";
    porClassificacao[chave] = (porClassificacao[chave] || 0) + 1;
  }

  return NextResponse.json({
    ok: true,
    recentes: (recentes.data || []).map((e) => ({
      // O endereço aparece cortado: o painel serve para saber o que ela fez,
      // não para virar uma lista de e-mails de cliente na tela.
      remetente: e.remetente,
      assunto: e.assunto,
      classificacao: e.classificacao,
      acao: e.acao,
      leadPara: e.lead_para,
      quando: e.visto_em,
    })),
    semana: {
      total: linhas.length,
      porClassificacao,
      rascunhosEsperando: linhas.filter((l) => l.acao === "rascunho").length,
      respondidos: linhas.filter((l) => l.acao === "responder").length,
    },
    suprimidos: supressao.count || 0,
  });
}
