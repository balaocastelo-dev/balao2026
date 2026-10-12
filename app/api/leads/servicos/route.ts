// ============================================================
// Lead da página /servicos-e-ofertas.
//
// O formulário pede só nome, WhatsApp e o que a pessoa precisa. Ao enviar,
// o navegador abre o WhatsApp da loja com a mensagem pronta (é lá que o CRM
// e a JUL.IA atendem) e, em paralelo, chama esta rota, que avisa a loja por
// e-mail. Assim o contato não se perde se a pessoa fechar o WhatsApp sem
// mandar a mensagem: a loja tem o nome e o número para chamar de volta.
// ============================================================

import { NextResponse } from "next/server";
import { sendSystemNotification } from "@/lib/mail";

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Campo escondido: robô preenche, gente não vê.
    if (texto(body?.site, 200)) return NextResponse.json({ success: true });

    const nome = texto(body?.nome, 120);
    const whatsapp = texto(body?.whatsapp, 40).replace(/\D/g, "");
    const necessidade = texto(body?.necessidade, 80);
    const detalhe = texto(body?.detalhe, 1000);
    const bairro = texto(body?.bairro, 80);
    const origem = texto(body?.origem, 200);

    if (nome.length < 2) return NextResponse.json({ error: "Informe o seu nome." }, { status: 400 });
    if (whatsapp.length < 10 || whatsapp.length > 13) {
      return NextResponse.json({ error: "Informe um WhatsApp com DDD." }, { status: 400 });
    }

    await sendSystemNotification("Novo lead - Serviços e Ofertas", {
      nome,
      whatsapp,
      chamar: `https://wa.me/${whatsapp.length <= 11 ? `55${whatsapp}` : whatsapp}`,
      necessidade: necessidade || null,
      detalhe: detalhe || null,
      bairro_ou_cidade: bairro || null,
      pagina: origem || "/servicos-e-ofertas",
      recebido_em: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
