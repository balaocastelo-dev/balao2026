
import { SITE_CONFIG } from "@/lib/config";

export const emailStyles = `
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
    .header { background-color: #ffffff; padding: 30px 40px; text-align: center; border-bottom: 3px solid #E60012; }
    .logo-text { color: #E60012; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
    .content { padding: 40px; }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .button { display: inline-block; background-color: #E60012; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 25px; box-shadow: 0 2px 4px rgba(230, 0, 18, 0.2); transition: background-color 0.2s; }
    .button:hover { background-color: #cc0010; }
    
    .product-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 25px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .product-table th { background-color: #f9fafb; text-align: left; padding: 12px 16px; color: #4b5563; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; }
    .product-table td { padding: 16px; vertical-align: middle; border-bottom: 1px solid #f3f4f6; }
    .product-table tr:last-child td { border-bottom: none; }
    
    .product-img { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; }
    .product-name { font-weight: 600; color: #111827; display: block; margin-bottom: 4px; }
    .product-meta { font-size: 13px; color: #6b7280; }
    
    .total-section { margin-top: 20px; text-align: right; padding-top: 20px; border-top: 2px dashed #e5e7eb; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #4b5563; }
    .total-final { font-size: 20px; font-weight: 800; color: #E60012; margin-top: 12px; }
    
    .info-box { background-color: #fef2f2; border-left: 4px solid #E60012; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
    .info-title { color: #991b1b; font-weight: 700; margin-bottom: 8px; display: block; font-size: 14px; text-transform: uppercase; }
    
    h1 { color: #111827; font-size: 24px; font-weight: 800; margin: 0 0 20px; }
    h2 { color: #111827; font-size: 20px; font-weight: 700; margin: 30px 0 15px; }
    p { margin: 0 0 16px; color: #374151; font-size: 16px; }
    ul { margin: 0 0 20px; padding-left: 20px; color: #374151; }
    li { margin-bottom: 8px; }
    
    .status-badge { display: inline-block; padding: 6px 12px; border-radius: 9999px; font-weight: 600; font-size: 14px; text-transform: uppercase; }
  </style>
`;

