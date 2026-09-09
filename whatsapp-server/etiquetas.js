// ============================================================
// Etiquetas do WhatsApp Business.
//
// As etiquetas que a loja usa no celular (Cliente novo, Orçamento, Pago…)
// precisam ser AS MESMAS no painel. Antes o painel trazia uma lista inventada
// e guardada no navegador, sem relação nenhuma com o WhatsApp — o vendedor
// etiquetava no sistema e nada aparecia no celular.
//
// Aqui é só a parte pura: transformar o que vem da página do WhatsApp no
// formato que o painel usa. A leitura em si (que precisa do navegador) fica no
// server.js.
// ============================================================

/** Cor de etiqueta que o WhatsApp não informou. Cinza neutro, não inventado. */
const COR_PADRAO = "#5f6368";

/**
 * O WhatsApp guarda a cor como número inteiro com canal alfa (ARGB), não como
 * texto. Sem converter, a etiqueta que é vermelha no celular chegaria ao painel
 * como "4294198070" e viraria cinza.
 */
function corEmHex(valor) {
  if (typeof valor === "string") {
    const limpo = valor.trim();
    if (/^#[0-9a-f]{6}$/i.test(limpo)) return limpo.toLowerCase();
    if (/^#[0-9a-f]{8}$/i.test(limpo)) return `#${limpo.slice(3).toLowerCase()}`;
    const numero = Number(limpo);
    if (Number.isFinite(numero)) return corEmHex(numero);
    return null;
  }

  if (typeof valor === "number" && Number.isFinite(valor)) {
    // Descarta o alfa e fica com os 24 bits de cor.
    const rgb = (valor >>> 0) & 0xffffff;
    return `#${rgb.toString(16).padStart(6, "0")}`;
  }

  return null;
}

/**
 * Monta a lista de etiquetas e o mapa conversa→etiquetas.
 *
 * @param {Array} brutas Cada item: { id, nome, cor, chatIds }
 * @returns {{ etiquetas: Array, porConversa: Object }}
 */
function montarEtiquetas(brutas) {
  const etiquetas = [];
  const porConversa = {};

  for (const bruta of Array.isArray(brutas) ? brutas : []) {
    const nome = String(bruta?.nome ?? bruta?.name ?? "").trim();
    if (!nome) continue;

    const id = String(bruta?.id ?? "").trim() || nome;
    etiquetas.push({
      id,
      nome,
      cor: corEmHex(bruta?.cor ?? bruta?.hexColor) || COR_PADRAO,
    });

    for (const chatId of Array.isArray(bruta?.chatIds) ? bruta.chatIds : []) {
      const chave = String(chatId || "").trim();
      if (!chave) continue;
      if (!porConversa[chave]) porConversa[chave] = [];
      if (!porConversa[chave].includes(nome)) porConversa[chave].push(nome);
    }
  }

  // Ordem estável: a mesma lista, na mesma ordem, em todos os computadores.
  etiquetas.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  for (const chave of Object.keys(porConversa)) {
    porConversa[chave].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  return { etiquetas, porConversa };
}

module.exports = { montarEtiquetas, corEmHex, COR_PADRAO };
