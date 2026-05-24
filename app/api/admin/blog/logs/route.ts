import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/auth';
import { adminListAgentLogs } from '@/lib/blog/admin-store';

export async function GET(request: Request) {
  const auth = requireAdminApiAuth(request);
  if (auth) return auth;

  const { searchParams } = new URL(request.url);
  const limit = Math.max(1, Math.min(500, Number(searchParams.get('limit') || 200)));
  const logs = await adminListAgentLogs(limit);
  return NextResponse.json({ logs });
}

