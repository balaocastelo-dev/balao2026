import { NextResponse } from "next/server";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import { getPainelMetrics } from "@/lib/painel-metrics";

export async function GET(request: Request) {
  try {
    const authenticated = await isPainelAuthenticated();

    if (!authenticated) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const metrics = await getPainelMetrics({ startDate, endDate });
    return NextResponse.json(metrics);
  } catch (error: unknown) {
    console.error("Painel Metrics Error:", error);

    const message =
      error instanceof Error ? error.message : "Erro ao carregar metricas do painel";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
