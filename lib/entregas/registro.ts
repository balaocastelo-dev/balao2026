// ============================================================
// Entregas por motoboy — o caderno das corridas.
//
// Guardado na mesma gaveta da Arena (lib/arena/gaveta.ts: Vercel Blob, fora do
// MySQL, que tem cota de conexões por hora). Um documento só, "entregas", com
// as últimas MAXIMO_GUARDADO corridas — a loja chama poucas por dia.
//
// Avisos no WhatsApp (pela linha da loja, servidor da VPS):
//  - aviso interno: para ENTREGA_AVISO_INTERNO (número com DDD ou grupo da
//    loja), a cada mudança de situação. Sem a variável, não avisa;
//  - aviso ao cliente: SÓ no modo real e com ENTREGA99_AVISAR_CLIENTE=1.
//    No simulado nunca sai mensagem para cliente (regra do Thiago: teste só
//    entre os números dele).
// ============================================================

import { randomBytes } from "crypto";
import { atualizar, ler } from "@/lib/arena/gaveta";
import { enviarAviso } from "@/lib/arena/whatsapp";
import { distanciaAteACasa, modoAtual, provedor } from "./provedor-99";
import { encerrada, motivoParaRecusar, podeMudar, proximaSituacao, ROTULO_DA_SITUACAO, somenteDigitos } from "./regras";
import type { Endereco, Entrega, PedidoDeCotacao, ResultadoDaCotacao, SituacaoDaEntrega, VeiculoDaEntrega } from "./tipos";

const CHAVE = "entregas";
const MAXIMO_GUARDADO = 400;

interface Caderno {
  entregas: Entrega[];
}

const vazio = (): Caderno => ({ entregas: [] });
const agora = () => new Date().toISOString();

// ---------------------------------------------------------------- cotação

export async function cotarEntrega(pedido: PedidoDeCotacao): Promise<ResultadoDaCotacao> {
  const veiculo: VeiculoDaEntrega = pedido.veiculo ?? "moto";
  const km = await distanciaAteACasa(pedido.destino);
  const motivo = motivoParaRecusar({ cep: pedido.destino.cep, valorDosProdutos: pedido.valorDosProdutos, veiculo, distanciaKm: km });
  if (motivo) return { disponivel: false, motivo };
  try {
    return { disponivel: true, cotacao: await provedor().cotar({ ...pedido, veiculo }) };
  } catch (e) {
    return { disponivel: false, motivo: (e as Error).message };
  }
}

// ---------------------------------------------------------------- consulta

export async function listarEntregas(): Promise<Entrega[]> {
  const { dados } = await ler<Caderno>(CHAVE);
  return [...(dados?.entregas ?? [])].sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
}

export async function entregaDoPedido(pedidoId: string): Promise<Entrega | null> {
  return (await listarEntregas()).find((e) => e.pedidoId === pedidoId && !encerrada(e.situacao)) ?? null;
}

// ---------------------------------------------------------------- chamar o motoboy

export interface DadosDoPedido {
  pedidoId: string;
  cliente: { nome: string; whatsapp: string };
  destino: Endereco;
  valorDosProdutos: number;
  veiculo?: VeiculoDaEntrega;
}

export async function chamarMotoboy(dados: DadosDoPedido): Promise<Entrega> {
  const veiculo = dados.veiculo ?? "moto";
  const km = await distanciaAteACasa(dados.destino);
  const motivo = motivoParaRecusar({ cep: dados.destino.cep, valorDosProdutos: dados.valorDosProdutos, veiculo, distanciaKm: km });
  if (motivo) throw new Error(motivo);

  const aberta = await entregaDoPedido(dados.pedidoId);
  if (aberta) throw new Error(`Este pedido já tem motoboy chamado (${ROTULO_DA_SITUACAO[aberta.situacao].toLowerCase()}).`);

  const p = provedor();
  const criada = await p.criar({ ...dados, veiculo });
  const momento = agora();
  const entrega: Entrega = {
    id: `ent_${randomBytes(6).toString("hex")}`,
    idNaParceira: criada.idNaParceira,
    modo: p.modo,
    pedidoId: dados.pedidoId,
    cliente: dados.cliente,
    destino: dados.destino,
    valorDosProdutos: dados.valorDosProdutos,
    veiculo,
    preco: criada.preco,
    situacao: "solicitada",
    historico: [{ situacao: "solicitada", em: momento }],
    codigoDeVerificacao: criada.codigoDeVerificacao,
    linkDeAcompanhamento: criada.linkDeAcompanhamento,
    criadaEm: momento,
    atualizadaEm: momento,
  };

  await atualizar<Caderno>(CHAVE, vazio, (c) => {
    c.entregas.push(entrega);
    if (c.entregas.length > MAXIMO_GUARDADO) c.entregas = c.entregas.slice(-MAXIMO_GUARDADO);
    return c;
  });
  await avisar(entrega);
  return entrega;
}

// ---------------------------------------------------------------- mudanças

/**
 * Muda a situação de uma corrida (pelo nosso id ou pelo id da 99). Mudança
 * repetida ou para trás é ignorada (webhook manda o mesmo aviso mais de uma vez).
 */
