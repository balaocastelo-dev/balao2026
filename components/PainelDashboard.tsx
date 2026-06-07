"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Award,
  Clock,
  CreditCard,
  DollarSign,
  Filter,
  Package,
  Phone,
  Printer,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
  Wrench,
  MessageCircle,
  Mail,
} from "lucide-react";
import type { DashboardMetrics } from "@/lib/dashboard-metrics";

type Trend = "up" | "down" | "neutral";

type MetricCardProps = {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: Trend;
  icon: ComponentType<{ size?: number; className?: string }>;
};

type PainelDashboardProps = {
  endpoint: string;
  title: string;
  description: string;
  footerText?: string;
  actions?: ReactNode;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend = "neutral",
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm print:border print:border-gray-300 print:shadow-none">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div
          className={`rounded-lg p-3 print:hidden ${
            trend === "up"
              ? "bg-green-50 text-green-600"
              : trend === "down"
                ? "bg-red-50 text-red-600"
                : "bg-blue-50 text-blue-600"
          }`}
        >
          <Icon size={24} />
        </div>
      </div>
      {subtext ? (
        <div className="flex items-center gap-2 text-sm print:hidden">
          {trend === "up" ? (
            <TrendingUp size={16} className="text-green-500" />
          ) : trend === "down" ? (
            <TrendingDown size={16} className="text-red-500" />
          ) : null}
          <span
            className={
              trend === "up"
                ? "font-medium text-green-600"
                : trend === "down"
                  ? "font-medium text-red-600"
                  : "text-gray-500"
            }
          >
            {subtext}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function truncateLabel(value: string, max = 42) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

function formatCurrencyTooltip(value: string | number | undefined) {
  return `R$ ${Number(value || 0).toLocaleString("pt-BR")}`;
}

export default function PainelDashboard({
  endpoint,
  title,
  description,
  footerText = "Dados atualizados em tempo real do banco de dados principal.",
  actions,
}: PainelDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [period, setPeriod] = useState("today");

  const fetchMetrics = async (nextStartDate = startDate, nextEndDate = endDate) => {
    setLoading(true);

    try {
      let url = endpoint;
      const params = new URLSearchParams();

      if (nextStartDate) {
        params.append("startDate", new Date(nextStartDate).toISOString());
      }

      if (nextEndDate) {
        const end = new Date(nextEndDate);
        end.setHours(23, 59, 59, 999);
        params.append("endDate", end.toISOString());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar metricas");
      }

      const data = (await response.json()) as DashboardMetrics;
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (nextPeriod: string) => {
    setPeriod(nextPeriod);

    const now = new Date();
    let start = new Date(now);
    const end = new Date(now);

    if (nextPeriod === "today") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (nextPeriod === "week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
    } else if (nextPeriod === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (nextPeriod === "year") {
      start = new Date(now.getFullYear(), 0, 1);
    } else {
      return;
    }

    const formattedStart = start.toISOString().split("T")[0];
    const formattedEnd = end.toISOString().split("T")[0];

    setStartDate(formattedStart);
    setEndDate(formattedEnd);
    void fetchMetrics(formattedStart, formattedEnd);
  };

  useEffect(() => {
    handlePeriodChange("today");
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (period === "today") {
        void fetchMetrics();
      }
    }, 30000);

    return () => window.clearInterval(interval);
  }, [period, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const downloadCSV = () => {
    if (!metrics) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metrica,Valor,Detalhe\n";
    csvContent += `Faturamento Total,${metrics.totalRevenue.toFixed(2)},+${metrics.revenue24h.toFixed(2)} (24h)\n`;
    csvContent += `Pedidos,${metrics.totalOrders},+${metrics.orders24h} (24h)\n`;
    csvContent += `Visitantes,${metrics.totalVisits},+${metrics.visits24h} (24h)\n`;
    csvContent += `Ticket Medio,${metrics.ticketAverage.toFixed(2)},\n`;
    csvContent += `Taxa de Conversao,${metrics.conversionRate.toFixed(2)}%,\n`;
    csvContent += "\nVendas por Vendedor\n";
    csvContent += "Vendedor,Valor,Meta\n";

    metrics.salesBySeller.forEach((seller) => {
      csvContent += `${seller.name},${seller.value.toFixed(2)},${seller.goal.toFixed(2)}\n`;
    });

    csvContent += "\nProdutos Mais Vendidos\n";
    csvContent += "Produto,Quantidade\n";

    metrics.topProducts.forEach((product) => {
      csvContent += `${product.name},${product.quantity}\n`;
    });

    csvContent += "\nMetodos de Pagamento\n";
    csvContent += "Metodo,Quantidade\n";

    metrics.paymentMethods.forEach((method) => {
      csvContent += `${method.name},${method.value}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !metrics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!metrics) {
    return <div className="p-8 text-center text-gray-700">Erro ao carregar dados.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans print:bg-white print:p-0 md:p-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 print:hidden md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">{title}</h1>
          <p className="mt-1 text-gray-500">{description}</p>
        </div>

        <div className="flex w-full flex-col items-start gap-3 md:w-auto md:items-end">
          {actions ? <div className="flex w-full justify-end md:w-auto">{actions}</div> : null}

          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => handlePeriodChange("today")}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                period === "today"
                  ? "bg-blue-100 font-medium text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => handlePeriodChange("week")}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                period === "week"
                  ? "bg-blue-100 font-medium text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => handlePeriodChange("month")}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                period === "month"
                  ? "bg-blue-100 font-medium text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => handlePeriodChange("year")}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                period === "year"
                  ? "bg-blue-100 font-medium text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Ano
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
            <input
              type="date"
              value={startDate}
              onChange={(event) => {
                const nextStartDate = event.target.value;
                setPeriod("custom");
                setStartDate(nextStartDate);
              }}
              className="rounded border px-2 py-1 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => {
                const nextEndDate = event.target.value;
                setPeriod("custom");
                setEndDate(nextEndDate);
              }}
              className="rounded border px-2 py-1 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => void fetchMetrics()}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
            >
              Atualizar
            </button>
            <button
              onClick={handlePrint}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
              title="Imprimir Relatorio"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={downloadCSV}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-green-50 hover:text-green-600"
              title="Exportar CSV"
            >
              <Filter size={18} />
            </button>
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
            <Clock size={12} />
            Atualizado: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="mb-8 hidden border-b pb-4 text-center print:block">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-600">
          Periodo: {new Date(startDate).toLocaleDateString("pt-BR")} ate{" "}
          {new Date(endDate).toLocaleDateString("pt-BR")}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Gerado em: {new Date().toLocaleString("pt-BR")}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 print:grid-cols-4 print:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Faturamento Total"
          value={`R$ ${formatMoney(metrics.totalRevenue)}`}
          subtext={`+ R$ ${formatMoney(metrics.revenue24h)} (24h)`}
          icon={DollarSign}
          trend="up"
        />
        <MetricCard
          title="Pedidos Realizados"
          value={metrics.totalOrders}
          subtext={`+ ${metrics.orders24h} novos (24h)`}
          icon={ShoppingBag}
          trend={metrics.orders24h > 0 ? "up" : "neutral"}
        />
        <MetricCard
          title="Ordens de Servico"
          value={metrics.serviceOrders.total}
          subtext={`R$ ${formatMoney(metrics.serviceOrders.revenue)}`}
          icon={Wrench}
        />
        <MetricCard
          title="Visitantes Unicos"
          value={metrics.totalVisits.toLocaleString("pt-BR")}
          subtext={`+ ${metrics.visits24h} hoje`}
          icon={Users}
          trend="up"
        />
      </div>

      {metrics.leadKpis ? (
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Leads e Conversoes</h2>
            <p className="text-sm text-gray-500">
              Contatos reais medidos por WhatsApp, telefone, email e formulario.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Leads Totais"
              value={metrics.leadKpis.total}
              subtext={`+ ${metrics.leadKpis.last24h} nas ultimas 24h`}
              icon={Users}
              trend={metrics.leadKpis.last24h > 0 ? "up" : "neutral"}
            />
            <MetricCard
              title="Taxa Lead/Visita"
              value={`${metrics.leadKpis.conversionRate.toFixed(2)}%`}
              subtext={`${metrics.leadKpis.sectionViews} visualizacoes de bloco`}
              icon={TrendingUp}
              trend={metrics.leadKpis.conversionRate > 0 ? "up" : "neutral"}
            />
            <MetricCard
              title="Formularios Enviados"
              value={metrics.leadKpis.formSuccesses}
              subtext={`${metrics.leadKpis.emailClicks} cliques em email`}
              icon={Mail}
              trend={metrics.leadKpis.formSuccesses > 0 ? "up" : "neutral"}
            />
            <MetricCard
              title="WhatsApp e Ligacoes"
              value={metrics.leadKpis.whatsappClicks + metrics.leadKpis.phoneClicks}
              subtext={`${metrics.leadKpis.whatsappClicks} WhatsApp e ${metrics.leadKpis.phoneClicks} ligacoes`}
              icon={MessageCircle}
              trend={
                metrics.leadKpis.whatsappClicks + metrics.leadKpis.phoneClicks > 0
                  ? "up"
                  : "neutral"
              }
            />
          </div>
        </div>
      ) : null}

      <div className="mb-8 grid grid-cols-1 gap-8 print:grid-cols-2 print:gap-4 print:break-inside-avoid lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm print:border-gray-300">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-800">
            <Award className="text-yellow-500" />
            Performance de Vendas
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.salesBySeller} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={formatCurrencyTooltip}
                />
                <Bar
                  dataKey="value"
                  name="Vendas"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="goal"
                  name="Meta"
                  fill="#e5e7eb"
                  radius={[0, 4, 4, 0]}
                  barSize={10}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm print:border-gray-300">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-800">
            <Clock className="text-blue-500" />
            Vendas por Horario
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.salesByHour}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  formatter={formatCurrencyTooltip}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 print:grid-cols-3 print:gap-4 print:break-inside-avoid lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm print:col-span-2 print:border-gray-300 lg:col-span-2">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-800">
            <Package className="text-purple-500" />
            Produtos Mais Vendidos
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.topProducts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" name="Qtd" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm print:border-gray-300">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-800">
            <CreditCard className="text-green-500" />
            Metodos de Pagamento
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.paymentMethods.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={formatCurrencyTooltip}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {metrics.leadBreakdown?.length || metrics.topLeadSources?.length || metrics.topLeadPages?.length ? (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-800">
              <MessageCircle className="text-green-500" />
              Tipos de Conversao
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.leadBreakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
              <Phone className="text-blue-500" />
              Top Origens
            </h3>
            <div className="space-y-3">
              {(metrics.topLeadSources || []).map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {truncateLabel(item.name)}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
              {!(metrics.topLeadSources || []).length ? (
                <p className="text-sm text-gray-500">Sem dados de origem ainda.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
              <Package className="text-purple-500" />
              Paginas que Geram Lead
            </h3>
            <div className="space-y-3">
              {(metrics.topLeadPages || []).map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {truncateLabel(item.name)}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
              {!(metrics.topLeadPages || []).length ? (
                <p className="text-sm text-gray-500">Sem paginas com lead ainda.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {metrics.topLeadCities?.length ? (
        <div className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
            <Users className="text-red-500" />
            Cidades com Mais Lead
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {metrics.topLeadCities.map((item) => (
              <div
                key={item.name}
                className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <p className="text-sm text-gray-500">{truncateLabel(item.name, 28)}</p>
                <p className="mt-1 text-xl font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 text-center text-sm text-gray-400 print:hidden">{footerText}</div>
    </div>
  );
}
