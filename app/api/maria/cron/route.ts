import { NextResponse } from "next/server";
import { gerarRelatorioUltimaHora, enviarTelegramMaria, lerConfigMaria } from "@/lib/maria";

export async function GET() {
  try {
    const config = await lerConfigMaria();
    const relatorio = await gerarRelatorioUltimaHora();

    // Se estiver configurado para enviar, dispara o Telegram
    if (config.vendas || config.compras || config.orcamentos) {
      await enviarTelegramMaria(relatorio.resumo);
    }

    return NextResponse.json({
      ok: true,
      mensagem: "Relatório da Maria gerado e disparado com sucesso",
      config,
      relatorio: relatorio.dados,
      resumo: relatorio.resumo,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, erro: err.message }, { status: 500 });
  }
}
