import { DashboardMetrics, getDashboardMetrics } from "@/lib/dashboard-metrics";
import { turso, isTursoActive } from "@/lib/turso";

type ConversionEventRow = {
  created_at: string;
  event_name: string;
  page_path: string | null;
  source: string | null;
  city: string | null;
};

const LEAD_EVENT_NAMES = new Set([
  "whatsapp_click",
  "phone_click",
  "email_click",
  "lead_form_success",
]);

const EVENT_LABELS: Record<string, string> = {
  whatsapp_click: "WhatsApp",
  phone_click: "Telefone",
  email_click: "Email",
  lead_form_attempt: "Formulario iniciado",
  lead_form_success: "Formulario enviado",
  lead_form_error: "Formulario com erro",
  lead_section_view: "Bloco de lead visto",
};

function countBy<T>(items: T[], getKey: (item: T) => string | null | undefined) {
  const map = new Map<string, number>();

  items.forEach((item) => {
    const key = getKey(item)?.trim();
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  });

  return map;
}

function mapToSortedArray(map: Map<string, number>, limit = 5) {
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export async function getPainelMetrics(params: {
  startDate?: string | null;
  endDate?: string | null;
}): Promise<DashboardMetrics> {
  const baseMetrics = await getDashboardMetrics(params);

  if (!isTursoActive()) {
    return baseMetrics;
  }

  const { startDate, endDate } = params;
  const where: string[] = [];
  const args: string[] = [];
  if (startDate) {
    where.push("created_at >= ?");
    args.push(startDate);
  }
  if (endDate) {
    where.push("created_at <= ?");
    args.push(endDate);
  }

  let rows: ConversionEventRow[] = [];
  try {
    const res = await turso.execute({
      sql: `SELECT created_at, event_name, page_path, source, city
            FROM site_conversion_events
            ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`,
      args,
    });
    rows = res.rows as unknown as ConversionEventRow[];
  } catch (err: any) {
    console.warn("Erro ao consultar site_conversion_events:", err?.message);
    return {
      ...baseMetrics,
      leadKpis: {
        total: 0,
        last24h: 0,
        conversionRate: 0,
        formSuccesses: 0,
        whatsappClicks: 0,
        phoneClicks: 0,
        emailClicks: 0,
        sectionViews: 0,
      },
      leadBreakdown: [],
      topLeadSources: [],
      topLeadPages: [],
      topLeadCities: [],
    };
  }

  const events = rows;
  const leadEvents = events.filter((event) => LEAD_EVENT_NAMES.has(event.event_name));
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const leadEvents24h = leadEvents.filter(
    (event) => new Date(event.created_at).getTime() >= oneDayAgo.getTime()
  ).length;

  const eventBreakdownMap = countBy(events, (event) => EVENT_LABELS[event.event_name] || event.event_name);
  const sourceMap = countBy(leadEvents, (event) => event.source || "Sem origem");
  const pageMap = countBy(leadEvents, (event) => event.page_path || "Sem pagina");
  const cityMap = countBy(leadEvents, (event) => event.city || "Sem cidade");

  const whatsappClicks = leadEvents.filter((event) => event.event_name === "whatsapp_click").length;
  const phoneClicks = leadEvents.filter((event) => event.event_name === "phone_click").length;
  const emailClicks = leadEvents.filter((event) => event.event_name === "email_click").length;
  const formSuccesses = leadEvents.filter((event) => event.event_name === "lead_form_success").length;
  const sectionViews = events.filter((event) => event.event_name === "lead_section_view").length;

  return {
    ...baseMetrics,
    leadKpis: {
      total: leadEvents.length,
      last24h: leadEvents24h,
      conversionRate: baseMetrics.totalVisits > 0 ? (leadEvents.length / baseMetrics.totalVisits) * 100 : 0,
      formSuccesses,
      whatsappClicks,
      phoneClicks,
      emailClicks,
      sectionViews,
    },
    leadBreakdown: mapToSortedArray(eventBreakdownMap, 7),
    topLeadSources: mapToSortedArray(sourceMap, 7),
    topLeadPages: mapToSortedArray(pageMap, 7),
    topLeadCities: mapToSortedArray(cityMap, 7),
  };
}
