// Animações dos projetores do passeio noturno (video mapping sobre copas, muros, portões e paredes).
// Cada animação é um sombreador de tela cheia desenhado num ladrilho de um atlas (alvo de 8 bits, linear).
// A imagem é LUZ projetada: preto = sem luz. Tudo procedural, sem texturas de fora; o texto das
// faixas ("FELIZ ANIVERSÁRIO", "BEM-VINDOS") sai de um canvas 2D desenhado uma vez por frase.
//
//   import { ANIMACOES, criarAnimador } from './projecoes_anim.js';
//   const anim = criarAnimador(renderer);
//   await anim.preparar();                                  // compila tudo antes de usar
//   anim.desenhar(id, alvo, { x, y, w, h }, tempo, extras); // a cada quadro, por projetor ligado
//   anim.descartar();
//
// {x, y, w, h}: ladrilho em pixels no alvo, na convenção do WebGL/three (y a partir de baixo, como
// renderTarget.viewport). extras: { batida 0..1 (fase do compasso, 0 = na batida), energia 0..1,
// cor (THREE.Color, linear), texto, semente, gobo 0..1 (só nas luzes) }. Sem batida, usa 120 bpm;
// sem energia, 0,75. A semente desloca o relógio e o sorteio: projetores com a mesma animação
// e sementes diferentes não ficam iguais. Cada item de ANIMACOES diz em "extras" o que ele usa.
//
// Tempo: o relógio de cada animação dá a volta a cada 30 min; nos 3 s antes da volta a imagem
// funde com o começo do ciclo seguinte (duas passadas só nesses 3 s). Assim não há salto e o
// sombreador nunca recebe número grande (não perde precisão depois de horas).
import * as THREE from 'three';

const PERIODO = 1800;   // segundos até o relógio da animação dar a volta
const TRANSICAO = 3;    // segundos de fusão antes da volta
const BASE = 4;         // o relógio do sombreador começa em 4 s (a fusão usa de 1 a 4 s)
const MAX_FLASH_HZ = 3; // estrobo: no máximo 3 flashes por segundo

const VERT = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

// ---------------------------------------------------------------------------------------------
// Peças comuns a todos os sombreadores
// ---------------------------------------------------------------------------------------------
const COMUM = /* glsl */`
uniform float uTempo;    // segundos, de 1 a 1804 (ver PERIODO e BASE)
uniform float uBatida;   // fase do compasso 0..1
uniform float uEnergia;  // 0..1
uniform vec2 uDesloc;    // deslocamento vindo da semente (projetores diferentes não ficam iguais)
uniform vec3 uCor;       // cor pedida (linear)
uniform float uTemCor;   // 1 quando veio extras.cor
uniform float uAlfa;     // 1; menor só na fusão da volta do relógio
uniform float uPx;       // tamanho do pixel em uv (1 / largura do ladrilho)
uniform vec4 uAux;       // parâmetros próprios de cada animação
varying vec2 vUv;

#define PI 3.14159265359
#define TAU 6.28318530718

float h11(float p){ p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 h22(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
vec3 h32(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yxz + 33.33); return fract((p3.xxy + p3.yzz) * p3.zyx); }
float ruido(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), u.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), u.x), u.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; const mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++){ s += a * ruido(p); p = m * p; a *= 0.5; } return s / 0.9375; }
float fbm3(vec2 p){ float s = 0.0, a = 0.5; const mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 3; i++){ s += a * ruido(p); p = m * p; a *= 0.5; } return s / 0.875; }
mat2 giro(float a){ float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
// matiz -> cor saturada já em linear
vec3 matiz(float h){ vec3 c = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); return c * c; }
// distância de p ao segmento ab
float segmento(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
// as bordas do ladrilho caem até o preto (nada de recorte duro na superfície)
float bordaLadrilho(vec2 uv){ vec2 a = smoothstep(vec2(0.0), vec2(0.085), uv) * smoothstep(vec2(0.0), vec2(0.085), 1.0 - uv); return a.x * a.y; }
`;

const PRINCIPAL = /* glsl */`
void main(){
  vec3 c = cena(vUv, uTempo);
  c = clamp(c * bordaLadrilho(vUv), 0.0, 1.0);
  // pontilhado de meio degrau: o atlas é de 8 bits linear e o degradê escuro marcaria faixas.
  // Só onde há luz: o preto continua preto.
  float pont = (h21(gl_FragCoord.xy + fract(uTempo * 7.13) * 91.0) + h21(gl_FragCoord.yx + 17.3) - 1.0) / 255.0;
  c = max(c + pont * step(0.0008, max(c.r, max(c.g, c.b))), 0.0);
  gl_FragColor = vec4(c, uAlfa);
}`;

// ---------------------------------------------------------------------------------------------
// Animações
// ---------------------------------------------------------------------------------------------
const FRAG = {};

// Aquário: carpas laranja e brancas, cáusticas no fundo, sombra dos peixes, ninfeias e gotas.
FRAG.carpas = /* glsl */`
float voronoiBorda(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float d1 = 8.0, d2 = 8.0;
  for (int y = -1; y <= 1; y++)
  for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = 0.1 + 0.8 * h22(i + g + uDesloc);
    float d = length(g + o - f);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
  }
  return d2 - d1;
}
float causticas(vec2 p, float t){
  vec2 w = vec2(ruido(p * 1.3 + t * 0.15), ruido(p * 1.3 + vec2(5.2, 1.3) - t * 0.15)) - 0.5;
  p += w * 0.45;
  float a = 1.0 - smoothstep(0.0, 0.09, voronoiBorda(p * 4.2 + vec2(t * 0.11, t * 0.04)));
  float b = 1.0 - smoothstep(0.0, 0.12, voronoiBorda(p * 7.0 + 3.0 - vec2(t * 0.06, t * 0.14)));
  float manchas = smoothstep(0.32, 0.8, ruido(p * 2.0 + vec2(t * 0.06, -t * 0.04) + uDesloc));
  return (a * a * 0.75 + b * b * 0.4) * (0.02 + 0.98 * manchas * manchas * manchas);
}
uniform vec4 uObj[10];   // 0..4: (centro, direção) de cada carpa; 5..9: (comprimento, tipo, fase, -)
// uma carpa: cor pré-multiplicada e cobertura. L = comprimento em uv.
vec4 carpa(vec2 p, vec2 c, vec2 dir, float L, float t, float tipo, float sem){
  vec2 d = p - c;
  vec2 n = vec2(-dir.y, dir.x);
  float s = dot(d, dir) / L;               // positivo para a cabeça
  float lat = dot(d, n) / L;
  if (abs(s) > 0.56 || abs(lat) > 0.17 + 0.42 * max(-s, 0.0)) return vec4(0.0);   // fora da caixa do peixe
  float u = 0.5 - s;                       // 0 no focinho, 1 na ponta do rabo
  float onda = sin(4.2 * u - t * 6.0 + sem * 9.0);
  float y = lat - (0.02 + 0.13 * u * u) * onda;
  float ay = abs(y);
  float aa = 1.2 * uPx / L;
  // corpo
  float w = 0.13 * sqrt(clamp(u / 0.2, 0.0, 1.0)) * (1.0 - 0.78 * smoothstep(0.2, 0.8, u));
  float corpo = smoothstep(w + aa, w - aa, ay) * step(0.0, u) * smoothstep(0.84, 0.8, u);
  // rabo em leque, bifurcado
  float wf = 0.02 + 0.2 * smoothstep(0.68, 1.0, u);
  float fim = 0.9 + 0.45 * ay;
  float rabo = smoothstep(wf + aa, wf - aa, ay) * smoothstep(0.66, 0.72, u) * smoothstep(fim + aa, fim - aa, u);
  rabo *= 0.55 + 0.45 * (0.5 + 0.5 * sin(ay * 120.0));    // raios da nadadeira
  // nadadeiras do peito
  vec2 pq = giro(0.7 + 0.35 * sin(t * 2.6 + sem * 5.0)) * vec2(u - 0.36, ay - 0.15);
  float peito = smoothstep(1.0, 0.75, length(pq / vec2(0.1, 0.04))) * 0.75;
  // cor: kohaku (manchas), laranja, ouro, branca com mancha vermelha na cabeça
  vec3 laranja = vec3(1.0, 0.26, 0.02), branco = vec3(0.92, 0.9, 0.84), ouro = vec3(1.0, 0.6, 0.08), vermelho = vec3(0.95, 0.05, 0.02);
  vec3 cc;
  if (tipo < 0.5) cc = mix(branco, laranja, smoothstep(0.42, 0.52, ruido(vec2(u * 5.0, y * 7.0) + sem * 17.0)));
  else if (tipo < 1.5) cc = mix(laranja, ouro, smoothstep(0.1, 0.0, ay) * 0.35);
  else if (tipo < 2.5) cc = ouro;
  else cc = mix(branco, vermelho, smoothstep(0.075, 0.06, length(vec2(u - 0.17, y))));
  float lado = clamp(ay / max(w, 0.02), 0.0, 1.0);
  cc *= 0.5 + 0.5 * (1.0 - lado * lado);                  // dorso claro, flancos escuros
  cc *= 0.92 + 0.08 * sin(u * 90.0) * sin(y * 90.0);      // escamas
  cc = mix(cc, vec3(0.01), smoothstep(0.022, 0.012, length(vec2(u - 0.085, ay - 0.06))));  // olhos
  vec3 cn = mix(cc, vec3(1.0, 0.75, 0.6), 0.25) * 0.8;    // nadadeira translúcida
  float aNad = max(rabo, peito) * 0.8;
  float alfa = max(corpo, aNad);
  vec3 cor = mix(cn * aNad, cc, corpo);
  return vec4(cor, alfa);
}
vec4 ninfeia(vec2 p, vec2 c, float R, float ang, float flor){
  vec2 d = giro(-ang) * (p - c);
  float r = length(d);
  if (r > R * 1.05) return vec4(0.0);
  float a = atan(d.y, d.x);
  float disco = smoothstep(R, R - 1.5 * uPx, r) * smoothstep(0.16, 0.24, abs(a));
  float nerv = 0.5 + 0.5 * cos(a * 20.0);
  vec3 cor = vec3(0.03, 0.17, 0.025) * (0.75 + 0.25 * nerv) * (0.6 + 0.4 * r / R);
  cor += vec3(0.08, 0.3, 0.05) * smoothstep(R - 0.012, R - 0.003, r);   // borda levantada
  // flor rosa em cima da folha
  float pf = r / (R * 0.42);
  float petala = smoothstep(1.0, 0.9, pf / (0.65 + 0.35 * abs(cos(a * 4.0 + 0.4))));
  float miolo = smoothstep(0.32, 0.22, pf);
  vec3 cf = mix(vec3(1.0, 0.3, 0.55), vec3(1.0, 0.85, 0.9), 1.0 - pf);
  cor = mix(cor, cf, petala * flor);
  cor = mix(cor, vec3(1.0, 0.75, 0.1), miolo * flor);
  float alfa = max(disco, petala * flor);
  return vec4(cor * alfa, alfa);
}
vec3 cena(vec2 uv, float t){
  // a superfície ondula e desloca o que se vê por baixo (refração)
  vec2 p = uv + 0.0035 * vec2(sin(uv.y * 23.0 + t * 1.4) + sin(uv.x * 17.0 - t), cos(uv.x * 19.0 - t * 1.2) + sin(uv.y * 13.0 + t * 0.8));
  vec3 agua = mix(vec3(0.0, 0.012, 0.02), vec3(0.0, 0.004, 0.01), clamp(length(uv - 0.5) * 1.6, 0.0, 1.0));
  float luz = causticas(p, t);
  float sombra = 0.0;
  vec4 peixes = vec4(0.0);
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec4 o = uObj[i], o2 = uObj[i + 5];
    vec2 c = o.xy, dir = o.zw;
    float L = o2.x;
    vec2 ds = p - c - vec2(0.024, -0.032);
    vec2 ls = vec2(dot(ds, dir), dot(ds, vec2(-dir.y, dir.x))) / L;
    sombra = max(sombra, smoothstep(1.0, 0.25, length(ls / vec2(0.5, 0.14))));
    vec4 k = carpa(p, c, dir, L, t, o2.y, o2.z);
    peixes = k + peixes * (1.0 - k.a);
  }
  vec3 col = agua + vec3(0.02, 0.3, 0.34) * luz * (1.0 - 0.8 * sombra);
  col = col * (1.0 - peixes.a) + peixes.rgb * (0.8 + 0.4 * luz);
  // gotas caindo na água: anéis que abrem e somem
  for (int k = 0; k < 2; k++) {
    float fk = float(k);
    float tt = t + fk * 3.3;
    float ciclo = floor(tt / 6.0);
    float tau = tt - ciclo * 6.0;
    vec2 c = 0.2 + 0.6 * h22(vec2(ciclo, fk) + uDesloc);
    float r = length(uv - c);
    float R = tau * 0.06;
    float e1 = (r - R) * 110.0, e2 = (r - R * 0.6) * 110.0;
    col += vec3(0.2, 0.45, 0.5) * (exp(-e1 * e1) + 0.5 * exp(-e2 * e2)) * exp(-tau * 0.7) * 0.7;
  }
  // ninfeias boiando
  vec4 n1 = ninfeia(uv, vec2(0.22 + 0.04 * sin(t * 0.05), 0.76 + 0.03 * cos(t * 0.043)), 0.085, 0.6 + 0.1 * sin(t * 0.03), 1.0);
  vec4 n2 = ninfeia(uv, vec2(0.79 + 0.03 * cos(t * 0.04), 0.22 + 0.03 * sin(t * 0.051)), 0.07, 2.4 + 0.1 * cos(t * 0.027), 0.0);
  col = col * (1.0 - n1.a) + n1.rgb;
  col = col * (1.0 - n2.a) + n2.rgb;
  return col;
}`;

