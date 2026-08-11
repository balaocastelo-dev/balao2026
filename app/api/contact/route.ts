import { NextResponse } from "next/server";
import { sendEmail, sendSystemNotification } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, message, subject, source, city, service } = body;

    if (!email || !message) {
      return NextResponse.json({ error: "Email and message required" }, { status: 400 });
    }

    // 1. Notificar Admin (Formulário enviado)
    await sendSystemNotification('Novo Formulário de Contato', {
      name,
      email,
      phone,
      message,
      subject: subject || null,
      source: source || null,
      city: city || null,
      service: service || null,
    });

    // 2. Confirmação para o usuário
    const userHtml = `
      <h2>Olá, ${name || 'Visitante'}!</h2>
      <p>Recebemos sua mensagem e retornaremos em breve.</p>
      <hr>
      <p><strong>Sua mensagem:</strong></p>
      <blockquote>${message.replace(/\n/g, '<br>')}</blockquote>
      <br>
      <p>Atenciosamente,<br>Equipe Balão Castelo</p>
    `;

    await sendEmail({
        to: email,
        subject: subject || 'Recebemos sua mensagem - Balão Castelo',
        html: userHtml,
        eventType: 'contact_form'
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
