import { NextResponse } from "next/server";
import { createOrder, getProductById, getProductsByCategory } from "@/lib/db";
import { sendEmail, sendNewOrderNotification } from "@/lib/mail";
import { getOrderCustomerWhatsAppTemplate } from "@/lib/mail-templates";
import { validateCoupon } from "@/lib/coupons";
import { isTursoActive } from "@/lib/turso";
import { getCachedProductByIdentifier } from "@/lib/cache";
import { reprecificar, type ItemEnviado } from "@/lib/carrinho/precos";
import { pedidoVeioDoApp, DESCONTO_APP_PIX, emCentavos } from "@/lib/app-balao";
import type { Product } from "@/lib/utils";

/**
 * Preço do produto agora: banco direto (sem cache) e, se ele falhar, o cache do
 * catálogo (que já cai no espelho da VPS). Ver lib/carrinho/precos.ts.
 */
async function buscarProdutoAtual(id: string): Promise<Product | null> {
  const direto = await getProductById(id).catch(() => null);
  if (direto) return direto;
  return getCachedProductByIdentifier(id).catch(() => null);
}

type CheckoutCustomerInput = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  address?: unknown;
  cep?: unknown;
  city?: unknown;
  state?: unknown;
  number?: unknown;
  complement?: unknown;
};

type CheckoutItemInput = {
  id?: unknown;
  product_id?: unknown;
  name?: unknown;
  image?: unknown;
  quantity?: unknown;
  price?: unknown;
};