// Ondas do mar rolando em camadas, azuis e verdes, com espuma nas cristas.
FRAG.ondas = /* glsl */`
vec3 cena(vec2 uv, float t){
  vec3 col = vec3(0.0);
  // brilho baixo de lua no horizonte, só para a primeira camada não flutuar no nada
  col += vec3(0.01, 0.025, 0.05) * exp(-pow((uv.y - 0.83) * 12.0, 2.0)) * smoothstep(0.45, 0.0, abs(uv.x - 0.55));
  for (int j = 0; j < 6; j++) {
    float fi = float(5 - j);                                      // da frente (5) para trás (0)
    float base = 0.80 - fi * 0.125;
    float freq = 8.5 - fi * 1.0;
    float amp = 0.03 + fi * 0.011;
    float vel = 0.45 + fi * 0.14;
    float x = uv.x * freq + t * vel + fi * 1.7 + uDesloc.x;
    float w = pow(0.5 + 0.5 * sin(x), 2.4);                       // crista pontuda, cava larga
    float w2 = 0.5 + 0.5 * sin(x * 2.13 + 1.1 + t * 0.35);
    float sup = base + amp * (w * 1.7 + 0.3 * w2 - 0.65) + 0.005 * (ruido(vec2(x * 3.0, fi * 3.0 + t * 0.5)) - 0.5);
    float d = sup - uv.y;                                         // profundidade abaixo da superfície
    if (d > 0.0) {
      float k = 0.45 + 0.55 * fi / 5.0;                           // camadas da frente mais fortes
      vec3 c = mix(vec3(0.02, 0.72, 0.55), vec3(0.0, 0.26, 0.5), smoothstep(0.0, 0.045, d));
      c = mix(c, vec3(0.0, 0.025, 0.11), smoothstep(0.035, 0.14, d));
      c += vec3(0.05, 0.55, 0.38) * exp(-d * 45.0) * w * 0.7;     // luz atravessando a crista
      // espuma da crista, mais forte nos picos e quebrada pelo ruído
      float esp = smoothstep(0.014 + 0.012 * w, 0.0, d) * (0.45 + 0.55 * w);
      esp *= smoothstep(0.3, 0.55, fbm3(vec2(x * 2.5, d * 55.0 + fi * 5.0)) + w * 0.3);
      // renda de espuma descendo pela face da onda
      float renda = smoothstep(0.52, 0.72, fbm3(vec2(x * 4.0, d * 28.0 - t * 0.4 + fi))) * smoothstep(0.08, 0.01, d) * w;
      c = mix(c, vec3(0.88, 0.97, 1.0), clamp(esp + renda * 0.55, 0.0, 1.0));
      // reflexos piscando na água
      vec2 g = vec2(x * 6.0, d * 90.0);
      float brilho = step(0.97, h21(floor(g) + fi * 31.0)) * smoothstep(0.45, 0.1, length(fract(g) - 0.5)) * (0.5 + 0.5 * sin(t * 5.0 + h21(floor(g)) * 40.0));
      c += vec3(0.6, 0.9, 1.0) * brilho * smoothstep(0.12, 0.03, d) * 0.5;
      col = c * k;
      break;                                                      // as de trás ficam escondidas
    }
  }
  return col;
}`;

// Labaredas subindo, com fagulhas.
FRAG.fogo = /* glsl */`
uniform vec4 uObj[16];   // fagulhas: (x, y, brilho, -)
vec3 rampaFogo(float k){
  vec3 c = mix(vec3(0.0), vec3(0.4, 0.015, 0.0), smoothstep(0.04, 0.28, k));
  c = mix(c, vec3(1.0, 0.2, 0.0), smoothstep(0.28, 0.52, k));
  c = mix(c, vec3(1.0, 0.58, 0.06), smoothstep(0.52, 0.76, k));
  c = mix(c, vec3(1.0, 0.9, 0.55), smoothstep(0.78, 1.0, k));
  return c;
}
vec3 cena(vec2 uv, float t){
  float x = uv.x - 0.5;
  float y = uv.y;
  float n1 = fbm(vec2(x * 3.5, y * 2.6 - t * 1.9) + uDesloc);
  float n2 = fbm3(vec2(x * 7.0 + n1 * 1.4, y * 4.6 - t * 3.1) + uDesloc.yx);
  // várias línguas de fogo que sobem e se dividem
  float xl = x + (n1 - 0.5) * 0.22 * y;
  float linguas = 0.5 + 0.5 * cos(xl * 30.0 + n1 * 5.0 - sin(t * 0.6) * 0.8 + n2 * 2.0);
  float largura = mix(0.42, 0.16, smoothstep(0.0, 0.8, y));
  float env = smoothstep(largura, largura * 0.25, abs(xl));
  float k = (n1 * 0.55 + n2 * 0.6) * mix(1.0, 0.25 + 1.1 * linguas, smoothstep(0.05, 0.45, y));
  float calor = k * env * 1.75 - y * 1.1 + 0.05 - (1.0 - n2) * 0.25;
  calor = clamp(calor * 1.3, 0.0, 1.0);
  vec3 col = rampaFogo(calor);
  // fagulhas subindo
  for (int i = 0; i < 16; i++) {
    vec2 d = uv - uObj[i].xy;
    float dd = dot(d, d);
    if (dd < 0.0005) col += vec3(1.0, 0.45, 0.06) * exp(-dd * 26000.0) * uObj[i].z;
  }
  return col;
}`;

// Aurora boreal: cortinas verdes com franja rosa embaixo e roxo no alto, em céu estrelado.
FRAG.aurora = /* glsl */`
float fbm2(vec2 p){ return (ruido(p) * 0.5 + ruido(mat2(1.6, 1.2, -1.2, 1.6) * p) * 0.25) / 0.75; }
vec3 cena(vec2 uv, float t){
  vec3 col = vec3(0.0);
  float cortinas = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float x = uv.x;
    float base = 0.24 + fi * 0.13 + 0.13 * (fbm2(vec2(x * 1.4 + t * 0.035 + fi * 7.1, fi)) - 0.5) + 0.035 * sin(x * 5.0 + t * 0.22 + fi * 2.0);
    float dy = uv.y - base;
    float borda = smoothstep(-0.015, 0.004, dy);                  // pé da cortina bem marcado
    float sobe = exp(-max(dy, 0.0) * (3.6 + fi * 1.6));
    // raios verticais que dobram e deslizam
    float xr = x * 34.0 + 3.0 * fbm2(vec2(x * 2.6 + fi * 3.0, t * 0.06)) + t * 0.15 * (fi - 1.0);
    float raios = 0.3 + 0.7 * ruido(vec2(xr, t * 0.35 + fi * 3.0 + dy * 2.0));
    raios = raios * raios;
    float a = borda * sobe * raios * (0.9 + 0.3 * sin(t * 0.4 + fi * 2.0 + x * 3.0));
    vec3 c = mix(vec3(0.05, 1.0, 0.32), vec3(0.5, 0.08, 0.9), smoothstep(0.03, 0.3, dy));
    c = mix(c, vec3(1.0, 0.1, 0.45), smoothstep(0.012, -0.012, dy) * 0.7);
    float forca = 0.95 - fi * 0.2;
    col += c * a * forca;
    cortinas += a * forca;
  }
  // estrelas que somem atrás da aurora
  vec2 g = uv * 70.0;
  vec2 id = floor(g);
  vec2 h = h22(id + uDesloc);
  float est = step(0.975, h.x) * smoothstep(0.2, 0.0, length(fract(g) - 0.5 - (h - 0.5) * 0.5));
  est *= 0.55 + 0.45 * sin(t * (1.0 + 3.0 * h.y) + h.x * 50.0);
  col += vec3(0.7, 0.8, 1.0) * est * 0.6 * clamp(1.0 - cortinas * 2.0, 0.0, 1.0);
  return col;
}`;

// Galáxia em espiral girando devagar, com nebulosas, poeira e estrelas cintilando.
FRAG.galaxia = /* glsl */`
vec3 cena(vec2 uv, float t){
  vec2 p = (uv - 0.5) * 2.4;
  p = giro(-0.45) * p;
  p.y *= 1.55;                                  // disco visto inclinado
  vec2 pr = giro(-t * 0.05) * p;                // coordenadas que giram com a galáxia
  float r = length(pr);
  float a = atan(pr.y, pr.x);
  float esp = 2.0 * a - 4.4 * log(r + 0.02);    // dois braços em espiral logarítmica
  float braco = 0.5 + 0.5 * cos(esp);
  float n = fbm(pr * 3.2 + uDesloc);
  float n2 = fbm3(pr * 7.5 + 3.0);
  float disco = exp(-r * 2.3);
  float br = pow(braco, 3.0) * (0.45 + 1.0 * n) * disco;
  float poeira = smoothstep(0.6, 0.9, 0.5 + 0.5 * cos(esp - 0.6)) * smoothstep(0.08, 0.3, r) * smoothstep(0.35, 0.6, n2);
  vec3 col = vec3(0.3, 0.48, 1.0) * br * 1.7;
  col += vec3(1.0, 0.18, 0.55) * pow(braco, 6.0) * smoothstep(0.55, 0.78, n2) * disco * 1.6;   // nebulosas rosadas
  col += vec3(0.25, 0.1, 0.5) * disco * 0.12 * (0.5 + n);                                          // névoa do disco
  col *= 1.0 - poeira * 0.8;
  col += vec3(1.0, 0.8, 0.5) * (exp(-r * r * 70.0) * 1.2 + exp(-r * 5.5) * 0.35);                 // núcleo
  // estrelas do disco (giram junto), mais nos braços
  vec2 g = pr * 34.0;
  vec2 id = floor(g);
  vec2 h = h22(id + uDesloc);
  float e = step(0.9 - br * 0.5, h.x) * smoothstep(0.16, 0.0, length(fract(g) - 0.5 - (h - 0.5) * 0.6));
  col += vec3(0.85, 0.9, 1.0) * e * (0.35 + br) * (0.6 + 0.4 * sin(t * (1.0 + 3.0 * h.y) + h.x * 30.0));
  // estrelas de fundo, paradas, cintilando
  vec2 g2 = uv * 48.0;
  vec2 id2 = floor(g2);
  vec2 h2 = h22(id2 + 17.0 + uDesloc);
  float e2 = step(0.962, h2.x) * smoothstep(0.17, 0.0, length(fract(g2) - 0.5 - (h2 - 0.5) * 0.6));
  float cint = 0.5 + 0.5 * sin(t * (1.5 + 3.0 * h2.y) + h2.x * 50.0);
  col += vec3(1.0, 0.95, 0.9) * e2 * cint * cint;
  return col;
}`;

