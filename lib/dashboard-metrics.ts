import { hasAdmin, supabaseAdmin } from "@/lib/supabase-admin";
import { turso, isTursoActive } from "@/lib/turso";

const hasTurso = isTursoActive();

type OrderItemRow = {
  product_name: string | null;
  quantity: number | null;
};

type OrderRow = {
  id: string;
  total: number | string | null;
  created_at: string;
  status: string | null;
  payment_method: string | null;
  seller_id: string | null;
  order_items: OrderItemRow[] | null;
};

type SellerRow = {
  id: string;
  nome: string | null;
  meta_valor: number | null;
};

type ServiceOrderRow = {
  labor_income: number | string | null;
  parts_income: number | string | null;
  created_at: string;
};

export type DashboardMetrics = {
  totalOrders: number;
  orders24h: number;
  ordersGrowth: number;
  totalRevenue: number;
  revenue24h: number;
  revenueGrowth: number;
  totalVisits: number;
  visits24h: number;
  visitsGrowth: number;
  conversionRate: number;
  ticketAverage: number;
  topProducts: { name: string; quantity: number }[];
  salesBySeller: { name: string; value: number; goal: number }[];
  paymentMethods: { name: string; value: number }[];
  salesByHour: { hour: string; value: number }[];
  serviceOrders: { total: number; revenue: number };
  leadKpis?: {
    total: number;
    last24h: number;
    conversionRate: number;
    formSuccesses: number;
    whatsappClicks: number;
    phoneClicks: number;
    emailClicks: number;
    sectionViews: number;
  };
  leadBreakdown?: { name: string; value: number }[];
  topLeadSources?: { name: string; value: number }[];
  topLeadPages?: { name: string; value: number }[];
  topLeadCities?: { name: string; value: number }[];
};

const EMPTY_METRICS: DashboardMetrics = {
  totalOrders: 0,
  orders24h: 0,
  ordersGrowth: 0,
  totalRevenue: 0,
  revenue24h: 0,
  revenueGrowth: 0,
  totalVisits: 0,
  visits24h: 0,
  visitsGrowth: 0,
  conversionRate: 0,
  ticketAverage: 0,
  topProducts: [],
  salesBySeller: [],
  paymentMethods: [],
  salesByHour: Array.from({ length: 24 }, (_, h) => ({
    hour: `${h.toString().padStart(2, "0")}:00`,
    value: 0,
  })),
  serviceOrders: { total: 0, revenue: 0 },
};

function ensureDashboardAdminConfigured(): boolean {
  return Boolean(hasTurso || hasAdmin);
}

export async function getDashboardMetrics(params: {
  startDate?: string | null;
  endDate?: string | null;
}): Promise<DashboardMetrics> {
  if (!ensureDashboardAdminConfigured()) {
    return { ...EMPTY_METRICS };
  }

  const { startDate, endDate } = params;
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  try {
    if (hasTurso) {
      return await getDashboardMetricsTurso({ startDate, endDate, oneDayAgo });
    }
  } catch (tursoErr) {
    console.error("[dashboard] Turso metrics failed, falling back:", tursoErr);
  }

  try {
    return await getDashboardMetricsSupabase({ startDate, endDate, oneDayAgo });
  } catch (sbErr) {
    console.error("[dashboard] Supabase metrics also failed:", sbErr);
    return { ...EMPTY_METRICS };
  }
}

