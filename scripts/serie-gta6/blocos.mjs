export const p = (texto) => ({ tipo: "paragrafo", texto });
export const h2 = (texto) => ({ tipo: "titulo", nivel: 2, texto });
export const h3 = (texto) => ({ tipo: "titulo", nivel: 3, texto });
export const fig = (id) => ({ tipo: "imagem", id });
export const lista = (itens, ordenada) => ({ tipo: "lista", itens, ...(ordenada ? { ordenada: true } : {}) });
export const resumo = (itens) => ({ tipo: "resumo", itens });
export const destaque = (titulo, texto, tom = "nota") => ({ tipo: "destaque", tom, titulo, texto });
export const pros = (pros, contras) => ({ tipo: "pros-contras", pros, contras });
export const chamada = (tema) => ({ tipo: "chamada", tema });
export const fecho = (titulo, texto) => ({
  tipo: "chamada",
  titulo,
  texto,
  rotulo: "Pedir orçamento no WhatsApp",
});