// Silhuetas de folhas tropicais (costela-de-adão e bananeira) balançando na frente de luz colorida.
FRAG.folhas = /* glsl */`
// costela-de-adão: base (encaixe do talo) na origem, ponta em y ~ 1
float costela(vec2 q){
  float talo = smoothstep(0.03, 0.018, abs(q.x + 0.12 * q.y * q.y)) * step(q.y, 0.1) * step(-1.6, q.y);
  vec2 d = q - vec2(0.0, 0.5);
  float r = length(d);
  if (r > 0.6) return talo;
  float a = atan(d.x, d.y);              // 0 = ponta, ±PI = base
  float sa = abs(a);
  float R = 0.5 * (1.0 + 0.06 * cos(a * 2.0) + 0.1 * exp(-a * a * 12.0));
  R *= 1.0 - 0.55 * smoothstep(PI - 0.5, PI, sa);
  float folha = smoothstep(R + 0.008, R - 0.008, r);
  // fendas da borda para dentro, seguindo as nervuras (saem da nervura central e sobem para a ponta)
  float ax = abs(q.x);
  float sv = (q.y - 0.62 * ax + 0.08 * ax * ax) * 8.0;
  float fr = abs(fract(sv) - 0.5);
  float rr = r / R;
  float larg = 0.035 + 0.07 * smoothstep(0.5, 1.0, rr);
  float fenda = smoothstep(larg, larg - 0.03, fr) * smoothstep(0.08, 0.16, ax) * smoothstep(0.45, 0.6, rr) * step(0.08, q.y) * step(q.y, 0.92);
  // furos alongados entre as fendas, perto da nervura
  vec2 hq = vec2((abs(fract(sv + 0.5) - 0.5)) / 0.11, (ax - 0.13) / 0.045);
  float furo = smoothstep(1.0, 0.7, length(hq)) * step(0.15, q.y) * step(q.y, 0.85);
  // nervura central marcada por um fio de luz
  float nervura = smoothstep(0.012, 0.004, ax) * step(0.05, q.y) * step(q.y, 0.9) * 0.6;
  folha *= (1.0 - fenda) * (1.0 - furo) * (1.0 - nervura);
  return max(folha, talo);
}
// folha de bananeira: base na origem, comprimento 1, curvada, com rasgos
float bananeira(vec2 q, float sem){
  float y = q.y;
  float x = q.x - 0.14 * y * y;
  float talo = smoothstep(0.024, 0.014, abs(x)) * step(y, 0.02) * step(-1.6, y);
  if (y < 0.0 || y > 1.0) return talo;
  float w = 0.17 * pow(sin(PI * y), 0.55) * (1.0 - 0.25 * y);
  float folha = smoothstep(w + 0.006, w - 0.006, abs(x));
  float lado = step(0.0, x);
  float s = y * 15.0 - abs(x) * 6.0;
  float rasgo = step(0.5, h11(floor(s) * 3.7 + lado * 11.0 + sem)) * smoothstep(0.1, 0.06, abs(fract(s) - 0.5)) * smoothstep(0.012, 0.025, abs(x));
  folha *= 1.0 - rasgo;
  return max(folha, talo);
}
float folhaN(vec2 uv, vec4 f, float tipo, float fase, float t){
  float ang = f.z + 0.09 * sin(t * 0.75 + fase) + 0.04 * sin(t * 1.9 + fase * 2.0);
  vec2 q = giro(-ang) * (uv - f.xy) / f.w;
  return tipo < 0.5 ? costela(q) : bananeira(q, fase);
}
vec3 luzes(vec2 uv, float t){
  float n = fbm3(uv * 1.1 + vec2(t * 0.035, -t * 0.025) + uDesloc);
  float h = fract(n * 1.1 + t * 0.018);
  vec3 c = matiz(h);
  float m = smoothstep(0.3, 0.72, fbm3(uv * 1.8 - vec2(t * 0.06, t * 0.045) + 7.0));
  float f = dot(uv - 0.5, normalize(vec2(1.0, 0.45)));
  float pos = mod(t * 0.11, 2.2) - 1.1;
  float faixa = exp(-pow((f - pos) / 0.07, 2.0));
  return c * (0.18 + 0.82 * m) + matiz(h + 0.45) * faixa * 0.6;
}
vec3 cena(vec2 uv, float t){
  vec3 L = luzes(uv, t);
  // camada de trás: folhas menores, sombra mais fraca, mexem mais devagar
  float tras = 0.0;
  tras = max(tras, folhaN(uv, vec4(0.5, -0.12, 0.15, 0.42), 0.0, 4.0, t * 0.7));
  tras = max(tras, folhaN(uv, vec4(-0.08, 0.35, -1.25, 0.6), 1.0, 5.0, t * 0.7));
  tras = max(tras, folhaN(uv, vec4(1.08, 0.9, 2.1, 0.55), 1.0, 6.0, t * 0.7));
  // camada da frente
  float frente = 0.0;
  frente = max(frente, folhaN(uv, vec4(0.0, -0.08, -0.5, 0.55), 0.0, 0.0, t));
  frente = max(frente, folhaN(uv, vec4(1.0, -0.08, 0.55, 0.75), 1.0, 1.0, t));
  frente = max(frente, folhaN(uv, vec4(1.1, 0.55, 1.75, 0.42), 0.0, 2.0, t));
  frente = max(frente, folhaN(uv, vec4(0.45, 1.12, PI + 0.25, 0.38), 0.0, 3.0, t));
  frente = max(frente, folhaN(uv, vec4(-0.1, 1.05, -2.3, 0.7), 1.0, 7.0, t));
  vec3 col = L * (1.0 - 0.6 * tras);
  col *= 1.0 - frente;
  return col;
}`;

// Borboletas coloridas voando e batendo asas, com um rastro de brilho.
FRAG.borboletas = /* glsl */`
uniform vec4 uObj[30];   // 0..4: (centro, direção); 5..9: (fase da asa, tamanho, matiz, tipo); 10..29: rastro (x, y, brilho, -)
vec4 borboleta(vec2 p, vec2 c, vec2 dir, float esc, float bat, float hue, float tipo){
  vec2 d = p - c;
  if (dot(d, d) > esc * esc * 0.75) return vec4(0.0);
  vec2 q = vec2(dot(d, vec2(dir.y, -dir.x)), dot(d, dir)) / esc;   // x de lado, y para a frente
  float ax = abs(q.x);
  float abre = max(abs(cos(bat)), 0.1);                              // asas vistas de cima
  vec2 w = vec2(ax / abre, q.y);
  vec2 a1 = giro(0.55) * (w - vec2(0.40, 0.16));
  float e1 = length(a1 / vec2(0.44, 0.27));
  vec2 a2 = giro(-0.5) * (w - vec2(0.29, -0.22));
  float e2 = length(a2 / vec2(0.3, 0.25));
  float e = min(e1, e2);
  float aa = 2.5 * uPx / (esc * abre * 0.3);
  float asa = smoothstep(1.0, 1.0 - aa, e) * step(0.035, ax);
  float r = length(w);
  vec3 c1 = matiz(hue), c2 = matiz(hue + 0.13);
  vec3 col = mix(c2, c1, smoothstep(0.15, 0.7, r));
  if (tipo > 0.5) col = mix(col, vec3(1.0), smoothstep(0.35, 0.6, e1) * 0.35);
  float borda = smoothstep(0.72, 0.8, e);
  float pintas = smoothstep(0.34, 0.2, length(fract(w * 13.0) - 0.5));
  col = mix(col, vec3(0.02), borda);
  col = mix(col, vec3(1.0), borda * pintas * 0.9);
  float va = atan(w.y, w.x);
  float nerv = smoothstep(0.035, 0.0, abs(sin(va * 5.0)) * r) * smoothstep(0.1, 0.3, r);
  col *= 1.0 - 0.65 * nerv;
  col = mix(col, vec3(1.0, 0.92, 0.35), smoothstep(0.42, 0.34, e2) * 0.85);   // olho na asa de trás
  col = mix(col, vec3(0.02), smoothstep(0.24, 0.17, e2));
  col *= 0.4 + 0.6 * abre;                                                      // asa de lado reflete menos
  float corpo = smoothstep(1.0, 0.8, length(q / vec2(0.055, 0.34)));
  float antena = smoothstep(0.03, 0.015, segmento(vec2(ax, q.y), vec2(0.02, 0.3), vec2(0.13, 0.55)));
  antena = max(antena, smoothstep(0.05, 0.03, length(vec2(ax, q.y) - vec2(0.13, 0.55))));
  float alfa = max(asa, max(corpo, antena * 0.8));
  vec3 cor = mix(col * asa, vec3(0.16, 0.1, 0.05), corpo);
  cor = mix(cor, vec3(0.3, 0.25, 0.2), antena * (1.0 - corpo) * (1.0 - asa));
  return vec4(cor, alfa);
}
vec3 cena(vec2 uv, float t){
  vec3 col = vec3(0.0);
  vec4 acc = vec4(0.0);
  for (int i = 0; i < 5; i++) {                                        // rastro de brilho
    float g = 0.0;
    for (int k = 0; k < 4; k++) { vec4 o = uObj[10 + i * 4 + k]; vec2 dk = uv - o.xy; float dd = dot(dk, dk); if (dd < 0.0012) g += exp(-dd * 9000.0) * o.z; }
    col += matiz(float(i) * 0.19 + 0.05) * g;
  }
  for (int i = 0; i < 5; i++) {
    vec4 o = uObj[i], o2 = uObj[i + 5];
    vec4 b = borboleta(uv, o.xy, o.zw, o2.y, o2.x, o2.z, o2.w);
    acc = b + acc * (1.0 - b.a);
  }
  col = col * (1.0 - acc.a) + acc.rgb;
  return col;
}`;

