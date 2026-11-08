import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getProductByIdentifier } from "@/lib/db";
import { espelhoPorIdentificador, lerCatalogoDoEspelho } from "@/lib/catalogo-espelho";
import { sendEmail } from "@/lib/mail";
import { getVendedorLogado } from "@/lib/vendedor-auth";
import { ticketDaSessao, urlDoServidorWhatsApp } from "@/lib/whatsapp-ticket";
import {
  ErroDoEmail,
  LIMITE_DE_ITENS,
  montarEmailDeProdutos,
  montarItem,
  validarEmail,
  validarLinkDoSite,
  type ItemDoEmail,
  type LinkExtra,
  type PedidoDeItem,
} from "@/lib/crm/email-produtos";
import type { Product } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// E-mail de produtos mandado pelo vendedor, direto do CRM (lib/crm/email-produtos.ts explica).
//
// Sai pelo Gmail da loja (lib/mail.ts; Brevo como alternativa). A resposta do
// cliente vai para a caixa da loja (balaocastelo@gmail.com), e a loja recebe
// uma cópia oculta — o envio fica registrado lá também. `previa: true` monta
// o e-mail sem mandar, para o vendedor ver antes.
const RESPONDER_PARA = process.env.EMAIL_RESPOSTA || "balaocastelo@gmail.com";
const COPIA_DA_LOJA = process.env.EMAIL_COPIA_LOJA ?? "balaocastelo@gmail.com";

async function produtoDoSite(id: string): Promise<Product | null> {
  const doBanco = await getProductByIdentifier(id).catch(() => null);
  if (doBanco) return doBanco;
  // Banco fora (já aconteceu): a cópia do catálogo na VPS tem os mesmos dados públicos.
  try {
    return espelhoPorIdentificador(await lerCatalogoDoEspelho(), id);
  } catch {
    return null;
  }
}

const erro = (mensagem: string, status = 400) => NextResponse.json({ ok: false, erro: mensagem }, { status });

export async function POST(request: Request) {
  const sessao = await ticketDaSessao();
  if (!sessao) return erro("Entre no painel primeiro.", 401);

  const corpo = await request.json().catch(() => null);
  if (!corpo || typeof corpo !== "object") return erro("Pedido inválido.");
  const previa = corpo.previa === true;

  const para = validarEmail(corpo.para);
  if (!previa && !para) return erro("Confira o e-mail do cliente.");

  const pedidos: PedidoDeItem[] = (Array.isArray(corpo.itens) ? corpo.itens : [])
    .slice(0, LIMITE_DE_ITENS)
    .map((i: Record<string, unknown>) => ({
      id: String(i?.id ?? "").trim(),
      preco: i?.preco == null || i.preco === "" ? null : Number(i.preco),
      quantidade: Number(i?.quantidade) || 1,
    }))
    .filter((i: PedidoDeItem) => i.id);

  const links: LinkExtra[] = (Array.isArray(corpo.links) ? corpo.links : [])
    .slice(0, 5)
    .map((l: Record<string, unknown>) => ({ titulo: String(l?.titulo ?? "").trim().slice(0, 80), url: validarLinkDoSite(l?.url) || "" }))
    .filter((l: LinkExtra) => l.url);

  const mensagem = String(corpo.mensagem ?? "").slice(0, 4000);
  if (!pedidos.length && !links.length && !mensagem.trim()) return erro("Escolha um produto, um link do site ou escreva a mensagem.");

  const itens: ItemDoEmail[] = [];
  for (const pedido of pedidos) {
    const produto = await produtoDoSite(pedido.id);
    if (!produto) return erro(`Não achei o produto ${pedido.id} no site.`, 404);
    try {
      itens.push(montarItem(produto, pedido));
    } catch (e) {
      if (e instanceof ErroDoEmail) return erro(e.message);
      throw e;
    }
  }

  // Quem assina: o vendedor logado; no painel do dono, o nome que o painel mandou.
  let vendedor = String(corpo.vendedorNome ?? "").trim().slice(0, 60);
  if (sessao.papel === "vendedor") {
    const v = await getVendedorLogado().catch(() => null);
    vendedor = v?.nome || vendedor;
  }

  const chatId = String(corpo.chatId ?? "").trim().slice(0, 120) || null;
  const envioId = randomBytes(9).toString("base64url");
  const email = montarEmailDeProdutos({
    envioId,
    chatId,
    nomeCliente: String(corpo.nomeCliente ?? "").slice(0, 80),
    vendedor,
    assunto: String(corpo.assunto ?? ""),
    mensagem,
    itens,
    links,
  });

  if (previa) return NextResponse.json({ ok: true, assunto: email.assunto, html: email.html });

  const copia = COPIA_DA_LOJA && COPIA_DA_LOJA !== "0" && COPIA_DA_LOJA !== para ? COPIA_DA_LOJA : undefined;
  const r = await sendEmail({
    to: para!,
    subject: email.assunto,
    html: email.html,
    text: email.texto,
    eventType: "crm_email_produtos",
    fromName: vendedor ? `${vendedor} · Balão da Informática` : "Balão da Informática",
    replyTo: RESPONDER_PARA,
    bcc: copia,
  });
  if (!r.success) return erro(`O e-mail não saiu: ${r.error || "falha desconhecida"}`, 502);

  // Registro no CRM (ficha do cliente, nota e aviso no painel). Melhor esforço:
  // o e-mail já foi; se a VPS não responder, o vendedor ainda é avisado que saiu.
  let registrado = false;
  if (chatId) {
    registrado = await fetch(`${urlDoServidorWhatsApp()}/api/comando/contatos/${encodeURIComponent(chatId)}/email-enviado`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessao.ticket}` },
      body: JSON.stringify({
        para,
        assunto: email.assunto,
        envioId,
        provedor: r.provider || null,
        messageId: r.messageId || null,
        vendedor: vendedor || null,
        itens: itens.map((i) => ({ id: i.id, nome: i.nome, preco: i.precoVista, quantidade: i.quantidade })),
        links: links.map((l) => l.url),
      }),
      signal: AbortSignal.timeout(6000),
    })
      .then((res) => res.ok)
      .catch(() => false);
  }

  return NextResponse.json({ ok: true, envioId, provedor: r.provider || null, registrado });
}