export async function POST(req: Request) {
  try {
    if (!isTursoActive()) {
      return NextResponse.json(
        {
          error: "Banco de dados não configurado",
          details: "Defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN.",
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as {
      customer?: CheckoutCustomerInput;
      items?: CheckoutItemInput[];
      total?: unknown;
      couponCode?: unknown;
      discountValue?: unknown;
      shippingCost?: unknown;
      shippingOption?: { name?: unknown; days?: unknown };
    };

    const customer = body.customer;
    const items = body.items;
    const total = body.total;
    const couponCode = typeof body.couponCode === "string" ? body.couponCode : undefined;
    const discountValue = typeof body.discountValue === "number" ? body.discountValue : 0;
    const shippingCost = body.shippingCost;
    const shippingOption = body.shippingOption;

    if (!customer || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (typeof customer.email !== "string") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const parsedShippingCost = Number(shippingCost);
    if (!Number.isFinite(parsedShippingCost) || parsedShippingCost < 0) {
      return NextResponse.json({ error: "Missing or invalid shippingCost" }, { status: 400 });
    }

    console.log(`[Checkout] Processing order for ${customer.email}`);
    console.log(`[Checkout] Values received - Total: ${total}, Discount: ${discountValue}, Coupon: ${couponCode}`);

    // --- Backend Validation Start ---
    // O preço vem do BANCO, nunca do navegador (lib/carrinho/precos.ts).
    const enviados: ItemEnviado[] = items.map((item) => {
        const productId = typeof item.product_id === "string"
          ? item.product_id
          : (typeof item.id === "string" ? item.id : "");
        let price = item.price;
        if (typeof price === "string") {
             price = parseFloat(price.replace("R$", "").replace(/\./g, "").replace(",", ".")) || 0;
        }
        return {
          product_id: productId,
          name: String(item.name ?? ""),
          image: typeof item.image === "string" ? item.image : "",
          quantity: Number(item.quantity) || 1,
          price_enviado: typeof price === "number" ? price : Number(price) || 0,
        };
    });

    const repreco = await reprecificar(enviados, buscarProdutoAtual);

    if (repreco.faltando.length > 0) {
        console.warn(`[Checkout] Itens que não existem mais no site: ${repreco.faltando.join(", ")}`);
        return NextResponse.json(
          {
            error: "produto_indisponivel",
            message: "Algum produto do carrinho não está mais disponível no site. Remova-o ou fale com a gente no WhatsApp.",
            faltando: repreco.faltando,
            itens: repreco.itens.map((i) => i.atual),
          },
          { status: 409 }
        );
    }

    if (repreco.algumMudou) {
        console.warn(
          `[Checkout] Preço do carrinho diferente do site, pedido não criado: ` +
          repreco.itens.filter((i) => i.mudou).map((i) => `${i.product_id} ${i.price_enviado} -> ${i.price}`).join("; ")
        );
        return NextResponse.json(
          {
            error: "precos_atualizados",
            message: "O preço de algum item mudou. Atualizamos o carrinho: confira o total e confirme de novo.",
            itens: repreco.itens.map((i) => i.atual),
          },
          { status: 409 }
        );
    }

    const cleanItems = repreco.itens.map((i) => ({
      product_id: i.product_id,
      name: i.name,
      image: i.image,
      quantity: i.quantity,
      price: i.price,
    }));
    const calculatedTotalItems = repreco.subtotal;

    // Desconto extra de 15% no Pix para quem comprou PELO APP. Lido do
    // User-Agent no servidor (não do navegador), igual a loja já faz com o
    // cron da Vercel. Ver lib/app-balao.ts. Fora do app, descontoApp = 0.
    const ehApp = pedidoVeioDoApp(req);
    const descontoApp = ehApp ? emCentavos(calculatedTotalItems * DESCONTO_APP_PIX) : 0;
    if (ehApp) {
        console.log(`[Checkout] Pedido pelo app: -15% no Pix = -R$ ${descontoApp.toFixed(2)}`);
    }

    let calculatedDiscount = 0;
    if (couponCode) {
        try {
            const validation = await validateCoupon(couponCode, calculatedTotalItems, cleanItems);
            if (validation.valid && validation.discount) {
                calculatedDiscount = validation.discount;
            } else {
                console.warn(`[Checkout] Invalid coupon detected during backend validation: ${couponCode}`);
            }
        } catch (err) {
            console.error(`[Checkout] Error validating coupon: ${err}`);
        }
    }

    // Desconto do app + cupom somam. O piso de 0 e o recálculo pelo banco
    // garantem que nunca saia um total negativo nem o valor que o cliente mandou.
    const descontoTotal = emCentavos(calculatedDiscount + descontoApp);
    const expectedTotal = Math.max(0, calculatedTotalItems - descontoTotal + parsedShippingCost);

    // Check for discrepancy (> 0.10 to allow minor rounding diffs)
    if (Math.abs(expectedTotal - Number(total)) > 0.1) {
        console.warn(`[Checkout] CRITICAL: Price mismatch! Received: ${total}, Calculated: ${expectedTotal}. Using calculated value.`);
    } else {
        console.log(`[Checkout] Price validation passed. Calculated: ${expectedTotal}`);
    }
    // --- Backend Validation End ---

    const orderData = {
      customer_name: String(customer.name ?? ""),
      customer_email: customer.email,
      customer_whatsapp: String(customer.phone ?? ""),
      address: {
        street: String(customer.address ?? ""),
        cep: String(customer.cep ?? ""),
        city: String(customer.city ?? ""),
        state: String(customer.state ?? ""),
        number: String(customer.number ?? ""),
        complement: String(customer.complement ?? ""),
        shipping: {
          name: typeof shippingOption?.name === "string" ? shippingOption.name : null,
          days: typeof shippingOption?.days === "string" ? shippingOption.days : null,
          cost: parsedShippingCost
        }
      },
      total: expectedTotal,
      status: 'pending' as const,
      coupon_code: couponCode || (ehApp ? "APP15" : undefined),
      discount_value: descontoTotal
    };

    const orderItems = cleanItems.map((item) => ({
      product_id: item.product_id,
      product_name: String(item.name ?? ""),
      product_image: typeof item.image === "string" ? item.image : "",
      quantity: item.quantity,
      price: item.price
    }));

    const order = await createOrder(orderData, orderItems);
    if (!order) {
      throw new Error("Falha ao criar o pedido no banco de dados");
    }

    const primaryProductId = typeof orderItems?.[0]?.product_id === "string" ? orderItems[0].product_id : "";
    const [primaryProduct] = await Promise.all([
      primaryProductId ? getProductById(primaryProductId) : Promise.resolve(null),
    ]);
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

    // 2. Send Emails (Customer + Admin Notification)
    
    // E-mail para o Cliente usando Template
    const emailHtml = getOrderCustomerWhatsAppTemplate(
      { ...orderData, id: order.id, discount_value: descontoTotal },
      orderItems,
      relatedProducts,
      { whatsappNumber: "19987510267" }
    );

    // Envio assíncrono para não bloquear resposta (ou síncrono se crítico)
    // Aqui fazemos síncrono para garantir
    await sendEmail({
        to: customer.email,
        subject: `Confirmação de Pedido #${order.id.slice(0, 8)}`,
        html: emailHtml,
        eventType: 'order_confirmation'
    });

    await sendNewOrderNotification({
        orderId: order.id,
        origin: "site",
        customerName: String(customer.name ?? ""),
        customerEmail: customer.email,
        customerWhatsapp: String(customer.phone ?? ""),
        address: {
          street: String(customer.address ?? ""),
          number: String(customer.number ?? ""),
          complement: String(customer.complement ?? ""),
          cep: String(customer.cep ?? ""),
          city: String(customer.city ?? ""),
          state: String(customer.state ?? ""),
        },
        shipping: {
          name: typeof shippingOption?.name === "string" ? shippingOption.name : null,
          days: typeof shippingOption?.days === "string" ? shippingOption.days : null,
          cost: parsedShippingCost
        },
        couponCode: couponCode || null,
        discountValue: typeof descontoTotal === "number" ? descontoTotal : null,
        total: expectedTotal,
        items: orderItems.map((it) => ({
          productId: it.product_id,
          productName: it.product_name,
          productImage: it.product_image,
          quantity: it.quantity,
          price: it.price,
        }))
    });

    return NextResponse.json({ success: true, orderId: order.id, total: expectedTotal });

  } catch (error: any) {
    console.error("Checkout error details:", error);
    
    // Check for common database errors
    let errorMessage = "Failed to process order";
    let details = error instanceof Error ? error.message : JSON.stringify(error);
    let hint = "Verifique se as tabelas 'orders' e 'order_items' existem no banco Turso e se TURSO_AUTH_TOKEN está configurado.";

    return NextResponse.json(
        { 
            error: errorMessage, 
            details: details,
            hint: hint
        }, 
        { status: 500 }
    );
  }
}
