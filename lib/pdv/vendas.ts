// ============================================================
// PDV: as vendas do balcão e o caminho delas até o Bling.
//
// Guardadas na gaveta (Vercel Blob privado), fora do MySQL da Hostinger: a
// cota de conexões por hora do banco já derrubou a Arena (12/10), e o caixa
// não pode parar junto com ele.
//
//   pdv/dia-AAAA-MM-DD   as vendas do dia
//   pdv/pendentes        o que ainda não terminou de ir para o Bling
//
// Venda feita aqui vai para o Bling na hora (contato → pedido → nota). Sem
// acesso ao Bling naquele instante (o token venceu e a sentinela do PC ainda
// não renovou), a venda fica "aguardando o Bling" e segue sozinha assim que
// o vigia trouxer o acesso novo. A lista do dia junta as vendas daqui com os
// pedidos lançados direto no Bling.
// ============================================================

import { atualizar, ler } from "@/lib/arena/gaveta";
import { hojeNaLoja } from "@/lib/arena/periodos";
import {
  ErroDoBling,
  SemAcessoAoBling,
  acharPedidoIgual,
  contatoParaVenda,
  criarPedido,
  enviarNota,
  formasDePagamento,
  gerarNota,
  lerNota,
  pedidoDetalhado,
  pedidosDoDia,
  vendedores,
  type FormaDoBling,
} from "./bling";
import { centavos, conferirVenda, novoIdDeVenda, soDigitos, tabelaPelosPagamentos, totaisDa } from "./calculos";
import {
  CLIENTE_VAZIO,
  NOMES_DAS_FORMAS,
  NOTA_NAO_PEDIDA,
  SITUACOES_CANCELADAS,
  SITUACOES_DO_PEDIDO,
  estadoDaNotaNoBling,
  type ClienteDaVenda,
  type Desconto,
  type EstadoDaNota,
  type FormaDePagamento,
  type ItemDaVenda,
  type LinhaDoDia,
  type NotaDaVenda,
  type Pagamento,
  type VendaDoPdv,
} from "./tipos";

const FORMAS: FormaDePagamento[] = ["pix", "dinheiro", "credito", "debito", "boleto", "outro"];
const TRAVA_MS = 90_000;

interface DocDoDia {
  vendas: VendaDoPdv[];
}
interface DocPendentes {
  ids: { id: string; dia: string }[];
}

const chaveDoDia = (dia: string) => `pdv/dia-${dia}`;

export function diaDoId(id: string): string | null {
  const m = /^PDV-(\d{2})(\d{2})(\d{2})-[A-Z0-9]{4}$/.exec(id);
  return m ? `20${m[1]}-${m[2]}-${m[3]}` : null;
}

// ---------------------------------------------------------------- leitura e gravação

const cacheDoDia = new Map<string, { em: number; vendas: VendaDoPdv[] }>();

export async function vendasDoPdv(dia: string, fresco = false): Promise<VendaDoPdv[]> {
  const c = cacheDoDia.get(dia);
  if (!fresco && c && Date.now() - c.em < 10_000) return c.vendas;
  const { dados } = await ler<DocDoDia>(chaveDoDia(dia));
  const vendas = dados?.vendas ?? [];
  cacheDoDia.set(dia, { em: Date.now(), vendas });
  return vendas;
}

export async function lerVenda(id: string): Promise<VendaDoPdv | null> {
  const dia = diaDoId(id);
  if (!dia) return null;
  return (await vendasDoPdv(dia, true)).find((v) => v.id === id) ?? null;
}

