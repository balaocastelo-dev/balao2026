import { NextResponse } from "next/server";
import { sendEmail, sendSystemNotification } from "@/lib/mail";

const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const escapar = (texto: string) =>
  texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const corte = (valor: unknown, max: number) => (typeof valor === "string" ? valor.slice(0, max).trim() : "");

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Campo escondido que só robô preenche: finge que deu certo e não avisa ninguém.
    if (corte(body?.honeypot, 200)) {
      return NextResponse.json({ success: true });
    }

    const name = corte(body?.name, 120);
    const email = corte(body?.email, 200);
    const phone = corte(body?.phone, 40);
    const message = corte(body?.message, 3000);
    const subject = corte(body?.subject, 200);
    const source = corte(body?.source, 120);
    const city = corte(body?.city, 120);
    const service = corte(body?.service, 160);
    const urgency = corte(body?.urgency, 60);
    const page = corte(body?.page, 200);

    const temEmail = emailValido(email);
    const temTelefone = phone.replace(/\D/g, "").length >= 10;

    // Lead de triagem (ex.: /especialidades) chega só com nome e WhatsApp:
    // basta um jeito de responder — e-mail OU telefone.
    if (!message || (!temEmail && !temTelefone)) {
      return NextResponse.json({ error: "Informe a mensagem e um e-mail ou WhatsApp para retorno." }, { status: 400 });
    }

    // 1. Avisa a loja
    await sendSystemNotification(subject || "Novo Formulário de Contato", {
      name,
      email: email || null,
      phone: phone || null,
      message,
      subject: subject || null,
      source: source || null,
      city: city || null,
      service: service || null,
      urgency: urgency || null,
      page: page || null,
    });

    // 2. Confirmação para o cliente, quando ele deixou e-mail
    if (temEmail) {
      const userHtml = `
      <h2>Olá, ${escapar(name || "Visitante")}!</h2>
      <p>Recebemos sua mensagem e retornaremos em breve.</p>
      <hr>
      <p><strong>Sua mensagem:</strong></p>
      <blockquote>${escapar(message).replace(/\n/g, "<br>")}</blockquote>
      <br>
      <p>Atenciosamente,<br>Equipe Balão Castelo</p>
    `;

      await sendEmail({
        to: email,
        subject: subject || "Recebemos sua mensagem - Balão Castelo",
        html: userHtml,
        eventType: "contact_form",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
