import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/auth';
import { runBlogIngestionCycle } from '@/lib/blog/agents/master-agent';

export async function POST(request: Request) {
  const auth = requireAdminApiAuth(request);
  if (auth) return auth;

  const body = await request.json().catch(() => ({}));
  const maxNewPosts = body?.maxNewPosts !== undefined ? Number(body.maxNewPosts) : 8;
  const force = body?.force !== undefined ? Boolean(body.force) : true;

  const result = await runBlogIngestionCycle({ maxNewPosts, force });
  return NextResponse.json({ ok: true, result });
}