/** Muda uma venda com releitura em caso de escrita cruzada. `mudar` devolve undefined para não gravar. */
async function mudarVenda(id: string, mudar: (v: VendaDoPdv) => VendaDoPdv | undefined): Promise<VendaDoPdv | null> {
  const dia = diaDoId(id);
  if (!dia) return null;
  let resultado: VendaDoPdv | null = null;
  const doc = await atualizar<DocDoDia>(chaveDoDia(dia), () => ({ vendas: [] }), (atual) => {
    const i = atual.vendas.findIndex((v) => v.id === id);
    if (i < 0) {
      resultado = null;
      return undefined;
    }
    const nova = mudar(atual.vendas[i]);
    if (!nova) {
      resultado = atual.vendas[i];
      return undefined;
    }
    atual.vendas[i] = nova;
    resultado = nova;
    return atual;
  });
  cacheDoDia.set(dia, { em: Date.now(), vendas: doc.vendas });
  return resultado;
}

async function marcarPendente(id: string, dia: string, pendente: boolean) {
  await atualizar<DocPendentes>("pdv/pendentes", () => ({ ids: [] }), (atual) => {
    const tem = atual.ids.some((x) => x.id === id);
    if (pendente === tem) return undefined;
    atual.ids = pendente ? [...atual.ids, { id, dia }].slice(-300) : atual.ids.filter((x) => x.id !== id);
    return atual;
  });
}

// ---------------------------------------------------------------- nova venda

export interface EntradaDeVenda {
  itens: ItemDaVenda[];
  cliente: ClienteDaVenda;
  vendedor: { id: string; nome: string } | null;
  desconto: Desconto | null;
  pagamentos: Pagamento[];
  observacao: string;
  pedirNota: boolean;
}

const texto = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const numero = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Tudo o que vem do navegador passa por aqui antes de virar venda. */
export function lerEntrada(bruto: unknown): EntradaDeVenda {
  const o = (bruto ?? {}) as Record<string, unknown>;
  const itens = (Array.isArray(o.itens) ? o.itens : []).slice(0, 80).map((x) => {
    const i = (x ?? {}) as Record<string, unknown>;
    return {
      produtoId: texto(i.produtoId, 80) || `avulso-${Date.now()}`,
      nome: texto(i.nome, 200) || "Item",
      foto: i.foto ? texto(i.foto, 600) : null,
      quantidade: Math.max(0, Math.trunc(numero(i.quantidade))),
      valor: centavos(numero(i.valor)),
      valorDoSite: i.valorDoSite != null && numero(i.valorDoSite) > 0 ? centavos(numero(i.valorDoSite)) : null,
    } satisfies ItemDaVenda;
  });
  const c = (o.cliente ?? {}) as Record<string, unknown>;
  const cliente: ClienteDaVenda = {
    nome: texto(c.nome, 120),
    documento: soDigitos(String(c.documento ?? "")).slice(0, 14),
    email: texto(c.email, 120),
    telefone: soDigitos(String(c.telefone ?? "")).slice(0, 13),
    cep: soDigitos(String(c.cep ?? "")).slice(0, 8),
    endereco: texto(c.endereco, 120),
    numero: texto(c.numero, 20),
    complemento: texto(c.complemento, 60),
    bairro: texto(c.bairro, 60),
    cidade: texto(c.cidade, 60),
    uf: texto(c.uf, 2).toUpperCase(),
    blingId: c.blingId ? soDigitos(String(c.blingId)) || null : null,
  };
  const v = (o.vendedor ?? null) as Record<string, unknown> | null;
  const d = (o.desconto ?? null) as Record<string, unknown> | null;
  const pagamentos = (Array.isArray(o.pagamentos) ? o.pagamentos : []).slice(0, 6).map((x) => {
    const p = (x ?? {}) as Record<string, unknown>;
    const forma = FORMAS.includes(p.forma as FormaDePagamento) ? (p.forma as FormaDePagamento) : "outro";
    return {
      forma,
      valor: centavos(numero(p.valor)),
      recebido: forma === "dinheiro" && p.recebido != null ? centavos(numero(p.recebido)) : null,
      parcelas: forma === "credito" ? Math.min(24, Math.max(1, Math.trunc(numero(p.parcelas) || 1))) : null,
    } satisfies Pagamento;
  });
  return {
    itens,
    cliente,
    vendedor: v && v.id ? { id: soDigitos(String(v.id)), nome: texto(v.nome, 80) } : null,
    desconto: d && numero(d.valor) > 0 ? { tipo: d.tipo === "percentual" ? "percentual" : "valor", valor: numero(d.valor) } : null,
    pagamentos: pagamentos.filter((p) => p.valor > 0),
    observacao: texto(o.observacao, 500),
    pedirNota: Boolean(o.pedirNota),
  };
}

