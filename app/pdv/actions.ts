"use server";

import { createOrder as createDbOrder } from "@/lib/db";
import { sendNewOrderNotification } from "@/lib/mail";
import { PdvCartItem, PdvCustomer } from "./store";

export async function createOrder({
  customer,
  items,
  total,
  paymentMethod,
  origin,
  sellerId
}: {
  customer: PdvCustomer;
  items: PdvCartItem[];
  total: number;
  paymentMethod: string;
  origin: string;
  sellerId: string | null;
}) {
  try {
    const orderData = {
      customer_name: customer.name,
      customer_email: customer.email,
      customer_whatsapp: customer.phone,
      address: {
        street: customer.address,
        cep: customer.cep,
        city: customer.city,
        state: customer.state,
        number: customer.number,
        complement: customer.complement
      },
      total: total,
      status: "paid" as const,
      origin: "pdv" as const,
      seller_id: sellerId || undefined,
      cpf_cnpj: customer.cpf_cnpj,
      payment_method: paymentMethod,
    };
    
    const itemsData = items.map((item) => ({
      product_id: item.id,
      product_name: item.name,
      product_image: item.image_url || '',
      quantity: item.quantity,
      price: item.price
    }));

    const order = await createDbOrder(orderData, itemsData);

    await sendNewOrderNotification({
      orderId: order.id,
      origin: "pdv",
      customerName: customer.name,
      customerEmail: customer.email,
      customerWhatsapp: customer.phone,
      customerCpfCnpj: customer.cpf_cnpj,
      address: {
        street: customer.address,
        cep: customer.cep,
        city: customer.city,
        state: customer.state,
        number: customer.number,
        complement: customer.complement
      },
      paymentMethod,
      total,
      items: itemsData.map((it) => ({
        productId: it.product_id,
        productName: it.product_name,
        productImage: it.product_image,
        quantity: it.quantity,
        price: it.price
      }))
    });

    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return { success: false, error: error.message };
  }
}