const getUnsubscribeLink = (email?: string) => {
  if (!email) return "#";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://balaocastelo.com.br";
  return `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
};

export const getBaseTemplate = (content: string, title: string = "Balão Castelo", email?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">🎈 Balão da Informática</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p style="margin-bottom: 10px;">
        <strong>${SITE_CONFIG.companyName}</strong><br>
        ${SITE_CONFIG.address}<br>
        ${SITE_CONFIG.whatsapp.display}
      </p>
      <div style="margin-top: 20px; pt-10px; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 11px; color: #9ca3af;">
          &copy; ${new Date().getFullYear()} Balão Castelo. Todos os direitos reservados.<br>
          Este e-mail foi enviado automaticamente.
        </p>
        ${email ? `<p><a href="${getUnsubscribeLink(email)}" style="color: #9ca3af; text-decoration: underline;">Descadastrar-se</a></p>` : ''}
      </div>
    </div>
  </div>
</body>
</html>
`;

export const getOrderStatusUpdateTemplate = (order: any, status: string) => {
  const statusMap: Record<string, string> = {
    pending: "⏳ Pendente",
    paid: "✅ Pagamento Aprovado",
    shipped: "🚚 Enviado",
    delivered: "🎉 Entregue",
    canceled: "❌ Cancelado"
  };

  const statusColor: Record<string, string> = {
    pending: "#fff7ed; color: #c2410c", // Orange
    paid: "#eff6ff; color: #1d4ed8",    // Blue
    shipped: "#f5f3ff; color: #6d28d9", // Purple
    delivered: "#ecfdf5; color: #047857", // Green
    canceled: "#fef2f2; color: #b91c1c"   // Red
  };

  const statusLabel = statusMap[status] || status;
  const style = statusColor[status] || "background: #f3f4f6; color: #374151";

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1>Atualização de Pedido</h1>
      <p style="font-size: 18px; color: #6b7280;">Pedido #${order.id.slice(0, 8)}</p>
      <div style="margin-top: 20px;">
        <span class="status-badge" style="background: ${style.split(';')[0]}; ${style.split(';')[1]}">
          ${statusLabel}
        </span>
      </div>
    </div>

    <p>Olá, <strong>${order.customer_name.split(' ')[0]}</strong>! 👋</p>
    <p>Temos novidades sobre o seu pedido. O status foi atualizado para: <strong>${statusLabel}</strong>.</p>
    
    ${status === 'shipped' ? `
    <div class="info-box" style="border-color: #6d28d9; background-color: #f5f3ff;">
      <span class="info-title" style="color: #6d28d9;">🚚 Rastreamento</span>
      <p style="margin:0;">Seu pedido está a caminho! Você receberá o código de rastreio em breve ou ele já está disponível na sua área de pedidos.</p>
    </div>
    ` : ''}

    ${status === 'delivered' ? `
    <div class="info-box" style="border-color: #047857; background-color: #ecfdf5;">
      <span class="info-title" style="color: #047857;">🎉 Entrega Confirmada</span>
      <p style="margin:0;">Esperamos que você ame seus novos produtos! Se precisar de ajuda, estamos aqui.</p>
    </div>
    ` : ''}

    <p style="text-align: center;">
      <a href="https://balaocastelo.com.br/meus-pedidos" class="button">Acompanhar Pedido</a>
    </p>
  `;

  return getBaseTemplate(content, `Atualização do Pedido #${order.id.slice(0, 8)}`, order.customer_email);
};

export const getOrderConfirmationTemplate = (order: any, items: any[]) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td width="70">
        <img src="${item.product_image || 'https://via.placeholder.com/60'}" class="product-img" alt="${item.product_name}">
      </td>
      <td>
        <span class="product-name">${item.product_name}</span>
        <span class="product-meta">Qtd: ${item.quantity}</span>
      </td>
      <td style="text-align: right; font-weight: 600; white-space: nowrap;">
        R$ ${Number(item.price).toFixed(2).replace('.', ',')}
      </td>
    </tr>
  `).join('');

  const discountHtml = order.discount_value > 0 
    ? `
    <div class="total-row" style="color: #059669;">
      <span>Desconto</span>
      <span>- R$ ${Number(order.discount_value).toFixed(2).replace('.', ',')}</span>
    </div>`
    : '';

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
      <h1>Pedido Confirmado!</h1>
      <p style="color: #6b7280;">Pedido #${order.id.slice(0, 8)}</p>
    </div>

    <p>Olá, <strong>${order.customer_name.split(' ')[0]}</strong>!</p>
    <p>Obrigado pela sua compra! 🎈 Recebemos seu pedido e ele já está sendo preparado com muito carinho.</p>
    
    <div class="info-box">
      <span class="info-title">📍 Endereço de Entrega</span>
      ${order.address.street}, ${order.address.number} ${order.address.complement ? `- ${order.address.complement}` : ''}<br>
      ${order.address.city}/${order.address.state}<br>
      CEP: ${order.address.cep}
    </div>

    <h2>📦 Resumo do Pedido</h2>
    <table class="product-table">
      <thead>
        <tr>
          <th colspan="2">Produto</th>
          <th style="text-align: right;">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="total-section">
      ${discountHtml}
      <div class="total-final">
        Total: R$ ${Number(order.total).toFixed(2).replace('.', ',')}
      </div>
    </div>

    <p style="text-align: center; margin-top: 30px;">
      <a href="https://balaocastelo.com.br/thank-you?orderId=${order.id}&total=${order.total}&name=${encodeURIComponent(order.customer_name)}" class="button">Ver Detalhes e Pagamento</a>
    </p>
  `;

  return getBaseTemplate(content, `Pedido Confirmado #${order.id.slice(0, 8)}`, order.customer_email);
};

