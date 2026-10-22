// ============================================================
// PDV: as vendas do balcão e o caminho delas até o /sistema (MEU BLING).
//
// Até 21/10/2026 iam para o Bling; desde 22/10 vão para o /sistema (pedido do
// Thiago). Guardadas primeiro na gaveta (Vercel Blob privado), fora do MySQL
// da Hostinger: a cota de conexões por hora do banco já derrubou a Arena
// (12/10), e o caixa não pode parar junto com ele.
//
//   pdv/dia-AAAA-MM-DD   as vendas do dia
//   pdv/pendentes        o que ainda não terminou de ir para o /sistema
//
// Venda feita aqui vai para o /sistema na hora (cliente → venda "Fechada" →
// nota, se pedida). Com o /sistema fora naquele instante, a venda fica
// "aguardando o sistema" e segue sozinha depois. O /sistema não duplica: a
// venda leva o id do PDV e repetir a chamada devolve a mesma venda. A lista do
// dia junta as vendas daqui com as lançadas direto no /sistema.
// ============================================================

import { atualizar, ler } from "@/lib/arena/gaveta";
import { hojeNaLoja } from "@/lib/arena/periodos";
import {
  ErroDoSistema,
  SemAcessoAoSistema,
  consultarNota,
  emitirNota,
  enviarVenda,
  linkDoDanfe,
  vendaDoSistema,
  vendasDoDiaNoSistema,
  type LinhaDoSistema,
  type NotaResumo,
} from "./sistema";
import { centavos, conferirVenda, novoIdDeVenda, soDigitos, tabelaPelosPagamentos, totaisDa } from "./calculos";
import {
  CLIENTE_VAZIO,
  NOMES_DAS_FORMAS,
  NOTA_NAO_PEDIDA,
  estadoDaNotaNoSistema,
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

// ---------------------------------------------------------------- vendas antigas (do tempo do Bling)

type VendaGuardada = VendaDoPdv & {
  bling?: { estado?: string; pedidoId?: string | null; numero?: string | null; tentativas?: number; ultimaTentativa?: string | null; mensagem?: string | null };
};

/**
 * Venda gravada antes de 22/10 tem `bling` em vez de `sistema`. A que chegou ao
 * Bling fica como está (não vai de novo para o /sistema); a que nunca chegou
 * segue agora para o /sistema.
 */
export function normalizarVenda(v: VendaGuardada): VendaDoPdv {
  if (v.sistema) return v;
  const b = v.bling ?? {};
  const noBling = Boolean(b.pedidoId);
  const notaAntiga = (v.nota ?? {}) as Partial<NotaDaVenda> & { blingId?: string | null; linkPdf?: string | null };
  const { bling: _antigo, ...resto } = v;
  void _antigo;
  return {
    ...resto,
    cliente: { ...CLIENTE_VAZIO, ...v.cliente, sistemaId: null },
    sistema: {
      estado: noBling ? "no-sistema" : "pendente",
      vendaId: null,
      numero: null,
      tentativas: 0,
      ultimaTentativa: null,
      mensagem: null,
    },
    legadoBling: noBling ? { pedidoId: b.pedidoId ?? null, numero: b.numero ?? null } : null,
    nota: {
      ...NOTA_NAO_PEDIDA,
      ...notaAntiga,
      notaId: null,
      linkDanfe: notaAntiga.linkPdf || notaAntiga.linkDanfe || null,
      // nota que não chegou ao fim pelo Bling: sem ele, não há mais como seguir daqui
      estado: noBling && notaAntiga.estado && !["autorizada", "cancelada", "rejeitada", "nao-pedida"].includes(notaAntiga.estado) ? "erro" : notaAntiga.estado ?? "nao-pedida",
      mensagem: noBling && notaAntiga.estado && !["autorizada", "cancelada", "rejeitada", "nao-pedida"].includes(notaAntiga.estado) ? "Venda do tempo do Bling: confira a nota no Bling." : notaAntiga.mensagem ?? null,
    } as NotaDaVenda,
  };
}

// ---------------------------------------------------------------- leitura e gravação

const cacheDoDia = new Map<string, { em: number; vendas: VendaDoPdv[] }>();

export async function vendasDoPdv(dia: string, fresco = false): Promise<VendaDoPdv[]> {
  const c = cacheDoDia.get(dia);
  if (!fresco && c && Date.now() - c.em < 10_000) return c.vendas;
  const { dados } = await ler<DocDoDia>(chaveDoDia(dia));
  const vendas = (dados?.vendas ?? []).map((v) => normalizarVenda(v as VendaGuardada));
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
    const nova = mudar(normalizarVenda(atual.vendas[i] as VendaGuardada));
    if (!nova) {
      resultado = normalizarVenda(atual.vendas[i] as VendaGuardada);
      return undefined;
    }
    atual.vendas[i] = nova;
    resultado = nova;
    return atual;
  });
  cacheDoDia.set(
    dia,
    { em: Date.now(), vendas: doc.vendas.map((v) => normalizarVenda(v as VendaGuardada)) }
  );
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
  const sistemaId = Math.trunc(numero(c.sistemaId));
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
    sistemaId: sistemaId > 0 ? sistemaId : null,
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
    sistema: { estado: "pendente", vendaId: null, numero: null, tentativas: 0, ultimaTentativa: null, mensagem: null },
    nota: entrada.pedirNota ? { ...NOTA_NAO_PEDIDA, estado: "pendente" } : { ...NOTA_NAO_PEDIDA },
  };
  const doc = await atualizar<DocDoDia>(chaveDoDia(dia), () => ({ vendas: [] }), (atual) => {
    if (atual.vendas.some((v) => v.id === venda.id)) venda.id = novoIdDeVenda(dia); // colisão: 1 em 900 mil
    atual.vendas.push(venda);
    return atual;
  });
  cacheDoDia.set(dia, { em: Date.now(), vendas: doc.vendas.map((v) => normalizarVenda(v as VendaGuardada)) });
  await marcarPendente(venda.id, dia, true);
  return venda;
}

