import { hasAdmin, supabaseAdmin } from "@/lib/supabase-admin";

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

export function ensureDashboardAdminConfigured() {
  if (!hasAdmin) {
    throw new Error("Supabase admin nao configurado");
  }
}

export async function getDashboardMetrics(params: {
  startDate?: string | null;
  endDate?: string | null;
}): Promise<DashboardMetrics> {
  ensureDashboardAdminConfigured();

  const { startDate, endDate } = params;
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

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
    console.error("Erro ao buscar pedidos:", ordersError);
  }

  const orders = (ordersData || []) as OrderRow[];
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
  const revenue24h = recentOrders.reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0
  );

  let visitsQuery = supabaseAdmin
    .from("site_visits")
    .select("*", { count: "exact", head: true });

  if (startDate) visitsQuery = visitsQuery.gte("created_at", startDate);
  if (endDate) visitsQuery = visitsQuery.lte("created_at", endDate);

  const { count: totalVisitsCount, error: visitsError } = await visitsQuery;

  if (visitsError) {
    console.error("Erro ao buscar visitas:", visitsError);
  }

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
  for (let hour = 0; hour < 24; hour += 1) {
    salesByHourMap.set(hour, 0);
  }

  orders.forEach((order) => {
    const hour = new Date(order.created_at).getHours();
    const current = salesByHourMap.get(hour) || 0;
    salesByHourMap.set(hour, current + (Number(order.total) || 0));
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
