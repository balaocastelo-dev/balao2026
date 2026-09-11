import { NextResponse } from "next/server";
import {
  mandarMaterialPeloWhatsApp,
  normalizarWhatsApp,
  salvarContato,
} from "@/lib/captura";

/**
 * Recebe o WhatsApp de quem quer baixar um material.
 *
 * Guarda o contato e manda o link pelo WhatsApp da loja — assim a pessoa
 * recebe o que pediu no aplicativo que ela usa, e a conversa nasce na caixa do
 * CRM, onde o vendedor já trabalha.
 *
 * O envio é "se der". O download no navegador nunca depende dele: servidor de
 * WhatsApp fora do ar não pode impedir alguém de baixar um livro.
 */
export async function POST(req: Request) {
  try {
    const corpo = await req.json().catch(() => ({}));

    // Campo-armadilha: robô preenche tudo que encontra. Gente não vê este
    // campo, então qualquer coisa aqui é robô — responde ok e não grava nada.
    if (String(corpo?.site || "").trim()) {
      return NextResponse.json({ ok: true });
    }

    const whatsapp = normalizarWhatsApp(String(corpo?.whatsapp || ""));
    if (!whatsapp) {
      return NextResponse.json(
        { error: "Confira o número: precisa ter DDD, como (19) 98751-0267." },
        { status: 400 }
      );
    }

    const material = String(corpo?.material || "").slice(0, 120) || null;
    const titulo = String(corpo?.titulo || material || "o material").slice(0, 160);
    const origem = String(corpo?.origem || "site").slice(0, 80);
    const link = String(corpo?.link || "").slice(0, 300);

    const { ok, novo } = await salvarContato({ whatsapp, origem, material });

    // Só manda mensagem para quem acabou de chegar. Quem já baixou outro
    // material não precisa receber boas-vindas de novo a cada download.
    if (novo) {
      const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.balao.info";
      const endereco = link ? `${base}${link}` : "";
      await mandarMaterialPeloWhatsApp(
        whatsapp,
        `Olá! Aqui é o *Balão da Informática* 👋\n\n` +
          `Seu material está pronto: *${titulo}*` +
          (endereco ? `\n${endereco}` : "") +
          `\n\nQualquer dúvida sobre computador, notebook ou assistência técnica, é só responder aqui.`
      );
    }

    return NextResponse.json({ ok: true, guardado: ok });
  } catch (error: unknown) {
    // Nunca derruba o download por causa do cadastro.
    console.error("[captura] Falha:", error);
    return NextResponse.json({ ok: true, guardado: false });
  }
}
