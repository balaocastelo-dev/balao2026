import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/dashboard-metrics";
import { isPainelAuthenticated } from "@/lib/painel-auth";

// Faturamento, pedidos e vendas por vendedor: só para quem entrou no painel.
// (A tela que usava isto, /dashboard, hoje é /painel/indicadores.)
export async function GET(request: Request) {
  if (!(await isPainelAuthenticated())) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const metrics = await getDashboardMetrics({ startDate, endDate });
    return NextResponse.json(metrics);
  } catch (error: unknown) {
    console.error("Dashboard Metrics Error:", error);
    const message =
      error instanceof Error ? error.message : "Erro ao carregar metricas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