async function getDashboardMetricsTurso(opts: {
  startDate?: string | null;
  endDate?: string | null;
  oneDayAgo: string;
}): Promise<DashboardMetrics> {
  const { startDate, endDate, oneDayAgo } = opts;
  const dateArgs: any[] = [];
  let dateWhere = "1=1";
  if (startDate) {
    dateWhere += " AND o.created_at >= ?";
    dateArgs.push(startDate);
  }
  if (endDate) {
    dateWhere += " AND o.created_at <= ?";
    dateArgs.push(endDate);
  }

  const ordersSql = `
    SELECT o.id, o.total, o.created_at, o.status, o.payment_method, o.seller_id
    FROM orders o
    WHERE (o.status IS NULL OR o.status NOT IN ('cancelled','pending'))
      AND ${dateWhere}
    ORDER BY o.created_at DESC
  `;
  const ordersRes = await turso.execute({ sql: ordersSql, args: dateArgs });
  const orderIds = ordersRes.rows.map((r: any) => r.id);

  let orderItemsByOrder: Record<string, OrderItemRow[]> = {};
  if (orderIds.length > 0) {
    const placeholders = orderIds.map(() => "?").join(",");
    const itemsRes = await turso.execute({
      sql: `SELECT order_id, product_name, quantity FROM order_items WHERE order_id IN (${placeholders})`,
      args: orderIds,
    });
    for (const row of itemsRes.rows as any[]) {
      const oid = String(row.order_id);
      if (!orderItemsByOrder[oid]) orderItemsByOrder[oid] = [];
      orderItemsByOrder[oid].push({
        product_name: row.product_name ? String(row.product_name) : null,
        quantity: row.quantity != null ? Number(row.quantity) : null,
      });
    }
  }

  const orders: OrderRow[] = (ordersRes.rows as any[]).map((r) => ({
    id: String(r.id),
    total: r.total,
    created_at: String(r.created_at),
    status: r.status ? String(r.status) : null,
    payment_method: r.payment_method ? String(r.payment_method) : null,
    seller_id: r.seller_id ? String(r.seller_id) : null,
    order_items: orderItemsByOrder[String(r.id)] || null,
  }));

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const recentSql = `
    SELECT id, total FROM orders
    WHERE (status IS NULL OR status NOT IN ('cancelled','pending'))
      AND created_at >= ?
  `;
  const recentRes = await turso.execute({ sql: recentSql, args: [oneDayAgo] });
  const recentOrders = recentRes.rows as unknown as Array<{ id: string; total: any }>;
  const orders24h = recentOrders.length;
  const revenue24h = recentOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);

  let totalVisits = 0;
  let visits24h = 0;
  try {
    const visitsWhereArgs: any[] = [];
    let visitsWhere = "1=1";
    if (startDate) {
      visitsWhere += " AND created_at >= ?";
      visitsWhereArgs.push(startDate);
    }
    if (endDate) {
      visitsWhere += " AND created_at <= ?";
      visitsWhereArgs.push(endDate);
    }
    const totalVisitsRes = await turso.execute({
      sql: `SELECT COUNT(*) as c FROM site_visits WHERE ${visitsWhere}`,
      args: visitsWhereArgs,
    });
    totalVisits = Number((totalVisitsRes.rows[0] as any)?.c || 0);

    const visits24hRes = await turso.execute({
      sql: `SELECT COUNT(*) as c FROM site_visits WHERE created_at >= ?`,
      args: [oneDayAgo],
    });
    visits24h = Number((visits24hRes.rows[0] as any)?.c || 0);
  } catch (e) {
    console.warn("[dashboard] site_visits table missing or error:", (e as any).message);
  }

  let serviceOrdersTotal = 0;
  let serviceOrdersRevenue = 0;
  try {
    const serviceWhereArgs: any[] = [];
    let serviceWhere = "1=1";
    if (startDate) {
      serviceWhere += " AND created_at >= ?";
      serviceWhereArgs.push(startDate);
    }
    if (endDate) {
      serviceWhere += " AND created_at <= ?";
      serviceWhereArgs.push(endDate);
    }
    const weeklySql = `SELECT labor_income, parts_income, created_at FROM weekly_orders WHERE ${serviceWhere}`;
    const serviceRes = await turso.execute({ sql: weeklySql, args: serviceWhereArgs });
    const serviceRows = serviceRes.rows as any[];
    serviceOrdersTotal = serviceRows.length;
    serviceOrdersRevenue = serviceRows.reduce((s, r) => {
      return s + (Number(r.labor_income) || 0) + (Number(r.parts_income) || 0);
    }, 0);
  } catch (e) {
    console.warn("[dashboard] weekly_orders missing:", (e as any).message);
  }

  const productMap = new Map<string, number>();
  orders.forEach((o) => {
    o.order_items?.forEach((it) => {
      if (!it.product_name) return;
      const q = productMap.get(it.product_name) || 0;
      productMap.set(it.product_name, q + (it.quantity || 1));
    });
  });
  const topProducts = Array.from(productMap.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const sellerSalesMap = new Map<string, number>();
  orders.forEach((o) => {
    if (!o.seller_id) return;
    const cur = sellerSalesMap.get(o.seller_id) || 0;
    sellerSalesMap.set(o.seller_id, cur + (Number(o.total) || 0));
  });

  let sellersRows: SellerRow[] = [];
  try {
    const sellersRes = await turso.execute("SELECT id, nome, meta_valor FROM arena_vendedores");
    sellersRows = (sellersRes.rows as any[]).map((r) => ({
      id: String(r.id),
      nome: r.nome ? String(r.nome) : null,
      meta_valor: r.meta_valor != null ? Number(r.meta_valor) : null,
    }));
  } catch (e) {
    console.warn("[dashboard] arena_vendedores missing:", (e as any).message);
  }
  const salesBySeller = sellersRows
    .map((s) => ({
      name: s.nome || "Sem nome",
      value: sellerSalesMap.get(s.id) || 0,
      goal: s.meta_valor || 0,
    }))
    .sort((a, b) => b.value - a.value);

  const paymentMap = new Map<string, number>();
  orders.forEach((o) => {
    const method = o.payment_method || "Outros";
    paymentMap.set(method, (paymentMap.get(method) || 0) + (Number(o.total) || 0));
  });
  const paymentMethods = Array.from(paymentMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const salesByHourMap = new Map<number, number>();
  for (let h = 0; h < 24; h++) salesByHourMap.set(h, 0);
  orders.forEach((o) => {
    const hour = new Date(o.created_at).getHours();
    salesByHourMap.set(hour, (salesByHourMap.get(hour) || 0) + (Number(o.total) || 0));
  });
  const salesByHour = Array.from(salesByHourMap.entries())
    .map(([hour, value]) => ({ hour: `${hour.toString().padStart(2, "0")}:00`, value }))
    .sort((a, b) => parseInt(a.hour, 10) - parseInt(b.hour, 10));

  const ticketAverage = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const conversionRate = totalVisits > 0 ? (totalOrders / totalVisits) * 100 : 0;

  return {
    totalOrders,
    orders24h,
    ordersGrowth: 0,
    totalRevenue,
    revenue24h,
    revenueGrowth: 0,
    totalVisits,
    visits24h,
    visitsGrowth: 0,
    conversionRate,
    ticketAverage,
    topProducts,
    salesBySeller,
    paymentMethods,
    salesByHour,
    serviceOrders: { total: serviceOrdersTotal, revenue: serviceOrdersRevenue },
  };
}

async function getDashboardMetricsSupabase(opts: {
  startDate?: string | null;
  endDate?: string | null;
  oneDayAgo: string;
}): Promise<DashboardMetrics> {
  const { startDate, endDate, oneDayAgo } = opts;

  let ordersQuery = supabaseAdmin
    .from("orders")
    .select(
      "id, total, created_at, status, payment_method, seller_id, order_items(product_name, quantity)"
    )
    .neq("status", "cancelled")
    .neq("status", "pending");

  if (startDate) ordersQuery = ordersQuery.gte("created_at", startDate);
  if (endDate) ordersQuery = ordersQuery.lte("created_at", endDate);

  const { data: ordersData, error: ordersError } = await ordersQuery;

  if (ordersError) {
    console.error("Erro ao buscar pedidos (Supabase):", ordersError);
  }

  const orders = ((ordersData || []) as OrderRow[]).filter((o) =>
    !["cancelled", "pending"].includes(o.status || "")
  );
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  const { data: recentOrdersData } = await supabaseAdmin
    .from("orders")
    .select("id, total")
    .neq("status", "cancelled")
    .neq("status", "pending")
    .gte("created_at", oneDayAgo);

  const recentOrders = (recentOrdersData || []) as Array<{ id: string; total: number | string | null }>;
  const orders24h = recentOrders.length;
  const revenue24h = recentOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  let visitsQuery = supabaseAdmin
    .from("site_visits")
    .select("*", { count: "exact", head: true });

  if (startDate) visitsQuery = visitsQuery.gte("created_at", startDate);
  if (endDate) visitsQuery = visitsQuery.lte("created_at", endDate);

  const { count: totalVisitsCount } = await visitsQuery;
  const totalVisits = totalVisitsCount || 0;

  const { count: visits24hCount } = await supabaseAdmin
    .from("site_visits")
    .select("*", { count: "exact", head: true })
    .gte("created_at", oneDayAgo);
  const visits24h = visits24hCount || 0;

  let serviceQuery = supabaseAdmin
    .from("weekly_orders")
    .select("labor_income, parts_income, created_at");

  if (startDate) serviceQuery = serviceQuery.gte("created_at", startDate);
  if (endDate) serviceQuery = serviceQuery.lte("created_at", endDate);

  const { data: serviceOrdersData } = await serviceQuery;
  const serviceOrdersList = (serviceOrdersData || []) as ServiceOrderRow[];
  const serviceOrdersTotal = serviceOrdersList.length;
  const serviceOrdersRevenue = serviceOrdersList.reduce((sum, order) => {
    return sum + (Number(order.labor_income) || 0) + (Number(order.parts_income) || 0);
  }, 0);

  const productMap = new Map<string, number>();
  orders.forEach((order) => {
    order.order_items?.forEach((item) => {
      if (!item.product_name) return;
      const current = productMap.get(item.product_name) || 0;
      productMap.set(item.product_name, current + (item.quantity || 1));
    });
  });

  const topProducts = Array.from(productMap.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const sellerSalesMap = new Map<string, number>();
  orders.forEach((order) => {
    if (!order.seller_id) return;
    const current = sellerSalesMap.get(order.seller_id) || 0;
    sellerSalesMap.set(order.seller_id, current + (Number(order.total) || 0));
  });

  const { data: sellersData } = await supabaseAdmin
    .from("arena_vendedores")
    .select("id, nome, meta_valor");

  const salesBySeller = ((sellersData || []) as SellerRow[])
    .map((seller) => ({
      name: seller.nome || "Sem nome",
      value: sellerSalesMap.get(seller.id) || 0,
      goal: seller.meta_valor || 0,
    }))
    .sort((a, b) => b.value - a.value);

  const paymentMap = new Map<string, number>();
  orders.forEach((order) => {
    const method = order.payment_method || "Outros";
    const current = paymentMap.get(method) || 0;
    paymentMap.set(method, current + (Number(order.total) || 0));
  });

  const paymentMethods = Array.from(paymentMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const salesByHourMap = new Map<number, number>();
  for (let hour = 0; hour < 24; hour += 1) salesByHourMap.set(hour, 0);

  orders.forEach((order) => {
    const hour = new Date(order.created_at).getHours();
    salesByHourMap.set(hour, (salesByHourMap.get(hour) || 0) + (Number(order.total) || 0));
  });

  const salesByHour = Array.from(salesByHourMap.entries())
    .map(([hour, value]) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      value,
    }))
    .sort((a, b) => parseInt(a.hour, 10) - parseInt(b.hour, 10));

  const ticketAverage = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const conversionRate = totalVisits > 0 ? (totalOrders / totalVisits) * 100 : 0;

  return {
    totalOrders,
    orders24h,
    ordersGrowth: 0,
    totalRevenue,
    revenue24h,
    revenueGrowth: 0,
    totalVisits,
    visits24h,
    visitsGrowth: 0,
    conversionRate,
    ticketAverage,
    topProducts,
    salesBySeller,
    paymentMethods,
    salesByHour,
    serviceOrders: {
      total: serviceOrdersTotal,
      revenue: serviceOrdersRevenue,
    },
  };
}
