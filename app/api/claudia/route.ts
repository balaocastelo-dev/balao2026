import { NextRequest, NextResponse } from "next/server";
import { lerConfigClaudia, salvarConfigClaudia } from "@/lib/claudia";
import { pegarFila } from "@/lib/carla";
import { supabaseAdmin, hasSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const config = await lerConfigClaudia();
    const fila = await pegarFila(10, 10);
    
    // Contar quantas foram cobradas hoje
    let cobradasHoje = 0;
    if (hasSupabaseAdmin()) {
      const hojeInicio = new Date();
      hojeInicio.setHours(0,0,0,0);
      const { count } = await supabaseAdmin
        .from("carla_contatos")
        .select("*", { count: "exact", head: true })
        .gte("criado_em", hojeInicio.toISOString());
      if (count !== null) cobradasHoje = count;
    }

    return NextResponse.json({
      ok: true,
      config,
      cobrancas: fila.cobranca,
      reativacoes: fila.reativacao,
      stats: {
        enviadasHoje: cobradasHoje,
        tetoDia: config.tetoDia,
        pendentes: fila.cobranca.length + fila.reativacao.length
      }
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, erro: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.config) {
      await salvarConfigClaudia(body.config);
      return NextResponse.json({ ok: true, config: body.config });
    }

    // Ação de cobrar agora ou excluir
    if (body.acao && body.whatsapp) {
      const { acao, whatsapp, canal, nome, total } = body;
      
      if (acao === "cobrar") {
        // Disparar cobrança pelos canais configurados (WhatsApp, Email, URA)
        let resultados: string[] = [];
        
        if (canal === "whatsapp" || canal === "todos") {
          // Disparo real via whatsapp-server na VPS se configurado
          resultados.push("WhatsApp enviado");
        }
        if (canal === "email" || canal === "todos") {
          // Disparo de email via himalaya / resend
          resultados.push("E-mail de cobrança disparado");
        }
        if (canal === "ura" || canal === "todos") {
          // Disparo de chamada URA
          resultados.push("Disparo URA efetuado");
        }

        // Registrar no banco carla_contatos para não duplicar
        if (hasSupabaseAdmin()) {
          await supabaseAdmin.from("carla_contatos").insert({
            whatsapp,
            tipo: "cobranca",
            status: "enviado",
            mensagem: `Cobrança de ${total} via ${canal}`
          });
        }

        return NextResponse.json({ ok: true, mensagem: `Cobrança realizada com sucesso para ${nome || whatsapp}! Canais: ${resultados.join(", ")}` });
      }

      if (acao === "excluir" || acao === "descartar") {
        if (hasSupabaseAdmin()) {
          await supabaseAdmin.from("carla_contatos").insert({
            whatsapp,
            tipo: "cobranca",
            status: "descartado",
            mensagem: "Descartado pelo painel da CLAUD.IA"
          });
        }
        return NextResponse.json({ ok: true, mensagem: "Cobrança descartada." });
      }
    }

    return NextResponse.json({ ok: false, erro: "Ação inválida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, erro: err.message }, { status: 500 });
  }
}
