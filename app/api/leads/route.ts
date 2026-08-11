import { NextResponse } from "next/server";
import { sendEmail, sendSystemNotification } from "@/lib/mail";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function normalizePhone(input: string) {
  return input.replace(/[^\d]/g, "");
}

function clampString(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.slice(0, max);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const honeypot = clampString(body?.honeypot, 200);
    if (honeypot.trim()) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const name = clampString(body?.name, 120).trim();
    const email = clampString(body?.email, 200).trim();
    const phone = normalizePhone(clampString(body?.phone, 40));
    const company = clampString(body?.company, 160).trim();
    const uf = clampString(body?.uf, 2).trim().toUpperCase();
    const budget = clampString(body?.budget, 40).trim();
    const systemType = clampString(body?.systemType, 60).trim();
    const message = clampString(body?.message, 2000).trim();
    const page = clampString(body?.page, 200).trim();
    const variant = clampString(body?.variant, 10).trim();
    const utm = typeof body?.utm === "object" && body?.utm ? body.utm : undefined;

    if (name.length < 2) {
      return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }
    if (phone.length < 10) {
      return NextResponse.json({ error: "Telefone/WhatsApp inválido." }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json({ error: "Mensagem muito curta." }, { status: 400 });
    }

    await sendSystemNotification("Novo Lead - Sistemas", {
      name,
      email,
      phone,
      company: company || null,
      uf: uf || null,
      budget: budget || null,
      systemType: systemType || null,
      message,
      page: page || null,
      variant: variant || null,
      utm: utm || null,
    });

    const userHtml = `
      <h2>Olá, ${name}!</h2>
      <p>Recebemos sua solicitação para criação de site/sistema personalizado.</p>
      <p>Em breve entraremos em contato para alinhar escopo, prazo e proposta.</p>
      <hr>
      <p><strong>Resumo enviado:</strong></p>
      <ul>
        <li><strong>Telefone:</strong> ${phone}</li>
        <li><strong>Empresa:</strong> ${company || "-"}</li>
        <li><strong>UF:</strong> ${uf || "-"}</li>
        <li><strong>Tipo:</strong> ${systemType || "-"}</li>
        <li><strong>Orçamento:</strong> ${budget || "-"}</li>
      </ul>
      <p><strong>Mensagem:</strong></p>
      <blockquote>${message.replace(/\n/g, "<br>")}</blockquote>
      <br>
      <p>Atenciosamente,<br>Equipe Balão da Informática</p>
    `;

    await sendEmail({
      to: email,
      subject: "Recebemos seu pedido de orçamento - Sistemas",
      html: userHtml,
      eventType: "lead_sistemas",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

