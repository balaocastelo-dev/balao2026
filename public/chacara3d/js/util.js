// Utilitários comuns do passeio 3D.
import * as THREE from 'three';

export const $ = id => document.getElementById(id);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// mundo (x ao longo do terreno, y na largura, z para cima)  ->  three (x, z, -y)
export const W3 = (x, y, z) => new THREE.Vector3(x, z, -y);

// gerador pseudoaleatório pequeno e repetível
export function aleatorio(semente) {
  let a = semente | 0;
  return function () {
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

let avisoT = 0;
export function aviso(msg, ms) {
  const t = $('toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(avisoT);
  avisoT = setTimeout(() => { t.hidden = true; }, ms || 3200);
}

// cor sRGB 0-1 -> linear
export const linear = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
export const corLinear = (r, g, b) => new THREE.Color(linear(r), linear(g), linear(b));

export function carimbo() {
  const d = new Date(), z = n => (n < 10 ? '0' : '') + n;
  return d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + '-' + z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds());
}

// estado global compartilhado entre os módulos
export const estado = {
  hora: 10, leste: Math.PI / 2, auto: false, mudouHora: true,
  dia: 1,          // 1 de dia, 0 de noite
  noite: 0,        // 0 de dia, 1 de noite (acende as luzes)
  tempo: 0,        // segundos desde o começo
  qualidade: 2,    // 0 baixa, 1 média, 2 alta
  dentroDeCasa: null,
};
