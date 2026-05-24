import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/auth';
import { adminListFeeds, adminToggleFeed, adminUpsertFeed } from '@/lib/blog/admin-store';

export async function GET(request: Request) {
  const auth = requireAdminApiAuth(request);
  if (auth) return auth;
  const feeds = await adminListFeeds();
  return NextResponse.json({ feeds });
}

export async function POST(request: Request) {
  const auth = requireAdminApiAuth(request);
  if (auth) return auth;

  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.url || !body?.category) {
    return NextResponse.json({ error: 'Campos obrigatórios: name, url, category' }, { status: 400 });
  }

  const feed = await adminUpsertFeed({
    id: body.id,
    name: String(body.name),
    url: String(body.url),
    category: String(body.category),
    language: body.language ? String(body.language) : 'pt-BR',
    active: body.active !== undefined ? Boolean(body.active) : true,
    priority: body.priority !== undefined ? Number(body.priority) : 0,
    fetch_interval: body.fetch_interval !== undefined ? Number(body.fetch_interval) : 15,
    campinas_rule: body.campinas_rule !== undefined ? Boolean(body.campinas_rule) : false,
    niche_rule: body.niche_rule ? String(body.niche_rule) : null,
    daily_limit: body.daily_limit !== undefined ? Number(body.daily_limit) : 10
  });

  return NextResponse.json({ feed });
}

export async function PATCH(request: Request) {
  const auth = requireAdminApiAuth(request);
  if (auth) return auth;

  const body = await request.json().catch(() => null);
  if (!body?.id || body.active === undefined) {
    return NextResponse.json({ error: 'Campos obrigatórios: id, active' }, { status: 400 });
  }
  const feed = await adminToggleFeed(String(body.id), Boolean(body.active));
  return NextResponse.json({ feed });
}