export class VendaInvalida extends Error {
  constructor(public problemas: string[]) {
    super(problemas.join(" "));
    this.name = "VendaInvalida";
  }
}

// ---------------------------------------------------------------- ida ao /sistema

function observacoesDaVenda(v: VendaDoPdv): { publica: string; interna: string } {
  const formas = v.pagamentos
    .map((p) => `${NOMES_DAS_FORMAS[p.forma]}${p.parcelas && p.parcelas > 1 ? ` ${p.parcelas}x` : ""}: R$ ${p.valor.toFixed(2).replace(".", ",")}`)
    .join(" | ");
  return {
    publica: [v.observacao, `Venda no balcão — Balão da Informática Castelo · balao.info`].filter(Boolean).join("\n"),
    interna: `PDV balao.info ${v.id}${v.troco > 0 ? ` · troco R$ ${v.troco.toFixed(2).replace(".", ",")}` : ""}\n${formas}`,
  };
}

const notaTerminada = (e: EstadoDaNota) => e === "nao-pedida" || e === "autorizada" || e === "rejeitada" || e === "cancelada" || e === "erro";

/** A nota do /sistema no formato do balcão. */
export function notaDoSistema(n: NotaResumo | null | undefined, anterior: NotaDaVenda): NotaDaVenda {
  if (!n) return anterior;
  const estado = estadoDaNotaNoSistema(n.situacao);
  return {
    ...anterior,
    estado,
    notaId: n.id,
    numero: n.numero ? String(n.numero) : null,
    serie: n.serie != null ? String(n.serie) : null,
    chave: n.chave,
    linkDanfe: estado === "autorizada" ? linkDoDanfe(n.id) : null,
    mensagem:
      estado === "rejeitada" || estado === "erro"
        ? `${n.cStat ? `${n.cStat} - ` : ""}${n.motivo || "A nota não saiu."} Abra a venda no /sistema para ver o que corrigir.`
        : null,
    atualizadaEm: new Date().toISOString(),
  };
}

const esperarUmPouco = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Leva a venda até onde der: venda no /sistema → nota → autorizada.
 * Cada passo é gravado na hora, então uma volta interrompida continua de onde parou.
 */