export async function registrarVenda(entrada: EntradaDeVenda, operador: string, agora = new Date()): Promise<VendaDoPdv> {
  const problemas = conferirVenda(entrada);
  if (problemas.length) throw new VendaInvalida(problemas.map((p) => p.mensagem));
  const t = totaisDa(entrada);
  const dia = hojeNaLoja(agora);
  const venda: VendaDoPdv = {
    id: novoIdDeVenda(dia),
    criadaEm: agora.toISOString(),
    dia,
    operador,
    vendedor: entrada.vendedor,
    cliente: { ...CLIENTE_VAZIO, ...entrada.cliente },
    tabela: tabelaPelosPagamentos(entrada.pagamentos),
    itens: entrada.itens,
    desconto: entrada.desconto,
    pagamentos: entrada.pagamentos,
    subtotal: t.subtotal,
    valorDoDesconto: t.desconto,
    total: t.total,
    troco: t.troco,
    observacao: entrada.observacao,
    pedirNota: entrada.pedirNota,
    bling: { estado: "pendente", pedidoId: null, numero: null, contatoId: null, tentativas: 0, ultimaTentativa: null, mensagem: null },
    nota: entrada.pedirNota ? { ...NOTA_NAO_PEDIDA, estado: "pendente" } : { ...NOTA_NAO_PEDIDA },
  };
  const doc = await atualizar<DocDoDia>(chaveDoDia(dia), () => ({ vendas: [] }), (atual) => {
    if (atual.vendas.some((v) => v.id === venda.id)) venda.id = novoIdDeVenda(dia); // colisão: 1 em 900 mil
    atual.vendas.push(venda);
    return atual;
  });
  cacheDoDia.set(dia, { em: Date.now(), vendas: doc.vendas });
  await marcarPendente(venda.id, dia, true);
  return venda;
}

export class VendaInvalida extends Error {
  constructor(public problemas: string[]) {
    super(problemas.join(" "));
    this.name = "VendaInvalida";
  }
}

// ---------------------------------------------------------------- ida ao Bling

function observacoesDaVenda(v: VendaDoPdv): { publica: string; interna: string } {
  const formas = v.pagamentos
    .map((p) => `${NOMES_DAS_FORMAS[p.forma]}${p.parcelas && p.parcelas > 1 ? ` ${p.parcelas}x` : ""}: R$ ${p.valor.toFixed(2).replace(".", ",")}`)
    .join(" | ");
  return {
    publica: [v.observacao, `Venda no balcão — Balão da Informática Castelo · balao.info`].filter(Boolean).join("\n"),
    interna: `PDV balao.info ${v.id} · operador: ${v.operador}${v.troco > 0 ? ` · troco R$ ${v.troco.toFixed(2).replace(".", ",")}` : ""}\n${formas}`,
  };
}

const notaTerminada = (e: EstadoDaNota) => e === "nao-pedida" || e === "autorizada" || e === "rejeitada" || e === "cancelada" || e === "erro";

function notaDoBling(n: Awaited<ReturnType<typeof lerNota>>, anterior: NotaDaVenda): NotaDaVenda {
  return {
    ...anterior,
    estado: estadoDaNotaNoBling(n.situacao),
    blingId: n.id,
    numero: n.numero,
    serie: n.serie,
    chave: n.chave,
    linkDanfe: n.linkDanfe,
    linkPdf: n.linkPdf,
    mensagem: n.situacao === 4 ? "A Sefaz rejeitou a nota. Abra a nota no Bling para ver o motivo e corrigir." : null,
    atualizadaEm: new Date().toISOString(),
  };
}

