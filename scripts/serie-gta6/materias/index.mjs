import { fig } from "../blocos.mjs";
import { live } from "./live.mjs";
import { noticiasA } from "./noticias-a.mjs";
import { noticiasB } from "./noticias-b.mjs";
import { pcA } from "./pc-a.mjs";
import { pcB } from "./pc-b.mjs";
import { TERCEIRAS } from "./terceiras.mjs";

function comQuatroImagens(materia) {
  const extra = TERCEIRAS[materia.slug];
  if (!extra) throw new Error(`Falta a quarta imagem de ${materia.slug}`);
  if (materia.imagens.some((img) => img.id === extra.id)) return materia;
  const blocos = [];
  let entrou = false;
  for (const bloco of materia.blocos) {
    if (!entrou && bloco.tipo === "pros-contras") {
      blocos.push(fig(extra.id));
      entrou = true;
    }
    blocos.push(bloco);
  }
  if (!entrou) throw new Error(`Sem prós e contras para encaixar a figura em ${materia.slug}`);
  return { ...materia, imagens: [...materia.imagens, extra], blocos };
}

export const MATERIAS = [...noticiasA, ...noticiasB, ...pcA, ...pcB, ...live].map(comQuatroImagens);
