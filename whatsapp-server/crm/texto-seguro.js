// O que o Postgres recusa num texto que veio do WhatsApp.
//
//   - o caractere nulo (\u0000): nem coluna de texto nem JSON aceitam;
//   - metade de emoji (um "surrogate" sozinho): aparece quando um texto é
//     cortado no meio do emoji, como o trecho da mensagem citada (200
//     caracteres). Na coluna de texto vira "?" sem reclamar, mas no JSON o
//     Postgres recusa a linha inteira com "invalid input syntax for type json"
//     (aconteceu na importação do histórico da loja em 12/10/2026).
//
// Tira só esses pedaços; o resto do texto fica igual.

const QUEBRADOS = /\u0000|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

function textoSeguro(s) {
  return typeof s === "string" ? s.replace(QUEBRADOS, "") : s;
}

/** O mesmo valor, com textoSeguro em todo texto (também dentro de objetos e listas). */
function semQuebrados(v) {
  if (typeof v === "string") return textoSeguro(v);
  if (Array.isArray(v)) return v.map(semQuebrados);
  if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) {
    const o = {};
    for (const [k, x] of Object.entries(v)) o[textoSeguro(k)] = semQuebrados(x);
    return o;
  }
  return v; // número, booleano, null, Date...
}

module.exports = { textoSeguro, semQuebrados };
