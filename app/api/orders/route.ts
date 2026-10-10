import { NextResponse } from 'next/server';
import { getOrders } from '@/lib/db';
import { isPainelAuthenticated } from '@/lib/painel-auth';

export const dynamic = 'force-dynamic';

// A lista de pedidos traz nome, e-mail, WhatsApp, endereço e CPF de cada
// cliente. Só responde para quem entrou no painel — a tranca do proxy.ts já
// barra antes, e esta conferência é a segunda, para o caso de a primeira ser
// mexida sem querer.
export async function GET() {
  if (!(await isPainelAuthenticated())) {
    return NextResponse.json({ error: 'Acesso negado. Entre no painel do Balão.' }, { status: 401 });
  }

  try {
    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
