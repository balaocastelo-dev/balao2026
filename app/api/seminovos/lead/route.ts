// Lead da página /seminovos: guarda no painel (/painel/seminovos), avisa a
// loja por e-mail e devolve o link do WhatsApp com o pedido já escrito.

import { NextResponse } from "next/server";
import { guardarLead, validarLead, type EntradaDeLead } from "@/lib/seminovos/dados";
import { INTERESSES, rotuloDoOrcamento, rotuloDoUso } from "@/lib/seminovos/tipos";
import { linkDoWhatsApp, mensagemDoPedido } from "@/lib/seminovos/whatsapp";
import { sendEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

// Freio simples contra robô: no máximo 6 envios por endereço a cada 10 minutos
// (por instância; não é cadeado, é lombada).
const recentes = new Map<string, number[]>();
function passouDoLimite(ip: string) {
  const agora = Date.now();
  const lista = (recentes.get(ip) ?? []).filter((t) => agora - t < 10 * 60 * 1000);
  lista.push(agora);
  recentes.set(ip, lista);
  if (recentes.size > 2000) recentes.clear();
  return lista.length > 6;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  const corpo = (await req.json().catch(() => ({}))) as EntradaDeLead & { site?: string; ms?: number };

  // Campo escondido preenchido, ou formulário enviado rápido demais: robô. Responde "ok" e não guarda.
  if ((corpo.site && String(corpo.site).trim()) || (typeof corpo.ms === "number" && corpo.ms < 1500)) {
    return NextResponse.json({ ok: true });
  }

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "?";
  if (passouDoLimite(ip)) {
    return NextResponse.json({ ok: false, erro: "Muitos envios seguidos. Chame direto no WhatsApp." }, { status: 429 });
  }

  const v = validarLead(corpo);
  if (!v.ok) return NextResponse.json({ ok: false, erro: v.erro }, { status: 400 });

  const whatsapp = linkDoWhatsApp(mensagemDoPedido(v.lead));

  let guardado = true;
  try {
    await guardarLead(v.lead);
  } catch (e) {
    guardado = false;
    console.error("[seminovos:lead] não guardou:", (e as Error).message);
  }

  const l = v.lead;
  const fone = l.whatsapp.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
  const linhas = [
    ["Pedido", INTERESSES[l.interesse]],
    ["Nome", l.nome],
    ["WhatsApp", `<a href="https://wa.me/55${l.whatsapp}">${fone}</a>`],
    ["E-mail", l.email ?? ""],
    ["Aparelho", l.aparelhoNome ?? ""],
    ["Uso", rotuloDoUso(l.uso)],
    ["Orçamento", rotuloDoOrcamento(l.orcamento)],
    ["Detalhes", l.preferencias ?? ""],
    ["Origem", [l.origem.bloco, l.origem.utm ? Object.values(l.origem.utm).join(" / ") : "", l.origem.referrer].filter(Boolean).join(" · ")],
  ].filter(([, valor]) => valor);
  const html = `
    <h2 style="margin:0 0 12px">Novo lead de seminovo</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      ${linhas.map(([k, val]) => `<tr><td style="color:#666">${k}</td><td><strong>${k === "WhatsApp" ? val : esc(val)}</strong></td></tr>`).join("")}
    </table>
    <p style="margin-top:16px">Todos os leads: <a href="https://www.balao.info/painel/seminovos">www.balao.info/painel/seminovos</a></p>
    ${guardado ? "" : "<p style='color:#c00'>Atenção: não consegui guardar este lead no painel. Ele só está neste e-mail.</p>"}
  `;
  const adm = process.env.ADMIN_EMAIL || "balaocastelo@gmail.com";
  await sendEmail({ to: adm, subject: `Lead seminovo: ${l.nome} — ${INTERESSES[l.interesse]}`, html, eventType: "lead_seminovos" }).catch((e) =>
    console.error("[seminovos:lead] e-mail:", (e as Error).message),
  );

  return NextResponse.json({ ok: true, whatsapp });
}
