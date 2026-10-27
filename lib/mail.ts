
import nodemailer from 'nodemailer';
import { getAdminNotificationTemplate, getNewOrderAdminTemplate } from "@/lib/mail-templates";
import { SITE_CONFIG } from "@/lib/config";

// Envio de e-mail do site e do CRM.
//
// Até 27/10/2026 o site mandava pela Resend, mas a Resend recusava o domínio
// balao.info ("domain is not verified") e nada saía. Agora a Resend saiu do
// caminho. Provedores, nesta ordem:
//   1. Gmail da loja (SMTP) — basta SMTP_PASS (senha de app do Google) na Vercel.
//      SMTP_USER vazio = balaocastelo@gmail.com. Outro SMTP? SMTP_HOST/SMTP_PORT.
//   2. Brevo (API HTTP) — se BREVO_API_KEY existir. Remetente: BREVO_FROM
//      (precisa estar validado na Brevo); vazio = o e-mail do SMTP_USER/loja.
// Nenhum configurado: o envio falha dizendo exatamente o que falta.

export const CONTA_PADRAO = "balaocastelo@gmail.com";
const LINK_SENHA_DE_APP = "https://myaccount.google.com/apppasswords";

function usuarioSmtp(): string {
    return (process.env.SMTP_USER || "").trim() || CONTA_PADRAO;
}

const createTransporter = () => {
    const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
    if (!pass) return null;
    const port = parseInt(process.env.SMTP_PORT || '465');
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: { user: usuarioSmtp(), pass },
    });
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

/** Separa "Nome <email>" ou "email" em partes. */
function remetente(bruto: string, nomePadrao: string): { name: string; email: string } {
    const m = bruto.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
    if (m) return { name: m[1] || nomePadrao, email: m[2].trim() };
    return { name: nomePadrao, email: bruto.trim() };
}

async function enviarPelaBrevo(p: {
    apiKey: string; fromName: string; to: string; subject: string; html: string; text?: string; bcc: string[]; replyTo: string;
}): Promise<string | undefined> {
    const de = remetente((process.env.BREVO_FROM || "").trim() || usuarioSmtp(), p.fromName);
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": p.apiKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
            sender: de,
            to: [{ email: p.to }],
            subject: p.subject,
            htmlContent: p.html,
            ...(p.text ? { textContent: p.text } : {}),
            ...(p.bcc.length ? { bcc: p.bcc.map((email) => ({ email })) } : {}),
            replyTo: { email: p.replyTo },
        }),
        signal: AbortSignal.timeout(15000),
    });
    const corpo = await res.json().catch(() => ({} as Record<string, unknown>));
    if (!res.ok) throw new Error(String((corpo as any)?.message || `HTTP ${res.status}`));
    return (corpo as any)?.messageId;
}

/**
 * Envia um e-mail (Gmail/SMTP primeiro, depois Brevo). Não simula: se nada sair, diz o motivo.
 */
export async function sendEmail({
    to,
    subject,
    html,
    text,
    eventType = 'general',
    campaignId,
    fromName = "Balão da Informática",
    replyTo,
    bcc,
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; provider?: string; error?: string }> {
    console.log(`[Mail] Iniciando envio (${eventType}): ${subject}`);
    const copia = bcc ? (Array.isArray(bcc) ? bcc : [bcc]).filter(Boolean) : [];
    const responderPara = replyTo || SITE_CONFIG.email;
    let ultimoErro = "";

    // 1. Gmail da loja (SMTP)
    const transporter = createTransporter();
    if (transporter) {
        try {
            const info = await transporter.sendMail({
                from: { name: fromName, address: usuarioSmtp() },
                to,
                subject,
                html,
                ...(text ? { text } : {}),
                ...(copia.length ? { bcc: copia } : {}),
                replyTo: responderPara,
            });
            console.log(`[Mail] Sucesso via SMTP ID: ${info.messageId}`);
            await logEmail(eventType, to, 'success', null, { provider: 'smtp', messageId: info.messageId, campaignId });
            return { success: true, messageId: info.messageId, provider: 'smtp' };
        } catch (error: any) {
            const msg = String(error?.message || error);
            ultimoErro = /Invalid login|Username and Password not accepted|535/i.test(msg)
                ? `Gmail recusou a senha (SMTP_PASS). Gere uma nova senha de app em ${LINK_SENHA_DE_APP} e troque na Vercel.`
                : `SMTP: ${msg}`;
            console.error('[Mail] Erro SMTP:', error);
        }
    }

    // 2. Brevo
    const brevoKey = (process.env.BREVO_API_KEY || "").trim();
    if (brevoKey) {
        try {
            const messageId = await enviarPelaBrevo({ apiKey: brevoKey, fromName, to, subject, html, text, bcc: copia, replyTo: responderPara });
            console.log(`[Mail] Sucesso via Brevo ID: ${messageId}`);
            await logEmail(eventType, to, 'success', null, { provider: 'brevo', messageId, campaignId });
            return { success: true, messageId, provider: 'brevo' };
        } catch (error: any) {
            ultimoErro = `${ultimoErro ? `${ultimoErro} · ` : ""}Brevo: ${error?.message || error}`;
            console.error('[Mail] Erro Brevo:', error);
        }
    }

    const motivo = ultimoErro
        || `E-mail não configurado: falta a senha de app do Gmail (${usuarioSmtp()}). Gere em ${LINK_SENHA_DE_APP} e cadastre como SMTP_PASS na Vercel (projeto balao2026).`;
    console.warn('[Mail] E-mail NÃO enviado.', motivo);
    await logEmail(eventType, to, 'failed', motivo, { subject });
    return { success: false, error: motivo };
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
    const adminEmail = process.env.ADMIN_EMAIL || usuarioSmtp();

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
