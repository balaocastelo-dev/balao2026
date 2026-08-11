import { NextResponse } from "next/server";
import { sendSystemNotification, sendEmail } from "@/lib/mail";
import { getWelcomeTemplate } from "@/lib/mail-templates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, id, name } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // 1. Notificar Admin
    await sendSystemNotification('Novo Usuário Cadastrado', {
      email,
      userId: id,
      name: name || 'Não informado',
      source: 'site_registration'
    });

    // 2. Enviar Boas-vindas para o Usuário
    if (name) {
        const welcomeHtml = getWelcomeTemplate(name, email);
        await sendEmail({
            to: email,
            subject: "Bem-vindo à Balão Castelo!",
            html: welcomeHtml,
            eventType: 'welcome_email'
        });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
