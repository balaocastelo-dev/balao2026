import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/dashboard-metrics";

export async function GET(request: Request) {
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
