import { NextResponse, NextRequest } from 'next/server';
import { updateOrderStatus, deleteOrder, getOrder } from '@/lib/db';
import { sendEmail } from '@/lib/mail';
import { getOrderStatusUpdateTemplate } from '@/lib/mail-templates';

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
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
  const params = await props.params;
  try {
    await deleteOrder(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