// Neon: figuras geométricas que se desenham, pulsam e se apagam; colchetes nos cantos com pulsos correndo.
FRAG.neon = /* glsl */`
// distância ao contorno de um polígono regular e posição (0..1) ao longo do contorno
float poligono(vec2 p, float n, float R, float rot, out float param){
  float a = mod(atan(p.y, p.x) - rot, TAU);
  float seg = TAU / n;
  float k = floor(a / seg);
  float a0 = k * seg + rot, a1 = a0 + seg;
  vec2 v0 = R * vec2(cos(a0), sin(a0)), v1 = R * vec2(cos(a1), sin(a1));
  vec2 e = v1 - v0, w = p - v0;
  float h = clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
  param = (k + h) / n;
  return length(w - e * h);
}
vec2 verticePoli(float n, float R, float rot, float param){
  float k = floor(param * n), h = fract(param * n);
  float a0 = TAU * k / n + rot, a1 = a0 + TAU / n;
  return mix(R * vec2(cos(a0), sin(a0)), R * vec2(cos(a1), sin(a1)), h);
}
vec3 tubo(vec3 cor, float d){
  float nucleo = smoothstep(0.0042, 0.0018, d);
  float halo = (exp(-d * 70.0) * 0.55 + exp(-d * 25.0) * 0.1) * smoothstep(0.09, 0.03, d);
  return cor * (halo + nucleo * 0.75) + vec3(nucleo * 0.4);
}
// trecho desenhado do traço: de "cauda" a "cabeca" (0..1 ao longo do contorno); ciclo de 9 s
vec3 tracado(float t, float fase){
  float tau = mod(t + fase, 9.0);
  float cabeca = smoothstep(0.0, 2.6, tau);
  float cauda = smoothstep(6.4, 8.6, tau);
  // tremida de neon acendendo, logo depois de terminar de desenhar
  float tremida = mix(1.0, 0.55 + 0.45 * step(0.35, h11(floor(t * 22.0) + fase)), step(2.6, tau) * step(tau, 3.0));
  return vec3(cauda, cabeca, tremida * smoothstep(0.0, 0.01, cabeca - cauda));
}
// distância ao trecho visível: no trecho, a distância ao contorno; fora dele, às pontas
float distTrecho(float d, float param, vec3 tr, vec2 p, vec2 pCauda, vec2 pCabeca){
  float dentro = step(tr.x, param) * step(param, tr.y);
  float pontas = min(length(p - pCauda), length(p - pCabeca));
  return mix(pontas, d, dentro);
}
vec3 cena(vec2 uv, float t){
  vec2 p = uv - 0.5;
  vec3 col = vec3(0.0);
  float pulso = 0.82 + 0.18 * sin(t * 2.2) + uEnergia * exp(-uBatida * 5.0) * 0.25;
  vec3 cCirc = uTemCor > 0.5 ? uCor : vec3(0.0, 0.85, 1.0);
  vec3 tr;
  float pm, dd;
  // círculo
  float rot0 = t * 0.1;
  tr = tracado(t, 0.0);
  float pc = fract((atan(p.y, p.x) - rot0) / TAU);
  vec2 cA = 0.355 * vec2(cos(tr.x * TAU + rot0), sin(tr.x * TAU + rot0));
  vec2 cB = 0.355 * vec2(cos(tr.y * TAU + rot0), sin(tr.y * TAU + rot0));
  dd = distTrecho(abs(length(p) - 0.355), pc, tr, p, cA, cB);
  col += tubo(cCirc, dd) * tr.z * pulso;
  col += vec3(1.0) * exp(-dot(p - cB, p - cB) * 9000.0) * step(tr.y, 0.999) * tr.z;
  // hexágono
  float rh = t * 0.12;
  tr = tracado(t, 6.0);
  dd = poligono(p, 6.0, 0.29, rh, pm);
  vec2 hB = verticePoli(6.0, 0.29, rh, tr.y);
  dd = distTrecho(dd, pm, tr, p, verticePoli(6.0, 0.29, rh, tr.x), hB);
  col += tubo(vec3(1.0, 0.05, 0.75), dd) * tr.z * pulso;
  col += vec3(1.0) * exp(-dot(p - hB, p - hB) * 9000.0) * step(tr.y, 0.999) * tr.z;
  // triângulo
  float rt = -t * 0.18 + PI * 0.5;
  tr = tracado(t, 3.0);
  dd = poligono(p, 3.0, 0.22, rt, pm);
  vec2 tB = verticePoli(3.0, 0.22, rt, tr.y);
  dd = distTrecho(dd, pm, tr, p, verticePoli(3.0, 0.22, rt, tr.x), tB);
  col += tubo(vec3(1.0, 0.75, 0.0), dd) * tr.z * pulso;
  col += vec3(1.0) * exp(-dot(p - tB, p - tB) * 9000.0) * step(tr.y, 0.999) * tr.z;
  // quadrado
  float rq = t * 0.3;
  tr = tracado(t, 4.5);
  dd = poligono(p, 4.0, 0.115, rq, pm);
  dd = distTrecho(dd, pm, tr, p, verticePoli(4.0, 0.115, rq, tr.x), verticePoli(4.0, 0.115, rq, tr.y));
  col += tubo(vec3(0.2, 1.0, 0.15), dd) * tr.z * pulso;
  // ponto central
  col += vec3(1.0, 0.3, 0.9) * exp(-dot(p, p) * 4000.0) * (0.5 + 0.5 * sin(t * 3.0));
  // colchetes nos quatro cantos com pulsos correndo
  vec2 q = abs(p);
  float d1 = segmento(q, vec2(0.415, 0.3), vec2(0.415, 0.415));
  float d2 = segmento(q, vec2(0.415, 0.415), vec2(0.3, 0.415));
  float dcol = min(d1, d2);
  float arco = (q.y - 0.3) + (0.415 - q.x) * step(d2, d1);
  float corre = pow(0.5 + 0.5 * sin(arco * 60.0 - t * 5.0), 6.0);
  col += tubo(vec3(0.55, 0.2, 1.0), dcol) * (0.45 + 0.55 * corre) * pulso;
  return col;
}`;

// Riscos de luz caindo como chuva, em três profundidades.
FRAG.chuva_luz = /* glsl */`
vec3 cena(vec2 uv, float t){
  vec3 col = vec3(0.0);
  for (int L = 0; L < 3; L++) {
    float fl = float(L);
    float ncol = 16.0 + fl * 13.0;
    float x = uv.x * ncol + fl * 0.37;
    float id = floor(x);
    float fx = fract(x) - 0.5;
    float hs = h11(id * 1.37 + fl * 17.1 + uDesloc.x);
    float vel = (0.55 + 0.6 * hs) * (1.0 - fl * 0.25);
    float periodo = 1.0 + hs * 0.9;
    float y = uv.y + t * vel + hs * 7.0;
    float gota = floor(y / periodo);
    float d = y - gota * periodo;                            // altura acima da cabeça da gota
    float ativo = step(0.3, h21(vec2(id, gota) + fl * 3.1));
    float compr = (0.16 + 0.26 * h21(vec2(gota, id) + 9.0)) * (1.0 - fl * 0.2);
    float cauda = clamp(1.0 - d / compr, 0.0, 1.0);
    cauda *= cauda;
    float dd = min(d, periodo - d);
    float cabeca = exp(-dd * dd * 4000.0);
    float larg = 0.07 + 0.025 * (2.0 - fl);
    float xm = exp(-fx * fx / (larg * larg));
    vec3 cor = mix(vec3(0.5, 0.75, 1.0), matiz(h21(vec2(id, gota) + 2.0)), step(0.7, h21(vec2(gota, id) + 5.0)) * 0.85);
    if (uTemCor > 0.5) cor = mix(uCor, vec3(1.0), 0.15);
    col += cor * (cauda * 0.6 + cabeca * 1.1) * xm * ativo * (1.0 - fl * 0.28);
  }
  return col;
}`;

// Cachoeira: véu de água descendo, lábio claro em cima, espuma e névoa embaixo.
FRAG.cachoeira = /* glsl */`
vec3 veu(vec2 uv, float t, float cx, float meia, float topo, float fundo, float sem){
  float x = uv.x - cx;
  float xn = x / meia;
  float topoX = topo - 0.014 * xn * xn;                      // a água faz um ombro leve na beira da pedra
  float caida = clamp((topoX - uv.y) / (topoX - fundo), 0.0, 1.0);   // 0 na beira, 1 embaixo
  float borda = meia * (1.0 + 0.08 * caida) + meia * 0.3 * (ruido(vec2(uv.y * 9.0 + t * 2.2, sem + sign(x) * 4.0)) - 0.5) * (0.4 + caida);
  float m = smoothstep(borda, borda - 0.045, abs(x - 0.012 * sin(uv.y * 4.0 + sem)))
          * smoothstep(topoX + 0.006, topoX - 0.012, uv.y) * smoothstep(fundo - 0.03, fundo + 0.02, uv.y);
  if (m <= 0.0) return vec3(0.0);
  // a água acelera ao cair: a textura desce mais depressa embaixo
  float desce = (uv.y + 0.5 * caida * caida * (topoX - fundo)) * 2.4 + t * 2.3;
  // a lâmina se abre em fitas conforme cai
  float fitas = smoothstep(0.3, 0.6, ruido(vec2(uv.x * 15.0 + sem * 5.0, desce * 0.12)) + 0.5 * (1.0 - caida));
  float fios = ruido(vec2(uv.x * 48.0 + sem * 9.0, desce * 0.8)) * 0.6 + 0.4 * ruido(vec2(uv.x * 120.0, desce * 1.5 + 5.0));
  float massa = fbm3(vec2(uv.x * 9.0 + sem, desce * 1.2));
  float agua = smoothstep(0.42, 0.9, fios * 0.62 + massa * 0.55);
  vec3 c = mix(vec3(0.0, 0.03, 0.1), vec3(0.75, 0.92, 1.0), agua) * (0.3 + 0.7 * fitas);
  float labio = exp(-pow((topoX - uv.y - 0.014) * 50.0, 2.0));
  c = mix(c, vec3(0.55, 0.82, 1.0), labio * 0.65 * (0.6 + 0.4 * sin(uv.x * 60.0 + t * 2.0)));
  return c * m;
}
uniform vec4 uObj[10];   // respingos: (x, y, brilho, -)
// espuma revolta numa faixa horizontal (patamar ou poço)
float espumaFaixa(vec2 uv, float t, float y0, float meia, float cx, float larg){
  float faixa = exp(-pow((uv.y - y0) / meia, 2.0)) * smoothstep(larg, larg * 0.6, abs(uv.x - cx));
  if (faixa < 0.003) return 0.0;
  float e = fbm3(vec2(uv.x * 10.0 + sin(t * 0.7) * 0.3, uv.y * 14.0 - t * 1.4));
  return smoothstep(0.42, 0.8, e) * faixa;
}
vec3 cena(vec2 uv, float t){
  // degrau de cima (mais estreito) e degrau de baixo (mais largo)
  vec3 col = veu(uv, t, 0.43, 0.1, 0.88, 0.57, 0.0);
  col += veu(uv, t * 1.07, 0.5, 0.2, 0.55, 0.12, 3.0);
  // patamar do meio e poço embaixo: espuma
  col += vec3(0.7, 0.88, 1.0) * espumaFaixa(uv, t, 0.565, 0.025, 0.45, 0.2) * 0.9;
  col += vec3(0.7, 0.88, 1.0) * espumaFaixa(uv, t * 1.1, 0.12, 0.04, 0.52, 0.36) * 0.9;
  // névoa subindo
  float onde = smoothstep(0.5, 0.06, uv.y) * smoothstep(0.55, 0.12, abs(uv.x - 0.5));
  if (onde > 0.0) {
    float nev = fbm(vec2(uv.x * 3.2 + t * 0.06, uv.y * 3.0 - t * 0.28) + uDesloc);
    col += vec3(0.55, 0.72, 0.9) * smoothstep(0.38, 0.85, nev) * onde * 0.55;
  }
  // respingos
  for (int i = 0; i < 10; i++) {
    vec2 d = uv - uObj[i].xy;
    float dd = dot(d, d);
    if (dd < 0.0004) col += vec3(0.8, 0.95, 1.0) * exp(-dd * 30000.0) * uObj[i].z;
  }
  return col;
}`;

