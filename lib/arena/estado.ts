// ============================================================
// Arena: o que o telão (/arena) recebe.
//
// O telão é público (fica na TV da loja, sem login), então daqui não sai nome
// de cliente nem valor em reais — só pilotos, pontos, metas e o prêmio.
//
// Guardado em cache por 30 s com a etiqueta "arena": o banco da Hostinger tem
// cota de conexões por hora, e várias telas abertas não podem virar várias
// consultas. Quando o vigia grava algo novo, a etiqueta é limpa na hora.
// ============================================================

import { createHash } from "crypto";
import { unstable_cache } from "next/cache";
import { janela, mesAnterior, semanaAnterior, somarDias } from "./periodos";
import { lancamentosEntre, lancamentosRecentes, lerAjustesDoTelao, listarPilotos, bancoAtivo } from "./banco";
import { indexarPilotos, montarPlacar, pilotoDoLancamento } from "./placar";
import type { EstadoDoTelao, Lancamento, Piloto, PlacarDoPeriodo } from "./tipos";

export const ETIQUETA_ARENA = "arena";

/** O vigia está vivo se falou com o site nos últimos 10 minutos. */
export function vigiaOnline(ultimaVez: string | null, agora = Date.now()) {
  return Boolean(ultimaVez && agora - Date.parse(ultimaVez) < 10 * 60_000);
}

function campeao(placar: PlacarDoPeriodo) {
  const porPontos = [...placar.linhas].sort((a, b) => b.pontos - a.pontos);
  const top = porPontos[0];
  return {
    rotulo: placar.rotulo,
    periodo: placar.periodo,
    campeao: top && top.pontos > 0 ? top.piloto.apelido || top.piloto.nome : null,
    foto: top && top.pontos > 0 ? top.piloto.foto : null,
    cor: top && top.pontos > 0 ? top.piloto.cor : null,
    pontos: top ? top.pontos : 0,
    chegaram: placar.linhas.filter((l) => l.chegou).length,
  };
}

/** Foto guardada como imagem no banco vira um endereço (o telão pergunta a cada 20 s). */
export function fotoPublica(p: Piloto): string | null {
  if (!p.foto) return null;
  if (!p.foto.startsWith("data:")) return p.foto;
  const v = createHash("sha1").update(p.foto).digest("hex").slice(0, 10);
  return `/api/arena/foto/${encodeURIComponent(p.id)}?v=${v}`;
}

export async function montarEstado(agora = new Date()): Promise<EstadoDoTelao> {
  const [crus, { corrida, premio, vigia }] = await Promise.all([listarPilotos(), lerAjustesDoTelao()]);
  const pilotos = crus.map((p) => ({ ...p, foto: fotoPublica(p) }));
  const semana = janela("semana", agora);
  const mes = janela("mes", agora);
  // Um pedaço de banco só: do começo do mais antigo (3 meses ou 4 semanas
  // atrás, para o hall da fama) até hoje.
  const antigas = [1, 2, 3, 4].map((n) => semanaAnterior(n, agora));
  const mesesAntigos = [1, 2, 3].map((n) => mesAnterior(n, agora));
  const desde = [mes.inicio, semana.inicio, ...antigas.map((j) => j.inicio), ...mesesAntigos.map((j) => j.inicio)].sort()[0];
  const ate = somarDias(mes.fim > semana.fim ? mes.fim : semana.fim, 0);
  const [lancs, recentes] = await Promise.all([lancamentosEntre(desde, ate, 20000), lancamentosRecentes(15)]);

  const placarSemana = montarPlacar(pilotos, lancs, semana, corrida);
  const placarMes = montarPlacar(pilotos, lancs, mes, corrida);
  const hall = [
    ...antigas.map((j) => campeao(montarPlacar(pilotos, lancs, j, corrida))),
    ...mesesAntigos.map((j) => campeao(montarPlacar(pilotos, lancs, j, corrida))),
  ].filter((h) => h.campeao);

  const { porBling, porId } = indexarPilotos(pilotos.filter((p) => p.ativo));
  return {
    titulo: corrida.titulo,
    periodoTelao: corrida.periodoTelao,
    som: corrida.som,
    semana: placarSemana,
    mes: placarMes,
    premio: premio.ativo && (premio.titulo || premio.imagem)
      ? { titulo: premio.titulo, link: premio.link, imagem: premio.imagem, local: premio.local, descricao: premio.descricao, periodo: premio.periodo }
      : null,
    recentes: recentes
      .map((l: Lancamento) => ({ l, p: pilotoDoLancamento(l, porBling, porId) as Piloto | null }))
      .filter((x) => x.p)
      .map(({ l, p }) => ({
        id: l.id,
        tipo: l.tipo,
        pilotoId: p!.id,
        pontos: l.pontos,
        licencas: l.licencas,
        conversao: Boolean(l.detalhe && l.detalhe.conversao > 0),
        registradoEm: l.registradoEm,
      })),
    hallDaFama: hall,
    vigiaOnline: vigiaOnline(vigia.ultimaVez, agora.getTime()),
    geradoEm: agora.toISOString(),
  };
}

const estadoEmCache = unstable_cache(async () => montarEstado(), ["arena-estado-v2"], {
  revalidate: 30,
  tags: [ETIQUETA_ARENA],
});

export async function estadoDoTelao(): Promise<EstadoDoTelao | null> {
  if (!bancoAtivo()) return null;
  try {
    return await estadoEmCache();
  } catch (e) {
    console.error("[arena:estado]", (e as Error).message);
    return null;
  }
}
