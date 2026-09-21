// Regras de recorrência dos Status agendados.
//
// Uma regra é um objeto JSON guardado no banco. Os tipos de hoje:
//   { tipo: "unica",      data: "2026-09-22", hora: "09:00" }
//   { tipo: "diaria",     horarios: ["08:00"] }
//   { tipo: "semanal",    dias: [1, 3], horarios: ["08:00", "18:00"] }   (0 = domingo)
//   { tipo: "dias_uteis", horarios: ["08:30"] }
// Todas as recorrentes aceitam `inicio` e `fim` ("AAAA-MM-DD", opcionais).
//
// Para criar um tipo novo (mensal, datas comemorativas…) basta ensinar
// `diasQueValem` a reconhecê-lo — o agendador só pergunta "qual a próxima
// ocorrência depois de X?" e não conhece os tipos.
//
// Os horários são sempre no fuso da loja (America/Sao_Paulo).

const FUSO = "America/Sao_Paulo";
const DIA_MS = 24 * 3600_000;
const NOMES_DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const reHora = /^([01]\d|2[0-3]):[0-5]\d$/;
const reData = /^\d{4}-\d{2}-\d{2}$/;

/** Diferença (ms) entre o relógio de São Paulo e UTC num instante. */
function deslocamento(ms) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: FUSO,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(ms))
      .map((p) => [p.type, p.value])
  );
  const comoUtc = Date.UTC(+partes.year, +partes.month - 1, +partes.day, +partes.hour, +partes.minute, +partes.second);
  return comoUtc - Math.floor(ms / 1000) * 1000;
}

/** "2026-09-22" + "08:00" no horário da loja -> instante (ms UTC). */
function instante(data, hora) {
  const [a, m, d] = data.split("-").map(Number);
  const [h, min] = hora.split(":").map(Number);
  const ingenuo = Date.UTC(a, m - 1, d, h, min);
  let ms = ingenuo - deslocamento(ingenuo);
  // Segunda passada acerta dias de troca de horário (se o Brasil voltar a ter).
  ms = ingenuo - deslocamento(ms);
  return ms;
}

/** Data local da loja ("AAAA-MM-DD") e dia da semana de um instante. */
function dataLocal(ms) {
  const d = new Date(ms + deslocamento(ms));
  const texto = d.toISOString().slice(0, 10);
  return { data: texto, diaSemana: d.getUTCDay() };
}

function somarDias(data, n) {
  const [a, m, d] = data.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d) + n * DIA_MS).toISOString().slice(0, 10);
}

function diaDaSemana(data) {
  const [a, m, d] = data.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}

function horariosOrdenados(regra) {
  return [...new Set(regra.horarios || [])].sort();
}

function validarRegra(regra) {
  if (!regra || typeof regra !== "object") throw new Error("Recorrência não informada.");
  const { tipo } = regra;
  if (tipo === "unica") {
    if (!reData.test(regra.data || "")) throw new Error("Data da publicação inválida.");
    if (!reHora.test(regra.hora || "")) throw new Error("Horário inválido (use HH:MM).");
    return { tipo, data: regra.data, hora: regra.hora };
  }
  if (!["diaria", "semanal", "dias_uteis"].includes(tipo)) throw new Error(`Recorrência "${tipo}" não existe.`);
  const horarios = horariosOrdenados(regra);
  if (!horarios.length) throw new Error("Escolha pelo menos um horário.");
  if (horarios.some((h) => !reHora.test(h))) throw new Error("Horário inválido (use HH:MM).");
  if (horarios.length > 12) throw new Error("No máximo 12 horários por dia.");
  const limpa = { tipo, horarios };
  if (tipo === "semanal") {
    const dias = [...new Set((regra.dias || []).map(Number))].filter((d) => d >= 0 && d <= 6).sort();
    if (!dias.length) throw new Error("Escolha pelo menos um dia da semana.");
    limpa.dias = dias;
  }
  if (regra.inicio) {
    if (!reData.test(regra.inicio)) throw new Error("Data de início inválida.");
    limpa.inicio = regra.inicio;
  }
  if (regra.fim) {
    if (!reData.test(regra.fim)) throw new Error("Data de fim inválida.");
    if (limpa.inicio && regra.fim < limpa.inicio) throw new Error("O fim vem antes do início.");
    limpa.fim = regra.fim;
  }
  return limpa;
}

/** Se a regra vale num dia (data local da loja). */
function diaQueVale(regra, data) {
  if (regra.inicio && data < regra.inicio) return false;
  if (regra.fim && data > regra.fim) return false;
  const dia = diaDaSemana(data);
  if (regra.tipo === "diaria") return true;
  if (regra.tipo === "dias_uteis") return dia >= 1 && dia <= 5;
  if (regra.tipo === "semanal") return regra.dias.includes(dia);
  return false;
}

/** Todas as ocorrências entre dois instantes (inclui `de`, exclui `ate`). */
function ocorrencias(regraBruta, de, ate, limite = 2000) {
  const regra = validarRegra(regraBruta);
  if (regra.tipo === "unica") {
    const t = instante(regra.data, regra.hora);
    return t >= de && t < ate ? [t] : [];
  }
  const saida = [];
  let data = dataLocal(de).data;
  const ultimo = dataLocal(ate).data;
  while (data <= ultimo && saida.length < limite) {
    if (diaQueVale(regra, data)) {
      for (const h of regra.horarios) {
        const t = instante(data, h);
        if (t >= de && t < ate) saida.push(t);
      }
    }
    if (regra.fim && data >= regra.fim) break;
    data = somarDias(data, 1);
  }
  return saida;
}

/** Próxima ocorrência estritamente depois de `depoisDe` (ou null). */
function proxima(regra, depoisDe) {
  const lista = ocorrencias(regra, depoisDe + 1, depoisDe + 400 * DIA_MS, 1);
  return lista.length ? lista[0] : null;
}

function descrever(regraBruta) {
  let regra;
  try {
    regra = validarRegra(regraBruta);
  } catch {
    return "Recorrência inválida";
  }
  const horas = (regra.horarios || []).join(", ");
  let texto;
  if (regra.tipo === "unica") {
    const [a, m, d] = regra.data.split("-");
    return `Uma vez, ${d}/${m}/${a} às ${regra.hora}`;
  }
  if (regra.tipo === "diaria") texto = `Todo dia às ${horas}`;
  else if (regra.tipo === "dias_uteis") texto = `Dias úteis (seg a sex) às ${horas}`;
  else texto = `Toda ${regra.dias.map((d) => NOMES_DIAS[d]).join(", ")} às ${horas}`;
  if (regra.fim) {
    const [a, m, d] = regra.fim.split("-");
    texto += `, até ${d}/${m}/${a}`;
  }
  return texto;
}

module.exports = { validarRegra, ocorrencias, proxima, descrever, instante, dataLocal, somarDias, FUSO };