const esperarUmPouco = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Leva a venda até onde der: contato → pedido → nota gerada → enviada → autorizada.
 * Cada passo é gravado na hora, então uma volta interrompida continua de onde parou.
 */
export async function sincronizarVenda(id: string, opcoes: { esperarNota?: boolean } = {}): Promise<VendaDoPdv | null> {
  // Trava: duas abas (ou a volta automática e o botão) não mandam a mesma venda ao mesmo tempo.
  const trava = { pegou: false };
  let venda = await mudarVenda(id, (v) => {
    if (v.cancelada) return undefined;
    const ocupada = v.bling.estado === "enviando" && v.bling.ultimaTentativa && Date.now() - new Date(v.bling.ultimaTentativa).getTime() < TRAVA_MS;
    if (ocupada) return undefined;
    trava.pegou = true;
    return { ...v, bling: { ...v.bling, estado: "enviando", tentativas: v.bling.tentativas + 1, ultimaTentativa: new Date().toISOString() } };
  });
  if (!venda || !trava.pegou) return venda;

  const gravar = async (mudar: (v: VendaDoPdv) => VendaDoPdv) => {
    venda = (await mudarVenda(id, mudar)) ?? venda;
    return venda!;
  };

  try {
    // 1. pedido
    if (!venda.bling.pedidoId) {
      const contatoId = venda.bling.contatoId ?? (await contatoParaVenda(venda.cliente));
      await gravar((v) => ({ ...v, bling: { ...v.bling, contatoId } }));
      // Tentativa anterior pode ter criado o pedido e perdido a resposta.
      const repetido = venda.bling.tentativas > 1 ? await acharPedidoIgual(venda.dia, contatoId, venda.total) : null;
      const obs = observacoesDaVenda(venda);
      const pedido = repetido
        ? { id: repetido, numero: null as string | null }
        : await criarPedido({
            data: venda.dia,
            contatoId,
            vendedorId: venda.vendedor?.id ?? null,
            itens: venda.itens.map((i) => ({
              codigo: i.produtoId.startsWith("avulso") ? "" : `SITE-${i.produtoId}`,
              descricao: i.nome,
              quantidade: i.quantidade,
              valor: i.valor,
            })),
            descontoEmReais: venda.valorDoDesconto,
            parcelas: venda.pagamentos.map((p) => ({
              forma: p.forma,
              valor: p.valor,
              observacao: p.parcelas && p.parcelas > 1 ? `${p.parcelas}x no cartão` : undefined,
            })),
            observacoes: obs.publica,
            observacoesInternas: obs.interna,
          });
      if (repetido && !pedido.numero) {
        pedido.numero = (await pedidoDetalhado(repetido).catch(() => null))?.numero ?? null;
      }
      await gravar((v) => ({ ...v, bling: { ...v.bling, pedidoId: pedido.id, numero: pedido.numero, mensagem: null } }));
    }

    // 2. nota
    if (venda.pedirNota && !notaTerminada(venda.nota.estado)) {
      if (!venda.nota.blingId) {
        try {
          const notaId = await gerarNota(venda.bling.pedidoId!);
          await gravar((v) => ({ ...v, nota: { ...v.nota, estado: "gerada", blingId: notaId, mensagem: null, atualizadaEm: new Date().toISOString() } }));
        } catch (e) {
          // O pedido já tem nota (gerada no Bling ou numa volta anterior): usa ela.
          const det = await pedidoDetalhado(venda.bling.pedidoId!).catch(() => null);
          if (!det?.notaId) throw e;
          await gravar((v) => ({ ...v, nota: { ...v.nota, estado: "gerada", blingId: det.notaId, atualizadaEm: new Date().toISOString() } }));
        }
      }
      if (venda.nota.estado === "gerada" || venda.nota.estado === "pendente") {
        const n = await lerNota(venda.nota.blingId!);
        if (estadoDaNotaNoBling(n.situacao) === "gerada") {
          await enviarNota(venda.nota.blingId!, Boolean(venda.cliente.email));
          await gravar((v) => ({ ...v, nota: { ...v.nota, estado: "enviada", atualizadaEm: new Date().toISOString() } }));
        } else {
          await gravar((v) => ({ ...v, nota: notaDoBling(n, v.nota) }));
        }
      }
      // A Sefaz costuma responder em poucos segundos: espera um pouco para o balcão já imprimir.
      for (let i = 0; i < (opcoes.esperarNota ? 4 : 1) && venda.nota.estado === "enviada"; i++) {
        if (i > 0 || opcoes.esperarNota) await esperarUmPouco(2500);
        const n = await lerNota(venda.nota.blingId!);
        await gravar((v) => ({ ...v, nota: notaDoBling(n, v.nota) }));
      }
    }

    await gravar((v) => ({ ...v, bling: { ...v.bling, estado: "no-bling", mensagem: null } }));
  } catch (e) {
    const semAcesso = e instanceof SemAcessoAoBling;
    const msg = e instanceof Error ? e.message : String(e);
    const naNota = Boolean(venda.bling.pedidoId);
    await gravar((v) => ({
      ...v,
      bling: { ...v.bling, estado: naNota ? "no-bling" : semAcesso ? "pendente" : "erro", mensagem: naNota ? null : msg },
      nota:
        naNota && v.pedirNota
          ? { ...v.nota, estado: semAcesso ? v.nota.estado : "erro", mensagem: msg, atualizadaEm: new Date().toISOString() }
          : v.nota,
    }));
    if (!semAcesso && !(e instanceof ErroDoBling)) console.error("[pdv] falha ao mandar ao Bling:", msg);
  }

  const pronta = venda.bling.estado === "no-bling" && notaTerminada(venda.nota.estado);
  const parada = venda.bling.estado === "erro";
  await marcarPendente(venda.id, venda.dia, !pronta && !parada).catch(() => undefined);
  return venda;
}

