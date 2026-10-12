// Mensagem que abre no WhatsApp da loja depois do formulário: o vendedor já
// recebe o pedido escrito e não precisa perguntar tudo de novo.

import { SITE_CONFIG } from "@/lib/config";
import { rotuloDoOrcamento, rotuloDoUso, type Interesse } from "./tipos";

export interface PedidoNoWhatsApp {
  nome?: string;
  interesse: Interesse;
  uso?: string;
  orcamento?: string;
  preferencias?: string;
  aparelhoNome?: string;
}

export function mensagemDoPedido(p: PedidoNoWhatsApp): string {
  const nome = p.nome?.trim().split(" ")[0];
  const oi = nome ? `Olá! Sou ${nome}.` : "Olá!";
  const linhas: string[] = [];
  if (p.interesse === "reservar" && p.aparelhoNome) linhas.push(`${oi} Quero reservar o seminovo *${p.aparelhoNome}* que vi no site.`);
  else if (p.interesse === "vender") linhas.push(`${oi} Tenho um notebook/PC usado e quero vender em consignação na Balão.`);
  else if (p.interesse === "lista") linhas.push(`${oi} Quero entrar na lista de espera de notebooks seminovos.`);
  else linhas.push(`${oi} Quero ver os notebooks seminovos que vocês têm hoje.`);
  if (p.uso) linhas.push(`• Uso: ${rotuloDoUso(p.uso)}`);
  if (p.orcamento) linhas.push(`• Orçamento: ${rotuloDoOrcamento(p.orcamento)}`);
  if (p.preferencias) linhas.push(`• ${p.preferencias}`);
  linhas.push("(Vim pela página de seminovos do site)");
  return linhas.join("\n");
}

export function linkDoWhatsApp(mensagem: string) {
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(mensagem)}`;
}
