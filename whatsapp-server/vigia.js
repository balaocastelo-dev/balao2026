// Vigia de recebimento
// ------------------------------------------------------------------
// Em 29/09 às 18:08 uma mensagem de "Meta Business Agent" travou a fila de
// nós offline do Baileys. A partir dali, NADA que o cliente escrevia chegava —
// e enviar continuava funcionando, porque sai por outro caminho. O WhatsApp
// dizia "conectado", o painel dizia "conectado", o /health dizia "conectado".
// Ficou assim por dois dias e ninguém percebeu.
//
// Este arquivo existe para isso não se repetir. A pergunta que ele responde
// não é "está conectado?" — essa já era respondida, e errado. É:
//
//     "faz tempo demais que ninguém escreve, PARA ESTA LOJA, NESTE HORÁRIO?"
//
// O "para esta loja, neste horário" é o que separa um alarme útil de um
// despertador tocando de madrugada. Em vez de um número chutado ("avise com
// 2 horas de silêncio"), o vigia aprende o ritmo da própria loja: quantas
// mensagens entram, em média, na terça às 15h, no sábado às 11h, no domingo
// às 4h da manhã. Domingo de madrugada o normal é zero, então silêncio ali
// não é notícia. Terça às 15h o normal são dezenas — e meia hora de silêncio
// já é estranho.
//
// Nada aqui faz entrada e saída: sem rede, sem relógio próprio, sem banco.
// Recebe o agora e a base de ritmo, devolve um parecer. É o que permite
// testar dois dias de silêncio em milissegundos.

const FUSO = "America/Sao_Paulo";

/** Dia da semana (0=domingo) e hora cheia, no fuso da loja. */
function fatiaDoRelogio(ms, fuso = FUSO) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: fuso,
    weekday: "short",
    hour: "2-digit",
    hour12: false,
  });
  const partes = Object.fromEntries(f.formatToParts(new Date(ms)).map((p) => [p.type, p.value]));
  const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { dow: dias[partes.weekday], hora: Number(partes.hour) % 24 };
}

/** As fatias de hora que a janela [inicio, fim] atravessa. */
function fatiasDaJanela(inicio, fim, fuso = FUSO) {
  const saida = [];
  const vistas = new Set();
  // De hora em hora, mais a ponta final — uma janela de 90 min cruza 2 ou 3.
  for (let t = inicio; t <= fim; t += 3600_000) {
    const f = fatiaDoRelogio(t, fuso);
    const chave = `${f.dow}:${f.hora}`;
    if (!vistas.has(chave)) {
      vistas.add(chave);
      saida.push(f);
    }
  }
  const ultima = fatiaDoRelogio(fim, fuso);
  if (!vistas.has(`${ultima.dow}:${ultima.hora}`)) saida.push(ultima);
  return saida;
}

/**
 * Quantas mensagens ENTRAM, normalmente, nesta fatia do dia?
 * base: { "2:15": 34, "0:4": 0, ... }  (dow:hora -> mediana de mensagens/hora)
 */
function normalDaFatia(base, { dow, hora }) {
  const v = base?.[`${dow}:${hora}`];
  return Number.isFinite(v) ? v : null;
}

/**
 * O parecer do vigia.
 *
 * Só acusa quando TODAS as fatias atravessadas pela janela são movimentadas.
 * Se a janela pega as 18h (movimentada) e as 19h (loja fechada, normal zero),
 * não acusa: o silêncio tem explicação. Essa é a regra que impede o alarme de
 * tocar no fim do expediente, no almoço de sábado e em feriado à noite.
 */