export async function sincronizarVenda(id: string, opcoes: { esperarNota?: boolean; clienteDaNota?: ClienteDaVenda | null } = {}): Promise<VendaDoPdv | null> {
  // Trava: duas abas (ou a volta automática e o botão) não mandam a mesma venda ao mesmo tempo.
  const trava = { pegou: false };
  let venda = await mudarVenda(id, (v) => {
    if (v.cancelada || v.legadoBling) return undefined;
    const ocupada = v.sistema.estado === "enviando" && v.sistema.ultimaTentativa && Date.now() - new Date(v.sistema.ultimaTentativa).getTime() < TRAVA_MS;
    if (ocupada) return undefined;
    trava.pegou = true;
    return { ...v, sistema: { ...v.sistema, estado: "enviando", tentativas: v.sistema.tentativas + 1, ultimaTentativa: new Date().toISOString() } };
  });
  if (!venda || !trava.pegou) {
    if (venda?.legadoBling) await marcarPendente(venda.id, venda.dia, false).catch(() => undefined);
    return venda;
  }

  const gravar = async (mudar: (v: VendaDoPdv) => VendaDoPdv) => {
    venda = (await mudarVenda(id, mudar)) ?? venda;
    return venda!;
  };

  try {
    // 1. venda
    if (!venda.sistema.vendaId) {
      const obs = observacoesDaVenda(venda);
      const vendedorId = Number(venda.vendedor?.id);
      const criada = await enviarVenda({
        pdvId: venda.id,
        data: venda.dia,
        operador: venda.operador,
        vendedorId: Number.isInteger(vendedorId) && vendedorId > 0 ? vendedorId : null,
        cliente: venda.cliente,
        itens: venda.itens.map((i) => ({
          siteId: i.produtoId.startsWith("avulso") ? null : i.produtoId,
          nome: i.nome,
          foto: i.foto,
          quantidade: i.quantidade,
          valor: i.valor,
        })),
        descontoEmReais: venda.valorDoDesconto,
        pagamentos: venda.pagamentos.map((p) => ({ forma: p.forma, valor: p.valor, parcelas: p.parcelas ?? null })),
        observacoes: obs.publica,
        observacoesInternas: obs.interna,
      });
      await gravar((v) => ({
        ...v,
        cliente: { ...v.cliente, sistemaId: criada.cliente?.sistemaId ?? v.cliente.sistemaId ?? null },
        sistema: { ...v.sistema, vendaId: criada.id, numero: String(criada.numero), mensagem: null },
        // a venda já tinha nota (repetição depois de uma resposta perdida): usa ela
        nota: criada.nota ? notaDoSistema(criada.nota, v.nota) : v.nota,
      }));
    }

    // 2. nota
    if (venda.pedirNota && !notaTerminada(venda.nota.estado)) {
      let n: NotaResumo | null;
      try {
        n =
          venda.nota.notaId && venda.nota.estado === "enviada"
            ? await consultarNota(venda.nota.notaId)
            : await emitirNota(venda.sistema.vendaId!, opcoes.clienteDaNota ?? null);
      } catch (e) {
        if (!(e instanceof ErroDoSistema)) throw e;
        // o /sistema diz o que falta para a nota (IE, NCM, endereço…): a venda está feita, a nota fica com o recado
        const msg = e.message;
        await gravar((v) => ({ ...v, nota: { ...v.nota, estado: "erro", mensagem: msg, atualizadaEm: new Date().toISOString() } }));
        n = null;
      }
      if (n) await gravar((v) => ({ ...v, nota: notaDoSistema(n, v.nota) }));
      // A Sefaz costuma responder em poucos segundos: espera um pouco para o balcão já imprimir.
      for (let i = 0; i < (opcoes.esperarNota ? 3 : 0) && venda.nota.estado === "enviada" && venda.nota.notaId; i++) {
        await esperarUmPouco(2500);
        const atual = await consultarNota(venda.nota.notaId);
        await gravar((v) => ({ ...v, nota: notaDoSistema(atual, v.nota) }));
      }
    }

    await gravar((v) => ({ ...v, sistema: { ...v.sistema, estado: "no-sistema", mensagem: null } }));
  } catch (e) {
    const semAcesso = e instanceof SemAcessoAoSistema;
    const msg = e instanceof Error ? e.message : String(e);
    const jaNoSistema = Boolean(venda.sistema.vendaId);
    await gravar((v) => ({
      ...v,
      sistema: { ...v.sistema, estado: jaNoSistema ? "no-sistema" : semAcesso ? "pendente" : "erro", mensagem: jaNoSistema ? null : msg },
      // venda já no /sistema e a nota travou no caminho: segue tentando sozinha se for falta de acesso
      nota: jaNoSistema && v.pedirNota && !semAcesso ? { ...v.nota, estado: "erro", mensagem: msg, atualizadaEm: new Date().toISOString() } : v.nota,
    }));
    if (!semAcesso && !(e instanceof ErroDoSistema)) console.error("[pdv] falha ao mandar ao /sistema:", msg);
  }

  const pronta = venda.sistema.estado === "no-sistema" && notaTerminada(venda.nota.estado);
  const parada = venda.sistema.estado === "erro";
  await marcarPendente(venda.id, venda.dia, !pronta && !parada).catch(() => undefined);
  return venda;
}

