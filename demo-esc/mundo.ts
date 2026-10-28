import { EQUIPE } from "./equipe";
import { COR_STATUS, ROTULO_STATUS, type EstadoEscritorio, type Lugar } from "./tipos";

/* O three.js não está no package.json de propósito: entra só nesta página,
   por um build ESM fixo, para não misturar com o resto do site. */
const URL_THREE = "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

// O módulo do CDN não traz os tipos do three neste repositório.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Tres = any;

export type ClassesCena = {
  etiqueta: string;
  nome: string;
  papel: string;
  linha: string;
  ponto: string;
  balao: string;
};

export type OpcoesMotor = {
  canvas: HTMLCanvasElement;
  camada: HTMLElement;
  classes: ClassesCena;
  obterEstado: () => EstadoEscritorio;
  aoClicar: (id: string | null) => void;
  aoQuadro: (dt: number, agora: number) => void;
  movimentoReduzido: () => boolean;
};

const PASSO_X = 3.55;
const PASSO_Z = 3.4;
const VELOCIDADE = 2.45;

function hash(id: string) {
  let h = 0;
  for (const letra of id) h = (h * 33 + letra.charCodeAt(0)) >>> 0;
  return h;
}

function hex(cor: string) {
  return Number.parseInt(cor.replace("#", ""), 16);
}

function clarear(cor: number, quanto: number) {
  const canal = (valor: number) => Math.max(0, Math.min(255, valor + quanto));
  return (canal((cor >> 16) & 255) << 16) | (canal((cor >> 8) & 255) << 8) | canal(cor & 255);
}

function aproximarAngulo(atual: number, alvo: number, passo: number) {
  let delta = alvo - atual;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  if (Math.abs(delta) <= passo) return alvo;
  return atual + Math.sign(delta) * passo;
}

async function carregarThree(): Promise<Tres> {
  const importar = new Function("endereco", "return import(endereco)") as (endereco: string) => Promise<Tres>;
  const prazo = new Promise<never>((_, rejeitar) => {
    setTimeout(() => rejeitar(new Error("tempo")), 12000);
  });
  return Promise.race([importar(URL_THREE), prazo]);
}

function desenharTela(ctx: CanvasRenderingContext2D, cor: string, desloc: number, ligada: boolean) {
  ctx.clearRect(0, 0, 64, 48);
  ctx.globalAlpha = 1;
  if (!ligada) {
    ctx.fillStyle = "#12141c";
    ctx.fillRect(0, 0, 64, 48);
    ctx.fillStyle = "#2c3144";
    ctx.fillRect(8, 22, 48, 3);
    return;
  }
  ctx.fillStyle = "#1c2438";
  ctx.fillRect(0, 0, 64, 48);
  ctx.fillStyle = cor;
  ctx.fillRect(0, 0, 64, 8);
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(3, 2, 16, 4);
  for (let i = 0; i < 5; i += 1) {
    const y = 12 + ((i * 8 + desloc) % 34);
    ctx.fillStyle = i % 2 === 0 ? "#fffaf0" : cor;
    ctx.fillRect(4, y, 26 + (i % 3) * 7, 3);
  }
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(46, 16, 12, 22);
  ctx.fillStyle = cor;
  ctx.fillRect(48, 28, 2, 8);
  ctx.fillRect(52, 22, 2, 14);
  ctx.fillRect(56, 18, 2, 18);
}