function avaliar({
  agora,
  ultimaEntradaEm,          // ms da última mensagem que ENTROU (de cliente)
  base,                     // ritmo aprendido; null = ainda sem base
  silencioMin = 45,         // silêncio que levanta suspeita
  escalaMin = 45,           // mais este tanto sem nada = alarme
  minimoDaFatia = 2,        // abaixo disso a fatia é "parada" e não vale alarme
  fuso = FUSO,
  desde = null,             // ms do boot: sem base de tempo não dá para julgar
}) {
  const sem = (estado, motivo) => ({ estado, motivo, silencioMin: null });

  if (!base || Object.keys(base).length === 0) return sem("sem-base", "ainda aprendendo o ritmo da loja");

  const ultima = Number(ultimaEntradaEm) || 0;
  // Sem nenhuma entrada desde que o servidor subiu, conta-se a partir do boot:
  // senão um servidor recém-ligado acusaria "dois dias de silêncio".
  const referencia = ultima || Number(desde) || 0;
  if (!referencia) return sem("sem-base", "sem referência de tempo");

  // Exato para comparar, arredondado para mostrar. A bancada usa limites
  // fracionários (0,2 min = 12 s) para rodar um apagão em segundos; se o
  // arredondamento entrasse na comparação, nada nunca passaria do zero.
  const paradoExato = (agora - referencia) / 60_000;
  const paradoMin = Math.floor(paradoExato);
  if (paradoExato < silencioMin) return { estado: "ok", motivo: null, silencioMin: paradoMin };

  // ATENÇÃO: a janela analisada é a RECENTE, não o vão inteiro desde a última
  // mensagem. Um apagão de dois dias atravessa várias madrugadas, e madrugada
  // é fatia parada — se olhássemos o vão todo, o apagão de 29/09 a 01/10 seria
  // classificado como "silêncio esperado" e o alarme nunca tocaria. O que
  // interessa é: nas últimas horas de movimento, entrou alguma coisa?
  const janelaMin = Math.min(paradoExato, silencioMin + escalaMin);
  const fatias = fatiasDaJanela(agora - janelaMin * 60_000, agora, fuso);
  const normais = fatias.map((f) => ({ ...f, normal: normalDaFatia(base, f) }));
  const desconhecida = normais.find((f) => f.normal === null);
  if (desconhecida) return { estado: "ok", motivo: "faixa de horário sem histórico", silencioMin: paradoMin };

  const parada = normais.find((f) => f.normal < minimoDaFatia);
  if (parada) {
    return {
      estado: "ok",
      motivo: `silêncio esperado (${diaDaSemana(parada.dow)} ${String(parada.hora).padStart(2, "0")}h costuma ter ${parada.normal})`,
      silencioMin: paradoMin,
    };
  }

  // Num alarme, o número mostrado nunca pode ser 0: "nenhuma mensagem nos
  // últimos 0 minutos" não quer dizer nada para quem está lendo com pressa.
  const paraMostrar = Math.max(1, Math.round(paradoExato));
  const esperadas = normais.reduce((s, f) => s + f.normal, 0);
  const detalhe =
    `${paraMostrar} min sem nenhuma mensagem entrar; ` +
    `neste pedaço do dia costumam entrar ~${Math.round(esperadas)}`;

  if (paradoExato >= silencioMin + escalaMin) return { estado: "surdo", motivo: detalhe, silencioMin: paraMostrar, esperadas };
  return { estado: "suspeita", motivo: detalhe, silencioMin: paraMostrar, esperadas };
}

function diaDaSemana(d) {
  return ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][d] || "?";
}

/**
 * O vigia em si: guarda o estado entre uma olhada e outra, decide quando
 * tentar se curar sozinho e quando gritar — e, principalmente, NÃO repete o
 * mesmo grito a cada ciclo. Um alarme que toca de dez em dez minutos vira
 * paisagem, e paisagem ninguém vê.
 */
