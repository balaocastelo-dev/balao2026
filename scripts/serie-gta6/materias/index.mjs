import { live } from "./live.mjs";
import { noticiasA } from "./noticias-a.mjs";
import { noticiasB } from "./noticias-b.mjs";
import { pcA } from "./pc-a.mjs";
import { pcB } from "./pc-b.mjs";

export const MATERIAS = [...noticiasA, ...noticiasB, ...pcA, ...pcB, ...live];
