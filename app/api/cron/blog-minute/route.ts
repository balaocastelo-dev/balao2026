import { NextResponse } from 'next/server';
import { runBlogIngestionCycle } from '@/lib/blog/agents/master-agent';
import { markAgentRunning, recordAgentRun } from '@/lib/ai/master-agent';

function isAuthorized(req: Request): boolean {
  const vercelCron = req.headers.get('x-vercel-cron');
  if (vercelCron) return true;

  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const url = new URL(req.url);
  const querySecret = url.searchParams.get('secret');
  if (querySecret && querySecret === secret) return true;

  const auth = req.headers.get('authorization');
  if (auth && auth.startsWith('Bearer ') && auth.slice('Bearer '.length) === secret) return true;

  return false;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const startedAtMs = Date.now();
  markAgentRunning('cron.blog-minute');

  try {
    const result = await runBlogIngestionCycle({ maxNewPosts: 3, force: false });
    recordAgentRun({
      agentId: 'cron.blog-minute',
      ok: true,
      startedAtMs,
      summary: `Blog cycle: created=${result.created} skipped=${result.skipped} errors=${result.errors}`,
      meta: result
    });
    return NextResponse.json({ ok: true, result }, { headers: { 'cache-control': 'no-store' } });
  } catch (e: any) {
    recordAgentRun({
      agentId: 'cron.blog-minute',
      ok: false,
      startedAtMs,
      summary: 'Blog cycle falhou',
      meta: { error: String(e?.message || e) }
    });
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
