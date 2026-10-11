// Quando recarregar a lista de conversas — e quanto dela.
//
// O servidor pedia à Evolution a lista INTEIRA (findChats de 12.754 conversas,
// até 120 s, um DISTINCT ON sobre todas as mensagens) a cada 5 minutos, o dia
// inteiro, para pegar o que o webhook deixasse escapar. Era o maior peso no
// Postgres da Evolution, que é o mesmo que grava cada mensagem que chega.
//
// Agora:
//   - lista inteira só no boot e uma vez de madrugada (03h30 em São Paulo);
//   - no resto do dia, a conversa que mudou chega sozinha (CHATS_UPSERT /
//     CHATS_UPDATE da Evolution) e só ela é relida;
//   - e, como rede de segurança barata, a cada 5 minutos um findChats com a
//     janela de tempo que a 2.3.7 aceita (where.messageTimestamp.gte/lte) —
//     só a última hora, que com os índices custa ~1 ms.
//
// Tudo aqui é função pura (sem rede, sem relógio próprio), para dar para
// testar a madrugada de domingo numa terça à tarde.

const FUSO = "America/Sao_Paulo";

/** Partes da data/hora no fuso (ano, mes, dia, hora, minuto). */
function partesNoFuso(ms, fuso = FUSO) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: fuso,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const p = Object.fromEntries(f.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { ano: +p.year, mes: +p.month, dia: +p.day, hora: +p.hour % 24, minuto: +p.minute, segundo: +p.second };
}

/** Diferença (ms) entre o relógio do fuso e o UTC naquele instante. */
function deslocamento(ms, fuso = FUSO) {
  const p = partesNoFuso(ms, fuso);
  const comoUtc = Date.UTC(p.ano, p.mes - 1, p.dia, p.hora, p.minuto, p.segundo);
  return comoUtc - Math.floor(ms / 1000) * 1000;
}

/**
 * Próximo instante em que o relógio de São Paulo marca HH:MM, depois de
 * `agora`. Não supõe fuso fixo: o Brasil não tem horário de verão desde 2019,
 * mas se voltar a ter, a conta continua certa.
 */
function proximaRecargaCompleta(agora, { hora = 3, minuto = 30, fuso = FUSO } = {}) {
  const p = partesNoFuso(agora, fuso);
  for (let somaDias = 0; somaDias <= 2; somaDias++) {
    // Meio-dia UTC do dia candidato: longe da virada, para o deslocamento valer.
    const base = Date.UTC(p.ano, p.mes - 1, p.dia + somaDias, 12, 0, 0);
    const desejadoNoFuso = Date.UTC(p.ano, p.mes - 1, p.dia + somaDias, hora, minuto, 0);
    const alvo = desejadoNoFuso - deslocamento(base, fuso);
    if (alvo > agora) return alvo;
  }
  return agora + 24 * 3600_000; // inalcançável; só para nunca devolver passado
}

/** "03:30" -> { hora: 3, minuto: 30 }. Valor estranho volta para 03:30. */
function lerHorario(texto, padrao = { hora: 3, minuto: 30 }) {
  const m = String(texto || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return padrao;
  const hora = Number(m[1]);
  const minuto = Number(m[2]);
  return hora < 24 && minuto < 60 ? { hora, minuto } : padrao;
}

/**
 * Filtro de janela de tempo da Evolution 2.3.7 para findChats e findMessages.
 * Ela só aplica o filtro quando vêm OS DOIS lados (gte e lte), e converte com
 * new Date(...): por isso vão como texto ISO. O lte fica um pouco no futuro
 * para não perder mensagem de relógio adiantado.
 */
function filtroDeJanela(agora, duracaoMs, { folgaFuturoMs = 5 * 60_000 } = {}) {
  return {
    messageTimestamp: {
      gte: new Date(agora - duracaoMs).toISOString(),
      lte: new Date(agora + folgaFuturoMs).toISOString(),
    },
  };
}

module.exports = { proximaRecargaCompleta, lerHorario, filtroDeJanela, partesNoFuso, FUSO };