/** Volta automática: segue as vendas que esperavam o /sistema ou a Sefaz. */
export async function seguirPendentes(limite = 3): Promise<number> {
  const { dados } = await ler<DocPendentes>("pdv/pendentes");
  let feitas = 0;
  for (const p of (dados?.ids ?? []).slice(0, limite)) {
    const v = await lerVenda(p.id);
    if (!v || v.legadoBling) {
      await marcarPendente(p.id, p.dia, false);
      continue;
    }
    if (v.sistema.estado === "erro") continue;
    const r = await sincronizarVenda(p.id);
    feitas++;
    if (r && r.sistema.estado === "pendente") break; // sistema fora: não adianta tentar as outras agora
  }
  return feitas;
}

/** Nota pedida depois da venda (ou nova tentativa depois de erro), com os dados do cliente para a nota. */
export async function pedirNotaDepois(id: string, cliente: ClienteDaVenda | null): Promise<VendaDoPdv | null> {
  const atual = await lerVenda(id);
  if (!atual) return null;
  if (atual.legadoBling) throw new VendaInvalida(["Venda do tempo do Bling: a nota dela se emite no Bling."]);
  const novoCliente = cliente ? { ...atual.cliente, ...cliente, sistemaId: cliente.sistemaId ?? atual.cliente.sistemaId ?? null } : atual.cliente;
  const problemas = conferirVenda({ ...atual, cliente: novoCliente, pedirNota: true }).filter((p) => p.campo === "cliente");
  if (problemas.length) throw new VendaInvalida(problemas.map((p) => p.mensagem));
  await mudarVenda(id, (v) => ({
    ...v,
    cliente: novoCliente,
    pedirNota: true,
    sistema: { ...v.sistema, estado: v.sistema.estado === "erro" ? "pendente" : v.sistema.estado, mensagem: null },
    nota:
      v.nota.estado === "nao-pedida" || v.nota.estado === "erro" || v.nota.estado === "rejeitada"
        ? { ...v.nota, estado: "pendente", mensagem: null }
        : v.nota,
  }));
  await marcarPendente(id, atual.dia, true);
  // venda já no /sistema: o cliente da nota vai junto (ele passa a ser o cliente da venda lá)
  return sincronizarVenda(id, { esperarNota: true, clienteDaNota: novoCliente });
}

export async function tentarDeNovo(id: string): Promise<VendaDoPdv | null> {
  const v = await mudarVenda(id, (x) =>
    x.sistema.estado === "erro"
      ? { ...x, sistema: { ...x.sistema, estado: "pendente", mensagem: null } }
      : x.nota.estado === "erro" || x.nota.estado === "rejeitada"
        ? { ...x, nota: { ...x.nota, estado: "pendente", mensagem: null } }
        : x
  );
  if (!v) return null;
  await marcarPendente(id, v.dia, true);
  return sincronizarVenda(id, { esperarNota: true });
}

