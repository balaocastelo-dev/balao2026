"use server";

// ============================================================
// Ações do painel da Arena (/painel/arena). Cada uma confere a sessão do
// painel aqui dentro: trancar a tela não basta, porque uma ação de servidor
// pode ser chamada direto.
// ============================================================

import { revalidateTag } from "next/cache";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import {
  ajustarLancamento,
  apagarManual,
  buscarLancamentos,
  existeChaveDoVigia,
  gerarChaveDoVigia,
  gravarCorrida,
  gravarMetas,
  gravarPremio,
  gravarRegras,
  lancamentosEntre,
  lancarManual,
  lerCorrida,
  lerPremio,
  lerRegras,
  lerVarredura,
  lerVendedoresDoBling,
  lerVigia,
  listarPilotos,
  pedirVarredura,
  recalcularTudo,
  removerPiloto,
  salvarPiloto,
  vendedoresSemPiloto,
  type DadosDoPiloto,
  type FiltroDeLancamentos,
} from "@/lib/arena/banco";
import { ETIQUETA_ARENA, fotoPublica, vigiaOnline } from "@/lib/arena/estado";
import { janela, mesAnterior, semanaAnterior } from "@/lib/arena/periodos";
import { montarPlacar, sugerirMeta } from "@/lib/arena/placar";
import { REGRAS_PADRAO } from "@/lib/arena/pontos";
import { CORES_DE_KART, KARTS } from "@/lib/arena/tipos";

type Resultado<T = undefined> = { ok: true; dados?: T } | { ok: false; erro: string };

async function comSessao<T>(fn: () => Promise<T>): Promise<Resultado<T>> {
  if (!(await isPainelAuthenticated())) return { ok: false, erro: "Sessão do painel vencida. Entre de novo." };
  try {
    return { ok: true, dados: await fn() };
  } catch (e) {
    return { ok: false, erro: (e as Error).message || "Falhou" };
  }
}

const mexeuNaArena = () => revalidateTag(ETIQUETA_ARENA, { expire: 0 });

export async function carregarPainel() {
  return comSessao(async () => {
    const [crus, corrida, regras, premio, vigia, temChave, vendedoresBling, semPiloto, varrerDesde] = await Promise.all([
      listarPilotos(),
      lerCorrida(),
      lerRegras(),
      lerPremio(),
      lerVigia(),
      existeChaveDoVigia(),
      lerVendedoresDoBling(),
      vendedoresSemPiloto(),
      lerVarredura(),
    ]);
    const pilotos = crus.map((p) => ({ ...p, fotoTelao: fotoPublica(p) }));
    const semana = janela("semana");
    const mes = janela("mes");
    const semanas = [1, 2, 3, 4].map((n) => semanaAnterior(n));
    const meses = [1, 2, 3].map((n) => mesAnterior(n));
    const lancs = await lancamentosEntre(meses[2].inicio, mes.fim, 20000);
    const placarSemana = montarPlacar(crus, lancs, semana, corrida);
    const placarMes = montarPlacar(crus, lancs, mes, corrida);

    // Meta sugerida de cada piloto: média do que ele fez nas 4 semanas e nos
    // 3 meses anteriores, com 15% a mais.
    const passadasS = semanas.map((j) => montarPlacar(crus, lancs, j, corrida));
    const passadasM = meses.map((j) => montarPlacar(crus, lancs, j, corrida));
    const sugestoes: Record<string, { semana: number | null; mes: number | null }> = {};
    for (const p of crus) {
      const pts = (pl: typeof passadasS) => pl.map((x) => x.linhas.find((l) => l.piloto.id === p.id)?.pontos ?? 0);
      sugestoes[p.id] = { semana: sugerirMeta(pts(passadasS)), mes: sugerirMeta(pts(passadasM)) };
    }
    const hall = [...passadasS, ...passadasM].map((pl) => {
      const top = [...pl.linhas].sort((a, b) => b.pontos - a.pontos)[0];
      return {
        rotulo: pl.rotulo,
        periodo: pl.periodo,
        campeao: top && top.pontos > 0 ? top.piloto.apelido || top.piloto.nome : null,
        pontos: top?.pontos ?? 0,
        chegaram: pl.linhas.filter((l) => l.chegou).map((l) => l.piloto.apelido || l.piloto.nome),
        equipe: pl.equipe,
      };
    });

    return {
      pilotos,
      corrida,
      regras,
      regrasPadrao: REGRAS_PADRAO,
      premio,
      vigia: { ...vigia, online: vigiaOnline(vigia.ultimaVez), temChave, varrerDesde },
      vendedoresBling,
      semPiloto,
      placarSemana,
      placarMes,
      sugestoes,
      hall,
      karts: [...KARTS],
      cores: CORES_DE_KART,
    };
  });
}

export async function salvarPilotoAcao(id: string | null, dados: DadosDoPiloto) {
  return comSessao(async () => {
    const novo = await salvarPiloto(id, dados);
    mexeuNaArena();
    return novo;
  });
}

export async function removerPilotoAcao(id: string) {
  return comSessao(async () => {
    await removerPiloto(id);
    mexeuNaArena();
  });
}