/** Volta automática: segue as vendas que esperavam o Bling (sem acesso) ou a Sefaz. */
export async function seguirPendentes(limite = 3): Promise<number> {
  const { dados } = await ler<DocPendentes>("pdv/pendentes");
  let feitas = 0;
  for (const p of (dados?.ids ?? []).slice(0, limite)) {
    const v = await lerVenda(p.id);
    if (!v) {
      await marcarPendente(p.id, p.dia, false);
      continue;
    }
    if (v.bling.estado === "erro") continue;
    const r = await sincronizarVenda(p.id);
    feitas++;
    if (r && r.bling.estado === "pendente") break; // sem acesso: não adianta tentar as outras agora
  }
  return feitas;
}

/** Nota pedida depois da venda (ou nova tentativa depois de erro). */
export async function pedirNotaDepois(id: string, cliente: ClienteDaVenda | null): Promise<VendaDoPdv | null> {
  const atual = await lerVenda(id);
  if (!atual) return null;
  const novoCliente = cliente ? { ...atual.cliente, ...cliente, blingId: atual.cliente.blingId ?? cliente.blingId ?? null } : atual.cliente;
  const problemas = conferirVenda({ ...atual, cliente: novoCliente, pedirNota: true }).filter((p) => p.campo === "cliente");
  if (problemas.length) throw new VendaInvalida(problemas.map((p) => p.mensagem));
  const mudouCliente = soDigitos(novoCliente.documento) !== soDigitos(atual.cliente.documento);
  await mudarVenda(id, (v) => ({
    ...v,
    cliente: novoCliente,
    pedirNota: true,
    // Cliente trocado antes do pedido existir: o contato é refeito.
    bling: mudouCliente && !v.bling.pedidoId ? { ...v.bling, contatoId: null } : { ...v.bling, estado: v.bling.estado === "erro" ? "pendente" : v.bling.estado, mensagem: null },
    nota: v.nota.estado === "nao-pedida" || v.nota.estado === "erro" ? { ...v.nota, estado: v.nota.blingId ? "gerada" : "pendente", mensagem: null } : v.nota,
  }));
  await marcarPendente(id, atual.dia, true);
  return sincronizarVenda(id, { esperarNota: true });
}