// Mandala/caleidoscópio: anéis de pétalas girando em sentidos alternados, cores andando.
FRAG.mandala = /* glsl */`
vec3 cena(vec2 uv, float t){
  vec2 p = (uv - 0.5) * 2.0;
  float r = length(p);
  float a = atan(p.y, p.x);
  vec3 col = vec3(0.0);
  float pulso = 1.0 + 0.04 * sin(t * 1.3);
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float n = 6.0 + fi * 3.0;
    float sentido = mod(fi, 2.0) < 0.5 ? 1.0 : -1.0;
    float ga = t * 0.13 * sentido / (1.0 + fi * 0.25);
    float R = (0.15 + fi * 0.165) * pulso;
    float seg = TAU / n;
    float ca = abs(mod(a + ga + seg * 0.5, seg) - seg * 0.5);     // espelhado dentro da pétala
    vec2 q = vec2(ca * r, r - R);
    float meia = R * seg * 0.42;
    float comp = 0.07 + 0.012 * fi;
    float larg = meia * (1.0 - 0.55 * clamp(q.y / comp * 0.5 + 0.5, 0.0, 1.0));
    float e = length(vec2(q.x / larg, q.y / comp));
    float petala = smoothstep(1.0, 0.9, e);
    float contorno = smoothstep(0.12, 0.0, abs(e - 0.85));
    float miolo = smoothstep(0.34, 0.22, e);
    vec3 c = matiz(fract(fi * 0.17 + t * 0.025));
    vec3 c2 = matiz(fract(fi * 0.17 + 0.5 + t * 0.025));
    col += c * petala * (0.12 + 0.35 * (1.0 - e)) + c * contorno * 0.85 + c2 * miolo * 0.8;
    // contas entre as pétalas
    vec2 qd = vec2((seg * 0.5 - ca) * r, r - R - comp * 0.7);
    col += mix(c, vec3(1.0), 0.4) * smoothstep(0.014, 0.007, length(qd)) * 0.9;
  }
  // anéis finos que pulsam para fora
  float an = abs(fract(r * 5.5 - t * 0.15) - 0.5);
  col += matiz(fract(r * 0.6 - t * 0.03)) * smoothstep(0.03, 0.0, an) * 0.18 * smoothstep(0.1, 0.3, r);
  // estrela do centro
  float ce = abs(mod(a - t * 0.4 + PI / 8.0, PI / 4.0) - PI / 8.0);
  float estrela = smoothstep(0.11, 0.08, r * (0.6 + 2.2 * ce));
  col += vec3(1.0, 0.85, 0.45) * (estrela + exp(-r * r * 300.0));
  col *= smoothstep(1.0, 0.86, r);
  return col;
}`;

// Vaga-lumes: enxame de pontinhos de luz quente piscando.
FRAG.vagalumes = /* glsl */`
uniform vec4 uObj[40];
vec3 cena(vec2 uv, float t){
  vec3 col = vec3(0.0);
  vec3 quente = uTemCor > 0.5 ? uCor : vec3(1.0, 0.72, 0.16);
  float sN = 0.0, sN2 = 0.0, sH = 0.0;
  for (int i = 0; i < 40; i++) {
    vec4 o = uObj[i];                                    // (x, y, piscada, 1 / tamanho²)
    vec2 d = uv - o.xy;
    float dd = dot(d, d);
    if (dd * o.w > 0.006) continue;                      // longe: não acende este pixel
    float nucleo = exp(-dd * 26000.0 * o.w) * o.z;
    sN += nucleo; sN2 += nucleo * nucleo / max(o.z, 0.05);
    sH += exp(-dd * 1500.0 * o.w) * 0.32 * o.z;
  }
  col = quente * (sN - sN2 + sH) + vec3(1.0, 0.96, 0.75) * sN2;
  return 1.0 - exp(-col * 1.2);
}`;

// Texto grande (canvas: R = letra, G = índice da letra * R, B = contorno), confete e brilhos.
const GLSL_TEXTO = /* glsl */`
uniform sampler2D tTexto;
// palheta alegre por letra
vec3 corLetra(float k){
  float m = mod(k, 6.0);
  if (m < 0.5) return vec3(1.0, 0.06, 0.4);
  if (m < 1.5) return vec3(1.0, 0.7, 0.02);
  if (m < 2.5) return vec3(0.02, 0.7, 1.0);
  if (m < 3.5) return vec3(0.25, 1.0, 0.1);
  if (m < 4.5) return vec3(1.0, 0.3, 0.01);
  return vec3(0.6, 0.12, 1.0);
}
`;

FRAG.aniversario = GLSL_TEXTO + /* glsl */`
float confete(vec2 uv, float t, float camada, out vec3 cor){
  float esc = 9.0 + camada * 5.0;
  vec2 g = vec2(uv.x * esc, uv.y * esc + t * (1.1 + 0.5 * camada));
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  vec3 h = h32(id + camada * 17.0 + uDesloc);
  cor = corLetra(floor(h.z * 6.0));
  if (h.x > 0.55) return 0.0;
  f.x += 0.18 * sin(t * (1.5 + h.y) + h.z * TAU);
  f -= (h.yz - 0.5) * 0.25;
  f = giro(t * (1.0 + 2.0 * h.y) + h.x * TAU) * f;
  float vira = cos(t * (3.0 + 4.0 * h.x) + h.y * 10.0);
  vec2 tam = vec2(0.13 * abs(vira) + 0.015, 0.065);
  vec2 q = abs(f) - tam;
  float aa = uPx * esc * 1.2;
  float m = smoothstep(aa, -aa, max(q.x, q.y));
  cor *= 0.55 + 0.45 * abs(vira);
  return m;
}
vec3 cena(vec2 uv, float t){
  vec3 col = vec3(0.0);
  vec3 cc;
  float c1 = confete(uv, t, 1.0, cc);                    // confete de trás (menor, mais fraco)
  col += cc * c1 * 0.55;
  // letras ondulando como uma faixa, com um pulo suave
  vec2 tuv = uv;
  tuv.y += 0.016 * sin(uv.x * 8.0 - t * 3.0);
  float s = 1.0 + 0.025 * sin(t * 2.2);
  tuv = (tuv - 0.5) / s + 0.5;
  vec4 tx = texture2D(tTexto, tuv);
  float preench = tx.r;
  float contorno = clamp(tx.b - tx.r, 0.0, 1.0);
  float letra = floor(tx.g / max(tx.r, 0.004) * 31.875 + 0.5) - 1.0;
  float halo = textureLod(tTexto, tuv, 4.0).b * 0.6 + textureLod(tTexto, tuv, 5.5).b * 0.6;
  vec3 cl = corLetra(letra);
  cl *= 0.75 + 0.25 * sin(t * 4.0 + letra * 1.3);
  float luzPassa = exp(-pow((uv.x + uv.y * 0.6 - mod(t * 0.45, 3.0) + 0.6) * 7.0, 2.0));
  cl = mix(cl, vec3(1.0), luzPassa * 0.65);
  vec3 cHalo = matiz(fract(uv.x * 0.8 - t * 0.1));
  col = col * (1.0 - clamp(halo, 0.0, 1.0) * 0.5) + cHalo * halo * 0.22;
  col = mix(col, vec3(0.95), contorno);
  col = mix(col, cl, preench);
  float c2 = confete(uv, t, 0.0, cc);                    // confete da frente
  col = mix(col, cc, c2);
  // brilhos de quatro pontas
  vec2 g = uv * 7.0;
  vec2 id = floor(g);
  vec3 h = h32(id + 40.0 + uDesloc);
  vec2 f = fract(g) - 0.25 - h.xy * 0.5;
  float pisca = pow(max(sin(t * (1.5 + h.z * 2.0) + h.x * TAU), 0.0), 8.0);
  float estrela = (exp(-abs(f.x) * 90.0) * exp(-abs(f.y) * 12.0) + exp(-abs(f.y) * 90.0) * exp(-abs(f.x) * 12.0));
  col += vec3(1.0, 0.95, 0.8) * estrela * pisca * step(0.45, h.z);
  return col;
}`;

FRAG.boas_vindas = GLSL_TEXTO + /* glsl */`
vec3 cena(vec2 uv, float t){
  vec3 col = vec3(0.0);
  vec3 dourado = uTemCor > 0.5 ? uCor : vec3(1.0, 0.62, 0.2);
  vec2 p = uv - 0.5;
  vec2 b = vec2(0.44, 0.27);
  // moldura de lâmpadas que correm (letreiro)
  vec2 q = abs(p);
  float dLado = abs(q.x - b.x), dTopo = abs(q.y - b.y);
  float naVertical = step(dLado, dTopo);
  float esp = 0.043;
  float s;
  vec2 centro;
  if (naVertical > 0.5) {
    float k = floor(p.y / esp + 0.5);
    k = clamp(k, -floor(b.y / esp), floor(b.y / esp));
    centro = vec2(sign(p.x) * b.x, k * esp);
    s = p.x > 0.0 ? (2.0 * b.x + (b.y - centro.y)) : (4.0 * b.x + 2.0 * b.y + (centro.y + b.y));
  } else {
    float k = floor(p.x / esp + 0.5);
    k = clamp(k, -floor(b.x / esp), floor(b.x / esp));
    centro = vec2(k * esp, sign(p.y) * b.y);
    s = p.y > 0.0 ? (b.x + centro.x) : (2.0 * b.x + 2.0 * b.y + (b.x - centro.x));
  }
  float dl = length(p - centro);
  float corre = smoothstep(0.5, 0.0, abs(fract(s / esp / 3.0 - t * 1.6) - 0.5) - 0.15);
  float lamp = 0.25 + 0.75 * corre;
  col += mix(dourado, vec3(1.0, 0.95, 0.8), 0.5) * smoothstep(0.009, 0.004, dl) * lamp;
  col += dourado * exp(-dl * dl * 2200.0) * lamp * 0.6;
  // filete de neon dentro da moldura
  vec2 dq = q - (b - 0.035);
  float dRet = abs(max(dq.x, dq.y));
  col += dourado * (smoothstep(0.003, 0.0012, dRet) * 0.7 + exp(-dRet * 90.0) * 0.12);
  // texto
  vec2 tuv = uv;
  vec4 tx = texture2D(tTexto, tuv);
  float preench = tx.r;
  float contorno = clamp(tx.b - tx.r, 0.0, 1.0);
  float halo = textureLod(tTexto, tuv, 4.0).b * 0.5 + textureLod(tTexto, tuv, 5.5).b * 0.5;
  float luzPassa = exp(-pow((uv.x - uv.y * 0.35 - mod(t * 0.3, 2.2) + 0.45) * 9.0, 2.0));
  vec3 ct = mix(vec3(1.0, 0.88, 0.62), vec3(1.0, 0.55, 0.12), smoothstep(0.62, 0.38, uv.y));
  ct = mix(ct, vec3(1.0), luzPassa * 0.7);
  col += dourado * halo * 0.25;
  col = mix(col, dourado * 0.55, contorno);
  col = mix(col, ct * (0.85 + 0.15 * sin(t * 1.7)), preench);
  // brilhinhos subindo dentro da moldura
  for (int i = 0; i < 10; i++) {
    float fi = float(i);
    vec2 h = h22(vec2(fi, 6.1) + uDesloc);
    float k = fract(t * (0.07 + 0.05 * h.x) + h.y);
    vec2 pos = vec2(0.5 + (h.x - 0.5) * 0.78 + 0.02 * sin(t + fi), 0.26 + k * 0.48);
    col += vec3(1.0, 0.85, 0.55) * exp(-dot(uv - pos, uv - pos) * 40000.0) * sin(k * PI) * 0.9;
  }
  return col;
}`;

// Equalizador da rave: barras em LED espelhadas, chute na batida, anéis saindo do centro.
FRAG.equalizador = /* glsl */`
vec3 cena(vec2 uv, float t){
  float bat = uBatida, en = uEnergia;
  float chute = exp(-bat * 6.0);
  vec3 col = vec3(0.0);
  float nb = 15.0;
  float xb = (uv.x - 0.1) / 0.8 * nb;
  float i = floor(xb), fx = fract(xb);
  if (i >= 0.0 && i < nb) {
    float f = i / (nb - 1.0);
    float n = ruido(vec2(i * 3.7 + uDesloc.x, t * (2.5 + 3.5 * f)));
    float n2 = ruido(vec2(i * 1.3 + 9.0, t * 7.0));
    float grave = 1.0 - smoothstep(0.0, 0.5, f);
    float alt = en * (0.2 + 0.5 * n + 0.2 * n2) * (1.0 - 0.3 * f) + chute * (0.25 + 0.75 * en) * grave * 0.75;
    alt = clamp(alt, 0.05, 1.0) * 0.4;
    float dy = abs(uv.y - 0.5);
    float sy = fract(dy / 0.024);
    float led = smoothstep(0.0, 0.12, sy) * smoothstep(0.86, 0.72, sy);
    float barraX = smoothstep(0.1, 0.18, fx) * smoothstep(0.9, 0.82, fx);
    float ligado = step(dy, alt);
    vec3 c = mix(vec3(0.05, 1.0, 0.3), vec3(1.0, 0.8, 0.0), smoothstep(0.1, 0.24, dy));
    c = mix(c, vec3(1.0, 0.04, 0.12), smoothstep(0.25, 0.36, dy));
    if (uTemCor > 0.5) c = mix(uCor, vec3(1.0), smoothstep(0.2, 0.4, dy) * 0.6);
    col += c * led * barraX * ligado;
    col += c * barraX * exp(-max(dy - alt, 0.0) * 50.0) * (1.0 - ligado) * 0.15;
  }
  // anéis que nascem na batida
  vec2 p = uv - 0.5;
  float r = length(p);
  vec3 cAnel = mix(vec3(0.15, 0.35, 1.0), vec3(1.0, 0.05, 0.8), bat);
  col += cAnel * exp(-pow((r - bat * 0.62) * 45.0, 2.0)) * (1.0 - bat) * (0.3 + 0.7 * en) * 0.85;
  col += cAnel * exp(-pow((r - bat * 0.35) * 60.0, 2.0)) * (1.0 - bat) * (0.3 + 0.7 * en) * 0.4;
  // linha do meio acende no chute
  col += vec3(0.6, 0.8, 1.0) * exp(-abs(uv.y - 0.5) * 140.0) * (0.12 + chute * 0.7) * smoothstep(0.48, 0.3, abs(uv.x - 0.5));
  return col;
}`;

