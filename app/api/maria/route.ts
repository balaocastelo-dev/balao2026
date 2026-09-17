import { NextRequest, NextResponse } from "next/server";
import { lerConfigMaria, salvarConfigMaria, responderPerguntaMaria, enviarTelegramMaria, gerarRelatorioUltimaHora } from "@/lib/maria";

export async function GET() {
  try {
    const config = await lerConfigMaria();
    const rel = await gerarRelatorioUltimaHora();
    return NextResponse.json({ ok: true, config, ultimoRelatorio: rel });
  } catch (err: any) {
    return NextResponse.json({ ok: false, erro: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Se for alteração de config
    if (body.config) {
      await salvarConfigMaria(body.config);
      return NextResponse.json({ ok: true, config: body.config });
    }

    // Se for pergunta em linguagem natural
    if (body.pergunta) {
      const resposta = await responderPerguntaMaria(body.pergunta);
      // Envia a resposta automaticamente no Telegram também!
      await enviarTelegramMaria(`🤖 *Pergunta do Patrão:* "${body.pergunta}"\n\n${resposta}`);
      return NextResponse.json({ ok: true, resposta });
    }

    return NextResponse.json({ ok: false, erro: "Ação desconhecida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, erro: err.message }, { status: 500 });
  }
}