export async function tentarDeNovo(id: string): Promise<VendaDoPdv | null> {
  const v = await mudarVenda(id, (x) =>
    x.bling.estado === "erro" ? { ...x, bling: { ...x.bling, estado: "pendente", mensagem: null } } : x.nota.estado === "erro" ? { ...x, nota: { ...x.nota, estado: x.nota.blingId ? "gerada" : "pendente" } } : x
  );
  if (!v) return null;
  await marcarPendente(id, v.dia, true);
  return sincronizarVenda(id, { esperarNota: true });
}

/** Confere no Bling como está a nota (o balcão aperta "atualizar"). */
export async function atualizarNota(id: string): Promise<VendaDoPdv | null> {
  const v = await lerVenda(id);
  if (!v?.nota.blingId) return v;
  const n = await lerNota(v.nota.blingId);
  return mudarVenda(id, (x) => ({ ...x, nota: notaDoBling(n, x.nota) }));
}

// ---------------------------------------------------------------- vendas do dia (PDV + Bling)

let cacheDoBling: { dia: string; em: number; pedidos: Awaited<ReturnType<typeof pedidosDoDia>> } | null = null;

export interface ResumoDoDia {
  dia: string;
  linhas: LinhaDoDia[];
  bling: { lido: boolean; mensagem: string | null; lidoEm: string | null };
  totais: { vendas: number; valor: number; notas: number; aguardando: number };
}

const horaDe = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

function situacaoDaLinhaPdv(v: VendaDoPdv): string {
  if (v.cancelada) return "Cancelada";
  if (v.bling.estado === "pendente") return "Aguardando o Bling";
  if (v.bling.estado === "enviando") return "Enviando ao Bling";
  if (v.bling.estado === "erro") return "Erro no Bling";
  return "No Bling";
}

