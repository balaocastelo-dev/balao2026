
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { getAdminNotificationTemplate, getNewOrderAdminTemplate } from "@/lib/mail-templates";
import { SITE_CONFIG } from "@/lib/config";

// Configuração do Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Configuração SMTP (Padrão: Gmail)
const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // True para 465, false para outras
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};

// Cria o transportador apenas se as credenciais existirem
const createTransporter = () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null;
    }
    return nodemailer.createTransport(smtpConfig);
};

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    /** Versão em texto puro (melhora a entrega e é o que leitores de tela leem). */
    text?: string;
    campaignId?: string;
    eventType?: string; // Para logs
    fromName?: string;
    /** Para onde vai a resposta do cliente. Padrão: o e-mail da loja na config. */
    replyTo?: string;
    /** Cópia oculta (ex.: a caixa da loja, para o envio ficar registrado lá). */
    bcc?: string | string[];
}

// Remetente padrão.
//
// Até outubro de 2026 o padrão era o endereço de SITE_CONFIG.email, do domínio
// balaodainformatica.com.br — que NÃO está verificado na Resend (não há o
// registro resend._domainkey nesse domínio). A Resend recusava, o SMTP não tem
// senha cadastrada, e o envio terminava "simulado": pedido novo, contato e
// lead não chegavam a ninguém. O domínio balao.info, sim, está pronto na
// Resend (DKIM em resend._domainkey.balao.info, retorno em send.balao.info).
// RESEND_FROM na Vercel continua mandando, se existir.
export const REMETENTE_PADRAO = "vendas@balao.info";

function remetenteDaResend(fromName: string): string {
    const bruto = (process.env.RESEND_FROM || "").trim();
    if (bruto.includes("<")) return bruto;
    return `${fromName} <${bruto || REMETENTE_PADRAO}>`;
}

/**
 * Envia um e-mail (Tenta Resend primeiro, depois SMTP, depois simula)
 */
export async function sendEmail({
    to,
    subject,
    html,
    text,
    eventType = 'general',
    campaignId,
    fromName = "Balão Castelo",
    replyTo,
    bcc,
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; provider?: string; error?: string }> {
    console.log(`[Mail] Iniciando envio (${eventType}): ${subject}`);
    const copia = bcc ? (Array.isArray(bcc) ? bcc : [bcc]).filter(Boolean) : [];
    let ultimoErro = "";

    // 1. Tentar via RESEND (Prioridade)
    if (resend) {
        try {
            const { data, error } = await resend.emails.send({
                from: remetenteDaResend(fromName),
                to: [to],
                subject: subject,
                html: html,
                ...(text ? { text } : {}),
                ...(copia.length ? { bcc: copia } : {}),
                replyTo: replyTo || SITE_CONFIG.email,
            });

            if (error) {
                console.error('[Mail] Erro Resend:', error);
                throw new Error(error.message);
            }

            console.log(`[Mail] Sucesso via Resend ID: ${data?.id}`);
            await logEmail(eventType, to, 'success', null, { provider: 'resend', messageId: data?.id, campaignId });
            return { success: true, messageId: data?.id, provider: 'resend' };
        } catch (error: any) {
            ultimoErro = `Resend: ${error?.message || error}`;
            console.warn('[Mail] Falha no Resend, tentando fallback para SMTP...', error?.message);
        }
    }

    // 2. Tentar via SMTP (Fallback)
    const transporter = createTransporter();
    if (transporter) {
        try {
            const info = await transporter.sendMail({
                from: `"${fromName}" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
                ...(text ? { text } : {}),
                ...(copia.length ? { bcc: copia } : {}),
                ...(replyTo ? { replyTo } : {}),
            });

            console.log(`[Mail] Sucesso via SMTP ID: ${info.messageId}`);
            await logEmail(eventType, to, 'success', null, { provider: 'smtp', messageId: info.messageId, campaignId });
            return { success: true, messageId: info.messageId, provider: 'smtp' };

        } catch (error: any) {
            ultimoErro = `${ultimoErro ? `${ultimoErro} · ` : ""}SMTP: ${error?.message || error}`;
            console.error('[Mail] Erro SMTP:', error);
        }
    }

    // 3. Nada saiu. Antes isto era "simulado" em silêncio; quem chama precisa
    // saber o motivo para não dizer ao vendedor que o e-mail foi.
    console.warn('[Mail] E-mail NÃO enviado.', ultimoErro || 'Nenhum provedor configurado.');
    await logEmail(eventType, to, 'simulated', ultimoErro || 'Nenhum provedor configurado', { subject });
    return {
        success: false,
        error: ultimoErro || 'Serviço de e-mail não configurado. Adicione RESEND_API_KEY ou SMTP_USER/PASS no .env',
    };
}

/**
 * Envia notificação do sistema para o administrador
 */
export async function sendSystemNotification(event: string, data: any) {
    const subject = `[Admin] Novo Evento: ${event}`;
    
    // Formata os dados em HTML simples
    const dataHtml = Object.entries(data)
        .map(([key, value]) => `<strong>${key}:</strong> <pre>${JSON.stringify(value, null, 2)}</pre>`)
        .join('<br>');

    const html = `
        <h2>Nova notificação do sistema</h2>
        <p><strong>Evento:</strong> ${event}</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <hr>
        <h3>Detalhes:</h3>
        ${dataHtml}
        <br>
        <p>Este é um e-mail automático do sistema Balão Castelo.</p>
    `;

    // Tenta enviar para o e-mail administrativo definido ou usa o SMTP user como fallback
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'balaocastelo@gmail.com';

    return sendEmail({
        to: adminEmail,
        subject,
        html,
        eventType: `system_${event}`
    });
}

const ORDER_NOTIFICATION_RECIPIENTS = ["balaocastelo@gmail.com", "tiagaskan@gmail.com"] as const;

export async function sendNewOrderNotification(data: {
    orderId: string;
    origin?: string;
    customerName: string;
    customerEmail: string;
    customerWhatsapp?: string;
    customerCpfCnpj?: string;
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
}) {
    const subject = `[Pedido] Novo pedido #${data.orderId.slice(0, 8)}${data.origin ? ` (${data.origin})` : ""}`;
    const html = getNewOrderAdminTemplate({
        orderId: data.orderId,
        origin: data.origin || "site",
        customer: {
            name: data.customerName,
            email: data.customerEmail,
            whatsapp: data.customerWhatsapp,
            cpfCnpj: data.customerCpfCnpj,
        },
        address: data.address,
        shipping: data.shipping,
        paymentMethod: data.paymentMethod,
        couponCode: data.couponCode,
        discountValue: data.discountValue,
        total: data.total,
        items: data.items,
    });

    const uniqueTargets = [...new Set(ORDER_NOTIFICATION_RECIPIENTS)];
    const results = await Promise.all(
        uniqueTargets.map((to) =>
            sendEmail({
                to,
                subject,
                html,
                eventType: "new_order_admin",
            }),
        ),
    );

    return { success: true, results, recipients: uniqueTargets };
}

/**
 * Loga o evento de e-mail
 */
async function logEmail(event: string, recipient: string, status: string, errorMessage: string | null, metadata: any) {
    try {
        // Log simplificado para não travar o envio:
        // console.log(`[Mail Log] ${event} -> ${recipient} (${status})`);
    } catch (e) {
        console.error('[Mail Log Error]', e);
    }
}