// Flashes de cor na batida (no máximo 3 por segundo; o envelope vem do JS).
FRAG.estrobo_cores = /* glsl */`
vec3 cena(vec2 uv, float t){
  float fl = uAux.x;      // envelope do flash 0..1
  float dt = uAux.y;      // segundos desde o flash
  float matizF = uAux.z;
  float padrao = uAux.w;
  vec3 c = matiz(matizF);
  if (uTemCor > 0.5) c = mod(padrao, 2.0) < 0.5 ? uCor : mix(uCor, vec3(1.0), 0.35);
  vec2 p = uv - 0.5;
  float r = length(p);
  float a = atan(p.y, p.x);
  float m;
  if (padrao < 0.5) m = pow(0.5 + 0.5 * cos(a * 10.0 + dt * 3.0), 3.0) * smoothstep(0.0, 0.08, r) + exp(-r * r * 60.0);
  else if (padrao < 1.5) { float R = dt * 1.5; m = exp(-pow((r - R) * 16.0, 2.0)) + 0.6 * exp(-pow((r - R * 0.55) * 16.0, 2.0)); }
  else if (padrao < 2.5) m = smoothstep(0.44, 0.08, r) * (0.55 + 0.45 * cos(r * 34.0 - dt * 10.0));
  else { m = 0.5 + 0.5 * sin((p.x + p.y) * 28.0 + dt * 9.0); m *= m; }
  m *= smoothstep(0.5, 0.2, r);
  // um respiro fraco entre os flashes, para a superfície não sumir de vez
  vec3 fundo = c * 0.05 * smoothstep(0.5, 0.0, r);
  return c * m * fl * 0.95 + fundo;
}`;

// Fogos de artifício: foguete subindo, estouro em anel de faíscas com rastro, caindo e crepitando.
FRAG.fogos = /* glsl */`
vec3 anelFogos(vec2 d, float s, float n, float R0, float semCiclo, vec3 cor){
  float a = atan(d.y, d.x);
  float k = mod(floor(a / TAU * n + 0.5), n);      // mesmo índice dos dois lados da costura em ±PI
  float ak = k / n * TAU;
  vec2 dirk = vec2(cos(ak), sin(ak));
  float vk = 0.85 + 0.3 * h11(k + semCiclo);
  float Rk = R0 * vk * (1.0 - exp(-s * 2.6));
  float ao = dot(d, dirk);
  float perp = abs(dot(d, vec2(-dirk.y, dirk.x)));
  vec2 pk = dirk * Rk;
  float faisca = exp(-dot(d - pk, d - pk) * 6000.0);
  float compr = 0.14 * exp(-s * 0.6) + 0.02;
  float rastro = exp(-perp * perp * 40000.0) * pow(clamp((ao - (Rk - compr)) / compr, 0.0, 1.0), 1.5) * step(ao, Rk + 0.004);
  float crepita = mix(1.0, 0.2 + 0.8 * step(0.5, h11(k * 3.1 + floor(s * 16.0) + semCiclo)), smoothstep(1.0, 1.8, s));
  return cor * (faisca * 1.8 + rastro * 0.9) * crepita;
}
vec3 cena(vec2 uv, float t){
  vec3 col = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float per = 3.4 + fi * 0.45;
    float tt = t + fi * 1.37 + uDesloc.x;
    float ciclo = floor(tt / per);
    float tau = tt - ciclo * per;
    vec3 h = h32(vec2(ciclo, fi) + uDesloc);
    vec2 alvo = vec2(0.24 + 0.52 * h.x, 0.55 + 0.2 * h.y);
    vec3 cor = mix(matiz(h.z), vec3(1.0), 0.12);
    float subida = 0.85;
    if (tau < subida) {
      float k = tau / subida;
      float y = alvo.y * (1.0 - (1.0 - k) * (1.0 - k));
      vec2 pos = vec2(alvo.x + 0.015 * sin(k * 9.0), y);
      vec2 d = uv - pos;
      float rastro = exp(-d.x * d.x * 60000.0) * clamp(1.0 + d.y / 0.1, 0.0, 1.0) * step(d.y, 0.0);
      col += vec3(1.0, 0.7, 0.35) * (exp(-dot(d, d) * 20000.0) * 1.2 + rastro * 0.4);
    } else {
      float s = tau - subida;
      float vida = per - subida;
      vec2 c = alvo - vec2(0.0, 0.03 * s * s);
      vec2 d = uv - c;
      col += cor * exp(-dot(d, d) * 140.0) * exp(-s * 7.0) * 0.6;     // clarão do estouro
      float fade = exp(-s * 0.6) * smoothstep(vida, vida - 0.6, s);
      float R0 = 0.22 + 0.06 * h.y;
      float alcance = R0 * 1.25 * (1.0 - exp(-s * 2.6)) + 0.03;
      if (dot(d, d) > alcance * alcance) continue;
      vec3 brilho = anelFogos(d, s, 24.0 + floor(h.x * 10.0), R0, ciclo * 7.0 + fi, cor);
      if (h.y > 0.4) brilho += anelFogos(d, s, 14.0, R0 * 0.5, ciclo * 3.0 + fi + 50.0, matiz(h.z + 0.45));
      col += brilho * fade;
    }
  }
  return 1.0 - exp(-col * 1.3);
}`;

// Corações subindo, pulsando, com contorno de neon.
FRAG.coracoes = /* glsl */`
// distância a um coração: quadrado girado 45° + dois círculos; h = meio lado; ponta para baixo
float distCoracao(vec2 p, float h){
  p.y += 0.15 * h;
  vec2 q = giro(-PI * 0.25) * p;
  vec2 dq = abs(q) - vec2(h);
  float caixa = length(max(dq, 0.0)) + min(max(dq.x, dq.y), 0.0);
  float c1 = length(q - vec2(h, 0.0)) - h;
  float c2 = length(q - vec2(0.0, h)) - h;
  return min(caixa, min(c1, c2));
}
vec3 cena(vec2 uv, float t){
  vec3 col = vec3(0.0);
  for (int L = 0; L < 2; L++) {
    float fl = float(L);
    float esc = 3.4 + fl * 2.6;                       // células por ladrilho
    vec2 g = vec2(uv.x * esc + fl * 0.5, uv.y * esc - t * (0.22 - fl * 0.07) * esc);
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    vec3 h = h32(id + fl * 13.0 + uDesloc);
    if (h.x > 0.6) continue;
    f.x += 0.12 * sin(t * (1.0 + h.y) + h.z * TAU);
    f -= (h.yz - 0.5) * 0.12;
    float bate = 1.0 + 0.1 * pow(0.5 + 0.5 * sin(t * 4.2 + h.z * TAU), 6.0);
    vec2 q = giro(0.25 * sin(t * 1.2 + h.y * 6.0)) * f / esc;          // em uv
    float tam = (0.105 + 0.03 * h.y) * bate / esc;
    float d = distCoracao(q, tam);
    vec3 c = mix(vec3(1.0, 0.02, 0.18), vec3(1.0, 0.15, 0.65), h.y);
    float dentro = smoothstep(uPx, -uPx, d);
    float fundo = smoothstep(-tam * 0.9, 0.0, d);                     // mais claro perto da borda
    float contorno = smoothstep(0.0035, 0.0012, abs(d));
    float halo = exp(-max(d, 0.0) * 120.0 * esc / 3.4) * 0.3 * smoothstep(0.1 / esc, 0.04 / esc, d);
    float forca = 1.0 - fl * 0.35;
    col += (c * (dentro * (0.22 + 0.4 * fundo) + halo) + mix(c, vec3(1.0), 0.5) * contorno) * forca;
  }
  return col;
}`;

// Luz de jardim: foco macio (centro forte, borda caindo até o preto) com leve gobo de folhagem.
// uAux = (modo 0 fixa | 1 cores girando | 2 batida, força do gobo, -, -); a cor vem em uCorLuz.
const FRAG_LUZ = /* glsl */`
uniform vec3 uCorLuz;
vec3 cena(vec2 uv, float t){
  vec2 p = (uv - 0.5) * 2.0;
  float r = length(p);
  float borda = 1.0 - smoothstep(0.5, 0.97, r);
  float foco = (0.62 * exp(-r * r * 1.9) + 0.38 * exp(-r * r * 7.0)) * borda;
  vec2 q = p * 2.0 + uDesloc + vec2(sin(t * 0.23), cos(t * 0.19)) * 0.12;
  float folha = smoothstep(0.46, 0.62, fbm(q));
  foco *= 1.0 - uAux.y * folha * 0.8;
  vec3 c = uCorLuz;
  if (uAux.x > 0.5 && uAux.x < 1.5) {
    float h = fract(t * 0.02);
    vec2 dir = vec2(cos(t * 0.15), sin(t * 0.15));
    c = mix(matiz(h), matiz(h + 0.22), smoothstep(-0.9, 0.9, dot(p, dir)));
  } else if (uAux.x > 1.5) {
    float pulso = exp(-uBatida * 4.5);
    foco *= 0.2 + 0.8 * mix(0.6, pulso, 0.35 + 0.65 * uEnergia);
    if (uTemCor < 0.5) c = matiz(fract(t * 0.025));
  }
  return c * foco;
}`;

// ---------------------------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------------------------
const LUZES = {
  luz_ambar:         { nome: 'Luz âmbar',          cor: [1.0, 0.40, 0.04], modo: 0, descricao: 'Foco âmbar macio, bom para iluminar tronco e copa de baixo para cima.' },
  luz_branca_quente: { nome: 'Luz branca quente',  cor: [1.0, 0.70, 0.40], modo: 0, descricao: 'Foco branco quente (~2700 K) para lavar parede ou muro.' },
  luz_verde:         { nome: 'Luz verde',          cor: [0.12, 1.0, 0.10], modo: 0, descricao: 'Foco verde, realça folhagem.' },
  luz_azul:          { nome: 'Luz azul',           cor: [0.04, 0.22, 1.0], modo: 0, descricao: 'Foco azul, luar de mentira na copa.' },
  luz_roxa:          { nome: 'Luz roxa',           cor: [0.42, 0.06, 1.0], modo: 0, descricao: 'Foco roxo.' },
  luz_magenta:       { nome: 'Luz magenta',        cor: [1.0, 0.03, 0.62], modo: 0, descricao: 'Foco magenta.' },
  luz_cores:         { nome: 'Luz de cores',       cor: [1.0, 1.0, 1.0],   modo: 1, descricao: 'Foco em duas cores que vão girando devagar pelo arco-íris.' },
  luz_batida:        { nome: 'Luz na batida',      cor: [1.0, 0.1, 0.6],   modo: 2, descricao: 'Foco que pulsa na batida; sem cor pedida, a cor anda devagar.' },
};