export async function mudarSituacao(
  id: string,
  situacao: SituacaoDaEntrega,
  extras: { observacao?: string; entregador?: Entrega["entregador"]; linkDeAcompanhamento?: string } = {}
): Promise<{ entrega: Entrega | null; mudou: boolean }> {
  let mudou = false;
  let achada: Entrega | null = null;
  await atualizar<Caderno>(CHAVE, vazio, (c) => {
    mudou = false;
    const e = c.entregas.find((x) => x.id === id || x.idNaParceira === id);
    achada = e ?? null;
    if (!e) return undefined;
    if (extras.entregador) e.entregador = { ...e.entregador, ...extras.entregador };
    if (extras.linkDeAcompanhamento) e.linkDeAcompanhamento = extras.linkDeAcompanhamento;
    if (podeMudar(e.situacao, situacao)) {
      e.situacao = situacao;
      e.historico.push({ situacao, em: agora(), ...(extras.observacao ? { observacao: extras.observacao } : {}) });
      mudou = true;
    }
    e.atualizadaEm = agora();
    achada = e;
    return c;
  });
  if (mudou && achada) await avisar(achada);
  return { entrega: achada, mudou };
}

export async function cancelarEntrega(id: string, observacao = "Cancelada no painel"): Promise<Entrega> {
  const e = (await listarEntregas()).find((x) => x.id === id);
  if (!e) throw new Error("Entrega não encontrada.");
  if (encerrada(e.situacao)) throw new Error("Esta entrega já terminou.");
  if (e.modo === "real") await provedor().cancelar(e.idNaParceira);
  const { entrega } = await mudarSituacao(id, "cancelada", { observacao });
  return entrega!;
}

/** Só no simulado: empurra a corrida de mentira um passo (para testar a tela e os avisos). */
export async function avancarSimulada(id: string): Promise<Entrega> {
  const e = (await listarEntregas()).find((x) => x.id === id);
  if (!e) throw new Error("Entrega não encontrada.");
  if (e.modo !== "simulado") throw new Error("Só corrida simulada avança à mão; a real é a 99 que informa.");
  const prox = proximaSituacao(e.situacao);
  if (!prox) throw new Error("Esta entrega já terminou.");
  const extras = prox === "a_caminho_da_loja" ? { entregador: { nome: "Entregador de teste", placa: "TST-0000" } } : {};
  const { entrega } = await mudarSituacao(id, prox, { observacao: "Avanço simulado", ...extras });
  return entrega!;
}

// ---------------------------------------------------------------- avisos

function textoInterno(e: Entrega) {
  const teste = e.modo === "simulado" ? " [SIMULADO]" : "";
  return [
    `🛵 Motoboy 99${teste}: ${ROTULO_DA_SITUACAO[e.situacao]}`,
    `Pedido #${e.pedidoId.slice(0, 8)} — ${e.cliente.nome}`,
    `${e.destino.rua ?? ""}, ${e.destino.numero ?? ""} — ${e.destino.bairro ?? e.destino.cidade ?? ""}`.trim(),
    `Corrida: R$ ${e.preco.toFixed(2).replace(".", ",")}`,
    e.entregador?.nome ? `Entregador: ${e.entregador.nome}${e.entregador.placa ? ` (${e.entregador.placa})` : ""}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function textoParaOCliente(e: Entrega): string | null {
  const nome = e.cliente.nome.split(" ")[0] || "";
  const assinatura = "\n\nBalão da Informática Castelo\n🌐 balao.info";
  switch (e.situacao) {
    case "a_caminho_da_loja":
      return `Olá, ${nome}! Um entregador da 99 já está vindo buscar o seu pedido na loja.${assinatura}`;
    case "coletada":
      return (
        `Olá, ${nome}! Seu pedido saiu para entrega com a 99.` +
        (e.codigoDeVerificacao ? `\nNa chegada, informe ao entregador o código ${e.codigoDeVerificacao}.` : "") +
        (e.linkDeAcompanhamento ? `\nAcompanhe: ${e.linkDeAcompanhamento}` : "") +
        assinatura
      );
    case "entregue":
      return `Pedido entregue! Obrigado pela compra, ${nome}. Qualquer coisa, é só chamar aqui.${assinatura}`;
    default:
      return null;
  }
}

/** Número no formato do servidor do WhatsApp (55 + DDD + número); grupo passa direto. */
export function destinoDoWhatsApp(v: string): string | null {
  const s = String(v || "").trim();
  if (s.endsWith("@g.us")) return s;
  const d = somenteDigitos(s);
  if (d.length === 10 || d.length === 11) return `55${d}`;
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) return d;
  return null;
}

async function avisar(e: Entrega) {
  const interno = destinoDoWhatsApp(process.env.ENTREGA_AVISO_INTERNO || "");
  if (interno) {
    await enviarAviso(interno, textoInterno(e)).catch((err) => console.error("[entregas] aviso interno falhou:", (err as Error).message));
  }
  const avisarCliente = e.modo === "real" && process.env.ENTREGA99_AVISAR_CLIENTE === "1";
  const texto = textoParaOCliente(e);
  const numero = destinoDoWhatsApp(e.cliente.whatsapp);
  if (avisarCliente && texto && numero) {
    await enviarAviso(numero, texto).catch((err) => console.error("[entregas] aviso ao cliente falhou:", (err as Error).message));
  }
}

export { modoAtual };
