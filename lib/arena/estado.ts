// ============================================================
// Arena: a corrida já calculada, que o telão (/arena) e as páginas dos
// pilotos (/arena/<piloto>) recebem.
//
// Público (TV da loja, celular do vendedor): daqui não sai nome de cliente.
// Desde 12/10 (tarde) a corrida é em reais, então os valores aparecem.
//
// A corrida é calculada quando algo muda (o vigia trouxe venda, o painel
// mexeu) e guardada pronta na gaveta ("telao"). O telão só lê esse documento,
// com uma cópia em memória. Se a gaveta falhar, serve a última cópia boa.
// ============================================================

import { createHash } from "crypto";
import { ler, atualizar, tipoDaGaveta } from "./gaveta";
import { janela, mesAnterior, semanaAnterior, somarDias } from "./periodos";
import { lancamentosEntre, lerConfig, lerVigia, type ConfigDaArena } from "./dados";
import { indexarPilotos, montarPlacar, pilotoDoLancamento } from "./placar";
import { avisosEntre, dispararAvisos, lerAvisos } from "./avisos";
import { enviarAviso } from "./whatsapp";
import type { EstadoDoTelao, JogadaPublica, Lancamento, Piloto, PlacarDoPeriodo, SituacaoDoVigia } from "./tipos";

/** O vigia está vivo se falou com o site nos últimos 15 minutos (ele só anota de 10 em 10 quando nada muda). */
export function vigiaOnline(ultimaVez: string | null, agora = Date.now()) {
  return Boolean(ultimaVez && agora - Date.parse(ultimaVez) < 15 * 60_000);
}

function campeao(placar: PlacarDoPeriodo) {
  const top = [...placar.linhas].sort((a, b) => b.valor - a.valor)[0];
  return {
    rotulo: placar.rotulo,
    periodo: placar.periodo,
    campeao: top && top.valor > 0 ? top.piloto.apelido || top.piloto.nome : null,
    foto: top && top.valor > 0 ? top.piloto.foto : null,
    cor: top && top.valor > 0 ? top.piloto.cor : null,
    valor: top ? top.valor : 0,
    chegaram: placar.linhas.filter((l) => l.chegou).length,
  };
}