export const ANIMACOES = [
  { id: 'carpas',        nome: 'Aquário de carpas',     tipo: 'animacao', extras: ['semente'], descricao: 'Carpas laranja, brancas e douradas nadando sobre cáusticas, com sombra no fundo, ninfeias e gotas abrindo anéis.' },
  { id: 'ondas',         nome: 'Ondas do mar',          tipo: 'animacao', extras: ['semente'], descricao: 'Camadas de ondas rolando em azul e verde, com espuma nas cristas e reflexos.' },
  { id: 'fogo',          nome: 'Fogo',                  tipo: 'animacao', extras: ['semente'], descricao: 'Labaredas subindo, do vermelho ao amarelo, com fagulhas.' },
  { id: 'aurora',        nome: 'Aurora boreal',         tipo: 'animacao', extras: ['semente'], descricao: 'Cortinas verdes com franja rosa e topo roxo, ondulando sobre um céu estrelado.' },
  { id: 'galaxia',       nome: 'Galáxia',               tipo: 'animacao', extras: ['semente'], descricao: 'Galáxia em espiral girando devagar, com nebulosas rosadas, poeira e estrelas cintilando.' },
  { id: 'folhas',        nome: 'Folhas tropicais',      tipo: 'animacao', extras: ['semente'],          descricao: 'Silhuetas de costela-de-adão e bananeira balançando na frente de luzes coloridas que passam.' },
  { id: 'borboletas',    nome: 'Borboletas',            tipo: 'animacao', extras: ['semente'], descricao: 'Borboletas coloridas voando, batendo asas e planando, com rastro de brilho.' },
  { id: 'neon',          nome: 'Neon geométrico',       tipo: 'animacao', extras: ['cor', 'batida', 'energia', 'semente'], descricao: 'Círculo, hexágono, triângulo e quadrado de neon que se desenham, pulsam e se apagam; colchetes nos cantos.' },
  { id: 'chuva_luz',     nome: 'Chuva de luz',          tipo: 'animacao', extras: ['cor', 'semente'], descricao: 'Riscos de luz caindo como chuva, em três profundidades.' },
  { id: 'cachoeira',     nome: 'Cachoeira',             tipo: 'animacao', extras: ['semente'], descricao: 'Véu de água descendo e acelerando, espuma no poço, névoa subindo e respingos.' },
  { id: 'mandala',       nome: 'Mandala',               tipo: 'animacao', extras: ['semente'],          descricao: 'Caleidoscópio de anéis de pétalas girando em sentidos alternados, com as cores andando.' },
  { id: 'vagalumes',     nome: 'Vaga-lumes',            tipo: 'animacao', extras: ['cor', 'semente'], descricao: 'Enxame de pontinhos de luz quente voando e piscando.' },
  { id: 'aniversario',   nome: 'Feliz aniversário',     tipo: 'animacao', extras: ['texto', 'semente'], descricao: '"FELIZ ANIVERSÁRIO" em letras grandes coloridas ondulando, com confete caindo e brilhos.' },
  { id: 'boas_vindas',   nome: 'Boas-vindas',           tipo: 'animacao', extras: ['texto', 'cor', 'semente'], descricao: '"BEM-VINDOS" dourado numa moldura de lâmpadas que correm.' },
  { id: 'equalizador',   nome: 'Equalizador',           tipo: 'animacao', extras: ['batida', 'energia', 'cor', 'semente'], descricao: 'Barras de LED espelhadas que pulam na batida, com anéis saindo do centro.' },
  { id: 'estrobo_cores', nome: 'Flashes de cor',        tipo: 'animacao', extras: ['batida', 'cor', 'semente'], descricao: 'Flash de cor e desenho a cada batida, limitado a 3 por segundo.' },
  { id: 'fogos',         nome: 'Fogos de artifício',    tipo: 'animacao', extras: ['semente'], descricao: 'Foguetes subindo e estourando em anéis de faíscas que caem e crepitam.' },
  { id: 'coracoes',      nome: 'Corações',              tipo: 'animacao', extras: ['semente'], descricao: 'Corações cor-de-rosa subindo e pulsando, com contorno de neon.' },
  ...Object.entries(LUZES).map(([id, l]) => ({
    id, nome: l.nome, tipo: 'luz', descricao: l.descricao,
    extras: l.modo === 1 ? ['gobo', 'semente'] : l.modo === 2 ? ['batida', 'energia', 'cor', 'gobo', 'semente'] : ['cor', 'gobo', 'semente'],
  })),
];

// ---------------------------------------------------------------------------------------------
// Texto em canvas 2D (uma vez por frase)
// ---------------------------------------------------------------------------------------------
const TAM_TEXTO = 1024;
const FONTE = '"Arial Black", "Segoe UI Black", "Helvetica Neue", Arial, "Liberation Sans", "DejaVu Sans", sans-serif';