function criarVigia({
  relogio = () => Date.now(),
  silencioMin = Number(process.env.VIGIA_SILENCIO_MIN || 45),
  escalaMin = Number(process.env.VIGIA_ESCALA_MIN || 45),
  minimoDaFatia = Number(process.env.VIGIA_MINIMO_FATIA || 2),
  repetirAlarmeMin = Number(process.env.VIGIA_REPETIR_MIN || 60),
  curaCadaMin = Number(process.env.VIGIA_CURA_CADA_MIN || 15),
  fuso = FUSO,
  tentarCurar = async () => {},
  avisar = async () => {},
  registrar = console.warn,
} = {}) {
  const desde = relogio();
  let base = null;
  let baseEm = null;
  let estadoAtual = "ok";
  let desdeQuando = null;
  let ultimoAviso = 0;
  let ultimaCura = 0;
  // Qual era a última entrada quando o alarme começou. Serve para uma coisa
  // só, e importante: depois que o vigia acusa surdez às 15h, chega as 19h e a
  // loja fecha — a fatia vira "parada" e o parecer solto diria "ok". Sem esta
  // marca, o vigia mandaria um "voltou a funcionar" todo fim de tarde, com o
  // sistema ainda surdo. Só mensagem NOVA desarma o alarme.
  let entradaDoAlarme = null;
  let curas = 0;
  let alarmes = 0;
  let ultimoParecer = { estado: "ok", motivo: null, silencioMin: 0 };

  function aprender(novaBase) {
    if (novaBase && Object.keys(novaBase).length) {
      base = novaBase;
      baseEm = new Date(relogio()).toISOString();
    }
  }

  async function olhar(ultimaEntradaEm) {
    const agora = relogio();
    const p = avaliar({ agora, ultimaEntradaEm, base, silencioMin, escalaMin, minimoDaFatia, fuso, desde });
    ultimoParecer = p;
    const antes = estadoAtual;

    if (p.estado === "ok" || p.estado === "sem-base") {
      if (antes === "surdo" || antes === "suspeita") {
        const entrouCoisaNova = Number(ultimaEntradaEm) > Number(entradaDoAlarme || 0);
        if (!entrouCoisaNova) {
          // O relógio mudou de fatia, a mensagem não chegou. Continua surdo.
          ultimoParecer = { ...p, estado: antes, motivo: `${p.motivo || "fora do horário de movimento"} — mas nada entrou desde ${new Date(Number(entradaDoAlarme) || agora).toISOString()}` };
          return ultimoParecer;
        }
        estadoAtual = "ok";
        desdeQuando = null;
        ultimoAviso = 0;
        entradaDoAlarme = null;
        registrar("[vigia] Voltou a entrar mensagem.");
        if (antes === "surdo") await Promise.resolve(avisar({ tipo: "voltou", parecer: p })).catch(() => {});
      }
      estadoAtual = p.estado === "sem-base" ? "sem-base" : "ok";
      return p;
    }

    if (antes !== p.estado) desdeQuando = new Date(agora).toISOString();
    if (antes === "ok" || antes === "sem-base") entradaDoAlarme = Number(ultimaEntradaEm) || 0;
    estadoAtual = p.estado;

    // Suspeita: tenta se curar em silêncio. Pode ser só o webhook que caiu —
    // isso o servidor conserta sozinho, sem acordar ninguém.
    if (p.estado === "suspeita") {
      // Conferir webhook e reler 120 mensagens não é de graça: a Evolution e o
      // Postgres moram no mesmo container pequeno. Tentar isso a cada 5 minutos
      // durante uma suspeita longa castiga justamente o sistema que se quer
      // salvar. Uma tentativa por intervalo de cura, e basta.
      if (agora - ultimaCura < curaCadaMin * 60_000) return p;
      ultimaCura = agora;
      curas++;
      await Promise.resolve(tentarCurar(p)).catch((e) => registrar("[vigia] cura falhou:", e?.message));
      return p;
    }

    // Surdo: agora grita. Mas só uma vez por hora, senão vira paisagem.
    if (agora - ultimoAviso >= repetirAlarmeMin * 60_000) {
      ultimoAviso = agora;
      alarmes++;
      registrar(`[vigia] ALARME: ${p.motivo}`);
      await Promise.resolve(avisar({ tipo: "surdo", parecer: p })).catch((e) =>
        registrar("[vigia] aviso falhou:", e?.message)
      );
    }
    return p;
  }

  return {
    olhar,
    aprender,
    get estado() {
      return {
        estado: estadoAtual,
        motivo: ultimoParecer.motivo,
        silencioMin: ultimoParecer.silencioMin,
        desdeQuando,
        base: base ? { fatias: Object.keys(base).length, em: baseEm } : null,
        curas,
        alarmes,
        limites: { silencioMin, escalaMin, minimoDaFatia, repetirAlarmeMin, curaCadaMin },
      };
    },
  };
}

module.exports = { criarVigia, avaliar, fatiasDaJanela, fatiaDoRelogio, diaDaSemana };
