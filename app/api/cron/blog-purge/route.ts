import { NextResponse } from "next/server";
import { turso, isTursoActive } from "@/lib/turso";
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

  if (!isTursoActive()) {
    return NextResponse.json({ error: "Banco de dados não configurado" }, { status: 500 });
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
            const res = await turso.execute(
              "SELECT COUNT(*) AS n FROM blog_posts WHERE source_type = 'rss'"
            );
            return { deleted: Number(res.rows[0]?.n || 0) };
          }

          const res = await turso.execute(
            "DELETE FROM blog_posts WHERE source_type = 'rss' RETURNING id"
          );
          return { deleted: res.rows.length };
        },
      });
    }

    if (deleteNonBalaoProductPosts) {
      plan.push({
        label: "blog_posts:product_non_balao",
        exec: async () => {
          const res = await turso.execute(
            "SELECT id, source_url FROM blog_posts WHERE source_type = 'product' LIMIT 10000"
          );
          const rows = res.rows as any[];
          const ids = rows
            .filter((r) => getDomain(String(r?.source_url || "")) !== "balao.info")
            .map((r) => r.id);
          if (ids.length === 0) return { deleted: 0 };

          if (dryRun) return { deleted: ids.length };

          const placeholders = ids.map(() => "?").join(",");
          const delRes = await turso.execute({
            sql: `DELETE FROM blog_posts WHERE id IN (${placeholders}) RETURNING id`,
            args: ids,
          });
          return { deleted: delRes.rows.length };
        },
      });
    }

    if (deleteSourceItems && deleteRssPosts) {
      plan.push({
        label: "blog_source_items:rss",
        exec: async () => {
          if (dryRun) {
            const res = await turso.execute(
              "SELECT COUNT(*) AS n FROM blog_source_items WHERE source_type = 'rss'"
            );
            return { deleted: Number(res.rows[0]?.n || 0) };
          }

          const res = await turso.execute(
            "DELETE FROM blog_source_items WHERE source_type = 'rss' RETURNING id"
          );
          return { deleted: res.rows.length };
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
