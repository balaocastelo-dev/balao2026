// Regras do disparo por tema que não dependem de banco nem de rede:
// horário comercial no fuso de São Paulo, intervalo entre envios e o texto
// que chega ao cliente. Tudo função pura, para dar para testar com relógio
// falso (crm/campanha-regras.test.js).
//
// O horário é SEMPRE o de São Paulo, calculado pelo Intl — nunca o relógio do
// container. Hoje o Dockerfile.evo põe TZ=America/Sao_Paulo, mas basta um
// container subir em UTC para "9h" virar 6h da manhã para o cliente.

const FUSO = "America/Sao_Paulo";
const WHATSAPP_DA_LOJA = "5519987510267";
const LINK_WHATSAPP = `https://wa.me/${WHATSAPP_DA_LOJA}`;
const LINHA_SAIR = "Para não receber mais, responda SAIR.";
// Os dois números do Thiago. O "enviar teste" não aceita nenhum outro.
const NUMEROS_DE_TESTE = Object.freeze(["5519987510267", "5519984515960"]);

// Segunda (1) a sábado (6), das 9h às 18h.
const JANELA_PADRAO = Object.freeze({ dias: Object.freeze([1, 2, 3, 4, 5, 6]), inicio: 9, fim: 18, sempreAberta: false });
const TETO_PADRAO = 100;
const TETO_MAXIMO = 500;
const INTERVALO_PADRAO = Object.freeze({ minMs: 40_000, maxMs: 120_000 });
const VARIAVEIS = Object.freeze(["nome", "whatsapp"]);
const DIA_MS = 24 * 60 * 60 * 1000;

const DIAS_DA_SEMANA = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const formatador = new Intl.DateTimeFormat("en-US", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  weekday: "short",
  hourCycle: "h23",
});

/** Data e hora de São Paulo para um instante (ms). diaSemana: 0 = domingo. */
function partesEmSP(ms) {
  const p = {};
  for (const x of formatador.formatToParts(new Date(ms))) p[x.type] = x.value;
  return {
    ano: Number(p.year),
    mes: Number(p.month),
    dia: Number(p.day),
    hora: Number(p.hour) % 24,
    minuto: Number(p.minute),
    segundo: Number(p.second),
    diaSemana: DIAS_DA_SEMANA.indexOf(p.weekday),
  };
}

/** Diferença de São Paulo para UTC naquele instante, em minutos (ex.: -180). */
function deslocamentoMin(ms) {
  const p = partesEmSP(ms);
  const comoUTC = Date.UTC(p.ano, p.mes - 1, p.dia, p.hora, p.minuto, p.segundo);
  return Math.round((comoUTC - Math.floor(ms / 1000) * 1000) / 60_000);
}

/** O instante (ms) em que é `hora:minuto` do dia `ano-mes-dia` em São Paulo. */
function instanteEmSP(ano, mes, dia, hora = 0, minuto = 0) {
  const ingenuo = Date.UTC(ano, mes - 1, dia, hora, minuto);
  const primeiro = ingenuo - deslocamentoMin(ingenuo) * 60_000;
  // Confere no instante achado (horário de verão, se um dia voltar).
  return ingenuo - deslocamentoMin(primeiro) * 60_000;
}

/** Soma dias a uma data de calendário (sem fuso no meio). */
function somarDias({ ano, mes, dia }, n) {
  const d = new Date(Date.UTC(ano, mes - 1, dia + n));
  return { ano: d.getUTCFullYear(), mes: d.getUTCMonth() + 1, dia: d.getUTCDate() };
}

function inicioDoDia(ms) {
  const p = partesEmSP(ms);
  return instanteEmSP(p.ano, p.mes, p.dia, 0);
}

function inicioDoProximoDia(ms) {
  const d = somarDias(partesEmSP(ms), 1);
  return instanteEmSP(d.ano, d.mes, d.dia, 0);
}

function janelaAberta(ms, janela = JANELA_PADRAO) {
  if (janela.sempreAberta) return true;
  const p = partesEmSP(ms);
  return janela.dias.includes(p.diaSemana) && p.hora >= janela.inicio && p.hora < janela.fim;
}

/** Quando a janela abre de novo (o próprio `ms` se ela já está aberta). */
function proximaAbertura(ms, janela = JANELA_PADRAO) {
  if (janelaAberta(ms, janela)) return ms;
  const hoje = partesEmSP(ms);
  for (let n = 0; n <= 8; n++) {
    const d = somarDias(hoje, n);
    const abre = instanteEmSP(d.ano, d.mes, d.dia, janela.inicio);
    if (abre <= ms) continue;
    if (janela.dias.includes(partesEmSP(abre).diaSemana)) return abre;
  }
  return ms + DIA_MS; // janela sem nenhum dia: tenta de novo amanhã
}

/** Espera entre um envio e outro: aleatória, entre min e max. */
function sortearIntervalo(intervalo = INTERVALO_PADRAO, aleatorio = Math.random) {
  const min = Math.max(0, Number(intervalo.minMs) || 0);
  const max = Math.max(min, Number(intervalo.maxMs) || min);
  return min + Math.floor(aleatorio() * (max - min + 1));
}

