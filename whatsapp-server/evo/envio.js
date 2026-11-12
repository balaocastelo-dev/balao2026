// Envio de oferta do catálogo: o texto e a foto são mensagens diferentes.
// Se a foto falhar (400 na hora, ou ERROR no recibo), o texto já foi e não
// herda essa falha. A retentativa de número (400/ERROR) mora em normalizar.js
// e vale uma vez para cada uma.

const N = require("./normalizar");

function infoDoErro(erro) {
  if (!erro || typeof erro !== "object") return erro?.message || String(erro || "");
  return { status: erro.status, message: erro.message, resposta: erro.resposta };
}

/**
 * Manda o texto da oferta e, se houver imagem, a foto em seguida.
 * Devolve sempre o registro do TEXTO quando ele foi aceito. A foto recusada
 * vira `motivoSemFoto`, sem exceção e sem trocar o registro.
 */
async function enviarOferta({ destino, legenda, imagem, enviarTexto, enviarMidia, marcarFoto }) {
  const rec = await N.enviarComRetentativa(destino, enviarTexto);
  if (!imagem) return { rec, comFoto: false, motivoSemFoto: "produto sem foto no site" };
  try {
    const foto = await N.enviarComRetentativa(destino, enviarMidia);
    const id = foto?.key?.id;
    if (id) marcarFoto?.(String(id));
    return { rec, comFoto: true, motivoSemFoto: null };
  } catch (erro) {
    return {
      rec,
      comFoto: false,
      motivoSemFoto: N.motivoDaFalha(infoDoErro(erro)) || erro?.message || "foto recusada",
    };
  }
}

module.exports = { enviarOferta };
