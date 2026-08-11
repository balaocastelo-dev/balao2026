import { NextResponse } from 'next/server';

function safeBase64Decode(input: string): string | null {
  try {
    return Buffer.from(input, 'base64').toString('utf8');
  } catch {
    return null;
  }
}

export function requireAdminApiAuth(request: Request): NextResponse | null {
  const user = process.env.ADMIN_BASIC_AUTH_USER;
  const pass = process.env.ADMIN_BASIC_AUTH_PASS;
  if (!user || !pass) return null;

  const auth = request.headers.get('authorization') || '';
  const match = auth.match(/^Basic\s+(.+)$/i);
  if (!match?.[1]) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'www-authenticate': 'Basic realm="Admin"' }
    });
  }

  const decoded = safeBase64Decode(match[1]);
  if (!decoded) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'www-authenticate': 'Basic realm="Admin"' }
    });
  }

  const idx = decoded.indexOf(':');
  const gotUser = idx >= 0 ? decoded.slice(0, idx) : decoded;
  const gotPass = idx >= 0 ? decoded.slice(idx + 1) : '';

  if (gotUser !== user || gotPass !== pass) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'www-authenticate': 'Basic realm="Admin"' }
    });
  }

  return null;
}

