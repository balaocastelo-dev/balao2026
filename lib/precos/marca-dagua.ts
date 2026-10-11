// ============================================================
// As fotos de um fornecedor têm marca d'água / logo dele?
//
// A marca d'água de uma loja fica no MESMO lugar em todas as fotos (a da
// TechSupri: logo no canto de baixo, à direita). O produto muda de foto para
// foto. Então, sobrepondo várias fotos do fornecedor reduzidas ao mesmo
// tamanho, a marca aparece como pixels escuros que quase não variam; já a
// área do produto varia muito e o fundo branco não é escuro.
//
// `analisarMarca` é pura (recebe os pixels); `fotosTemMarca` baixa as fotos.
// ============================================================

export const LADO = 48;

export interface AnaliseDaMarca {
  /** Fração da imagem com pixels escuros e iguais em quase todas as fotos. */
  fracao: number;
  temMarca: boolean;
  fotos: number;
}

/** Acima desta fração de pixels "fixos" a loja carimba as fotos. */
export const LIMITE_DA_MARCA = 0.01;

/**
 * @param imagens  cada uma com LADO×LADO valores de cinza (0 = preto, 255 = branco).
 */
export function analisarMarca(imagens: Uint8Array[]): AnaliseDaMarca {
  const n = imagens.length;
  if (n < 6) return { fracao: 0, temMarca: false, fotos: n };
  const total = LADO * LADO;
  let fixos = 0;
  const coluna = new Array<number>(n);
  for (let p = 0; p < total; p++) {
    for (let i = 0; i < n; i++) coluna[i] = imagens[i][p];
    const ordenados = [...coluna].sort((a, b) => a - b);
    const mediana = ordenados[Math.floor(n / 2)];
    // Fundo branco puro fica de fora; marca d'água clarinha (cinza) entra.
    if (mediana > 245) continue;
    // Quantas fotos ficam perto da mediana neste ponto.
    const perto = coluna.filter((v) => Math.abs(v - mediana) <= 20).length;
    if (perto / n >= 0.7) fixos++;
  }
  const fracao = fixos / total;
  return { fracao: Math.round(fracao * 10000) / 10000, temMarca: fracao >= LIMITE_DA_MARCA, fotos: n };
}

/** Baixa até `limite` fotos e diz se o fornecedor carimba as fotos. */
export async function fotosTemMarca(
  urls: string[],
  opcoes: { limite?: number; buscar?: typeof fetch } = {}
): Promise<AnaliseDaMarca> {
  const sharp = (await import("sharp")).default;
  const buscar = opcoes.buscar ?? fetch;
  const escolhidas = espalhar(urls.filter(Boolean), opcoes.limite ?? 24);
  const imagens: Uint8Array[] = [];
  await Promise.all(
    escolhidas.map(async (url) => {
      try {
        const r = await buscar(url, { signal: AbortSignal.timeout(10_000) });
        if (!r.ok) return;
        const buf = Buffer.from(await r.arrayBuffer());
        const px = await sharp(buf).flatten({ background: "#ffffff" }).grayscale().resize(LADO, LADO, { fit: "fill" }).raw().toBuffer();
        if (px.length === LADO * LADO) imagens.push(new Uint8Array(px));
      } catch {
        /* foto que não abriu fica de fora */
      }
    })
  );
  return analisarMarca(imagens);
}

/** Pega `n` itens espalhados pela lista (não só os primeiros, que costumam ser da mesma categoria). */
function espalhar<T>(lista: T[], n: number): T[] {
  if (lista.length <= n) return lista;
  const passo = lista.length / n;
  return Array.from({ length: n }, (_, i) => lista[Math.floor(i * passo)]);
}
