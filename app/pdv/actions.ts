"use server";

import { createOrder as createDbOrder, getProductById, getProductsByCategory } from "@/lib/db";
import { sendEmail, sendNewOrderNotification } from "@/lib/mail";
import { PdvCartItem, PdvCustomer } from "./store";
import { getOrderCustomerWhatsAppTemplate } from "@/lib/mail-templates";

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

    const primaryProductId = typeof itemsData?.[0]?.product_id === "string" ? itemsData[0].product_id : "";
    const primaryProduct = primaryProductId ? await getProductById(primaryProductId) : null;
    const pickProductImage = (p: any) => {
      const direct = typeof p?.image === "string" ? p.image.trim() : "";
      if (direct) return direct;
      const urls = p?.image_urls;
      if (Array.isArray(urls)) {
        const first = urls.find((u) => typeof u === "string" && u.trim().length > 0);
        if (typeof first === "string") return first.trim();
      }
      return "";
    };
    const relatedProducts = primaryProduct?.category
      ? (await getProductsByCategory(primaryProduct.category))
          .filter((p) => p && typeof p.id === "string" && p.id !== primaryProductId)
          .slice(0, 3)
          .map((p) => ({
            id: String(p.id),
            slug: typeof (p as any).slug === "string" ? (p as any).slug : null,
            name: String((p as any).name || ""),
            price: String((p as any).price || ""),
            image: pickProductImage(p) || null,
            category: typeof (p as any).category === "string" ? (p as any).category : null,
          }))
      : [];

    const customerEmailHtml = getOrderCustomerWhatsAppTemplate(
      { ...orderData, id: order.id, discount_value: 0 },
      itemsData,
      relatedProducts,
      { whatsappNumber: "19987510267" }
    );

    await sendEmail({
      to: customer.email,
      subject: `Confirmação de Pedido #${order.id.slice(0, 8)}`,
      html: customerEmailHtml,
      eventType: "order_confirmation"
    });

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
