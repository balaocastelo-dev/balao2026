import { supabaseAdmin } from "./supabase";
import { resumoDoDia, listarPedidos, estadoBling } from "./bling";

// ============================================================
// Rafa — analista da loja. Dois relatórios por dia no WhatsApp do Thiago:
//
//   07h  Como está o setor: preço contra concorrente, o que as pessoas
//        procuraram e a loja não tem, movimento da semana.
//   19h  Fechamento do dia: quanto entrou, quantos clientes, por vendedor.
//
// A regra que governa este arquivo: o Rafa só reporta número que ele MEDIU.
//
// Seria mais fácil perguntar a um modelo "quais as tendências do varejo de
// informática hoje" e mandar a resposta. O resultado seria plausível, bonito
// e inventado — e alguém compraria estoque com base nisso. A IA aqui só
// escreve o texto a partir dos números apurados abaixo; ela não é a fonte de
// nenhum deles.
// ============================================================

const DIAS_JANELA = 7;

function diasAtras(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

function reais(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* ---------------------------------------------------------------- *
 * Sinal 1 — margem do catálogo
 * ---------------------------------------------------------------- */

export interface SinalMargem {
  itensComCusto: number;
  margemMediana: number | null;
  abaixoDoCusto: { nome: string; preco: number; custo: number }[];
  margemMagra: { nome: string; margem: number }[];
}

/**
 * Margem sobre os produtos que têm custo cadastrado.
 *
 * Mediana e não média: um punhado de itens com custo errado (centavos, ou o
 * preço repetido no lugar do custo) desloca a média e some com o sinal. A
 * mediana aguenta esse tipo de sujeira, que existe em qualquer catálogo.
 */
export async function medirMargem(): Promise<SinalMargem> {
  const vazio: SinalMargem = {
    itensComCusto: 0, margemMediana: null, abaixoDoCusto: [], margemMagra: [],
  };

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("name, price, cost")
    .eq("is_curated", true)
    .gt("cost", 0)
    .limit(2000);

  if (error || !data?.length) return vazio;

  const linhas = data
    .map((p) => ({
      nome: String(p.name || ""),
      preco: Number(p.price) || 0,
      custo: Number(p.cost) || 0,
    }))
    .filter((p) => p.preco > 0 && p.custo > 0);

  if (!linhas.length) return vazio;

  const margens = linhas
    .map((p) => (p.preco - p.custo) / p.preco)
    .sort((a, b) => a - b);
  const meio = Math.floor(margens.length / 2);

  return {
    itensComCusto: linhas.length,
    margemMediana:
      margens.length % 2 ? margens[meio] : (margens[meio - 1] + margens[meio]) / 2,
    abaixoDoCusto: linhas
      .filter((p) => p.preco < p.custo)
      .sort((a, b) => a.preco - a.custo - (b.preco - b.custo))
      .slice(0, 5)
      .map(({ nome, preco, custo }) => ({ nome, preco, custo })),
    margemMagra: linhas
      .filter((p) => p.preco >= p.custo && (p.preco - p.custo) / p.preco < 0.05)
      .slice(0, 5)
      .map((p) => ({ nome: p.nome, margem: (p.preco - p.custo) / p.preco })),
  };
}

/* ---------------------------------------------------------------- *
 * Sinal 2 — procura sem resposta
 * ---------------------------------------------------------------- */

export interface SinalProcura {
  eventos: number;
  maisProcurados: { termo: string; vezes: number }[];
  semProdutoNoCatalogo: string[];
}

/**
 * O que as pessoas procuraram no site nos últimos 7 dias, e o que delas a
 * loja não tem no catálogo.
 *
 * Esta é a única fonte de "oportunidade" que não é chute: alguém digitou,
 * alguém clicou, e não havia produto. Tendência de mercado a loja lê no
 * jornal; o que falta na prateleira dela só este número conta.
 */
export async function medirProcura(): Promise<SinalProcura> {
  const vazio: SinalProcura = { eventos: 0, maisProcurados: [], semProdutoNoCatalogo: [] };

  const { data, error } = await supabaseAdmin
    .from("site_conversion_events")
    .select("product_name, service, label")
    .gte("created_at", diasAtras(DIAS_JANELA))
    .limit(5000);

  if (error || !data?.length) return vazio;

  const contagem = new Map<string, number>();
  for (const e of data) {
    const termo = String(e.product_name || e.service || e.label || "").trim().toLowerCase();
    if (termo.length < 3) continue;
    contagem.set(termo, (contagem.get(termo) || 0) + 1);
  }

  const maisProcurados = [...contagem.entries()]
    .map(([termo, vezes]) => ({ termo, vezes }))
    .sort((a, b) => b.vezes - a.vezes)
    .slice(0, 10);

  // Para cada termo do topo, pergunta ao catálogo se existe algo parecido.
  const semProduto: string[] = [];
  for (const { termo } of maisProcurados.slice(0, 6)) {
    const { data: achados } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("is_curated", true)
      .ilike("name", `%${termo.slice(0, 25)}%`)
      .limit(1);
    if (!achados?.length) semProduto.push(termo);
  }

  return { eventos: data.length, maisProcurados, semProdutoNoCatalogo: semProduto };
}

/* ---------------------------------------------------------------- *
 * Sinal 3 — movimento do site
 * ---------------------------------------------------------------- */

export interface SinalMovimento {
  visitasSemana: number;
  visitasSemanaAnterior: number;
  variacao: number | null;
}

export async function medirMovimento(): Promise<SinalMovimento> {
  const contar = async (de: string, ate: string) => {
    const { count } = await supabaseAdmin
      .from("site_visits")
      .select("id", { count: "exact", head: true })
      .gte("created_at", de)
      .lt("created_at", ate);
    return count || 0;
  };

  const agora = new Date().toISOString();
  const semana = await contar(diasAtras(DIAS_JANELA), agora);
  const anterior = await contar(diasAtras(DIAS_JANELA * 2), diasAtras(DIAS_JANELA));

  return {
    visitasSemana: semana,
    visitasSemanaAnterior: anterior,
    variacao: anterior > 0 ? (semana - anterior) / anterior : null,
  };
}

/* ---------------------------------------------------------------- *
 * Sinal 4 — venda da semana (Bling)
 * ---------------------------------------------------------------- */

export interface SinalVenda {
  disponivel: boolean;
  motivo: string | null;
  semana: { pedidos: number; total: number };
  semanaAnterior: { pedidos: number; total: number };
}

export async function medirVenda(): Promise<SinalVenda> {
  const estado = await estadoBling();
  if (!estado.conectado) {
    return {
      disponivel: false,
      motivo: estado.configurado ? "Bling não conectado" : "Bling não configurado",
      semana: { pedidos: 0, total: 0 },
      semanaAnterior: { pedidos: 0, total: 0 },
    };
  }

  const dia = (n: number) => diasAtras(n).slice(0, 10);
  const [atual, passada] = await Promise.all([
    listarPedidos({ dataInicial: dia(DIAS_JANELA), dataFinal: dia(0) }),
    listarPedidos({ dataInicial: dia(DIAS_JANELA * 2), dataFinal: dia(DIAS_JANELA + 1) }),
  ]);

  if (atual.erro) {
    return {
      disponivel: false, motivo: atual.erro,
      semana: { pedidos: 0, total: 0 }, semanaAnterior: { pedidos: 0, total: 0 },
    };
  }

  const somar = (ps: { total: number }[]) => ({
    pedidos: ps.length,
    total: ps.reduce((s, p) => s + p.total, 0),
  });

  return {
    disponivel: true,
    motivo: null,
    semana: somar(atual.pedidos),
    semanaAnterior: somar(passada.pedidos),
  };
}

/* ---------------------------------------------------------------- *
 * Os dois relatórios
 * ---------------------------------------------------------------- */

function porcentagem(v: number | null): string {
  if (v === null) return "—";
  const sinal = v > 0 ? "+" : "";
  return `${sinal}${(v * 100).toFixed(0)}%`;
}

/** 07h — como está o setor, pelos números que a loja tem. */
export async function relatorioDaManha(): Promise<string> {
  const [margem, procura, movimento, venda] = await Promise.all([
    medirMargem(), medirProcura(), medirMovimento(), medirVenda(),
  ]);

  const linhas: string[] = ["☀️ *Bom dia, Thiago!* Resumo do setor:", ""];

  if (venda.disponivel) {
    const delta =
      venda.semanaAnterior.total > 0
        ? (venda.semana.total - venda.semanaAnterior.total) / venda.semanaAnterior.total
        : null;
    linhas.push(
      `📈 *Venda (7 dias)*`,
      `${venda.semana.pedidos} pedidos · ${reais(venda.semana.total)} (${porcentagem(delta)} vs semana anterior)`,
      ""
    );
  } else {
    linhas.push(`📈 *Venda*: ${venda.motivo} — sem número de faturamento hoje.`, "");
  }

  linhas.push(
    `👀 *Movimento do site*`,
    `${movimento.visitasSemana} visitas em 7 dias (${porcentagem(movimento.variacao)} vs semana anterior)`,
    ""
  );

  if (margem.margemMediana !== null) {
    linhas.push(
      `💰 *Margem*`,
      `Mediana de ${(margem.margemMediana * 100).toFixed(0)}% em ${margem.itensComCusto} itens com custo cadastrado`
    );
    if (margem.abaixoDoCusto.length) {
      linhas.push(`⚠️ ${margem.abaixoDoCusto.length} item(ns) com preço ABAIXO do custo:`);
      for (const p of margem.abaixoDoCusto.slice(0, 3)) {
        linhas.push(`• ${p.nome.slice(0, 45)} — vende ${reais(p.preco)}, custa ${reais(p.custo)}`);
      }
    }
    linhas.push("");
  }

  if (procura.maisProcurados.length) {
    linhas.push(`🔎 *Mais procurado no site (7 dias)*`);
    for (const t of procura.maisProcurados.slice(0, 5)) {
      linhas.push(`• ${t.termo.slice(0, 40)} (${t.vezes}x)`);
    }
    if (procura.semProdutoNoCatalogo.length) {
      linhas.push(
        "",
        `🎯 *Oportunidade*: procuraram e a loja não tem no catálogo —`,
        procura.semProdutoNoCatalogo.map((t) => `• ${t.slice(0, 40)}`).join("\n")
      );
    }
    linhas.push("");
  }

  linhas.push("_Números apurados do catálogo, do site e do Bling. Nada aqui é estimativa._");
  return linhas.join("\n");
}

/** 19h — fechamento do dia. */
export async function relatorioDoFechamento(data?: string): Promise<string> {
  const resumo = await resumoDoDia(data);

  if (resumo.erro) {
    return [
      "🌙 *Fechamento do dia*",
      "",
      `Não consegui falar com o Bling: ${resumo.erro}`,
      "",
      "_Prefiro não mandar número do que mandar número errado._",
    ].join("\n");
  }

  if (!resumo.pedidos) {
    return [
      "🌙 *Fechamento do dia*",
      "",
      `Nenhum pedido registrado no Bling em ${resumo.data}.`,
      "",
      "_Se houve venda hoje, ela não chegou ao Bling._",
    ].join("\n");
  }

  const linhas: string[] = [
    "🌙 *Fechamento do dia*",
    "",
    `💵 *${reais(resumo.faturamento)}* em ${resumo.pedidos} pedidos`,
    `👥 ${resumo.clientes} cliente(s) · ticket médio ${reais(resumo.ticketMedio)}`,
    "",
  ];

  if (resumo.porVendedor.length) {
    linhas.push("*Por vendedor*");
    for (const v of resumo.porVendedor) {
      linhas.push(`• ${v.vendedorId || "sem vendedor"}: ${v.pedidos} pedido(s) · ${reais(v.total)}`);
    }
    linhas.push("");
  }

  if (resumo.maiores.length) {
    linhas.push("*Maiores do dia*");
    for (const m of resumo.maiores) {
      linhas.push(`• ${(m.cliente || "sem nome").slice(0, 35)} — ${reais(m.total)}`);
    }
  }

  return linhas.join("\n");
}
