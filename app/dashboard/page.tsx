import PainelDashboard from "@/components/PainelDashboard";

export default function DashboardPage() {
  return (
    <PainelDashboard
      endpoint="/api/dashboard/metrics"
      title="Dashboard Executivo"
      description="Visao geral em tempo real do Balao da Informatica"
    />
  );
}
