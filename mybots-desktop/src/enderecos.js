/**
 * Endereços que a janela do MyBots pode abrir.
 * O instalador não carrega segredo nenhum: só o painel público.
 */

const URL_PAINEL = "https://www.soubots.com/app";

const SUFIXOS_PROPRIOS = ["soubots.com", "balao.info"];
const SUFIXOS_LOGIN = [
  "google.com",
  "google.com.br",
  "gstatic.com",
  "googleusercontent.com",
  "googleapis.com",
];

function hostDe(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return "";
  }
}

function casaCom(host, sufixo) {
  return host === sufixo || host.endsWith(`.${sufixo}`);
}

/** Login do Google e o próprio site ficam na janela. O resto abre no navegador. */
function podeFicarNaJanela(url) {
  if (url === "about:blank") return true;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
  const host = hostDe(url);
  if (!host) return false;
  if (SUFIXOS_PROPRIOS.some((sufixo) => casaCom(host, sufixo))) return true;
  if (SUFIXOS_LOGIN.some((sufixo) => casaCom(host, sufixo))) return true;
  return host === "accounts.youtube.com";
}

/** O Google recusa login se o agente contém Electron. */
function agenteSemElectron(agente) {
  return String(agente || "")
    .replace(/\sElectron\/\S+/g, "")
    .replace(/\smybots-desktop\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = {
  URL_PAINEL,
  podeFicarNaJanela,
  agenteSemElectron,
};