/** Foto guardada na gaveta (ou dentro da configuração) vira um endereço do site. */
export function fotoPublica(p: Pick<Piloto, "id" | "foto">): string | null {
  if (!p.foto) return null;
  if (/^https:\/\//.test(p.foto)) return p.foto;
  const v = createHash("sha1").update(p.foto).digest("hex").slice(0, 10);
  return `/api/arena/foto/${encodeURIComponent(p.id)}?v=${v}`;
}

function jogada(l: Lancamento, p: Piloto): JogadaPublica {
  return {
    id: l.id,
    tipo: l.tipo,
    pilotoId: p.id,
    valor: l.valor,
    licencas: l.licencas,
    data: l.data,
    registradoEm: l.registradoEm,
  };
}

/** Monta a corrida a partir da configuração e dos lançamentos (sem gaveta: dá para testar). */
export function calcularEstado(config: ConfigDaArena, lancs: Lancamento[], vigia: SituacaoDoVigia, agora = new Date()): EstadoDoTelao {
  const pilotos = config.pilotos.map((p) => ({ ...p, foto: fotoPublica(p) }));
  const { corrida, premio } = config;
  const semana = janela("semana", agora);
  const mes = janela("mes", agora);
  const antigas = [1, 2, 3, 4].map((n) => semanaAnterior(n, agora));
  const mesesAntigos = [1, 2, 3].map((n) => mesAnterior(n, agora));

  const placarSemana = montarPlacar(pilotos, lancs, semana, corrida);
  const placarMes = montarPlacar(pilotos, lancs, mes, corrida);
  const hall = [
    ...antigas.map((j) => campeao(montarPlacar(pilotos, lancs, j, corrida))),
    ...mesesAntigos.map((j) => campeao(montarPlacar(pilotos, lancs, j, corrida))),
  ].filter((h) => h.campeao);

  const { porBling, porId } = indexarPilotos(pilotos.filter((p) => p.ativo));
  const validos = lancs
    .filter((l) => l.status === "valido")
    .map((l) => ({ l, p: pilotoDoLancamento(l, porBling, porId) }))
    .filter((x): x is { l: Lancamento; p: Piloto } => x.p !== null);

  const recentes = validos
    .filter((x) => !x.l.historico)
    .sort((a, b) => b.l.registradoEm.localeCompare(a.l.registradoEm))
    .slice(0, 15)
    .map((x) => jogada(x.l, x.p));

  const desde30 = somarDias(semana.fim, -37);
  const jogadasPorPiloto: Record<string, JogadaPublica[]> = {};
  for (const x of validos.filter((v) => v.l.data >= desde30).sort((a, b) => b.l.data.localeCompare(a.l.data) || b.l.registradoEm.localeCompare(a.l.registradoEm))) {
    const lista = (jogadasPorPiloto[x.p.id] ??= []);
    if (lista.length < 12) lista.push(jogada(x.l, x.p));
  }

  return {
    titulo: corrida.titulo,
    periodoTelao: corrida.periodoTelao,
    som: corrida.som,
    semana: placarSemana,
    mes: placarMes,
    premio:
      premio.ativo && (premio.titulo || premio.imagem)
        ? { titulo: premio.titulo, link: premio.link, imagem: premio.imagem, local: premio.local, descricao: "", periodo: premio.periodo }
        : null,
    recentes,
    jogadasPorPiloto,
    hallDaFama: hall,
    vigiaUltimaVez: vigia.ultimaVez,
    geradoEm: agora.toISOString(),
  };
}

/** Do mais antigo que o hall da fama precisa (3 meses) até o fim do mês. */
function janelaDeLeitura(agora: Date) {
  const mes = janela("mes", agora);
  const semana = janela("semana", agora);
  const desde = [mesAnterior(3, agora).inicio, semanaAnterior(4, agora).inicio].sort()[0];
  return { desde, ate: mes.fim > semana.fim ? mes.fim : semana.fim };
}

// ---------------------------------------------------------------- cópia em memória

let memoria: { estado: EstadoDoTelao; em: number } | null = null;
// No banco (reserva) a cópia dura mais: cada leitura pode gastar conexão da cota.
const validadeMs = () => (tipoDaGaveta() === "banco" ? 90_000 : 10_000);

function velho(e: EstadoDoTelao, agora = new Date()) {
  return (
    e.semana?.inicio !== janela("semana", agora).inicio ||
    e.mes?.inicio !== janela("mes", agora).inicio ||
    agora.getTime() - Date.parse(e.geradoEm) > 6 * 3600_000 ||
    !e.jogadasPorPiloto ||
    // Corrida guardada quando ainda era em pontos (antes de 12/10, tarde).
    typeof e.semana?.equipe?.valor !== "number"
  );
}

/**
 * Recalcula a corrida, guarda pronta e manda os avisos do WhatsApp do que
 * mudou (alguém cruzou a linha, a equipe bateu a meta…).
 */
export async function reconstruirTelao(agora = new Date()): Promise<EstadoDoTelao> {
  const config = await lerConfig();
  const { desde, ate } = janelaDeLeitura(agora);
  const [lancs, vigia, anterior] = await Promise.all([lancamentosEntre(desde, ate), lerVigia(), ler<EstadoDoTelao>("telao")]);
  const estado = calcularEstado(config, lancs, vigia, agora);
  await atualizar<EstadoDoTelao>("telao", () => estado, () => estado);
  memoria = { estado, em: Date.now() };

  const avisos = avisosEntre(anterior.dados && !velho(anterior.dados, agora) ? anterior.dados : null, estado, config.whatsapp);
  await dispararAvisos(avisos, config.whatsapp.destino, enviarAviso).catch((e) => console.error("[arena:avisos]", (e as Error).message));
  return estado;
}

export async function estadoDoTelao(): Promise<EstadoDoTelao | null> {
  if (memoria && Date.now() - memoria.em < validadeMs() && !velho(memoria.estado)) return memoria.estado;
  try {
    const { dados } = await ler<EstadoDoTelao>("telao");
    if (!dados || velho(dados)) return await reconstruirTelao();
    let estado = dados;
    if (tipoDaGaveta() === "blob") {
      // O vigia anota de 10 em 10 minutos sem refazer a corrida: lê à parte.
      const v = await lerVigia().catch(() => null);
      if (v?.ultimaVez) estado = { ...dados, vigiaUltimaVez: v.ultimaVez };
    }
    memoria = { estado, em: Date.now() };
    return estado;
  } catch (e) {
    console.error("[arena:estado]", (e as Error).message);
    return memoria?.estado ?? null;
  }
}

/** Para o painel: último erro dos avisos. */
export { lerAvisos };