export async function vendasDoDia(dia = hojeNaLoja()): Promise<ResumoDoDia> {
  const locais = await vendasDoPdv(dia);
  let pedidos: Awaited<ReturnType<typeof pedidosDoDia>> = [];
  let bling: ResumoDoDia["bling"] = { lido: false, mensagem: null, lidoEm: null };
  try {
    if (cacheDoBling && cacheDoBling.dia === dia && Date.now() - cacheDoBling.em < 15_000) {
      pedidos = cacheDoBling.pedidos;
    } else {
      pedidos = await pedidosDoDia(dia);
      cacheDoBling = { dia, em: Date.now(), pedidos };
    }
    bling = { lido: true, mensagem: null, lidoEm: new Date(cacheDoBling!.em).toISOString() };
  } catch (e) {
    bling = { lido: false, mensagem: e instanceof Error ? e.message : String(e), lidoEm: cacheDoBling?.dia === dia ? new Date(cacheDoBling.em).toISOString() : null };
    if (cacheDoBling?.dia === dia) pedidos = cacheDoBling.pedidos;
  }

  const porPedido = new Map(locais.filter((v) => v.bling.pedidoId).map((v) => [v.bling.pedidoId!, v]));
  const linhas: LinhaDoDia[] = [];
  const usados = new Set<string>();

  for (const p of pedidos) {
    const local = porPedido.get(p.id);
    const cancelada = p.situacaoId != null && SITUACOES_CANCELADAS.has(p.situacaoId);
    if (local) usados.add(local.id);
    linhas.push({
      chave: local ? local.id : `bling-${p.id}`,
      origem: local ? "pdv" : "bling",
      pdvId: local?.id ?? null,
      blingId: p.id,
      numero: p.numero || local?.bling.numero || null,
      hora: local ? horaDe(local.criadaEm) : null,
      cliente: p.contatoNome || local?.cliente.nome || "Consumidor final",
      vendedor: local?.vendedor?.nome ?? null,
      total: p.total,
      situacao: p.situacaoId != null ? SITUACOES_DO_PEDIDO[p.situacaoId] ?? `Situação ${p.situacaoId}` : "No Bling",
      situacaoId: p.situacaoId,
      estadoNoBling: "no-bling",
      nota: local?.pedirNota ? { estado: local.nota.estado, numero: local.nota.numero, linkDanfe: local.nota.linkDanfe } : null,
      cancelada,
    });
  }
  for (const v of locais) {
    if (usados.has(v.id)) continue;
    // Já está no Bling mas a lista do Bling (cache de 15 s) ainda não trouxe: aparece como do PDV.
    linhas.push({
      chave: v.id,
      origem: "pdv",
      pdvId: v.id,
      blingId: v.bling.pedidoId,
      numero: v.bling.numero,
      hora: horaDe(v.criadaEm),
      cliente: v.cliente.nome || "Consumidor final",
      vendedor: v.vendedor?.nome ?? null,
      total: v.total,
      situacao: situacaoDaLinhaPdv(v),
      situacaoId: null,
      estadoNoBling: v.bling.estado,
      nota: v.pedirNota ? { estado: v.nota.estado, numero: v.nota.numero, linkDanfe: v.nota.linkDanfe } : null,
      cancelada: Boolean(v.cancelada),
    });
  }
  // Mais nova em cima: o número do Bling cresce; as do PDV sem número vão para o topo.
  linhas.sort((a, b) => Number(b.numero || 1e12) - Number(a.numero || 1e12) || (b.hora || "").localeCompare(a.hora || ""));

  // Faturamento do dia como o resto do sistema conta: fora cancelado e "em digitação" (21).
  const valendo = linhas.filter((l) => !l.cancelada && l.situacaoId !== 21);
  return {
    dia,
    linhas,
    bling,
    totais: {
      vendas: valendo.length,
      valor: centavos(valendo.reduce((s, l) => s + l.total, 0)),
      notas: linhas.filter((l) => l.nota?.estado === "autorizada").length,
      aguardando: linhas.filter((l) => l.estadoNoBling === "pendente" || l.estadoNoBling === "enviando" || l.estadoNoBling === "erro").length,
    },
  };
}

// ---------------------------------------------------------------- comprovante

export interface DadosDoComprovante {
  chave: string;
  origem: "pdv" | "bling";
  pdvId: string | null;
  numeroBling: string | null;
  dataHora: string; // ISO (do Bling só a data)
  soData: boolean;
  vendedor: string | null;
  operador: string | null;
  cliente: ClienteDaVenda;
  itens: { nome: string; quantidade: number; valor: number; valorDoSite: number | null; foto: string | null; codigo: string }[];
  subtotal: number;
  desconto: number;
  total: number;
  pagamentos: { nome: string; valor: number; detalhe: string | null }[];
  troco: number;
  observacao: string;
  situacao: string;
  estadoNoBling: VendaDoPdv["bling"]["estado"];
  mensagemDoBling: string | null;
  pedirNota: boolean;
  nota: NotaDaVenda | null;
  cancelada: boolean;
}

