
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";
import { getNewOrderAdminTemplate, getOrderCustomerWhatsAppTemplate } from "@/lib/mail-templates";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { email, template } = await req.json();
        
        // Verifica o que está configurado
        const configStatus = {
            resend: !!process.env.RESEND_API_KEY,
            smtp: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
            adminEmail: process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'balaocastelo@gmail.com'
        };

        const allowlist = new Set<string>([
            "balaocastelo@gmail.com",
            "tiagaskan@gmail.com",
            configStatus.adminEmail
        ]);
        const targets: string[] = [];
        if (allowlist.has(configStatus.adminEmail)) targets.push(configStatus.adminEmail);
        if (typeof email === "string" && allowlist.has(email)) targets.push(email);
        const uniqueTargets = [...new Set(targets)].filter(Boolean);

        console.log(`[Test Email] Iniciando teste para: ${uniqueTargets.join(', ')}`);
        console.log(`[Test Email] Configuração:`, configStatus);

        const mode = typeof template === "string" ? template : "diagnostic";
        const orderId = crypto.randomUUID();
        const orderShort = orderId.slice(0, 8);

        const buildPayload = () => {
            if (mode === "order_customer") {
                const mockOrder = {
                    id: orderId,
                    customer_name: "Balão Teste",
                    customer_email: uniqueTargets[0] || configStatus.adminEmail,
                    customer_whatsapp: "19999999999",
                    address: {
                        street: "Rua Exemplo",
                        number: "123",
                        complement: "Sala 2",
                        city: "Campinas",
                        state: "SP",
                        cep: "13000-000",
                        shipping: { name: "Motoboy", days: "Hoje", cost: 15.9 }
                    },
                    total: 1999.9,
                    discount_value: 50,
                };

                const mockItems = [
                    {
                        product_id: "prod-teste-1",
                        product_name: "RTX 4060 8GB (Teste)",
                        product_image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=300&q=80",
                        quantity: 1,
                        price: 1899.9,
                    },
                ];

                const relatedProducts = [
                    {
                        id: "rel-1",
                        slug: "fonte-650w-80-plus",
                        name: "Fonte 650W 80 Plus (Teste)",
                        price: "R$ 349,90",
                        image: "https://images.unsplash.com/photo-1555617764-404b3b1c7c7b?auto=format&fit=crop&w=300&q=80",
                        category: "Hardware",
                    },
                    {
                        id: "rel-2",
                        slug: "ssd-nvme-1tb",
                        name: "SSD NVMe 1TB (Teste)",
                        price: "R$ 399,90",
                        image: "https://images.unsplash.com/photo-1626797186227-02e3fe0d0d3b?auto=format&fit=crop&w=300&q=80",
                        category: "Hardware",
                    },
                    {
                        id: "rel-3",
                        slug: "memoria-ram-32gb",
                        name: "Memória RAM 32GB (Teste)",
                        price: "R$ 429,90",
                        image: "https://images.unsplash.com/photo-1563212034-a9f1b6b0d7cc?auto=format&fit=crop&w=300&q=80",
                        category: "Hardware",
                    },
                ];

                return {
                    subject: `Confirmação de Pedido #${orderShort}`,
                    html: getOrderCustomerWhatsAppTemplate(mockOrder, mockItems, relatedProducts, { whatsappNumber: "19987510267" }),
                    eventType: "test_order_customer",
                };
            }

            if (mode === "order_admin") {
                return {
                    subject: `[Pedido] Novo pedido #${orderShort} (teste)`,
                    html: getNewOrderAdminTemplate({
                        orderId,
                        origin: "site",
                        customer: {
                            name: "Balão Teste",
                            email: uniqueTargets[0] || configStatus.adminEmail,
                            whatsapp: "19999999999",
                        },
                        address: {
                            street: "Rua Exemplo",
                            number: "123",
                            city: "Campinas",
                            state: "SP",
                            cep: "13000-000",
                        },
                        shipping: { name: "Motoboy", days: "Hoje", cost: 15.9 },
                        couponCode: "TESTE",
                        discountValue: 50,
                        total: 1999.9,
                        items: [
                            { productId: "prod-teste-1", productName: "RTX 4060 8GB (Teste)", productImage: "https://via.placeholder.com/60", quantity: 1, price: 1899.9 },
                        ],
                    }),
                    eventType: "test_order_admin",
                };
            }

            return {
                subject: "Teste de Integração de E-mail - Balão Castelo",
                html: `
                    <h1>Teste de E-mail</h1>
                    <p>Se você recebeu este e-mail, o sistema de envio está funcionando corretamente.</p>
                    <hr>
                    <h3>Diagnóstico de Configuração:</h3>
                    <ul>
                        <li><strong>Resend API Key:</strong> ${configStatus.resend ? '✅ Configurado' : '❌ Ausente'}</li>
                        <li><strong>SMTP (Gmail):</strong> ${configStatus.smtp ? '✅ Configurado' : '❌ Ausente'}</li>
                    </ul>
                    <p><em>Este e-mail foi enviado via: ${process.env.RESEND_API_KEY ? 'Resend' : (configStatus.smtp ? 'SMTP' : 'Simulação')}</em></p>
                `,
                eventType: "test_email",
            };
        };

        const payload = buildPayload();
        const results = await Promise.all(uniqueTargets.map(to => 
            sendEmail({
                to,
                subject: payload.subject,
                html: payload.html,
                eventType: payload.eventType
            })
        ));

        return NextResponse.json({ 
            success: true, 
            results,
            config: configStatus,
            mode,
            targets: uniqueTargets,
            message: "Teste finalizado. Verifique os logs e sua caixa de entrada."
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
