import { NextResponse } from "next/server";
import { hasAdmin, supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdminApiAuth } from "@/lib/admin/auth";

function isAuthorized(req: Request): NextResponse | null {
  const basicUnauthorized = requireAdminApiAuth(req);
  if (basicUnauthorized) return basicUnauthorized;

  const vercelCron = req.headers.get("x-vercel-cron");
  if (vercelCron) return null;

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret");
  if (querySecret && querySecret === secret) return null;

  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ") && auth.slice("Bearer ".length) === secret) return null;

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

export async function DELETE(req: Request) {
  const unauthorized = isAuthorized(req);
  if (unauthorized) return unauthorized;

  if (!hasAdmin) {
    return NextResponse.json({ error: "Supabase admin não configurado" }, { status: 500 });
  }

  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "rss").toLowerCase();
  const deleteSourceItems = url.searchParams.get("deleteSourceItems") === "true";
  const dryRun = url.searchParams.get("dryRun") === "true";

  const deleteRssPosts = mode === "rss" || mode === "all";
  const deleteNonBalaoProductPosts = mode === "all" || url.searchParams.get("deleteThirdPartyProducts") === "true";

  try {
    const plan: Array<{ label: string; exec: () => Promise<{ deleted: number }> }> = [];

    if (deleteRssPosts) {
      plan.push({
        label: "blog_posts:rss",
        exec: async () => {
          if (dryRun) {
            const { count, error } = await supabaseAdmin
              .from("blog_posts")
              .select("id", { count: "exact", head: true })
              .eq("source_type", "rss");
            if (error) throw error;
            return { deleted: count || 0 };
          }

          const { data, error } = await supabaseAdmin
            .from("blog_posts")
            .delete()
            .eq("source_type", "rss")
            .select("id");
          if (error) throw error;
          return { deleted: Array.isArray(data) ? data.length : 0 };
        },
      });
    }

    if (deleteNonBalaoProductPosts) {
      plan.push({
        label: "blog_posts:product_non_balao",
        exec: async () => {
          if (dryRun) {
            const { data, error } = await supabaseAdmin
              .from("blog_posts")
              .select("source_url", { count: "exact" })
              .eq("source_type", "product")
              .limit(10_000);
            if (error) throw error;
            const rows = Array.isArray(data) ? data : [];
            const count = rows.filter((r: any) => getDomain(String(r?.source_url || "")) !== "balao.info").length;
            return { deleted: count };
          }

          const { data, error } = await supabaseAdmin
            .from("blog_posts")
            .select("id,source_url")
            .eq("source_type", "product")
            .limit(10_000);
          if (error) throw error;
          const rows = Array.isArray(data) ? data : [];
          const ids = rows.filter((r: any) => getDomain(String(r?.source_url || "")) !== "balao.info").map((r: any) => r.id);
          if (ids.length === 0) return { deleted: 0 };

          const { data: delData, error: delError } = await supabaseAdmin
            .from("blog_posts")
            .delete()
            .in("id", ids)
            .select("id");
          if (delError) throw delError;
          return { deleted: Array.isArray(delData) ? delData.length : 0 };
        },
      });
    }

    if (deleteSourceItems && deleteRssPosts) {
      plan.push({
        label: "blog_source_items:rss",
        exec: async () => {
          if (dryRun) {
            const { count, error } = await supabaseAdmin
              .from("blog_source_items")
              .select("id", { count: "exact", head: true })
              .eq("source_type", "rss");
            if (error) throw error;
            return { deleted: count || 0 };
          }

          const { data, error } = await supabaseAdmin
            .from("blog_source_items")
            .delete()
            .eq("source_type", "rss")
            .select("id");
          if (error) throw error;
          return { deleted: Array.isArray(data) ? data.length : 0 };
        },
      });
    }

    const results: Record<string, number> = {};
    for (const step of plan) {
      const r = await step.exec();
      results[step.label] = r.deleted;
    }

    return NextResponse.json({
      ok: true,
      dryRun,
      mode,
      deleteSourceItems,
      results,
      note:
        deleteSourceItems && deleteRssPosts
          ? "Atenção: deletar blog_source_items faz o cron reimportar conteúdos antigos do feed."
          : "Mantendo blog_source_items: o cron não reimporta itens antigos, apenas novos.",
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Erro" }, { status: 500 });
  }
}

