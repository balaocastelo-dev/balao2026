/**
 * MAR.IA — analista da loja.
 *
 * Dois relatórios por dia no WhatsApp do Thiago:
 *   07:00  como está o setor (venda, movimento, margem, procura sem resposta)
 *   19:00  fechamento do dia (faturamento, clientes, vendedores)
 *
 * Este arquivo NÃO calcula nada. Ele sabe a hora e sabe o número; a apuração
 * mora no site (/api/rafa/relatorio), que é onde estão o banco e as chaves do
 * Bling. Worker que apura é worker que precisa de credencial de banco numa
 * VPS — e a VPS é a máquina mais exposta do conjunto.
 *
 * Roda na instância PRINCIPAL (número da loja): o relatório vai para o Thiago
 * pelo número que ele já conhece. A VITOR.IA tem número próprio e não manda nada
 * disso.
 */

const RAFA_URL = (process.env.RAFA_URL || process.env.BETO_URL || "https://www.balao.info").replace(/\/$/, "");
const RAFA_TOKEN = process.env.BETO_TOKEN || "";
const DESTINO = String(process.env.RAFA_WHATSAPP || "").replace(/\D/g, "");

const HORA_MANHA = Number(process.env.RAFA_HORA_MANHA) || 7;
const HORA_NOITE = Number(process.env.RAFA_HORA_NOITE) || 19;

// Verifica de minuto em minuto. Barato, e evita depender de um agendador
// externo que a VPS não tem.
const LOOP_MS = 60_000;

// Fuso fixo. O container roda em UTC; sem isto o relatório das 7h chegaria
// às 4h da manhã.
const FUSO = process.env.RAFA_FUSO || "America/Sao_Paulo";

const estado = {
  ativo: process.env.RAFA_ATIVO === "1",
  // Marca "AAAA-MM-DD:manha" / ":noite" do que já foi mandado. É o que impede
  // o relatório de sair 60 vezes durante a hora cheia.
  ultimoEnvio: { manha: "", noite: "" },
  ultimaAcao: null,
  ultimoErro: null,
};

let deps = null;
let emVoo = false;

/** Data e hora locais da loja, não do servidor. */
function agoraLocal() {
  const f = new Intl.DateTimeFormat("sv-SE", {
    timeZone: FUSO,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  // sv-SE formata como "2026-09-14 07:03" — ordenável e fácil de fatiar.
  const texto = f.format(new Date()).replace(" ", "T");
  return { dia: texto.slice(0, 10), hora: Number(texto.slice(11, 13)) };
}

async function buscarRelatorio(tipo) {
  const resposta = await fetch(`${RAFA_URL}/api/rafa/relatorio?tipo=${tipo}`, {
    headers: { Authorization: `Bearer ${RAFA_TOKEN}` },
    signal: AbortSignal.timeout(60_000),
  });
  if (!resposta.ok) {
    throw new Error(`site respondeu ${resposta.status}`);
  }
  const dados = await resposta.json();
  if (!dados?.ok || !dados.texto) throw new Error("site não devolveu texto");
  return dados.texto;
}

async function mandar(tipo) {
  if (!DESTINO) {
    estado.ultimoErro = "RAFA_WHATSAPP não configurado";
    return false;
  }
  if (!RAFA_TOKEN) {
    estado.ultimoErro = "BETO_TOKEN não configurado";
    return false;
  }
  if (!deps.whatsappConectado()) {
    // Não marca como enviado: tenta de novo no minuto seguinte, dentro da
    // mesma hora. Relatório perdido por queda de conexão é relatório perdido.
    estado.ultimoErro = "WhatsApp desconectado";
    return false;
  }

  const texto = await buscarRelatorio(tipo);
  await deps.sendDirectMessage({
    number: DESTINO,
    text: texto,
    chatId: null,
    signatureId: null,
    autorId: "rafa",
  });

  estado.ultimaAcao = `${tipo} enviado ${new Date().toISOString()}`;
  estado.ultimoErro = null;
  return true;
}

async function loop() {
  if (emVoo) return setTimeout(loop, LOOP_MS);
  emVoo = true;

  try {
    if (estado.ativo && deps) {
      const { dia, hora } = agoraLocal();

      const pendentes = [];
      if (hora === HORA_MANHA && estado.ultimoEnvio.manha !== dia) pendentes.push(["manha", "manha"]);
      if (hora === HORA_NOITE && estado.ultimoEnvio.noite !== dia) pendentes.push(["fechamento", "noite"]);

      for (const [tipo, chave] of pendentes) {
        try {
          if (await mandar(tipo)) {
            estado.ultimoEnvio[chave] = dia;
            persistir();
          }
        } catch (erro) {
          estado.ultimoErro = `${tipo}: ${erro.message}`;
          console.error("[rafa]", estado.ultimoErro);
        }
      }
    }
  } finally {
    emVoo = false;
    setTimeout(loop, LOOP_MS);
  }
}

function persistir() {
  if (!deps) return;
  deps.store.rafa = {
    ativo: estado.ativo,
    ultimoEnvio: estado.ultimoEnvio,
  };
  deps.persistStore();
}

function iniciar(d) {
  deps = d;
  if (deps.store && deps.store.rafa) {
    estado.ativo = Boolean(deps.store.rafa.ativo);
    estado.ultimoEnvio = deps.store.rafa.ultimoEnvio || estado.ultimoEnvio;
  }
  setTimeout(loop, 15_000);
}

function resumo() {
  const { dia, hora } = agoraLocal();
  return {
    ativo: estado.ativo,
    horaManha: HORA_MANHA,
    horaNoite: HORA_NOITE,
    fuso: FUSO,
    agoraNaLoja: `${dia} ${String(hora).padStart(2, "0")}h`,
    destinoConfigurado: Boolean(DESTINO),
    tokenConfigurado: Boolean(RAFA_TOKEN),
    ultimoEnvio: estado.ultimoEnvio,
    ultimaAcao: estado.ultimaAcao,
    ultimoErro: estado.ultimoErro,
  };
}

function definirConfig({ ativo }) {
  if (typeof ativo === "boolean" && ativo !== estado.ativo) {
    estado.ativo = ativo;
    persistir();
    if (deps) deps.emitToast(`MAR.IA: ${ativo ? "ligado" : "desligado"}`);
  }
  return resumo();
}

/** Manda um relatório agora, fora do horário. Serve para testar. */
async function enviarAgora(tipo) {
  try {
    const ok = await mandar(tipo === "fechamento" ? "fechamento" : "manha");
    return { ok, ...resumo() };
  } catch (erro) {
    estado.ultimoErro = erro.message;
    return { ok: false, erro: erro.message, ...resumo() };
  }
}

module.exports = { iniciar, resumo, definirConfig, enviarAgora, agoraLocal };
