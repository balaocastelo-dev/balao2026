import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/auth';
import { adminListPosts, adminUpdatePost } from '@/lib/blog/admin-store';

export async function GET(request: Request) {
  const auth = requireAdminApiAuth(request);
  if (auth) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const limit = Math.max(1, Math.min(200, Number(searchParams.get('limit') || 80)));
  const posts = await adminListPosts({ status, limit });
  return NextResponse.json({ posts });
}

export async function PATCH(request: Request) {
  const auth = requireAdminApiAuth(request);
  if (auth) return auth;

  const body = await request.json().catch(() => null);
  if (!body?.id || !body?.patch) {
    return NextResponse.json({ error: 'Campos obrigatórios: id, patch' }, { status: 400 });
  }

  const id = String(body.id);
  const patch = body.patch as Record<string, any>;
  if (patch.status === 'published' && !patch.published_at) {
    patch.published_at = new Date().toISOString();
  }
  if (patch.status !== undefined && !['draft', 'published', 'archived'].includes(String(patch.status))) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
  }

  const post = await adminUpdatePost(id, patch as any);
  return NextResponse.json({ post });
}

