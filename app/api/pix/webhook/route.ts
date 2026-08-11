import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, getOrder } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Este webhook simula a recepção de um pagamento Pix.
    // Em produção, você validaria a assinatura do banco (Inter, Nubank, etc).
    
    const { txid, status } = body;

    if (!txid || status !== 'CONCLUIDO') {
      return NextResponse.json({ received: true });
    }

    // No nosso payload de Pix, o txid é o orderId.slice(0, 8)
    // Para simplificar o tracking, vamos buscar pedidos pendentes que batem com esse prefixo
    // ou assumir que o txid passado aqui é o orderId completo para teste.
    
    const orderId = txid; // Mock
    const order = await getOrder(orderId);

    if (order && order.status === 'pending') {
      await updateOrderStatus(orderId, 'paid');
      console.log(`[Pix Webhook] Pedido ${orderId} marcado como PAGO.`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pix Webhook Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