export const getOrderCustomerWhatsAppTemplate = (
  order: any,
  items: any[],
  relatedProducts: Array<{
    id: string;
    slug?: string | null;
    name: string;
    price: string;
    image?: string | null;
    category?: string | null;
  }>,
  opts: { whatsappNumber: string },
) => {
  const orderShort = String(order.id || "").slice(0, 8);
  const firstName = String(order.customer_name || "").split(" ")[0] || "cliente";

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td width="70">
        <img src="${item.product_image || "https://via.placeholder.com/60"}" class="product-img" alt="${item.product_name}">
      </td>
      <td>
        <span class="product-name">${item.product_name}</span>
        <span class="product-meta">Qtd: ${item.quantity}</span>
      </td>
      <td style="text-align: right; font-weight: 600; white-space: nowrap;">
        R$ ${Number(item.price).toFixed(2).replace(".", ",")}
      </td>
    </tr>
  `,
    )
    .join("");

  const relatedHtml = (relatedProducts || [])
    .slice(0, 3)
    .map((p) => {
      const href = `https://www.balao.info/product/${p.slug || p.id}`;
      return `
      <tr>
        <td width="70">
          <img src="${p.image || "https://via.placeholder.com/60"}" class="product-img" alt="${p.name}">
        </td>
        <td>
          <span class="product-name">${p.name}</span>
          <span class="product-meta">${p.price}</span>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <a href="${href}" class="button" style="margin-top: 0; padding: 10px 14px; font-size: 14px;">Ver no site</a>
        </td>
      </tr>
    `;
    })
    .join("");

  const discountHtml =
    typeof order.discount_value === "number" && order.discount_value > 0
      ? `
    <div class="total-row" style="color: #059669;">
      <span>Desconto</span>
      <span>- R$ ${Number(order.discount_value).toFixed(2).replace(".", ",")}</span>
    </div>`
      : "";

  const shippingCost =
    typeof order?.address?.shipping?.cost === "number" ? Number(order.address.shipping.cost) : null;
  const shippingHtml =
    order?.address?.shipping?.name || shippingCost !== null
      ? `
    <div class="info-box" style="border-color: #6d28d9; background-color: #f5f3ff;">
      <span class="info-title" style="color: #6d28d9;">🚚 Entrega</span>
      ${order.address?.shipping?.name ? `${order.address.shipping.name}` : ""}${order.address?.shipping?.days ? ` • ${order.address.shipping.days}` : ""}${shippingCost !== null ? ` • R$ ${shippingCost.toFixed(2).replace(".", ",")}` : ""}
    </div>
  `
      : "";

  const messageLines = [
    `Olá! Fiz um pedido no Balão da Informática 🎈`,
    `Pedido: #${orderShort}`,
    `Nome: ${order.customer_name || ""}`,
    `Email: ${order.customer_email || ""}`,
    order.customer_whatsapp ? `WhatsApp: ${order.customer_whatsapp}` : "",
    `Total: R$ ${Number(order.total).toFixed(2).replace(".", ",")}`,
    `Quero informações sobre separação e rastreio, por favor.`,
  ].filter((v) => typeof v === "string" && v.trim().length > 0);
  const waText = encodeURIComponent(messageLines.join("\n"));
  const waHref = `https://wa.me/55${opts.whatsappNumber}?text=${waText}`;

  const content = `
    <div style="text-align: center; margin-bottom: 22px;">
      <img src="https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif" alt="Parabéns" style="max-width: 220px; border-radius: 12px;">
      <h1>Parabéns, ${firstName}! 🎉</h1>
      <p style="color: #6b7280;">Seu pedido foi recebido com sucesso.</p>
      <p style="color: #111827; font-weight: 800; font-size: 18px;">Pedido #${orderShort}</p>
    </div>

    <div class="info-box">
      <span class="info-title">👤 Seus Dados</span>
      <strong>${order.customer_name || ""}</strong><br>
      ${order.customer_email || ""}<br>
      ${order.customer_whatsapp ? `${order.customer_whatsapp}<br>` : ""}
    </div>

    <div class="info-box">
      <span class="info-title">📍 Endereço de Entrega</span>
      ${order.address?.street || ""}${order.address?.number ? `, ${order.address.number}` : ""} ${order.address?.complement ? `- ${order.address.complement}` : ""}<br>
      ${order.address?.city || ""}/${order.address?.state || ""}<br>
      ${order.address?.cep ? `CEP: ${order.address.cep}` : ""}
    </div>

    ${shippingHtml}

    <h2>📦 Resumo do Pedido</h2>
    <table class="product-table">
      <thead>
        <tr>
          <th colspan="2">Produto</th>
          <th style="text-align: right;">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="total-section">
      ${discountHtml}
      <div class="total-final">
        Total: R$ ${Number(order.total).toFixed(2).replace(".", ",")}
      </div>
    </div>

    <div style="text-align: center; margin-top: 26px;">
      <a href="${waHref}" class="button">Chamar no WhatsApp sobre seu pedido</a>
      <p style="font-size: 13px; color: #6b7280; margin-top: 10px;">
        Use o botão para solicitar informações de separação e rastreio.
      </p>
    </div>

    ${
      relatedHtml
        ? `
    <h2>🛒 Veja outros produtos</h2>
    <table class="product-table">
      <tbody>
        ${relatedHtml}
      </tbody>
    </table>
    `
        : ""
    }
  `;

  return getBaseTemplate(content, `Pedido Confirmado #${orderShort}`, order.customer_email);
};