function quebrarLinhas(texto, maxLinhas) {
  const bruto = String(texto).replace(/\r/g, '').trim();
  if (!bruto) return [];
  if (/[\n|]/.test(bruto)) return bruto.split(/[\n|]/).map(s => s.trim()).filter(Boolean).slice(0, maxLinhas);
  const palavras = bruto.split(/\s+/);
  if (palavras.length === 1 || bruto.length <= 11) return [bruto];
  // divide em 2 ou 3 linhas de tamanho parecido
  const n = Math.min(maxLinhas, bruto.length > 24 ? 3 : 2, palavras.length);
  const alvo = bruto.length / n;
  const linhas = [];
  let atual = '';
  for (const p of palavras) {
    if (atual && (atual.length + 1 + p.length) > alvo * 1.15 && linhas.length < n - 1) { linhas.push(atual); atual = p; }
    else atual = atual ? atual + ' ' + p : p;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

// R = letra, G = (índice + 1) * 8 / 255 * R (cor por letra), B = letra + contorno.
function criarTexturaTexto(linhas, caixa) {
  const T = TAM_TEXTO;
  const cv = document.createElement('canvas');
  cv.width = cv.height = T;
  const g = cv.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, T, T);
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.lineJoin = 'round';
  const n = Math.max(1, linhas.length);
  const altLinha = caixa.h * T / n;
  const espaco = 0.05;
  const medir = (linha, px) => {
    g.font = `900 ${px}px ${FONTE}`;
    let w = 0;
    for (const ch of linha) w += g.measureText(ch).width + px * espaco;
    return w - px * espaco;
  };
  const tams = linhas.map(l => {
    let px = altLinha * 0.8;
    const w = medir(l, px);
    if (w > caixa.w * T) px *= caixa.w * T / w;
    return px;
  });
  const topo = (caixa.cy - caixa.h / 2) * T;
  // passada 0: contorno grosso no azul; passada 1: a letra (vermelho) com o índice (verde) por cima
  g.strokeStyle = g.fillStyle = 'rgb(0,0,255)';
  for (let passo = 0; passo < 2; passo++) {
    let idx = 0;
    linhas.forEach((l, i) => {
      const px = tams[i];
      g.font = `900 ${px}px ${FONTE}`;
      let x = (T - medir(l, px)) / 2;
      const y = topo + (i + 0.5) * altLinha;
      for (const ch of l) {
        const w = g.measureText(ch).width;
        if (ch.trim()) {
          if (passo === 0) { g.lineWidth = px * 0.16; g.strokeText(ch, x, y); g.fillText(ch, x, y); }
          else { g.fillStyle = `rgb(255,${((idx % 31) + 1) * 8},255)`; g.fillText(ch, x, y); }
          idx++;
        }
        x += w + px * espaco;
      }
    });
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.NoColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

const TEXTOS = {
  aniversario: { padrao: 'FELIZ|ANIVERSÁRIO', caixa: { w: 0.8, h: 0.6, cy: 0.5 }, maxLinhas: 3, maiusculas: true },
  boas_vindas: { padrao: 'BEM-VINDOS', caixa: { w: 0.72, h: 0.34, cy: 0.5 }, maxLinhas: 3, maiusculas: true },
};

// ---------------------------------------------------------------------------------------------
// O que só depende do tempo (trajetórias, batida de asa, piscadas) é calculado uma vez por
// desenho aqui no JS e vai para o sombreador em uObj, em vez de ser refeito em cada pixel.
// ---------------------------------------------------------------------------------------------
function hashJS(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
const frac = x => x - Math.floor(x);
const limitar01 = x => Math.min(1, Math.max(0, x));
const suave = (a, b, x) => { const k = limitar01((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const TAU = Math.PI * 2;

function rotaCarpa(i, t, sem) {
  const hx = hashJS(i * 7.31 + 1 + sem * 13.7), hy = hashJS(i * 3.17 + 2.3 + sem * 5.1);
  const f = t * (0.16 + 0.08 * hy) * (hx < 0.5 ? -1 : 1) + i * 1.9 + hx * 6;
  return [0.5 + (0.22 + 0.06 * hy) * Math.cos(f) + 0.07 * Math.sin(f * 2 + i),
          0.5 + (0.21 + 0.06 * hx) * Math.sin(f) + 0.06 * Math.cos(f * 3 + i * 2)];
}
function rotaBorboleta(i, t, sem) {
  const hx = hashJS(i * 5.17 + 2 + sem * 3.3), hy = hashJS(i * 2.71 + 4.1 + sem * 1.9);
  return [0.5 + 0.3 * Math.sin(t * (0.2 + 0.12 * hx) + hy * TAU) + 0.08 * Math.sin(t * (0.9 + 0.3 * hy) + i),
          0.5 + 0.28 * Math.sin(t * (0.16 + 0.1 * hy) + hx * TAU + 1) + 0.07 * Math.cos(t * (0.7 + 0.4 * hx) + i * 2)];
}
function direcao(a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; }

const OBJETOS = {
  carpas: { n: 10, preencher(t, sem, a) {
    for (let i = 0; i < 5; i++) {
      const c = rotaCarpa(i, t, sem), d = direcao(c, rotaCarpa(i, t + 0.15, sem));
      a.set([c[0], c[1], d[0], d[1]], i * 4);
      a.set([0.2 + 0.035 * hashJS(i * 3.3 + 0.5 + sem), i % 4, i + frac(sem * 0.37) * 10, 0], (i + 5) * 4);
    }
  } },
  borboletas: { n: 30, preencher(t, sem, a) {
    for (let i = 0; i < 5; i++) {
      const c = rotaBorboleta(i, t, sem), d = direcao(c, rotaBorboleta(i, t + 0.08, sem));
      const freq = 11 + 4 * hashJS(i * 2.1 + sem);
      const fase = (t * freq + i) % TAU;
      const plana = suave(0.6, 0.9, Math.sin(t * 0.5 + i * 1.3));          // às vezes planam de asa aberta
      const abre = Math.abs(Math.cos(fase)) * (1 - plana) + 0.92 * plana;
      a.set([c[0], c[1] + 0.008 * Math.sin(fase) * (1 - plana), d[0], d[1]], i * 4);
      a.set([Math.acos(Math.min(1, abre)), 0.15 + 0.04 * hashJS(i * 7.7 + sem), i * 0.19, i % 2], (i + 5) * 4);
      for (let k = 1; k <= 4; k++) {
        const p = rotaBorboleta(i, t - k * 0.12, sem);
        a.set([p[0], p[1], (1 - k * 0.2) * 0.45 * (0.5 + 0.5 * Math.sin(t * 9 + k * 2 + i)), 0], (10 + i * 4 + k - 1) * 4);
      }
    }
  } },
  vagalumes: { n: 40, preencher(t, sem, a) {
    const cx = 0.5 + 0.12 * Math.sin(t * 0.13), cy = 0.5 + 0.1 * Math.sin(t * 0.17 + 1);
    for (let i = 0; i < 40; i++) {
      const hx = hashJS(i * 3.7 + sem * 7.1), hy = hashJS(i * 1.31 + 5.2 + sem * 2.3);
      const x = cx + 0.36 * Math.sin(t * (0.1 + 0.12 * hx) + hy * TAU) + 0.05 * Math.sin(t * (0.7 + hx) + i);
      const y = cy + 0.32 * Math.sin(t * (0.08 + 0.12 * hy) + hx * TAU * 1.3) + 0.05 * Math.cos(t * (0.8 + hy) + i * 1.7);
      const fase = frac(t / (1.8 + 2.6 * hx) + hy);
      const pisca = 0.05 + 0.95 * suave(0, 0.07, fase) * suave(0.42, 0.16, fase);
      const perto = 0.6 + 0.8 * hy;                                          // uns parecem mais perto (maiores)
      a.set([x, y, pisca, 1 / (perto * perto)], i * 4);
    }
  } },
  cachoeira: { n: 10, preencher(t, sem, a) {
    for (let i = 0; i < 10; i++) {
      const hx = hashJS(i * 2.3 + sem * 5.3), hy = hashJS(i * 6.1 + 0.7 + sem * 1.1);
      const k = frac(t / (1.1 + hx * 0.8) + hy);
      const y0 = i < 4 ? 0.57 : 0.13;
      a.set([0.47 + (hx - 0.5) * (i < 4 ? 0.22 : 0.4) + (hy - 0.5) * 0.25 * k, y0 + 0.2 * k - 0.3 * k * k, (1 - k) * 1.2, 0], i * 4);
    }
  } },
  fogo: { n: 16, preencher(t, sem, a) {
    for (let i = 0; i < 16; i++) {
      const hx = hashJS(i * 9.1 + sem * 3.7), hy = hashJS(i * 4.3 + 1.9 + sem * 1.3);
      const fase = frac(t / (2 + 1.6 * hx) + hy);
      a.set([0.5 + (hx - 0.5) * 0.45 + 0.05 * Math.sin(t * 2.3 + i * 1.7) * fase, 0.18 + fase * 0.8,
             (1 - fase) * (0.6 + 0.4 * Math.sin(t * 13 + i)) * 1.5, 0], i * 4);
    }
  } },
};

export function criarAnimador(renderer) {
  const geo = new THREE.PlaneGeometry(2, 2);
  const quad = new THREE.Mesh(geo);
  quad.frustumCulled = false;
  const cena = new THREE.Scene();
  cena.add(quad);
  cena.matrixWorldAutoUpdate = false;
  quad.updateMatrixWorld(true);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniformesBase = () => ({
    uTempo: { value: BASE }, uBatida: { value: 0 }, uEnergia: { value: 0.75 }, uDesloc: { value: new THREE.Vector2() },
    uCor: { value: new THREE.Color(1, 1, 1) }, uTemCor: { value: 0 }, uAlfa: { value: 1 }, uPx: { value: 1 / 512 },
    uAux: { value: new THREE.Vector4() },
  });
  const criarMaterial = (frag, extras) => {
    const m = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: COMUM + frag + PRINCIPAL,
      uniforms: Object.assign(uniformesBase(), extras || {}),
      depthTest: false, depthWrite: false, blending: THREE.NoBlending, toneMapped: false, fog: false,
    });
    // usado só na fusão da volta do relógio
    m.blendSrc = THREE.SrcAlphaFactor; m.blendDst = THREE.OneMinusSrcAlphaFactor;
    m.blendSrcAlpha = THREE.ZeroFactor; m.blendDstAlpha = THREE.OneFactor;
    m.blendEquation = THREE.AddEquation; m.blendEquationAlpha = THREE.AddEquation;
    return m;
  };

  // texto: uma textura por frase (guarda as últimas)
  const texturasTexto = new Map();
  function texturaTexto(id, texto) {
    const cfg = TEXTOS[id];
    let t = (texto && String(texto).trim()) || cfg.padrao;
    if (cfg.maiusculas) t = t.toLocaleUpperCase('pt-BR');
    const chave = id + '\u0000' + t;
    let tex = texturasTexto.get(chave);
    if (tex) { texturasTexto.delete(chave); texturasTexto.set(chave, tex); return tex; }
    tex = criarTexturaTexto(quebrarLinhas(t, cfg.maxLinhas), cfg.caixa);
    texturasTexto.set(chave, tex);
    if (texturasTexto.size > 10) {
      const [velha, tv] = texturasTexto.entries().next().value;
      texturasTexto.delete(velha); tv.dispose();
    }
    return tex;
  }

  // estado do estrobo por semente (para limitar a 3 flashes por segundo)
  const estrobos = new Map();
  function envelopeEstrobo(tempo, bat, sem) {
    let s = estrobos.get(sem);
    if (!s || tempo < s.ultimoTempo - 1) { s = { ultimaBatida: bat, ultimoFlash: -1e9, n: 0, ultimoTempo: tempo }; estrobos.set(sem, s); }
    const virou = bat < s.ultimaBatida - 0.3;
    if (virou && tempo - s.ultimoFlash >= 1 / MAX_FLASH_HZ - 1e-3) { s.ultimoFlash = tempo; s.n++; }
    s.ultimaBatida = bat; s.ultimoTempo = tempo;
    const dt = Math.max(0, tempo - s.ultimoFlash);
    const ataque = Math.min(1, 0.45 + dt / 0.03);
    const env = dt > 2 ? 0 : ataque * Math.exp(-dt * 6.5);
    return { env, dt: Math.min(dt, 2), matiz: frac(s.n * 0.381966 + hashJS(sem)), padrao: s.n % 4 };
  }

  const itens = new Map();
  for (const a of ANIMACOES) {
    if (a.tipo === 'luz') continue;
    const extras = {};
    if (TEXTOS[a.id]) extras.tTexto = { value: null };
    if (OBJETOS[a.id]) extras.uObj = { value: new Float32Array(OBJETOS[a.id].n * 4) };
    itens.set(a.id, { material: criarMaterial(FRAG[a.id], extras), objetos: OBJETOS[a.id] || null });
  }
  const matLuz = criarMaterial(FRAG_LUZ, { uCorLuz: { value: new THREE.Color() } });
  for (const id of Object.keys(LUZES)) itens.set(id, { material: matLuz, luz: LUZES[id] });

  const materiais = [...new Set([...itens.values()].map(i => i.material))];
  let preparo = null;

  function preparar() {
    if (preparo) return preparo;
    preparo = (async () => {
      for (const id of Object.keys(TEXTOS)) {
        const tex = texturaTexto(id, null);
        itens.get(id).material.uniforms.tTexto.value = tex;
        renderer.initTexture(tex);
      }
      const cenaComp = new THREE.Scene();
      for (const m of materiais) { const q = new THREE.Mesh(geo, m); q.frustumCulled = false; cenaComp.add(q); }
      // compila com um alvo ligado: o programa é o mesmo usado no atlas (saída linear)
      const rt = new THREE.WebGLRenderTarget(4, 4, { depthBuffer: false });
      const rtAnt = renderer.getRenderTarget(), face = renderer.getActiveCubeFace(), mip = renderer.getActiveMipmapLevel();
      let promessa;
      renderer.setRenderTarget(rt);
      try { promessa = renderer.compileAsync ? renderer.compileAsync(cenaComp, cam) : Promise.resolve(renderer.compile(cenaComp, cam)); }
      finally { renderer.setRenderTarget(rtAnt, face, mip); }
      await promessa;
      // um desenho de aquecimento de cada (4×4 pixels) para nada ficar para o primeiro quadro
      for (const id of itens.keys()) desenhar(id, rt, { x: 0, y: 0, w: 4, h: 4 }, 1, { semente: 0 });
      estrobos.clear();
      rt.dispose();
    })();
    return preparo;
  }

  const _vp = new THREE.Vector4(), _sc = new THREE.Vector4();

  function desenhar(id, alvo, ret, tempo, extras) {
    const item = itens.get(id);
    if (!item || !alvo) return false;
    const e = extras || {};
    const mat = item.material, un = mat.uniforms;
    const x = ret ? ret.x : 0, y = ret ? ret.y : 0, w = ret ? ret.w : alvo.width, h = ret ? ret.h : alvo.height;
    const sem = Number.isFinite(e.semente) ? e.semente : 0;
    tempo = Number.isFinite(tempo) ? tempo : 0;

    // relógio estável: volta a cada PERIODO, com fusão nos últimos TRANSICAO segundos
    const u = ((tempo + hashJS(sem + 3.1) * PERIODO) % PERIODO + PERIODO) % PERIODO;
    let mistura = 0;
    if (u > PERIODO - TRANSICAO) { const k = (u - (PERIODO - TRANSICAO)) / TRANSICAO; mistura = k * k * (3 - 2 * k); }
    const tA = u + BASE, tB = u - PERIODO + BASE;

    const bat = Number.isFinite(e.batida) ? limitar01(e.batida) : frac(tempo * 2);   // sem batida: 120 bpm
    un.uBatida.value = bat;
    un.uEnergia.value = Number.isFinite(e.energia) ? limitar01(e.energia) : 0.75;
    un.uDesloc.value.set(hashJS(sem) * 61.7, hashJS(sem + 1.7) * 47.3);
    if (e.cor && e.cor.isColor) { un.uCor.value.copy(e.cor); un.uTemCor.value = 1; } else un.uTemCor.value = 0;
    un.uPx.value = 1 / Math.max(1, w);
    if (item.luz) {
      const l = item.luz;
      if (e.cor && e.cor.isColor && l.modo !== 1) un.uCorLuz.value.copy(e.cor); else un.uCorLuz.value.setRGB(l.cor[0], l.cor[1], l.cor[2]);
      un.uAux.value.set(l.modo, Number.isFinite(e.gobo) ? limitar01(e.gobo) : 0.35, 0, 0);
    } else if (id === 'estrobo_cores') {
      const s = envelopeEstrobo(tempo, bat, sem);
      un.uAux.value.set(s.env, s.dt, s.matiz, s.padrao);
    }
    if (un.tTexto) un.tTexto.value = texturaTexto(id, e.texto);

    // estado do renderer, devolvido como estava
    const rtAnt = renderer.getRenderTarget(), faceAnt = renderer.getActiveCubeFace(), mipAnt = renderer.getActiveMipmapLevel();
    const autoAnt = renderer.autoClear, xrAnt = renderer.xr.enabled, infoAnt = renderer.info.autoReset;
    _vp.copy(alvo.viewport); _sc.copy(alvo.scissor);
    const scTesteAnt = alvo.scissorTest;
    alvo.viewport.set(x, y, w, h); alvo.scissor.set(x, y, w, h); alvo.scissorTest = true;
    renderer.autoClear = false; renderer.xr.enabled = false; renderer.info.autoReset = false;
    quad.material = mat;
    try {
      renderer.setRenderTarget(alvo);
      mat.blending = THREE.NoBlending;
      un.uAlfa.value = 1;
      un.uTempo.value = tA;
      if (item.objetos) item.objetos.preencher(tA, sem, un.uObj.value);
      mat.uniformsNeedUpdate = true;
      renderer.render(cena, cam);
      if (mistura > 0) {
        // fusão com o começo do próximo ciclo (só nos últimos 3 s de cada 30 min)
        mat.blending = THREE.CustomBlending;
        un.uAlfa.value = mistura;
        un.uTempo.value = tB;
        if (item.objetos) item.objetos.preencher(tB, sem, un.uObj.value);
        mat.uniformsNeedUpdate = true;
        renderer.render(cena, cam);
        mat.blending = THREE.NoBlending;
      }
    } finally {
      alvo.viewport.copy(_vp); alvo.scissor.copy(_sc); alvo.scissorTest = scTesteAnt;
      renderer.setRenderTarget(rtAnt, faceAnt, mipAnt);
      renderer.autoClear = autoAnt; renderer.xr.enabled = xrAnt; renderer.info.autoReset = infoAnt;
    }
    return true;
  }

  function descartar() {
    for (const m of materiais) m.dispose();
    for (const t of texturasTexto.values()) t.dispose();
    texturasTexto.clear();
    estrobos.clear();
    geo.dispose();
  }

  return { preparar, desenhar, descartar, ids: [...itens.keys()], materiais };
}