// ------------------------------------------------------------------
// Texto
// ------------------------------------------------------------------

// Palavras que aparecem no lugar do nome e não são nome de ninguém.
const NAO_E_NOME = new Set(["contato", "cliente", "loja", "voce", "você", "desconhecido", "whatsapp", "usuario", "usuário"]);

function capitalizar(palavra) {
  return palavra
    .split("-")
    .map((p) => (p ? p.charAt(0).toLocaleUpperCase("pt-BR") + p.slice(1).toLocaleLowerCase("pt-BR") : p))
    .join("-");
}

/**
 * Primeiro nome, com maiúscula ("JOÃO PEDRO" -> "João", "maria" -> "Maria").
 * Telefone, código interno do WhatsApp (@lid) ou "Contato" não são nome:
 * devolve "" e o texto sai sem o nome.
 */
function primeiroNome(nome) {
  const limpo = String(nome || "").normalize("NFC").trim();
  if (!limpo || limpo.includes("@")) return "";
  if (/^[\d\s()+\-.]+$/.test(limpo)) return "";
  const palavra = limpo
    .split(/\s+/)
    .map((p) => p.replace(/[^\p{L}'-]/gu, "").replace(/^[-']+|[-']+$/g, ""))
    .find((p) => p.replace(/[^\p{L}]/gu, "").length > 0);
  if (!palavra || palavra.replace(/[^\p{L}]/gu, "").length < 2) return "";
  if (NAO_E_NOME.has(palavra.toLocaleLowerCase("pt-BR"))) return "";
  return capitalizar(palavra);
}

/**
 * Tira o {nome} de um jeito que a frase continue natural:
 *   "Olá, {nome}!"          -> "Olá!"
 *   "Oi {nome}, tudo bem?"  -> "Oi, tudo bem?"
 *   "{nome}, temos novidade" -> "Temos novidade"
 */
function semNome(texto) {
  return texto
    .split("\n")
    .map((linha) => {
      let l = linha;
      const comeco = l.match(/^(\s*)\{nome\}[\s,!.:;-]*/i);
      if (comeco) {
        const resto = l.slice(comeco[0].length);
        l = comeco[1] + resto.charAt(0).toLocaleUpperCase("pt-BR") + resto.slice(1);
      }
      return l.replace(/[ \t]*,?[ \t]*\{nome\}/gi, "");
    })
    .join("\n");
}

function arrumarEspacos(texto) {
  return texto
    .split("\n")
    .map((l) => l.replace(/[ \t]{2,}/g, " ").replace(/[ \t]+([,!?.;:])/g, "$1").replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Acrescenta a linha do SAIR no fim, se o texto ainda não falar disso. */
function comLinhaDeSair(texto) {
  if (/responda\s*\*?\s*sair\b/i.test(texto)) return texto;
  return `${texto}\n\n${LINHA_SAIR}`;
}

/** O texto que chega ao cliente: variáveis trocadas e linha do SAIR no fim. */
function montarTexto(modelo, { nome } = {}) {
  let t = String(modelo || "").replace(/\r\n?/g, "\n");
  t = t.replace(/\{whatsapp\}/gi, LINK_WHATSAPP);
  const primeiro = primeiroNome(nome);
  t = primeiro ? t.replace(/\{nome\}/gi, primeiro) : semNome(t);
  return comLinhaDeSair(arrumarEspacos(t));
}

function erro400(mensagem) {
  return Object.assign(new Error(mensagem), { status: 400 });
}

/** Confere o texto antes de criar a campanha. Devolve o texto aparado. */
function conferirModelo(modelo) {
  const t = String(modelo || "").replace(/\r\n?/g, "\n").trim();
  if (!t) throw erro400("Escreva o texto da campanha.");
  if (t.length > 2000) throw erro400("Texto longo demais (máximo de 2.000 caracteres).");
  // Variável que ninguém troca chegaria ao cliente como "{promocao}".
  const desconhecida = [...t.matchAll(/\{([^{}\s]{1,30})\}/g)]
    .map((m) => m[1])
    .find((v) => !VARIAVEIS.includes(v.toLowerCase()));
  if (desconhecida) throw erro400(`A variável {${desconhecida}} não existe. Use só {nome} e {whatsapp}.`);
  return t;
}

module.exports = {
  FUSO,
  WHATSAPP_DA_LOJA,
  LINK_WHATSAPP,
  LINHA_SAIR,
  NUMEROS_DE_TESTE,
  JANELA_PADRAO,
  TETO_PADRAO,
  TETO_MAXIMO,
  INTERVALO_PADRAO,
  VARIAVEIS,
  DIA_MS,
  partesEmSP,
  deslocamentoMin,
  instanteEmSP,
  inicioDoDia,
  inicioDoProximoDia,
  janelaAberta,
  proximaAbertura,
  sortearIntervalo,
  primeiroNome,
  semNome,
  montarTexto,
  comLinhaDeSair,
  conferirModelo,
};