/** "Thiago Herrera" / "JULIA SOUZA" → "Thiago" / "Julia". */
function primeiroNome(nome: string) {
  const p = nome.trim().split(/\s+/)[0] || nome;
  return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
}
function nomeBonito(nome: string) {
  return nome
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((p) => (["da", "de", "do", "das", "dos", "e"].includes(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(" ");
}

/** Cria um piloto para cada vendedor do Bling que ainda não tem. */
export async function criarPilotosDoBlingAcao(ids?: string[]) {
  return comSessao(async () => {
    const [pilotos, vendedores, semPiloto] = await Promise.all([listarPilotos(), lerVendedoresDoBling(), vendedoresSemPiloto()]);
    const ligados = new Set(pilotos.map((p) => p.blingVendedorId).filter(Boolean));
    const nomes = new Map(vendedores.map((v) => [v.id, v.nome]));
    const candidatos = [...new Set([...vendedores.map((v) => v.id), ...semPiloto.map((s) => s.id)])]
      .filter((id) => !ligados.has(id))
      .filter((id) => !ids || ids.includes(id));
    let n = pilotos.length;
    for (const id of candidatos) {
      const nome = nomes.get(id);
      n++;
      await salvarPiloto(null, {
        nome: nome ? nomeBonito(nome) : `Vendedor ${id.slice(-4)}`,
        apelido: nome ? primeiroNome(nome) : null,
        blingVendedorId: id,
        cor: CORES_DE_KART[(n - 1) % CORES_DE_KART.length],
        kart: KARTS[(n - 1) % KARTS.length],
        numero: n,
      });
    }
    mexeuNaArena();
    return candidatos.length;
  });
}

export async function salvarMetasAcao(metas: { id: string; metaSemana: number | null; metaMes: number | null }[]) {
  return comSessao(async () => {
    await gravarMetas(metas);
    mexeuNaArena();
  });
}

export async function salvarCorridaAcao(c: unknown) {
  return comSessao(async () => {
    await gravarCorrida(c);
    mexeuNaArena();
  });
}

export async function salvarRegrasAcao(r: unknown) {
  return comSessao(async () => {
    await gravarRegras(r);
    const mudados = await recalcularTudo();
    mexeuNaArena();
    return mudados;
  });
}

export async function salvarPremioAcao(p: unknown) {
  return comSessao(async () => {
    await gravarPremio(p);
    mexeuNaArena();
  });
}

const HOSTS_AIRBNB = /(^|\.)airbnb\.[a-z.]+$|(^|\.)abnb\.me$/i;

function metaTag(html: string, prop: string) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*>`, "i");
  const tag = html.match(re)?.[0];
  const c = tag?.match(/content=["']([^"']*)["']/i)?.[1];
  return c
    ? c.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim()
    : null;
}

/**
 * Lê o título e a foto do anúncio do Airbnb. Só vai ao Airbnb (nada de buscar
 * endereço qualquer a pedido do painel). Se o Airbnb barrar, o painel deixa
 * colar a foto à mão.
 */
export async function lerAnuncioAirbnbAcao(link: string) {
  return comSessao(async () => {
    let url: URL;
    try {
      url = new URL(String(link).trim());
    } catch {
      throw new Error("Link inválido.");
    }
    if (url.protocol !== "https:" || !HOSTS_AIRBNB.test(url.hostname)) throw new Error("Cole um link do Airbnb (https://www.airbnb.com.br/rooms/…).");
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BalaoArena/1.0; +https://www.balao.info)",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(9000),
      cache: "no-store",
    });
    const final = new URL(r.url || url.toString());
    if (!HOSTS_AIRBNB.test(final.hostname)) throw new Error("O link levou para fora do Airbnb.");
    if (!r.ok) throw new Error(`O Airbnb respondeu ${r.status}. Cole a foto à mão.`);
    const html = (await r.text()).slice(0, 600_000);
    const titulo = metaTag(html, "og:title") || html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || "";
    const imagem = metaTag(html, "og:image") || "";
    const descricao = metaTag(html, "og:description") || "";
    if (!titulo && !imagem) throw new Error("Não achei título nem foto nessa página. Cole a foto à mão.");
    return {
      titulo: titulo.replace(/\s*[-|·]\s*Airbnb\s*$/i, "").slice(0, 120),
      imagem: /^https:\/\//.test(imagem) ? imagem : "",
      descricao: descricao.slice(0, 400),
      link: final.toString().split("?")[0],
    };
  });
}

export async function listarLancamentosAcao(f: FiltroDeLancamentos) {
  return comSessao(() => buscarLancamentos(f));
}

export async function ajustarLancamentoAcao(id: string, acao: { anular?: boolean; pontosManual?: number | null }) {
  return comSessao(async () => {
    await ajustarLancamento(id, acao);
    mexeuNaArena();
  });
}

export async function lancarManualAcao(pilotoId: string, pontos: number, motivo: string) {
  return comSessao(async () => {
    await lancarManual(pilotoId, pontos, motivo);
    mexeuNaArena();
  });
}

export async function apagarManualAcao(id: string) {
  return comSessao(async () => {
    await apagarManual(id);
    mexeuNaArena();
  });
}

export async function recalcularAcao() {
  return comSessao(async () => {
    const n = await recalcularTudo();
    mexeuNaArena();
    return n;
  });
}

/** Gera a chave nova (a antiga para de valer na hora). Aparece uma vez só. */
export async function gerarChaveAcao() {
  return comSessao(() => gerarChaveDoVigia());
}

export async function pedirVarreduraAcao(desde: string) {
  return comSessao(async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(desde)) throw new Error("Data inválida.");
    await pedirVarredura(desde);
  });
}