/** Confere no /sistema como está a nota (o balcão aperta "atualizar"). */
export async function atualizarNota(id: string): Promise<VendaDoPdv | null> {
  const v = await lerVenda(id);
  if (!v?.nota.notaId) return v;
  const n = await consultarNota(v.nota.notaId);
  return mudarVenda(id, (x) => ({ ...x, nota: notaDoSistema(n, x.nota) }));
}

// ---------------------------------------------------------------- vendas do dia (PDV + /sistema)

let cacheDoSistema: { dia: string; em: number; vendas: LinhaDoSistema[] } | null = null;

export interface ResumoDoDia {
  dia: string;
  linhas: LinhaDoDia[];
  sistema: { lido: boolean; mensagem: string | null; lidoEm: string | null };
  totais: { vendas: number; valor: number; notas: number; aguardando: number };
}

const horaDe = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

function situacaoDaLinhaPdv(v: VendaDoPdv): string {
  if (v.cancelada) return "Cancelada";
  if (v.legadoBling) return "No Bling (antes do sistema)";
  if (v.sistema.estado === "pendente") return "Aguardando o sistema";
  if (v.sistema.estado === "enviando") return "Enviando ao sistema";
  if (v.sistema.estado === "erro") return "Erro no sistema";
  return "No sistema";
}

function notaDaLinha(n: NotaResumo | null): LinhaDoDia["nota"] {
  if (!n) return null;
  const estado = estadoDaNotaNoSistema(n.situacao);
  return { estado, numero: n.numero ? String(n.numero) : null, linkDanfe: estado === "autorizada" ? linkDoDanfe(n.id) : null };
}

export async function vendasDoDia(dia = hojeNaLoja()): Promise<ResumoDoDia> {
  const locais = await vendasDoPdv(dia);
  let doSistema: LinhaDoSistema[] = [];
  let sistema: ResumoDoDia["sistema"] = { lido: false, mensagem: null, lidoEm: null };
  try {
    if (cacheDoSistema && cacheDoSistema.dia === dia && Date.now() - cacheDoSistema.em < 15_000) {
      doSistema = cacheDoSistema.vendas;
    } else {
      doSistema = await vendasDoDiaNoSistema(dia);
      cacheDoSistema = { dia, em: Date.now(), vendas: doSistema };
    }
    sistema = { lido: true, mensagem: null, lidoEm: new Date(cacheDoSistema!.em).toISOString() };
  } catch (e) {
    sistema = { lido: false, mensagem: e instanceof Error ? e.message : String(e), lidoEm: cacheDoSistema?.dia === dia ? new Date(cacheDoSistema.em).toISOString() : null };
    if (cacheDoSistema?.dia === dia) doSistema = cacheDoSistema.vendas;
  }

  const porPdv = new Map(locais.map((v) => [v.id, v]));
  const porVendaId = new Map(locais.filter((v) => v.sistema.vendaId).map((v) => [v.sistema.vendaId!, v]));
  const linhas: LinhaDoDia[] = [];
  const usados = new Set<string>();

  for (const s of doSistema) {
    const local = (s.pdvId ? porPdv.get(s.pdvId) : undefined) ?? porVendaId.get(s.id);
    if (local) usados.add(local.id);
    linhas.push({
      chave: local ? local.id : `sistema-${s.id}`,
      origem: local ? "pdv" : "sistema",
      pdvId: local?.id ?? null,
      vendaId: s.id,
      numero: String(s.numero),
      hora: horaDe(local?.criadaEm ?? s.criadaEm),
      cliente: s.cliente || local?.cliente.nome || "Consumidor final",
      vendedor: s.vendedor?.nome ?? local?.vendedor?.nome ?? null,
      total: s.total,
      situacao: s.situacao.nome,
      estadoNoSistema: "no-sistema",
      nota: notaDaLinha(s.nota) ?? (local?.pedirNota ? { estado: local.nota.estado, numero: local.nota.numero, linkDanfe: local.nota.linkDanfe } : null),
      cancelada: s.cancelada,
    });
  }
  for (const v of locais) {
    if (usados.has(v.id)) continue;
    // ainda não chegou ao /sistema (ou a lista de lá ainda não trouxe), ou é do tempo do Bling
    linhas.push({
      chave: v.id,
      origem: "pdv",
      pdvId: v.id,
      vendaId: v.sistema.vendaId,
      numero: v.sistema.numero ?? (v.legadoBling?.numero ? `Bling ${v.legadoBling.numero}` : null),
      hora: horaDe(v.criadaEm),
      cliente: v.cliente.nome || "Consumidor final",
      vendedor: v.vendedor?.nome ?? null,
      total: v.total,
      situacao: situacaoDaLinhaPdv(v),
      estadoNoSistema: v.sistema.estado,
      nota: v.pedirNota ? { estado: v.nota.estado, numero: v.nota.numero, linkDanfe: v.nota.linkDanfe } : null,
      cancelada: Boolean(v.cancelada),
    });
  }
  // Mais nova em cima.
  linhas.sort((a, b) => (b.hora || "").localeCompare(a.hora || "") || Number(b.numero?.replace(/\D/g, "") || 0) - Number(a.numero?.replace(/\D/g, "") || 0));

  const valendo = linhas.filter((l) => !l.cancelada);
  return {
    dia,
    linhas,
    sistema,
    totais: {
      vendas: valendo.length,
      valor: centavos(valendo.reduce((s, l) => s + l.total, 0)),
      notas: linhas.filter((l) => l.nota?.estado === "autorizada").length,
      aguardando: linhas.filter((l) => l.estadoNoSistema === "pendente" || l.estadoNoSistema === "enviando" || l.estadoNoSistema === "erro").length,
    },
  };
}

