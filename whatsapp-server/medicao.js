// Medição de latência: quanto tempo cada mensagem leva do WhatsApp à tela.
//
// Até aqui, "a mensagem demorou" era impressão. O /health dizia QUANDO foi a
// última mensagem, mas não QUANTO ela levou, nem por qual caminho chegou. E
// os caminhos são bem diferentes: o webhook é imediato; a varredura (que pega
// o que o webhook perdeu) roda de 20 em 20 segundos; o histórico (o que o
// celular sincroniza depois de ficar fora) pode trazer mensagem de horas.
// Medido em 11/10: 1.792 avisos por webhook contra 39 mensagens só pela
// varredura (~2%) — sem número por caminho, não dava para saber se esses 2%
// esperavam 20 segundos ou 20 minutos.
//
// Para cada mensagem NOVA, três marcas:
//   noWhatsapp  hora que o WhatsApp registrou (messageTimestamp, em segundos)
//   chegada     quando o servidor ficou sabendo dela
//   emitida     quando o servidor mandou para o painel
// e, por caminho, a mediana e o p95 das últimas 500 de:
//   ateChegar   chegada - noWhatsapp   (WhatsApp/Evolution/webhook)
//   ateEmitir   emitida - chegada      (o próprio servidor)
//   total       emitida - noWhatsapp   (o que o vendedor sente)
//
// Nenhum dado de cliente: só o id da mensagem fica guardado, e só até ela ser
// emitida; o resumo é feito apenas de números.
//
// O relógio do WhatsApp tem resolução de 1 segundo (messageTimestamp vem em
// segundos inteiros), então "ateChegar" de uma mensagem que chegou na hora
// fica entre 0 e ~1.000 ms. Valor negativo quer dizer relógio da VPS atrasado.

const CAMINHOS = ["webhook", "varredura", "historico"];

function percentil(ordenados, p) {
  if (!ordenados.length) return null;
  // Posição pelo método do vizinho mais próximo: p95 de 500 amostras é a 475ª.
  const i = Math.min(ordenados.length - 1, Math.max(0, Math.ceil((p / 100) * ordenados.length) - 1));
  return ordenados[i];
}

function resumir(valores) {
  const v = valores.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return { medianaMs: null, p95Ms: null };
  return { medianaMs: Math.round(percentil(v, 50)), p95Ms: Math.round(percentil(v, 95)) };
}

function criarMedicao({ tamanho = 500, limitePendentes = 5000, agora = () => Date.now() } = {}) {
  // Amostras por caminho, num anel de `tamanho` posições.
  const amostras = new Map(CAMINHOS.map((c) => [c, []]));
  // Mensagem que chegou e ainda não foi emitida: id -> { caminho, noWhatsapp, chegada }
  const pendentes = new Map();
  const totais = Object.fromEntries(CAMINHOS.map((c) => [c, 0]));

  /** O servidor ficou sabendo da mensagem. Só a PRIMEIRA chegada conta. */
  function chegou(id, { caminho, noWhatsapp, chegada = agora() }) {
    if (!id || !amostras.has(caminho) || pendentes.has(id)) return;
    if (pendentes.size >= limitePendentes) {
      // Mensagem que nunca foi emitida (oculta, descartada) não pode crescer
      // a memória para sempre: sai a mais velha.
      pendentes.delete(pendentes.keys().next().value);
    }
    pendentes.set(id, { caminho, noWhatsapp: Number(noWhatsapp) || null, chegada });
  }

  /** O servidor mandou a mensagem para o painel. Fecha a amostra, se houver. */
  function emitiu(id, emitida = agora()) {
    const p = pendentes.get(id);
    if (!p) return;
    pendentes.delete(id);
    const anel = amostras.get(p.caminho);
    anel.push({ noWhatsapp: p.noWhatsapp, chegada: p.chegada, emitida });
    if (anel.length > tamanho) anel.splice(0, anel.length - tamanho);
    totais[p.caminho]++;
  }

  /** Esquece uma mensagem que não vai ser emitida (ex.: conversa oculta). */
  function descartar(id) {
    pendentes.delete(id);
  }

  function resumo() {
    const saida = {};
    for (const [caminho, anel] of amostras) {
      saida[caminho] = {
        amostras: anel.length,
        desdeOBoot: totais[caminho],
        ateChegar: resumir(anel.map((a) => (a.noWhatsapp ? a.chegada - a.noWhatsapp : NaN))),
        ateEmitir: resumir(anel.map((a) => a.emitida - a.chegada)),
        total: resumir(anel.map((a) => (a.noWhatsapp ? a.emitida - a.noWhatsapp : NaN))),
      };
    }
    saida.aguardandoEmissao = pendentes.size;
    return saida;
  }

  return { chegou, emitiu, descartar, resumo };
}

module.exports = { criarMedicao, percentil, CAMINHOS };
