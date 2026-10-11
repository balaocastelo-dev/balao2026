// E-mail de produtos mandado pelo vendedor, direto do CRM.
//
// Complementa o WhatsApp, não substitui: serve para a empresa que precisa de
// um orçamento formal para aprovar, para o cliente que pede "me manda por
// e-mail" e para deixar um registro com foto, preço e link que não se perde
// na conversa.
//
// Regras que valem aqui, as mesmas da oferta pelo WhatsApp:
//   - nome, foto, preço e link vêm do SITE (não do que o navegador mandou);
//   - o vendedor pode dar um preço especial à vista, mas nunca abaixo do
//     custo quando o custo é conhecido;
//   - nada de dado interno (custo, fornecedor, margem) no e-mail.
//
// Este arquivo é puro (sem rede): monta o e-mail, assina e lê o link
// rastreado. As rotas em app/api/crm/email/ fazem o resto.

import { createHash, createHmac, timingSafeEqual } from "crypto";
import { SITE_CONFIG } from "@/lib/config";
import { getProductHref, parsePriceToNumber, type Product } from "@/lib/utils";
import { SITE } from "@/lib/crm/email-validacao";

export { SITE, emailsNoTexto, validarEmail, validarLinkDoSite } from "@/lib/crm/email-validacao";
export const LIMITE_DE_ITENS = 12;

export type PedidoDeItem = { id: string; preco?: number | null; quantidade?: number | null };

export type ItemDoEmail = {
  id: string;
  nome: string;
  imagem: string | null;
  /** O que vai no e-mail como preço à vista (o do site ou o especial do vendedor). */
  precoVista: number;
  /** O à vista do site, para saber se o vendedor deu preço especial. */
  precoSite: number;
  precoCartao: number | null;
  parcelamento: string | null;
  quantidade: number;
  /** Caminho no site (ex.: /product/rtx-5060-ti). */
  caminho: string;
};

export type LinkExtra = { titulo: string; url: string };

export class ErroDoEmail extends Error {}

// ------------------------------------------------------------------
// Preço
// ------------------------------------------------------------------

export function montarItem(produto: Product, pedido: PedidoDeItem): ItemDoEmail {
  const precoSite = parsePriceToNumber(produto.price);
  if (!(precoSite > 0)) throw new ErroDoEmail(`"${produto.name}" está sem preço no site.`);

  const especial = pedido.preco != null && Number(pedido.preco) > 0 ? Math.round(Number(pedido.preco) * 100) / 100 : null;
  const precoVista = especial ?? precoSite;
  const custo = typeof produto.cost === "number" && produto.cost > 0 ? produto.cost : 0;
  if (custo > 0 && precoVista < custo) {
    throw new ErroDoEmail(`O preço de "${produto.name}" ficou abaixo do custo. Revise o valor.`);
  }

  const quantidade = Math.min(999, Math.max(1, Math.floor(Number(pedido.quantidade) || 1)));
  const cartao = parsePriceToNumber(produto.price_card);
  const imagem = String(produto.image || produto.image_urls?.[0] || "").trim();

  return {
    id: String(produto.id),
    nome: String(produto.name || "Produto").trim(),
    imagem: imagem ? (imagem.startsWith("/") ? `${SITE}${imagem}` : imagem) : null,
    precoVista,
    precoSite,
    precoCartao: cartao > 0 ? cartao : null,
    parcelamento: typeof produto.installment === "string" && produto.installment.trim() ? produto.installment.trim() : null,
    quantidade,
    caminho: getProductHref(produto),
  };
}

