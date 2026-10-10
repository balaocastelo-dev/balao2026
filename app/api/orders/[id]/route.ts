import { NextResponse, NextRequest } from 'next/server';
import { updateOrderStatus, deleteOrder, getOrder } from '@/lib/db';
import { sendEmail } from '@/lib/mail';
import { getOrderStatusUpdateTemplate } from '@/lib/mail-templates';
import { isPainelAuthenticated } from '@/lib/painel-auth';

// Mudar a situação de um pedido manda e-mail para o cliente, e apagar não tem
// volta. As duas coisas só valem para quem entrou no painel (o proxy.ts barra
// antes; aqui é a segunda conferência).
function negado() {
  return NextResponse.json({ error: 'Acesso negado. Entre no painel do Balão.' }, { status: 401 });
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  if (!(await isPainelAuthenticated())) return negado();
  const params = await props.params;
  try {
    const { status } = await request.json();
    await updateOrderStatus(params.id, status);

    // Fetch updated order to send email
    const order = await getOrder(params.id);
    if (order && order.customer_email) {
      const html = getOrderStatusUpdateTemplate(order, status);
      await sendEmail({
        to: order.customer_email,
        subject: `Atualização do Pedido #${order.id.slice(0, 8)}`,
        html,
        eventType: 'order_status_update'
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  if (!(await isPainelAuthenticated())) return negado();
  const params = await props.params;
  try {
    await deleteOrder(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