// ---------------------------------------------------------------- comprovante

export interface DadosDoComprovante {
  chave: string;
  origem: "pdv" | "sistema";
  pdvId: string | null;
  /** nº da venda no /sistema */
  numeroSistema: string | null;
  dataHora: string; // ISO
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
  estadoNoSistema: VendaDoPdv["sistema"]["estado"];
  mensagemDoSistema: string | null;
  pedirNota: boolean;
  nota: NotaDaVenda | null;
  cancelada: boolean;
}

export function comprovanteDaVenda(v: VendaDoPdv): DadosDoComprovante {
  return {
    chave: v.id,
    origem: "pdv",
    pdvId: v.id,
    numeroSistema: v.sistema.numero ?? (v.legadoBling?.numero ? `Bling ${v.legadoBling.numero}` : null),
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
    estadoNoSistema: v.sistema.estado,
    mensagemDoSistema: v.sistema.mensagem,
    pedirNota: v.pedirNota,
    nota: v.pedirNota ? v.nota : null,
    cancelada: Boolean(v.cancelada),
  };
}

/** Venda lançada direto no /sistema, no mesmo formato do comprovante do balcão. */
export async function comprovanteDoSistema(vendaId: number): Promise<DadosDoComprovante> {
  const v = await vendaDoSistema(vendaId);
  const nota = v.nota ? notaDoSistema(v.nota, { ...NOTA_NAO_PEDIDA }) : null;
  return {
    chave: `sistema-${v.id}`,
    origem: "sistema",
    pdvId: null,
    numeroSistema: String(v.numero),
    dataHora: v.criadaEm,
    soData: false,
    vendedor: v.vendedor?.nome ?? null,
    operador: null,
    cliente: { ...CLIENTE_VAZIO, ...v.cliente },
    itens: v.itens.map((i) => ({ nome: i.nome, quantidade: i.quantidade, valor: i.valor, valorDoSite: null, foto: i.foto, codigo: i.codigo || "" })),
    subtotal: v.totalProdutos,
    desconto: v.desconto,
    total: v.total,
    pagamentos: v.pagamentos.map((p) => ({ nome: p.forma, valor: p.valor, detalhe: p.observacao })),
    troco: 0,
    observacao: v.observacoes || "",
    situacao: v.situacao.nome,
    estadoNoSistema: "no-sistema",
    mensagemDoSistema: null,
    pedirNota: Boolean(v.nota),
    nota,
    cancelada: v.cancelada,
  };
}
