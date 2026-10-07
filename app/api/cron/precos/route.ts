import { NextResponse } from "next/server";
import { isTursoActive } from "@/lib/turso";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import { rodarAgendado } from "@/lib/precos/coleta";
import { situacaoDaTroca } from "@/lib/precos/banco";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Agendador dos preços (vercel.json, a cada 10 minutos).
 *
 * Cada chamada lê as fontes que estão vencidas, enquanto couber em ~45 s.
 * Chamar fora de hora não faz mal: fonte que não venceu não é lida.
 */
async function autorizado(req: Request) {
  if (req.headers.get("x-vercel-cron")) return true;
  // O agendador da Vercel se apresenta pelo user-agent "vercel-cron/1.0" e só
  // manda o Authorization quando existe CRON_SECRET no projeto. Sem aceitar o
  // user-agent, a rota respondia 401 ao próprio agendador e nenhuma fonte era
  // relida sozinha. Não é segredo, e não precisa ser: quem chamar esta rota
  // por fora só adianta uma leitura que já estava vencida.
  if ((req.headers.get("user-agent") || "").toLowerCase().startsWith("vercel-cron/")) return true;
  const segredo = process.env.CRON_SECRET;
  if (segredo && req.headers.get("authorization") === `Bearer ${segredo}`) return true;
  return isPainelAuthenticated();
}

export async function GET(req: Request) {
  if (!(await autorizado(req))) {
    return NextResponse.json({ ok: false, erro: "Não autorizado" }, { status: 401 });
  }
  if (!isTursoActive()) {
    return NextResponse.json({ ok: false, erro: "Banco de dados não configurado" }, { status: 500 });
  }

  try {
    // Antes da troca do catálogo não há o que atualizar: as fontes ainda não existem.
    const situacao = await situacaoDaTroca();
    if (situacao.comFonte === 0) {
      return NextResponse.json({ ok: true, passos: [], aviso: "Catálogo ainda não vem das fontes." });
    }
    const passos = await rodarAgendado(45_000);
    // Uma linha por rodada, para dar para conferir nos logs que o agendador está vivo.
    console.log(
      "[cron/precos]",
      passos.length === 0
        ? "nenhuma fonte vencida"
        : passos.map((p) => `${p.fonte}: ${p.estado}${p.totalDePaginas ? ` (pág. ${p.pagina}/${p.totalDePaginas})` : ""}`).join("; ")
    );
    return NextResponse.json({ ok: true, passos });
  } catch (erro) {
    const mensagem = String((erro as Error)?.message || erro);
    console.error("[cron/precos]", mensagem);
    return NextResponse.json({ ok: false, erro: mensagem }, { status: 500 });
  }
}