export function reais(valor: number): string {
  return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ------------------------------------------------------------------
// Link rastreado
// ------------------------------------------------------------------
// O botão do e-mail passa por /api/crm/email/clique, que registra o clique
// (o vendedor é avisado no painel: é a hora de chamar no WhatsApp) e só então
// leva ao destino. O destino vai ASSINADO no próprio link: sem a chave
// ninguém usa a rota para mandar alguém para fora do site.

export type DadosDoClique = {
  /** Id do envio. */
  e: string;
  /** Conversa do cliente no CRM (pode faltar). */
  c?: string | null;
  /** Produto clicado, quando for um produto. */
  p?: string | null;
  /** Destino: caminho do site ("/product/x?…") ou "wa" (WhatsApp da loja). */
  u: string;
};

function chaveDoClique(): Buffer | null {
  const base = process.env.WHATSAPP_TICKET_SECRET || process.env.PAINEL_PASSWORD || "";
  if (!base) return null;
  return createHash("sha256").update(`balao-email-clique:${base}`).digest();
}

export function assinarClique(dados: DadosDoClique, chave: Buffer | null = chaveDoClique()): string | null {
  if (!chave) return null;
  const corpo = Buffer.from(JSON.stringify(dados)).toString("base64url");
  const assinatura = createHmac("sha256", chave).update(corpo).digest("base64url").slice(0, 22);
  return `${corpo}.${assinatura}`;
}

export function lerClique(token: unknown, chave: Buffer | null = chaveDoClique()): DadosDoClique | null {
  if (!chave || typeof token !== "string" || token.length > 1500) return null;
  const [corpo, assinatura, sobra] = token.split(".");
  if (!corpo || !assinatura || sobra !== undefined) return null;
  const esperada = Buffer.from(createHmac("sha256", chave).update(corpo).digest("base64url").slice(0, 22));
  const recebida = Buffer.from(assinatura);
  if (esperada.length !== recebida.length || !timingSafeEqual(esperada, recebida)) return null;
  try {
    const d = JSON.parse(Buffer.from(corpo, "base64url").toString("utf8")) as DadosDoClique;
    if (!d?.e || typeof d.u !== "string") return null;
    if (d.u !== "wa" && !d.u.startsWith("/")) return null;
    return d;
  } catch {
    return null;
  }
}

/** Para onde o clique leva, com a marcação de campanha do Google Analytics. */
export function destinoDoClique(d: DadosDoClique): string {
  if (d.u === "wa") {
    const texto = `Olá! Recebi o orçamento da Balão por e-mail (ref. ${d.e.slice(0, 6).toUpperCase()}) e quero continuar.`;
    return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(texto)}`;
  }
  const u = new URL(`${SITE}${d.u}`);
  u.searchParams.set("utm_source", "crm");
  u.searchParams.set("utm_medium", "email");
  u.searchParams.set("utm_campaign", "orcamento");
  return u.toString();
}

function linkRastreado(dados: DadosDoClique): string {
  const token = assinarClique(dados);
  // Sem a chave (ambiente de teste sem senha do painel) o link vai direto.
  return token ? `${SITE}/api/crm/email/clique?t=${encodeURIComponent(token)}` : destinoDoClique(dados);
}

// ------------------------------------------------------------------
// O e-mail
// ------------------------------------------------------------------

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export type DadosDoEmail = {
  envioId: string;
  chatId?: string | null;
  nomeCliente?: string | null;
  vendedor?: string | null;
  assunto?: string | null;
  mensagem?: string | null;
  itens: ItemDoEmail[];
  links?: LinkExtra[];
  /** Data em que os preços foram conferidos (padrão: agora). */
  em?: Date;
};

export function assuntoPadrao(itens: ItemDoEmail[]): string {
  if (itens.length === 1) return `${itens[0].nome} — orçamento da Balão da Informática`;
  if (itens.length > 1) return `Orçamento com ${itens.length} produtos — Balão da Informática`;
  return "Informações da Balão da Informática";
}

export function montarEmailDeProdutos(d: DadosDoEmail): { assunto: string; html: string; texto: string } {
  const em = d.em ?? new Date();
  const dia = em.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const primeiroNome = String(d.nomeCliente || "").trim().split(/\s+/)[0] || "";
  const saudacao = primeiroNome && !/^\(?\d/.test(primeiroNome) ? `Olá, ${primeiroNome}!` : "Olá!";
  const assunto = String(d.assunto || "").trim().slice(0, 140) || assuntoPadrao(d.itens);
  const mensagem =
    String(d.mensagem || "").trim().slice(0, 4000) ||
    (d.itens.length
      ? "Separei as opções que conversamos. Os preços abaixo foram conferidos no site hoje."
      : "Seguem as informações que conversamos.");
  const vendedor = String(d.vendedor || "").trim().slice(0, 60);
  const total = d.itens.reduce((s, i) => s + i.precoVista * i.quantidade, 0);
  const linkWa = linkRastreado({ e: d.envioId, c: d.chatId ?? null, u: "wa" });

  // ---- HTML (tabelas e estilo em linha: é o que todo leitor de e-mail entende) ----
  const linhasDeProduto = d.itens
    .map((i) => {
      const link = linkRastreado({ e: d.envioId, c: d.chatId ?? null, p: i.id, u: i.caminho });
      const especial = i.precoVista < i.precoSite;
      const qtd = i.quantidade > 1 ? `<span style="color:#6b7280;font-size:13px;font-weight:600">${i.quantidade} × </span>` : "";
      const cartao = i.precoCartao
        ? `<div style="font-size:13px;color:#4b5563;margin-top:2px">ou ${esc(reais(i.precoCartao))} no cartão${
            i.parcelamento ? ` · ${esc(i.parcelamento)}` : ""
          }</div>`
        : "";
      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #eef0f3;vertical-align:top;width:112px">
            ${
              i.imagem
                ? `<a href="${esc(link)}"><img src="${esc(i.imagem)}" width="96" height="96" alt="" style="display:block;width:96px;height:96px;object-fit:contain;border:1px solid #eef0f3;border-radius:8px;background:#fff"></a>`
                : ""
            }
          </td>
          <td style="padding:16px 0 16px 12px;border-bottom:1px solid #eef0f3;vertical-align:top">
            <a href="${esc(link)}" style="color:#111827;font-size:15px;font-weight:700;text-decoration:none;line-height:1.35">${esc(i.nome)}</a>
            <div style="margin-top:6px">${qtd}<span style="color:#E60012;font-size:20px;font-weight:800">${esc(reais(i.precoVista))}</span>
              <span style="color:#6b7280;font-size:13px"> à vista no PIX${especial ? " · preço especial" : ""}</span></div>
            ${cartao}
            <a href="${esc(link)}" style="display:inline-block;margin-top:10px;font-size:13px;font-weight:700;color:#E60012;text-decoration:none">Ver no site →</a>
          </td>
        </tr>`;
    })
    .join("");

  const blocoTotal =
    d.itens.length > 1 || d.itens.some((i) => i.quantidade > 1)
      ? `<tr><td colspan="2" style="padding:14px 0 0;text-align:right;font-size:15px;color:#111827">
           Total à vista no PIX: <strong style="color:#E60012;font-size:18px">${esc(reais(total))}</strong></td></tr>`
      : "";

  const links = (d.links || [])
    .map((l) => {
      const href = linkRastreado({ e: d.envioId, c: d.chatId ?? null, u: l.url });
      return `<li style="margin:4px 0"><a href="${esc(href)}" style="color:#E60012;font-weight:600">${esc(l.titulo || "Ver no site")}</a></li>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(assunto)}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Helvetica,Arial,sans-serif;color:#111827">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">
  <tr><td style="padding:22px 28px;border-bottom:3px solid #E60012">
    <div style="font-size:22px;font-weight:800;color:#E60012;letter-spacing:-0.3px">Balão da Informática</div>
    <div style="font-size:12px;color:#6b7280;margin-top:2px">Loja física no Cambuí, Campinas · assistência técnica no mesmo lugar</div>
  </td></tr>
  <tr><td style="padding:24px 28px 8px">
    <p style="margin:0 0 12px;font-size:16px;font-weight:700">${esc(saudacao)}</p>
    <p style="margin:0;font-size:15px;line-height:1.55;color:#374151">${esc(mensagem).replace(/\n/g, "<br>")}</p>
  </td></tr>
  ${
    d.itens.length
      ? `<tr><td style="padding:4px 28px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${linhasDeProduto}${blocoTotal}</table></td></tr>`
      : ""
  }
  ${links ? `<tr><td style="padding:8px 28px"><ul style="margin:0;padding-left:18px;font-size:14px">${links}</ul></td></tr>` : ""}
  <tr><td style="padding:20px 28px 8px" align="left">
    <a href="${esc(linkWa)}" style="display:inline-block;background:#0f9d58;color:#ffffff;font-weight:700;font-size:15px;padding:12px 22px;border-radius:8px;text-decoration:none">Falar no WhatsApp</a>
    <div style="font-size:13px;color:#6b7280;margin-top:8px">ou é só responder este e-mail.</div>
  </td></tr>
  <tr><td style="padding:18px 28px 22px;font-size:14px;line-height:1.5;color:#374151">
    ${vendedor ? `<strong>${esc(vendedor)}</strong><br>` : ""}Balão da Informática<br>
    <span style="color:#6b7280">${esc(SITE_CONFIG.address)} · WhatsApp ${esc(SITE_CONFIG.whatsapp.display)} · <a href="${SITE}" style="color:#6b7280">balao.info</a></span>
  </td></tr>
  <tr><td style="padding:14px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;line-height:1.5">
    Preços conferidos em ${esc(dia)}, sujeitos à disponibilidade de estoque.
    Não quer mais receber e-mails da loja? Responda com SAIR.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  // ---- Texto puro ----
  const linhasTexto = d.itens.map((i) => {
    const qtd = i.quantidade > 1 ? `${i.quantidade} × ` : "";
    const cartao = i.precoCartao ? ` | ${reais(i.precoCartao)} no cartão${i.parcelamento ? ` (${i.parcelamento})` : ""}` : "";
    return `- ${i.nome}\n  ${qtd}${reais(i.precoVista)} à vista no PIX${cartao}\n  ${destinoDoClique({ e: d.envioId, u: i.caminho })}`;
  });
  const texto = [
    saudacao,
    "",
    mensagem,
    "",
    ...linhasTexto,
    d.itens.length > 1 || d.itens.some((i) => i.quantidade > 1) ? `\nTotal à vista no PIX: ${reais(total)}` : null,
    ...(d.links || []).map((l) => `${l.titulo || "Link"}: ${destinoDoClique({ e: d.envioId, u: l.url })}`),
    "",
    `WhatsApp: ${destinoDoClique({ e: d.envioId, u: "wa" })}`,
    "",
    vendedor ? `${vendedor}\nBalão da Informática` : "Balão da Informática",
    `${SITE_CONFIG.address} · WhatsApp ${SITE_CONFIG.whatsapp.display} · balao.info`,
    "",
    `Preços conferidos em ${dia}, sujeitos à disponibilidade de estoque. Para não receber mais e-mails da loja, responda com SAIR.`,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  return { assunto, html, texto };
}