export const getWelcomeTemplate = (name: string, email: string) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 48px; margin-bottom: 10px;">🎈</div>
      <h1>Bem-vindo(a)!</h1>
    </div>

    <p>Olá, <strong>${name.split(' ')[0]}</strong>!</p>
    <p>Estamos muito felizes em ter você na família <strong>Balão da Informática Castelo</strong>! 🚀</p>
    
    <p>Agora você tem acesso às melhores ofertas de hardware e informática de Campinas e região.</p>

    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #E60012;">O que você pode fazer agora?</h3>
      <ul style="margin-bottom: 0; padding-left: 20px;">
        <li>🛒 Fazer pedidos com checkout agilizado</li>
        <li>📦 Acompanhar o status das suas entregas</li>
        <li>⚡ Receber promoções exclusivas em primeira mão</li>
      </ul>
    </div>

    <p>Se precisar de qualquer ajuda, nossa equipe está pronta para te atender no WhatsApp ou aqui na loja física.</p>

    <p style="text-align: center;">
      <a href="https://balaocastelo.com.br" class="button">Começar a Comprar</a>
    </p>
  `;
  return getBaseTemplate(content, "Bem-vindo à Balão Castelo! 🎈", email);
};

export const getAdminNotificationTemplate = (title: string, data: any) => {
  const dataHtml = Object.entries(data)
    .map(([key, value]) => `
      <div style="margin-bottom: 12px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">
        <strong style="color: #6b7280; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">${key}</strong>
        <span style="font-family: monospace; color: #111827; background: #f9fafb; padding: 2px 6px; border-radius: 4px;">
          ${typeof value === 'object' ? JSON.stringify(value) : value}
        </span>
      </div>
    `).join('');

  const content = `
    <div style="border-bottom: 2px solid #E60012; padding-bottom: 15px; margin-bottom: 20px;">
      <h2 style="color: #E60012; margin: 0;">🛡️ ${title}</h2>
    </div>
    
    <p>Uma nova atividade requer sua atenção no sistema.</p>
    
    <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      ${dataHtml}
    </div>
    
    <p style="font-size: 12px; color: #9ca3af; margin-top: 20px; text-align: right;">
      Data: ${new Date().toLocaleString('pt-BR')}
    </p>
  `;

  return getBaseTemplate(content, "Notificação Admin");
};

export const getNewOrderAdminTemplate = (data: {
  orderId: string;
  origin?: string;
  createdAt?: string;
  customer: {
    name: string;
    email: string;
    whatsapp?: string;
    cpfCnpj?: string;
  };
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    cep?: string;
    city?: string;
    state?: string;
  };
  shipping?: {
    name?: string | null;
    days?: string | null;
    cost?: number | null;
  };
  paymentMethod?: string;
  couponCode?: string | null;
  discountValue?: number | null;
  total: number;
  items: Array<{
    productId?: string;
    productName: string;
    productImage?: string;
    quantity: number;
    price: number;
  }>;
}) => {
  const formatMoney = (value: number) => `R$ ${Number(value).toFixed(2).replace(".", ",")}`;

  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td width="70">
        <img src="${item.productImage || "https://via.placeholder.com/60"}" class="product-img" alt="${item.productName}">
      </td>
      <td>
        <span class="product-name">${item.productName}</span>
        <span class="product-meta">Qtd: ${item.quantity}${item.productId ? ` • ID: ${item.productId}` : ""}</span>
      </td>
      <td style="text-align: right; font-weight: 600; white-space: nowrap;">
        ${formatMoney(item.price)}
      </td>
    </tr>
  `,
    )
    .join("");

  const shippingCost = typeof data.shipping?.cost === "number" ? data.shipping.cost : null;
  const discountValue = typeof data.discountValue === "number" ? data.discountValue : 0;
  const totalRowExtras =
    discountValue > 0 || (shippingCost !== null && shippingCost > 0)
      ? `
      ${discountValue > 0 ? `
      <div class="total-row" style="color: #059669;">
        <span>Desconto</span>
        <span>- ${formatMoney(discountValue)}</span>
      </div>` : ""}
      ${shippingCost !== null && shippingCost > 0 ? `
      <div class="total-row">
        <span>Frete</span>
        <span>${formatMoney(shippingCost)}</span>
      </div>` : ""}
    `
      : "";

  const address = data.address
    ? `
    <div class="info-box">
      <span class="info-title">📍 Endereço</span>
      ${data.address.street || ""}${data.address.number ? `, ${data.address.number}` : ""}${data.address.complement ? ` - ${data.address.complement}` : ""}<br>
      ${(data.address.city || "")}${data.address.state ? `/${data.address.state}` : ""}<br>
      ${data.address.cep ? `CEP: ${data.address.cep}` : ""}
    </div>
  `
    : "";

  const shipping = data.shipping?.name
    ? `
    <div class="info-box" style="border-color: #6d28d9; background-color: #f5f3ff;">
      <span class="info-title" style="color: #6d28d9;">🚚 Entrega</span>
      ${data.shipping.name}${data.shipping.days ? ` • ${data.shipping.days}` : ""}${shippingCost !== null ? ` • ${formatMoney(shippingCost)}` : ""}
    </div>
  `
    : "";

  const content = `
    <div style="text-align: center; margin-bottom: 22px;">
      <h1>Novo Pedido Emitido</h1>
      <p style="color: #6b7280;">Pedido #${data.orderId.slice(0, 8)}${data.origin ? ` • ${data.origin}` : ""}</p>
    </div>

    <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 18px; border-radius: 10px;">
      <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
        <div>
          <strong style="color:#111827;">Cliente</strong><br>
          ${data.customer.name}<br>
          ${data.customer.email}<br>
          ${data.customer.whatsapp ? `${data.customer.whatsapp}<br>` : ""}
          ${data.customer.cpfCnpj ? `CPF/CNPJ: ${data.customer.cpfCnpj}<br>` : ""}
        </div>
        <div>
          <strong style="color:#111827;">Data</strong><br>
          ${data.createdAt || new Date().toLocaleString("pt-BR")}
        </div>
        ${data.paymentMethod ? `
        <div>
          <strong style="color:#111827;">Pagamento</strong><br>
          ${data.paymentMethod}
        </div>` : ""}
        ${data.couponCode ? `
        <div>
          <strong style="color:#111827;">Cupom</strong><br>
          ${data.couponCode}
        </div>` : ""}
      </div>
    </div>

    ${address}
    ${shipping}

    <h2>🛒 Itens do Pedido</h2>
    <table class="product-table">
      <thead>
        <tr>
          <th colspan="2">Produto</th>
          <th style="text-align: right;">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="total-section">
      ${totalRowExtras}
      <div class="total-final">
        Total: ${formatMoney(data.total)}
      </div>
    </div>
  `;

  return getBaseTemplate(content, `Novo Pedido #${data.orderId.slice(0, 8)}`);
};
