import { NextResponse } from "next/server";
import { destinoDoClique, lerClique, SITE } from "@/lib/crm/email-produtos";
import { ticketDeServico, urlDoServidorWhatsApp } from "@/lib/whatsapp-ticket";

export const dynamic = "force-dynamic";

// O cliente clicou num link do e-mail de produtos (lib/crm/email-produtos.ts).
//
// Registra o clique no CRM — o vendedor é avisado no painel na hora: é o
// melhor momento para chamar no WhatsApp — e leva ao destino. O destino vem
// assinado dentro do próprio link, então esta rota não serve para mandar
// ninguém para fora do site. Link adulterado ou velho cai na página inicial.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t");
  const dados = lerClique(token);
  if (!dados) return NextResponse.redirect(SITE, 302);

  const ticket = ticketDeServico();
  if (ticket) {
    // Curto de propósito: o cliente não pode ficar esperando a VPS para abrir a página.
    await fetch(`${urlDoServidorWhatsApp()}/api/comando/email-clique`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ticket}` },
      body: JSON.stringify({ envioId: dados.e, chatId: dados.c || null, produtoId: dados.p || null, destino: dados.u }),
      signal: AbortSignal.timeout(1500),
    }).catch(() => {});
  }

  return NextResponse.redirect(destinoDoClique(dados), 302);
}