export function comprovanteDaVenda(v: VendaDoPdv): DadosDoComprovante {
  return {
    chave: v.id,
    origem: "pdv",
    pdvId: v.id,
    numeroBling: v.bling.numero,
    dataHora: v.criadaEm,
    soData: false,
    vendedor: v.vendedor?.nome ?? null,
    operador: v.operador,
    cliente: v.cliente,
    itens: v.itens.map((i) => ({
      nome: i.nome,
      quantidade: i.quantidade,
      valor: i.valor,
      valorDoSite: i.valorDoSite,
      foto: i.foto,
      codigo: i.produtoId.startsWith("avulso") ? "" : i.produtoId.slice(0, 12),
    })),
    subtotal: v.subtotal,
    desconto: v.valorDoDesconto,
    total: v.total,
    pagamentos: v.pagamentos.map((p) => ({
      nome: NOMES_DAS_FORMAS[p.forma],
      valor: p.valor,
      detalhe:
        p.forma === "credito" && p.parcelas && p.parcelas > 1
          ? `${p.parcelas}x`
          : p.forma === "dinheiro" && p.recebido
            ? `recebido R$ ${p.recebido.toFixed(2).replace(".", ",")}`
            : null,
    })),
    troco: v.troco,
    observacao: v.observacao,
    situacao: situacaoDaLinhaPdv(v),
    estadoNoBling: v.bling.estado,
    mensagemDoBling: v.bling.mensagem,
    pedirNota: v.pedirNota,
    nota: v.pedirNota ? v.nota : null,
    cancelada: Boolean(v.cancelada),
  };
}

function nomeDaForma(formas: FormaDoBling[], id: number | null): string {
  const f = formas.find((x) => x.id === id);
  return f?.descricao || "Pagamento";
}

/** Pedido lançado direto no Bling, no mesmo formato do comprovante do balcão. */
export async function comprovanteDoBling(pedidoId: string): Promise<DadosDoComprovante> {
  const [p, formas, vend] = await Promise.all([
    pedidoDetalhado(pedidoId),
    formasDePagamento().catch(() => [] as FormaDoBling[]),
    vendedores().catch(() => ({ lista: [] as { id: string; nome: string }[], doBling: false })),
  ]);
  let nota: NotaDaVenda | null = null;
  if (p.notaId) {
    const n = await lerNota(p.notaId).catch(() => null);
    nota = n ? notaDoBling(n, { ...NOTA_NAO_PEDIDA }) : { ...NOTA_NAO_PEDIDA, estado: "gerada", blingId: p.notaId };
  }
  const cliente = { ...CLIENTE_VAZIO, nome: p.contato.nome, documento: p.contato.documento, blingId: p.contato.id };
  return {
    chave: `bling-${p.id}`,
    origem: "bling",
    pdvId: null,
    numeroBling: p.numero,
    dataHora: `${p.data}T12:00:00-03:00`,
    soData: true,
    vendedor: vend.lista.find((x) => x.id === p.vendedorId)?.nome ?? null,
    operador: null,
    cliente,
    itens: p.itens.map((i) => ({ nome: i.descricao, quantidade: i.quantidade, valor: i.valor, valorDoSite: null, foto: null, codigo: i.codigo })),
    subtotal: p.totalProdutos,
    desconto: p.desconto,
    total: p.total,
    pagamentos: p.parcelas.map((x) => ({ nome: nomeDaForma(formas, x.formaId), valor: x.valor, detalhe: null })),
    troco: 0,
    observacao: "",
    situacao: p.situacaoId != null ? SITUACOES_DO_PEDIDO[p.situacaoId] ?? `Situação ${p.situacaoId}` : "",
    estadoNoBling: "no-bling",
    mensagemDoBling: null,
    pedirNota: Boolean(p.notaId),
    nota,
    cancelada: p.situacaoId != null && SITUACOES_CANCELADAS.has(p.situacaoId),
  };
}

/** A venda do PDV por trás de um pedido do Bling, se houver. */
export async function vendaPeloPedido(pedidoId: string, dia: string): Promise<VendaDoPdv | null> {
  return (await vendasDoPdv(dia)).find((v) => v.bling.pedidoId === pedidoId) ?? null;
}