export async function criarMotor(opcoes: OpcoesMotor) {
  const T = await carregarThree();
  const { canvas, camada, classes } = opcoes;
  const geos: Tres[] = [];
  const mats: Tres[] = [];
  const texs: Tres[] = [];
  const geo = <G>(item: G): G => {
    geos.push(item);
    return item;
  };
  const material = <M>(item: M): M => {
    mats.push(item);
    return item;
  };
  const textura = (item: Tres) => {
    texs.push(item);
    if (T.SRGBColorSpace) item.colorSpace = T.SRGBColorSpace;
    return item;
  };

  let renderer: Tres;
  try {
    renderer = new T.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch {
    throw new Error("sem-webgl");
  }
  if (!renderer.getContext()) throw new Error("sem-webgl");
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x8fd4ff, 1);
  if (T.SRGBColorSpace) renderer.outputColorSpace = T.SRGBColorSpace;

  const cena = new T.Scene();
  cena.fog = new T.Fog(0xbfe9ff, 52, 145);
  const camera = new T.PerspectiveCamera(42, 1, 0.1, 400);

  const ceuCanvas = document.createElement("canvas");
  ceuCanvas.width = 4;
  ceuCanvas.height = 256;
  const pincelCeu = ceuCanvas.getContext("2d");
  if (!pincelCeu) throw new Error("sem-webgl");
  const gradiente = pincelCeu.createLinearGradient(0, 0, 0, 256);
  gradiente.addColorStop(0, "#3a78ff");
  gradiente.addColorStop(0.42, "#67c0ff");
  gradiente.addColorStop(0.78, "#b7e7ff");
  gradiente.addColorStop(1, "#e7f8ff");
  pincelCeu.fillStyle = gradiente;
  pincelCeu.fillRect(0, 0, 4, 256);
  const texCeu = textura(new T.CanvasTexture(ceuCanvas));
  texCeu.magFilter = T.LinearFilter;
  texCeu.minFilter = T.LinearFilter;
  const cupula = new T.Mesh(
    geo(new T.SphereGeometry(220, 18, 12)),
    material(new T.MeshBasicMaterial({ map: texCeu, side: T.BackSide, depthWrite: false })),
  );
  cena.add(cupula);

  cena.add(new T.HemisphereLight(0xd6f1ff, 0xc4844a, 0.72));
  const solDir = new T.DirectionalLight(0xfff4d2, 1.05);
  solDir.position.set(18, 28, 10);
  cena.add(solDir);
  const sol = new T.Mesh(
    geo(new T.SphereGeometry(3.2, 8, 6)),
    material(new T.MeshBasicMaterial({ color: 0xfff3b0 })),
  );
  sol.position.set(-28, 22, -24);
  cena.add(sol);

  const lambert = (cor: number, opacidade = 1) =>
    material(
      new T.MeshLambertMaterial({
        color: cor,
        flatShading: true,
        transparent: opacidade < 1,
        opacity: opacidade,
        depthWrite: opacidade > 0.85,
      }),
    );

  const matGrama = lambert(0x54c83a);
  const matGramaEscura = lambert(0x3eae2c);
  const matTerra = lambert(0xd4894a);
  const matTerraEscura = lambert(0x8d4e28);
  const matGramaFantasma = lambert(0xb7c4c8, 0.55);
  const matTerraFantasma = lambert(0x9aa7ad, 0.4);
  const matMadeira = lambert(0xf0b45a);
  const matMadeiraEscura = lambert(0xc4843a);
  const matBezel = lambert(0x2c3142);
  const matParede = lambert(0xffe3b0);
  const matVidro = material(
    new T.MeshBasicMaterial({ color: 0xd7f6ff, transparent: true, opacity: 0.45, depthWrite: false }),
  );
  const matNuvem = lambert(0xffffff);
  const matOlho = lambert(0xfffaf2);
  const matPupila = lambert(0x241c18);
  const matSombra = material(
    new T.MeshBasicMaterial({ color: 0x1d2430, transparent: true, opacity: 0.22, depthWrite: false }),
  );
  const matFio = lambert(0x5c3b22);

  function xadrez(clara: string, escura: string) {
    const c = document.createElement("canvas");
    c.width = 2;
    c.height = 2;
    const g = c.getContext("2d");
    if (!g) return null;
    g.fillStyle = clara;
    g.fillRect(0, 0, 1, 1);
    g.fillRect(1, 1, 1, 1);
    g.fillStyle = escura;
    g.fillRect(1, 0, 1, 1);
    g.fillRect(0, 1, 1, 1);
    const tex = textura(new T.CanvasTexture(c));
    tex.magFilter = T.NearestFilter;
    tex.minFilter = T.NearestFilter;
    tex.wrapS = T.RepeatWrapping;
    tex.wrapT = T.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  const texPiso = xadrez("#ffe3a8", "#f0a04a");
  const texPisoFantasma = xadrez("#e7eef2", "#c5d0d8");

  function criarIlha(largura: number, profundidade: number, fantasma: boolean) {
    const grupo = new T.Group();
    const grama = new T.Mesh(geo(new T.BoxGeometry(largura, 0.36, profundidade)), fantasma ? matGramaFantasma : matGrama);
    grama.position.y = -0.18;
    const borda = new T.Mesh(
      geo(new T.BoxGeometry(largura + 0.3, 0.22, profundidade + 0.3)),
      fantasma ? matGramaFantasma : matGramaEscura,
    );
    borda.position.y = -0.28;
    const terra = new T.Mesh(
      geo(new T.BoxGeometry(largura - 0.2, 1.2, profundidade - 0.2)),
      fantasma ? matTerraFantasma : matTerra,
    );
    terra.position.y = -0.96;
    const raiz = new T.Mesh(
      geo(new T.BoxGeometry(largura * 0.62, 0.7, profundidade * 0.62)),
      fantasma ? matTerraFantasma : matTerraEscura,
    );
    raiz.position.y = -1.7;
    grupo.add(raiz, terra, borda, grama);

    const baseXadrez = fantasma ? texPisoFantasma : texPiso;
    if (baseXadrez) {
      const tex = baseXadrez.clone();
      tex.wrapS = T.RepeatWrapping;
      tex.wrapT = T.RepeatWrapping;
      tex.magFilter = T.NearestFilter;
      tex.minFilter = T.NearestFilter;
      tex.repeat.set(Math.max(2, largura / 0.85), Math.max(2, profundidade / 0.85));
      if (T.SRGBColorSpace) tex.colorSpace = T.SRGBColorSpace;
      tex.needsUpdate = true;
      texs.push(tex);
      const tapete = new T.Mesh(
        geo(new T.PlaneGeometry(largura - 1.1, profundidade - 1.3)),
        material(
          new T.MeshLambertMaterial({
            map: tex,
            flatShading: true,
            transparent: fantasma,
            opacity: fantasma ? 0.55 : 1,
          }),
        ),
      );
      tapete.rotation.x = -Math.PI / 2;
      tapete.position.y = 0.02;
      grupo.add(tapete);
    }
    return grupo;
  }

  const ativos = EQUIPE.filter((agente) => agente.status === "ativo");
  const breves = EQUIPE.filter((agente) => agente.status === "em_breve");
  const colunas = Math.max(2, Math.ceil(Math.sqrt(ativos.length * 1.35)));
  const linhas = Math.ceil(ativos.length / colunas);
  const margemX = 2.5;
  const margemFrente = 3.1;
  const margemFundo = 2.5;
  const largura = Math.max(10, (colunas - 1) * PASSO_X + margemX * 2);
  const profundidade = Math.max(9, (linhas - 1) * PASSO_Z + margemFrente + margemFundo);
  const deslocZ = (margemFundo - margemFrente) / 2;

  const ilha = criarIlha(largura, profundidade, false);
  cena.add(ilha);

  const reuniaoX = largura / 2 + 6.4;
  const ilhaReuniao = criarIlha(8.4, 8.4, false);
  ilhaReuniao.position.set(reuniaoX, 0, -0.4);
  cena.add(ilhaReuniao);

  const ponteReuniao = new T.Mesh(geo(new T.BoxGeometry(3.2, 0.32, 1.7)), matGrama);
  ponteReuniao.position.set(largura / 2 + 1.5, -0.16, -0.4);
  const ponteReuniaoTerra = new T.Mesh(geo(new T.BoxGeometry(3, 0.7, 1.35)), matTerra);
  ponteReuniaoTerra.position.set(largura / 2 + 1.5, -0.55, -0.4);
  cena.add(ponteReuniaoTerra, ponteReuniao);

  const cafeZ = profundidade / 2 + 5.2;
  const ilhaCafe = criarIlha(7.2, 6.6, false);
  ilhaCafe.position.set(-1.2, 0, cafeZ);
  cena.add(ilhaCafe);
  const ponteCafe = new T.Mesh(geo(new T.BoxGeometry(1.7, 0.32, 2.8)), matGrama);
  ponteCafe.position.set(-1.2, -0.16, profundidade / 2 + 1.35);
  const ponteCafeTerra = new T.Mesh(geo(new T.BoxGeometry(1.35, 0.7, 2.6)), matTerra);
  ponteCafeTerra.position.set(-1.2, -0.55, profundidade / 2 + 1.35);
  cena.add(ponteCafeTerra, ponteCafe);

  const breveColunas = Math.max(1, breves.length);
  const breveLargura = breveColunas * 3.15 + 2.4;
  const breveX = -largura / 2 - breveLargura / 2 - 2.4;
  const ilhaBreve = criarIlha(breveLargura, 6.2, true);
  ilhaBreve.position.set(breveX, -1.25, 0.6);
  cena.add(ilhaBreve);
  const ponteQuebrada = new T.Mesh(geo(new T.BoxGeometry(1.4, 0.28, 1.3)), matGramaFantasma);
  ponteQuebrada.position.set(-largura / 2 - 0.9, -0.7, 0.6);
  cena.add(ponteQuebrada);

  const geoCopa = geo(new T.ConeGeometry(0.72, 1.05, 6));
  const geoCopa2 = geo(new T.ConeGeometry(0.52, 0.8, 6));
  const geoTronco = geo(new T.CylinderGeometry(0.12, 0.16, 0.7, 6));
  const matFolha = lambert(0x2f9e32);
  const matFolhaClara = lambert(0x67d84a);
  const matTronco = lambert(0x8a4b28);

  function arvore(pai: Tres, x: number, z: number, escala: number) {
    const tronco = new T.Mesh(geoTronco, matTronco);
    tronco.position.set(x, 0.32 * escala, z);
    tronco.scale.setScalar(escala);
    const copa = new T.Mesh(geoCopa, matFolha);
    copa.position.set(x, 0.95 * escala, z);
    copa.scale.setScalar(escala);
    const ponta = new T.Mesh(geoCopa2, matFolhaClara);
    ponta.position.set(x, 1.55 * escala, z);
    ponta.scale.setScalar(escala);
    pai.add(tronco, copa, ponta);
  }

  const pontosBorda: { x: number; z: number }[] = [];
  const volta = 10;
  for (let i = 0; i < volta; i += 1) {
    const t = (i / volta) * 2 * (largura + profundidade);
    let x = 0;
    let z = 0;
    if (t < largura) {
      x = -largura / 2 + t;
      z = -profundidade / 2;
    } else if (t < largura + profundidade) {
      x = largura / 2;
      z = -profundidade / 2 + (t - largura);
    } else if (t < largura * 2 + profundidade) {
      x = largura / 2 - (t - largura - profundidade);
      z = profundidade / 2;
    } else {
      x = -largura / 2;
      z = profundidade / 2 - (t - largura * 2 - profundidade);
    }
    if (Math.abs(z + 0.4) < 1.2 && x > largura / 2 - 2) continue;
    if (Math.abs(x + 1.2) < 1.4 && z > profundidade / 2 - 2) continue;
    pontosBorda.push({ x: x * 0.9, z: z * 0.9 });
  }
  pontosBorda.forEach((ponto, indice) => arvore(ilha, ponto.x, ponto.z, 0.85 + (indice % 3) * 0.18));
  arvore(ilhaReuniao, -2.6, -2.6, 0.9);
  arvore(ilhaReuniao, 2.5, 2.4, 1.05);
  arvore(ilhaCafe, -2.2, -1.8, 0.8);
  arvore(ilha, 0, -profundidade / 2 + 1.15, 0.7);

  [[36, -1.5, -22, 7], [-34, 0.4, 26, 6.2], [24, -3.2, 42, 5.4]].forEach(([x, y, z, tamanho]) => {
    const distante = criarIlha(tamanho, tamanho * 0.85, false);
    distante.position.set(x, y, z);
    cena.add(distante);
    arvore(distante, 0.4, -0.2, 1.1);
  });

  const geoNuvem = geo(new T.IcosahedronGeometry(1, 0));
  const derivas: Tres[] = [];
  for (let i = 0; i < 8; i += 1) {
    const nuvem = new T.Group();
    for (let parte = 0; parte < 3; parte += 1) {
      const bola = new T.Mesh(geoNuvem, matNuvem);
      bola.position.set(parte * 0.85, (parte % 2) * 0.25, 0);
      bola.scale.setScalar(0.75 + (parte % 2) * 0.45);
      nuvem.add(bola);
    }
    nuvem.position.set(-32 + i * 10, 8 + (i % 3) * 1.4, -16 + (i % 4) * 8);
    cena.add(nuvem);
    derivas.push(nuvem);
  }

  const balaoGrupo: Tres[] = [];
  function criarBalao(cor: number, x: number, y: number, z: number) {
    const grupo = new T.Group();
    const corpo = new T.Mesh(geo(new T.SphereGeometry(0.42, 8, 6)), lambert(cor));
    corpo.scale.set(1, 1.18, 1);
    const no = new T.Mesh(geo(new T.ConeGeometry(0.12, 0.2, 5)), lambert(cor));
    no.position.y = -0.5;
    no.rotation.x = Math.PI;
    const fio = new T.Mesh(geo(new T.CylinderGeometry(0.015, 0.015, 0.9, 4)), matFio);
    fio.position.y = -1.05;
    grupo.add(corpo, no, fio);
    grupo.position.set(x, y, z);
    cena.add(grupo);
    balaoGrupo.push(grupo);
  }
  criarBalao(0xe60012, -3.4, 3.3, cafeZ + 0.4);
  criarBalao(0xffd84a, -2.5, 3.7, cafeZ + 1.1);

  const paredeZ = -profundidade / 2 + 0.7;
  const lintel = new T.Mesh(geo(new T.BoxGeometry(largura * 0.72, 0.28, 0.22)), matParede);
  lintel.position.set(0, 1.85, paredeZ);
  const peitoril = new T.Mesh(geo(new T.BoxGeometry(largura * 0.72, 0.24, 0.28)), matParede);
  peitoril.position.set(0, 0.48, paredeZ);
  ilha.add(lintel, peitoril);
  const vao = largura * 0.62;
  for (let janela = 0; janela < 4; janela += 1) {
    const x = -vao / 2 + (janela + 0.5) * (vao / 4);
    const vidro = new T.Mesh(geo(new T.PlaneGeometry(1.15, 0.95)), matVidro);
    vidro.position.set(x, 1.15, paredeZ + 0.02);
    const ombreira = new T.Mesh(geo(new T.BoxGeometry(0.12, 1.15, 0.18)), matParede);
    ombreira.position.set(x - 0.68, 1.15, paredeZ);
    ilha.add(vidro, ombreira);
  }

  const placaCanvas = document.createElement("canvas");
  placaCanvas.width = 512;
  placaCanvas.height = 160;
  const placaCtx = placaCanvas.getContext("2d");
  if (placaCtx) {
    placaCtx.fillStyle = "#ffe7ad";
    placaCtx.fillRect(0, 0, 512, 160);
    placaCtx.strokeStyle = "#5c3b22";
    placaCtx.lineWidth = 18;
    placaCtx.strokeRect(10, 10, 492, 140);
    placaCtx.fillStyle = "#5c3b22";
    placaCtx.textAlign = "center";
    placaCtx.textBaseline = "middle";
    placaCtx.font = "700 58px Verdana, sans-serif";
    placaCtx.fillText("EQUIPE DIGITAL", 256, 68);
    placaCtx.font = "700 26px Verdana, sans-serif";
    placaCtx.fillText("BALÃO DA INFORMÁTICA", 256, 118);
    const texPlaca = textura(new T.CanvasTexture(placaCanvas));
    texPlaca.magFilter = T.LinearFilter;
    texPlaca.needsUpdate = true;
    const placa = new T.Mesh(
      geo(new T.PlaneGeometry(3.4, 1.05)),
      material(new T.MeshLambertMaterial({ map: texPlaca, flatShading: true })),
    );
    placa.position.set(0, 1.35, profundidade / 2 - 0.55);
    const poste = new T.Mesh(geo(new T.BoxGeometry(0.16, 1.3, 0.16)), matMadeiraEscura);
    poste.position.set(0, 0.65, profundidade / 2 - 0.7);
    ilha.add(placa, poste);
  }

  const tampoReuniao = new T.Mesh(geo(new T.CylinderGeometry(1.45, 1.45, 0.16, 10)), matMadeira);
  tampoReuniao.position.y = 0.74;
  const peReuniao = new T.Mesh(geo(new T.CylinderGeometry(0.2, 0.26, 0.68, 8)), matMadeiraEscura);
  peReuniao.position.y = 0.34;
  ilhaReuniao.add(peReuniao, tampoReuniao);

  const CADEIRAS = 8;
  const cadeirasReuniao: { x: number; z: number; rot: number }[] = [];
  for (let i = 0; i < CADEIRAS; i += 1) {
    const angulo = (i / CADEIRAS) * Math.PI * 2 - Math.PI / 2;
    const raio = 2.55;
    const x = Math.cos(angulo) * raio;
    const z = Math.sin(angulo) * raio;
    const rot = Math.atan2(-Math.cos(angulo), -Math.sin(angulo));
    cadeirasReuniao.push({ x: reuniaoX + x, z: -0.4 + z, rot });
    const assento = new T.Mesh(geo(new T.BoxGeometry(0.5, 0.1, 0.5)), matMadeira);
    assento.position.set(x, 0.46, z);
    const pe = new T.Mesh(geo(new T.BoxGeometry(0.12, 0.4, 0.12)), matMadeiraEscura);
    pe.position.set(x, 0.2, z);
    ilhaReuniao.add(assento, pe);
  }

  const maquina = new T.Mesh(geo(new T.BoxGeometry(0.78, 0.92, 0.55)), lambert(0xff5d73));
  maquina.position.set(0.2, 0.46, -0.2);
  const faixa = new T.Mesh(geo(new T.BoxGeometry(0.82, 0.12, 0.58)), lambert(0xfff6dc));
  faixa.position.set(0.2, 0.72, -0.2);
  const xicara = new T.Mesh(geo(new T.CylinderGeometry(0.14, 0.12, 0.16, 8)), lambert(0xfffaf0));
  xicara.position.set(-0.55, 0.5, 0.45);
  const pires = new T.Mesh(geo(new T.CylinderGeometry(0.24, 0.24, 0.05, 8)), lambert(0xf0b45a));
  pires.position.set(-0.55, 0.4, 0.45);
  ilhaCafe.add(maquina, faixa, pires, xicara);
  const vapores: Tres[] = [];
  for (let i = 0; i < 3; i += 1) {
    const vapor = new T.Mesh(geo(new T.SphereGeometry(0.08, 6, 5)), matNuvem);
    vapor.position.set(0.2 + (i - 1) * 0.16, 1.05, -0.2);
    ilhaCafe.add(vapor);
    vapores.push(vapor);
  }
  const cafePontos = [
    { x: -1.2 - 0.9, z: cafeZ + 1.15, rot: Math.atan2(0.9, -1.15) },
    { x: -1.2 + 1.15, z: cafeZ + 0.9, rot: Math.atan2(-1.15, -0.9) },
  ];

  const listras = document.createElement("canvas");
  listras.width = 8;
  listras.height = 8;
  const ctxListra = listras.getContext("2d");
  if (ctxListra) {
    ctxListra.fillStyle = "#ff8a2a";
    ctxListra.fillRect(0, 0, 8, 8);
    ctxListra.fillStyle = "#fff6dc";
    ctxListra.fillRect(0, 0, 8, 4);
    const texListra = textura(new T.CanvasTexture(listras));
    texListra.magFilter = T.NearestFilter;
    texListra.minFilter = T.NearestFilter;
    texListra.wrapS = T.RepeatWrapping;
    texListra.wrapT = T.RepeatWrapping;
    texListra.repeat.set(1, 3);
    const matCone = material(new T.MeshLambertMaterial({ map: texListra, flatShading: true }));
    for (const lado of [-1.4, 1.5]) {
      const cone = new T.Mesh(geo(new T.ConeGeometry(0.28, 0.7, 6)), matCone);
      cone.position.set(lado, 0.35, 1.6);
      ilhaBreve.add(cone);
    }
  }

  const geoTampo = geo(new T.BoxGeometry(1.48, 0.12, 0.84));
  const geoPerna = geo(new T.BoxGeometry(0.1, 0.68, 0.1));
  const geoAssento = geo(new T.BoxGeometry(0.48, 0.1, 0.48));
  const geoPeCadeira = geo(new T.BoxGeometry(0.1, 0.36, 0.1));
  const geoMoldura = geo(new T.BoxGeometry(0.8, 0.52, 0.08));
  const geoTela = geo(new T.PlaneGeometry(0.66, 0.38));
  const geoBase = geo(new T.BoxGeometry(0.28, 0.06, 0.2));
  const geoPescoco = geo(new T.BoxGeometry(0.08, 0.18, 0.08));
  const geoTeclado = geo(new T.BoxGeometry(0.5, 0.05, 0.18));
  const geoTorre = geo(new T.BoxGeometry(0.28, 0.5, 0.4));
  const geoBaia = geo(new T.BoxGeometry(0.16, 0.08, 0.03));
  const geoLed = geo(new T.BoxGeometry(0.07, 0.07, 0.025));
  const geoAro = geo(new T.BoxGeometry(0.8, 0.07, 0.1));
  const geoMao = geo(new T.BoxGeometry(0.14, 0.08, 0.16));
  const geoVaso = geo(new T.CylinderGeometry(0.1, 0.13, 0.16, 6));
  const geoFolha = geo(new T.ConeGeometry(0.16, 0.34, 5));
  const geoSombra = geo(new T.CircleGeometry(0.46, 8));
  const geoCorpo = geo(new T.BoxGeometry(0.66, 0.58, 0.42));
  const geoCabeca = geo(new T.SphereGeometry(0.34, 10, 8));
  const geoBraco = geo(new T.BoxGeometry(0.18, 0.46, 0.18));
  const geoPernaBoneco = geo(new T.BoxGeometry(0.2, 0.5, 0.2));
  const geoOlho = geo(new T.SphereGeometry(0.075, 6, 5));
  const geoPupila = geo(new T.SphereGeometry(0.038, 5, 4));
  const geoTufo = geo(new T.SphereGeometry(0.16, 6, 5));
  const geoCabeloCaixa = geo(new T.BoxGeometry(0.5, 0.16, 0.42));
  const geoCabeloCone = geo(new T.ConeGeometry(0.18, 0.32, 5));
  const matMaoFantasma = lambert(0xd5dde4, 0.45);

  const texTeclas = textura(new T.CanvasTexture(desenharTeclado()));
  texTeclas.magFilter = T.NearestFilter;
  texTeclas.minFilter = T.NearestFilter;
  const matTeclado = material(new T.MeshLambertMaterial({ map: texTeclas, flatShading: true }));
  const matTecladoFantasma = material(
    new T.MeshLambertMaterial({ map: texTeclas, flatShading: true, transparent: true, opacity: 0.4 }),
  );

  function desenharTeclado() {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 32;
    const g = c.getContext("2d");
    if (!g) return c;
    g.fillStyle = "#2a3148";
    g.fillRect(0, 0, 64, 32);
    g.fillStyle = "#e7ecf8";
    for (let linha = 0; linha < 3; linha += 1) {
      for (let coluna = 0; coluna < 8; coluna += 1) {
        g.fillRect(4 + coluna * 7.4, 4 + linha * 9, 5.4, 6);
      }
    }
    return c;
  }

  type Mesa = {
    id: string;
    x: number;
    z: number;
    assentoX: number;
    assentoZ: number;
    chao: number;
    fantasma: boolean;
    ctx: CanvasRenderingContext2D;
    tex: Tres;
    matTela: Tres;
    matAro: Tres;
    matLed: Tres;
    maos: Tres;
    maosBase: number;
    desloc: number;
    ligada: boolean;
    ultimo: number;
  };

  type Pessoa = {
    id: string;
    cor: number;
    fantasma: boolean;
    chao: number;
    grupo: Tres;
    cabeca: Tres;
    bracoE: Tres;
    bracoD: Tres;
    pernaE: Tres;
    pernaD: Tres;
    ancora: Tres;
    ancoraFala: Tres;
    sombra: Tres;
    px: number;
    pz: number;
    rot: number;
    fase: number;
    etiqueta: HTMLButtonElement;
    balao: HTMLDivElement;
    estadoEl: HTMLSpanElement;
    pontoEl: HTMLElement;
    ultimoStatus: string;
    ultimaFala: string;
  };

  const mesas = new Map<string, Mesa>();
  const pessoas = new Map<string, Pessoa>();
  const hitboxes: Tres[] = [];

  function criarPosto(agente: (typeof EQUIPE)[number], x: number, z: number, pai: Tres, chao: number, fantasma: boolean) {
    const cor = hex(agente.cor);
    const grupo = new T.Group();
    grupo.position.set(x, 0, z);
    const madeira = fantasma ? lambert(0xd8c4a4, 0.45) : matMadeira;
    const madeiraEscura = fantasma ? lambert(0xc8b292, 0.4) : matMadeiraEscura;
    const bezel = fantasma ? lambert(0x8d93a3, 0.4) : matBezel;
    const tampo = new T.Mesh(geoTampo, madeira);
    tampo.position.y = 0.74;
    grupo.add(tampo);
    for (const [px, pz] of [
      [-0.62, -0.3],
      [0.62, -0.3],
      [-0.62, 0.3],
      [0.62, 0.3],
    ] as const) {
      const perna = new T.Mesh(geoPerna, madeiraEscura);
      perna.position.set(px, 0.34, pz);
      grupo.add(perna);
    }
    const cadeira = new T.Mesh(geoAssento, madeira);
    cadeira.position.set(0, 0.46, 1.05);
    const peCadeira = new T.Mesh(geoPeCadeira, madeiraEscura);
    peCadeira.position.set(0, 0.2, 1.05);
    grupo.add(cadeira, peCadeira);

    const canvasTela = document.createElement("canvas");
    canvasTela.width = 64;
    canvasTela.height = 48;
    const ctx = canvasTela.getContext("2d");
    if (!ctx) throw new Error("sem-webgl");
    desenharTela(ctx, agente.cor, 0, !fantasma);
    const tex = textura(new T.CanvasTexture(canvasTela));
    tex.magFilter = T.NearestFilter;
    tex.minFilter = T.NearestFilter;
    const matTela = material(
      new T.MeshLambertMaterial({
        map: tex,
        emissive: fantasma ? 0x222228 : cor,
        emissiveMap: tex,
        emissiveIntensity: fantasma ? 0 : 0.75,
        color: fantasma ? 0x333333 : 0xffffff,
        flatShading: true,
        transparent: fantasma,
        opacity: fantasma ? 0.4 : 1,
      }),
    );
    const matAro = material(
      new T.MeshBasicMaterial({
        color: fantasma ? 0x9aa3b2 : cor,
        transparent: fantasma,
        opacity: fantasma ? 0.45 : 1,
      }),
    );
    const matLed = material(
      new T.MeshBasicMaterial({
        color: fantasma ? 0x2a2e3a : cor,
        transparent: fantasma,
        opacity: fantasma ? 0.4 : 1,
      }),
    );

    const monitor = new T.Group();
    monitor.position.set(0, 0.8, -0.26);
    const base = new T.Mesh(geoBase, bezel);
    const pescoco = new T.Mesh(geoPescoco, bezel);
    pescoco.position.y = 0.14;
    const cabecaMonitor = new T.Group();
    cabecaMonitor.position.y = 0.46;
    cabecaMonitor.rotation.x = -0.58;
    const moldura = new T.Mesh(geoMoldura, bezel);
    const tela = new T.Mesh(geoTela, matTela);
    tela.position.z = 0.046;
    const aro = new T.Mesh(geoAro, matAro);
    aro.position.y = 0.3;
    cabecaMonitor.add(moldura, tela, aro);
    monitor.add(base, pescoco, cabecaMonitor);
    grupo.add(monitor);

    const teclado = new T.Mesh(geoTeclado, fantasma ? matTecladoFantasma : matTeclado);
    teclado.position.set(0, 0.83, 0.18);
    grupo.add(teclado);
    const maos = new T.Group();
    const matMaos = fantasma ? matMaoFantasma : lambert(clarear(cor, 30));
    const mãoE = new T.Mesh(geoMao, matMaos);
    mãoE.position.x = -0.12;
    const mãoD = new T.Mesh(geoMao, matMaos);
    mãoD.position.x = 0.12;
    maos.add(mãoE, mãoD);
    maos.position.set(0, 0.92, 0.2);
    maos.visible = false;
    grupo.add(maos);

    const torre = new T.Mesh(geoTorre, fantasma ? lambert(0x8b93a6, 0.4) : lambert(0x343a4e));
    torre.position.set(0.98, 0.25, 0.05);
    const baia = new T.Mesh(geoBaia, bezel);
    baia.position.set(0.98, 0.32, 0.26);
    const led = new T.Mesh(geoLed, matLed);
    led.position.set(0.98, 0.12, 0.26);
    grupo.add(torre, baia, led);

    if (hash(agente.id) % 3 === 0) {
      const vaso = new T.Mesh(geoVaso, fantasma ? lambert(0xd7c2a2, 0.4) : lambert(0xf4d7a2));
      vaso.position.set(-0.95, 0.16, -0.15);
      const folha = new T.Mesh(geoFolha, fantasma ? matGramaFantasma : matFolha);
      folha.position.set(-0.95, 0.4, -0.15);
      grupo.add(vaso, folha);
    }

    pai.add(grupo);
    mesas.set(agente.id, {
      id: agente.id,
      x: pai.position.x + x,
      z: pai.position.z + z,
      assentoX: pai.position.x + x,
      assentoZ: pai.position.z + z + 1.05,
      chao,
      fantasma,
      ctx,
      tex,
      matTela,
      matAro,
      matLed,
      maos,
      maosBase: 0.92,
      desloc: hash(agente.id) % 20,
      ligada: !fantasma,
      ultimo: 0,
    });
  }

  ativos.forEach((agente, indice) => {
    const linha = Math.floor(indice / colunas);
    const nesta = Math.min(colunas, ativos.length - linha * colunas);
    const coluna = indice % colunas;
    const x = (coluna - (nesta - 1) / 2) * PASSO_X;
    const z = (linha - (linhas - 1) / 2) * PASSO_Z + deslocZ;
    criarPosto(agente, x, z, ilha, 0, false);
  });
  breves.forEach((agente, indice) => {
    const x = (indice - (breves.length - 1) / 2) * 3.15;
    criarPosto(agente, x, 0.2, ilhaBreve, -1.25, true);
  });

  function criarPessoa(agente: (typeof EQUIPE)[number], mesa: Mesa) {
    const cor = hex(agente.cor);
    const fantasma = mesa.fantasma;
    const opacidade = fantasma ? 0.48 : 1;
    const matCorpo = lambert(cor, opacidade);
    const matCabeca = lambert(clarear(cor, 28), opacidade);
    const matCabelo = lambert(clarear(cor, -35), opacidade);
    const grupo = new T.Group();
    grupo.scale.setScalar(1.12);

    const corpo = new T.Mesh(geoCorpo, matCorpo);
    corpo.position.y = 0.86;
    grupo.add(corpo);

    const cabeca = new T.Group();
    cabeca.position.y = 1.34;
    const cranio = new T.Mesh(geoCabeca, matCabeca);
    cabeca.add(cranio);
    const olhoE = new T.Mesh(geoOlho, fantasma ? lambert(0xfffaf2, opacidade) : matOlho);
    olhoE.position.set(-0.11, 0.04, 0.26);
    const olhoD = new T.Mesh(geoOlho, fantasma ? lambert(0xfffaf2, opacidade) : matOlho);
    olhoD.position.set(0.11, 0.04, 0.26);
    const pupilaE = new T.Mesh(geoPupila, fantasma ? lambert(0x241c18, opacidade) : matPupila);
    pupilaE.position.set(-0.11, 0.04, 0.33);
    const pupilaD = new T.Mesh(geoPupila, fantasma ? lambert(0x241c18, opacidade) : matPupila);
    pupilaD.position.set(0.11, 0.04, 0.33);
    cabeca.add(olhoE, olhoD, pupilaE, pupilaD);
    const estilo = hash(agente.id) % 4;
    if (estilo === 1) {
      const tufo = new T.Mesh(geoTufo, matCabelo);
      tufo.position.y = 0.3;
      cabeca.add(tufo);
    } else if (estilo === 2) {
      const caixa = new T.Mesh(geoCabeloCaixa, matCabelo);
      caixa.position.y = 0.24;
      cabeca.add(caixa);
    } else if (estilo === 3) {
      const cone = new T.Mesh(geoCabeloCone, matCabelo);
      cone.position.y = 0.36;
      cabeca.add(cone);
    }
    grupo.add(cabeca);

    function membro(geoMembro: Tres, x: number, y: number) {
      const pivo = new T.Group();
      pivo.position.set(x, y, 0);
      const malha = new T.Mesh(geoMembro, matCorpo);
      malha.position.y = -0.22;
      pivo.add(malha);
      grupo.add(pivo);
      return pivo;
    }
    const bracoE = membro(geoBraco, -0.44, 1.05);
    const bracoD = membro(geoBraco, 0.44, 1.05);
    const pernaE = membro(geoPernaBoneco, -0.16, 0.52);
    const pernaD = membro(geoPernaBoneco, 0.16, 0.52);

    const ancora = new T.Object3D();
    ancora.position.y = 1.95;
    const ancoraFala = new T.Object3D();
    ancoraFala.position.y = 2.55;
    grupo.add(ancora, ancoraFala);

    const hitbox = new T.Mesh(
      geo(new T.BoxGeometry(0.9, 1.7, 0.8)),
      material(new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })),
    );
    hitbox.position.y = 0.9;
    hitbox.userData.id = agente.id;
    grupo.add(hitbox);
    hitboxes.push(hitbox);

    const sombra = new T.Mesh(geoSombra, matSombra);
    sombra.rotation.x = -Math.PI / 2;
    sombra.position.y = mesa.chao + 0.03;
    cena.add(sombra, grupo);

    const etiqueta = document.createElement("button");
    etiqueta.type = "button";
    etiqueta.className = classes.etiqueta;
    etiqueta.setAttribute("aria-label", `${agente.nome}, ${agente.papel}`);
    const nomeEl = document.createElement("span");
    nomeEl.className = classes.nome;
    nomeEl.textContent = agente.nome;
    const papelEl = document.createElement("span");
    papelEl.className = classes.papel;
    papelEl.textContent = agente.papel;
    const estadoEl = document.createElement("span");
    estadoEl.className = classes.linha;
    const pontoEl = document.createElement("i");
    pontoEl.className = classes.ponto;
    estadoEl.append(pontoEl, document.createTextNode(""));
    etiqueta.append(nomeEl, papelEl, estadoEl);
    etiqueta.addEventListener("click", (evento) => {
      evento.stopPropagation();
      opcoes.aoClicar(agente.id);
    });

    const balao = document.createElement("div");
    balao.className = classes.balao;
    balao.hidden = true;
    camada.append(etiqueta, balao);

    grupo.position.set(mesa.assentoX, mesa.chao, mesa.assentoZ);
    grupo.rotation.y = Math.PI;

    pessoas.set(agente.id, {
      id: agente.id,
      cor,
      fantasma,
      chao: mesa.chao,
      grupo,
      cabeca,
      bracoE,
      bracoD,
      pernaE,
      pernaD,
      ancora,
      ancoraFala,
      sombra,
      px: mesa.assentoX,
      pz: mesa.assentoZ,
      rot: Math.PI,
      fase: (hash(agente.id) % 1000) / 160,
      etiqueta,
      balao,
      estadoEl,
      pontoEl,
      ultimoStatus: "",
      ultimaFala: "",
    });
  }

  for (const agente of EQUIPE) {
    const mesa = mesas.get(agente.id);
    if (mesa) criarPessoa(agente, mesa);
  }

  const raioBase = Math.max(largura, profundidade) * 0.92 + 8;
  let teta = 0.62;
  let phi = 0.96;
  let raio = raioBase;
  let raioAlvo = raioBase;
  let pausaAte = 0;
  let focoAtual: string | null = null;
  let zoomManual = false;
  let arrastando = false;
  const olhar = new T.Vector3(0, 1.2, 0);
  const olharAlvo = new T.Vector3(0, 1.2, 0);
  const raycaster = new T.Raycaster();
  const ponteiro = new T.Vector2();
  const ponteiros = new Map<number, { x: number; y: number }>();
  let distanciaPinca = 0;
  let origem = { x: 0, y: 0 };
  let moveu = false;
  const abortar = new AbortController();
  const sinal = abortar.signal;
  const vTmp = new T.Vector3();
  const vDir = new T.Vector3();
  const vFrente = new T.Vector3();

  function enquadrar() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w < 2 || h < 2) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w, h, false);
  }
  const observador = new ResizeObserver(() => enquadrar());
  observador.observe(canvas.parentElement ?? canvas);
  enquadrar();

  function clicarNaCena(evento: PointerEvent) {
    const retangulo = canvas.getBoundingClientRect();
    ponteiro.x = ((evento.clientX - retangulo.left) / retangulo.width) * 2 - 1;
    ponteiro.y = -((evento.clientY - retangulo.top) / retangulo.height) * 2 + 1;
    raycaster.setFromCamera(ponteiro, camera);
    const acertos = raycaster.intersectObjects(hitboxes, false);
    const id = acertos[0]?.object?.userData?.id;
    opcoes.aoClicar(typeof id === "string" ? id : null);
  }

  function distanciaDos() {
    const pontos = [...ponteiros.values()];
    if (pontos.length < 2) return 0;
    return Math.hypot(pontos[0].x - pontos[1].x, pontos[0].y - pontos[1].y);
  }

  canvas.addEventListener(
    "pointerdown",
    (evento) => {
      canvas.setPointerCapture(evento.pointerId);
      ponteiros.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
      if (ponteiros.size === 1) {
        origem = { x: evento.clientX, y: evento.clientY };
        moveu = false;
        arrastando = true;
      } else {
        distanciaPinca = distanciaDos();
        arrastando = false;
        moveu = true;
      }
    },
    { signal: sinal },
  );
  canvas.addEventListener(
    "pointermove",
    (evento) => {
      const anterior = ponteiros.get(evento.pointerId);
      if (!anterior) return;
      const dx = evento.clientX - anterior.x;
      const dy = evento.clientY - anterior.y;
      ponteiros.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
      if (ponteiros.size >= 2 && distanciaPinca > 0) {
        const agoraDist = distanciaDos();
        if (agoraDist > 0) {
          raioAlvo = Math.min(72, Math.max(8, raioAlvo * (distanciaPinca / agoraDist)));
          distanciaPinca = agoraDist;
          zoomManual = true;
        }
        return;
      }
      if (!arrastando) return;
      if (Math.hypot(evento.clientX - origem.x, evento.clientY - origem.y) > 5) moveu = true;
      teta -= dx * 0.0055;
      phi = Math.min(1.28, Math.max(0.42, phi - dy * 0.004));
      pausaAte = performance.now() + 6500;
    },
    { signal: sinal },
  );
  const soltarPonteiro = (evento: PointerEvent) => {
    const eraUm = ponteiros.size === 1;
    ponteiros.delete(evento.pointerId);
    if (eraUm && !moveu) clicarNaCena(evento);
    if (ponteiros.size === 0) arrastando = false;
    pausaAte = performance.now() + 5000;
  };
  canvas.addEventListener("pointerup", soltarPonteiro, { signal: sinal });
  canvas.addEventListener("pointercancel", soltarPonteiro, { signal: sinal });
  canvas.addEventListener(
    "wheel",
    (evento) => {
      evento.preventDefault();
      raioAlvo = Math.min(72, Math.max(8, raioAlvo * Math.exp(evento.deltaY * 0.0011)));
      zoomManual = true;
      pausaAte = performance.now() + 4000;
    },
    { passive: false, signal: sinal },
  );

  let ultimo = performance.now();
  let quadro = 0;
  let vivo = true;

  function destinoDe(estado: EstadoEscritorio, id: string, lugar: Lugar, falandoCom: string | null) {
    const mesa = mesas.get(id);
    if (!mesa) return null;
    if (lugar === "reuniao") {
      const ocupantes = estado.agentes
        .filter((agente) => agente.lugar === "reuniao")
        .map((agente) => agente.id)
        .sort();
      const indice = Math.max(0, ocupantes.indexOf(id));
      const cadeira = cadeirasReuniao[indice % cadeirasReuniao.length];
      return { x: cadeira.x, z: cadeira.z, rot: cadeira.rot, sentar: true, chao: 0 };
    }
    if (lugar === "cafe") {
      const vaga = cafePontos[hash(id) % cafePontos.length];
      return { x: vaga.x, z: vaga.z, rot: vaga.rot, sentar: false, chao: 0 };
    }
    if (lugar === "visita" && falandoCom) {
      const anfitriao = mesas.get(falandoCom);
      if (anfitriao) {
        return {
          x: anfitriao.x + 1.25,
          z: anfitriao.z + 0.15,
          rot: Math.atan2(anfitriao.x - (anfitriao.x + 1.25), anfitriao.z - (anfitriao.z + 0.15)),
          sentar: false,
          chao: anfitriao.chao,
        };
      }
    }
    return { x: mesa.assentoX, z: mesa.assentoZ, rot: Math.PI, sentar: !mesa.fantasma, chao: mesa.chao };
  }

  function projetar(objeto: Tres, larguraTela: number, alturaTela: number) {
    objeto.getWorldPosition(vTmp);
    vDir.copy(vTmp).sub(camera.position);
    const frente = vDir.dot(camera.getWorldDirection(vFrente));
    vTmp.project(camera);
    return {
      visivel: frente > 0.15 && vTmp.z < 1,
      x: (vTmp.x * 0.5 + 0.5) * larguraTela,
      y: (-vTmp.y * 0.5 + 0.5) * alturaTela,
    };
  }

  function quadroLoop(agora: number) {
    if (!vivo) return;
    const dt = Math.min(0.05, (agora - ultimo) / 1000);
    ultimo = agora;
    opcoes.aoQuadro(dt, agora);
    const estado = opcoes.obterEstado();
    const reduzido = opcoes.movimentoReduzido();
    const tempo = agora / 1000;

    for (const pose of estado.agentes) {
      const pessoa = pessoas.get(pose.id);
      const mesa = mesas.get(pose.id);
      if (!pessoa || !mesa) continue;
      const alvo = destinoDe(estado, pose.id, pose.lugar, pose.falandoCom);
      if (!alvo) continue;
      const dx = alvo.x - pessoa.px;
      const dz = alvo.z - pessoa.pz;
      const dist = Math.hypot(dx, dz);
      const andando = dist > 0.09 && !pessoa.fantasma;
      if (andando) {
        const passo = Math.min(dist, VELOCIDADE * dt);
        pessoa.px += (dx / dist) * passo;
        pessoa.pz += (dz / dist) * passo;
        pessoa.rot = Math.atan2(dx, dz);
      } else {
        let rotAlvo = alvo.rot;
        if (pose.status === "em_conversa" && pose.lugar === "mesa") {
          rotAlvo = Math.atan2(1.25, 0.15);
        }
        pessoa.rot = aproximarAngulo(pessoa.rot, rotAlvo, dt * 5);
        pessoa.px = alvo.x;
        pessoa.pz = alvo.z;
      }

      const sentado = !andando && alvo.sentar && !pessoa.fantasma;
      const digitando = sentado && pose.status === "trabalhando" && pose.lugar === "mesa";
      if (andando && !reduzido) {
        const balanco = Math.sin(tempo * 9 + pessoa.fase);
        pessoa.pernaE.rotation.x = balanco * 0.65;
        pessoa.pernaD.rotation.x = -balanco * 0.65;
        pessoa.bracoE.rotation.x = -balanco * 0.45;
        pessoa.bracoD.rotation.x = balanco * 0.45;
        pessoa.grupo.position.y = pessoa.chao + Math.abs(balanco) * 0.05;
      } else if (sentado) {
        pessoa.pernaE.rotation.x = -1.15;
        pessoa.pernaD.rotation.x = -1.15;
        pessoa.grupo.position.y = pessoa.chao - 0.16;
        if (digitando && !reduzido) {
          pessoa.bracoE.rotation.x = -0.95 + Math.sin(tempo * 14 + pessoa.fase) * 0.2;
          pessoa.bracoD.rotation.x = -0.95 + Math.sin(tempo * 14 + pessoa.fase + 1.3) * 0.2;
        } else {
          pessoa.bracoE.rotation.x = pose.status === "em_conversa" ? -0.35 : -0.7;
          pessoa.bracoD.rotation.x = pose.status === "em_conversa" ? -0.35 : -0.7;
        }
      } else {
        pessoa.pernaE.rotation.x = 0;
        pessoa.pernaD.rotation.x = 0;
        pessoa.bracoE.rotation.x = 0;
        pessoa.bracoD.rotation.x = 0;
        const flutuar = pessoa.fantasma && !reduzido ? Math.sin(tempo * 1.5 + pessoa.fase) * 0.08 : 0;
        pessoa.grupo.position.y = pessoa.chao + flutuar;
      }
      pessoa.grupo.position.x = pessoa.px;
      pessoa.grupo.position.z = pessoa.pz;
      pessoa.grupo.rotation.y = pessoa.rot;
      pessoa.sombra.position.x = pessoa.px;
      pessoa.sombra.position.z = pessoa.pz;
      if (!reduzido && pose.status === "ocioso" && !andando) {
        pessoa.cabeca.rotation.y = Math.sin(tempo * 0.7 + pessoa.fase) * 0.35;
      } else {
        pessoa.cabeca.rotation.y *= 0.8;
      }

      const ligada = digitando && !pessoa.fantasma;
      if (pessoa.fantasma) {
        mesa.maos.visible = false;
      } else if (ligada) {
        mesa.matTela.color.setHex(0xffffff);
        mesa.matTela.emissive.setHex(pessoa.cor);
        mesa.matTela.emissiveIntensity = 0.82;
        mesa.matAro.color.setHex(pessoa.cor);
        mesa.matLed.color.setHex(0xc6ff7a);
        mesa.maos.visible = true;
        if (!reduzido) {
          mesa.maos.position.y = mesa.maosBase + Math.sin(tempo * 14 + pessoa.fase) * 0.025;
          if (agora - mesa.ultimo > 90) {
            mesa.desloc = (mesa.desloc + 3) % 34;
            desenharTela(mesa.ctx, EQUIPE.find((item) => item.id === pose.id)?.cor ?? "#ffffff", mesa.desloc, true);
            mesa.tex.needsUpdate = true;
            mesa.ultimo = agora;
          }
        } else if (!mesa.ligada) {
          desenharTela(mesa.ctx, EQUIPE.find((item) => item.id === pose.id)?.cor ?? "#ffffff", 0, true);
          mesa.tex.needsUpdate = true;
        }
        mesa.ligada = true;
      } else if (mesa.ligada) {
        desenharTela(mesa.ctx, "#888888", 0, false);
        mesa.tex.needsUpdate = true;
        mesa.matTela.emissiveIntensity = 0.02;
        mesa.matTela.emissive.setHex(0x22222a);
        mesa.matTela.color.setHex(0x555555);
        mesa.matAro.color.setHex(0x3a4154);
        mesa.matLed.color.setHex(0x2a2e3a);
        mesa.maos.visible = false;
        mesa.ligada = false;
      }

      if (pessoa.ultimoStatus !== pose.status) {
        pessoa.ultimoStatus = pose.status;
        pessoa.pontoEl.style.background = COR_STATUS[pose.status];
        const texto = pessoa.estadoEl.lastChild;
        if (texto) texto.textContent = ` ${ROTULO_STATUS[pose.status]}`;
      }
      pessoa.etiqueta.dataset.ativa = estado.selecionadoId === pose.id ? "sim" : "nao";
      const fala = pose.status === "em_conversa" || pose.status === "em_reuniao" ? pose.ultimaFala : "";
      if (fala !== pessoa.ultimaFala) {
        pessoa.ultimaFala = fala;
        pessoa.balao.textContent = fala;
      }
    }

    if (!reduzido && !arrastando && !estado.selecionadoId && agora > pausaAte) {
      teta += dt * 0.15;
    }
    if (estado.selecionadoId !== focoAtual) {
      focoAtual = estado.selecionadoId;
      zoomManual = false;
      raioAlvo = focoAtual ? Math.min(raioBase, 11.5) : raioBase;
    }
    if (estado.selecionadoId) {
      const foco = pessoas.get(estado.selecionadoId);
      if (foco) olharAlvo.set(foco.px, foco.chao + 1.25, foco.pz);
    } else {
      olharAlvo.set(0, 1.15, deslocZ * 0.25);
      if (!zoomManual) raioAlvo = raioBase;
    }
    const suave = 1 - Math.exp(-2.8 * dt);
    olhar.lerp(olharAlvo, suave);
    raio += (raioAlvo - raio) * suave;
    const seno = Math.sin(phi);
    camera.position.set(
      olhar.x + raio * seno * Math.sin(teta),
      olhar.y + raio * Math.cos(phi),
      olhar.z + raio * seno * Math.cos(teta),
    );
    camera.lookAt(olhar);

    if (!reduzido) {
      for (const nuvem of derivas) {
        nuvem.position.x += dt * 0.35;
        if (nuvem.position.x > 46) nuvem.position.x = -46;
      }
      balaoGrupo.forEach((balao, indice) => {
        balao.position.y += Math.sin(tempo * 1.2 + indice) * dt * 0.15;
      });
      vapores.forEach((vapor, indice) => {
        vapor.position.y = 1.02 + ((tempo * 0.35 + indice * 0.3) % 0.45);
      });
    }

    const larguraTela = canvas.clientWidth;
    const alturaTela = canvas.clientHeight;
    if (larguraTela > 2 && alturaTela > 2) {
      for (const pessoa of pessoas.values()) {
        const tag = projetar(pessoa.ancora, larguraTela, alturaTela);
        pessoa.etiqueta.hidden = !tag.visivel;
        if (tag.visivel) {
          pessoa.etiqueta.style.transform = `translate(${tag.x}px, ${tag.y}px) translate(-50%, -100%)`;
        }
        if (pessoa.ultimaFala.length === 0) {
          pessoa.balao.hidden = true;
        } else {
          const falaNaTela = projetar(pessoa.ancoraFala, larguraTela, alturaTela);
          pessoa.balao.hidden = !falaNaTela.visivel;
          if (falaNaTela.visivel) {
            pessoa.balao.style.transform = `translate(${falaNaTela.x}px, ${falaNaTela.y}px) translate(-50%, -100%)`;
          }
        }
      }
      renderer.render(cena, camera);
    }
    quadro = window.requestAnimationFrame(quadroLoop);
  }
  quadro = window.requestAnimationFrame(quadroLoop);

  return {
    destruir() {
      vivo = false;
      window.cancelAnimationFrame(quadro);
      abortar.abort();
      observador.disconnect();
      camada.replaceChildren();
      for (const item of geos) item.dispose?.();
      for (const item of mats) item.dispose?.();
      for (const item of texs) item.dispose?.();
      renderer.dispose();
      renderer.forceContextLoss?.();
    },
  };
}
