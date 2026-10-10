// ============================================================
// Monta data/techsupri-catalogo.json a partir da captura do catálogo da
// TechSupri (feita pelo navegador da loja) e procura uma foto de cada
// produto na KaBuM! — as fotos da TechSupri têm marca d'água e não são usadas.
//
// Uso:
//   npx tsx scripts/techsupri-carga.ts <captura.txt> [--sem-fotos]
//
// Formato da captura, uma linha por produto:
//   <id kyte sem o sufixo>|<nome>|<preço>|<preço promocional>|<categoria kyte>|<X se indisponível>
//
// Pode ser interrompido e rodado de novo: as fotos já achadas ficam guardadas
// em data/techsupri-fotos.json e não são buscadas outra vez.
// ============================================================

import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { buscarFotoNaKabum } from "../lib/precos/fotos";
import type { ProdutoCapturado } from "../lib/precos/techsupri";

const SUFIXO_KYTE = "-X5mQX";
const RAIZ = path.join(__dirname, "..");
const ARQ_FOTOS = path.join(RAIZ, "data", "techsupri-fotos.json");
const ARQ_SAIDA = path.join(RAIZ, "data", "techsupri-catalogo.json");

type Foto = { foto: string; fotos: string[]; achadoEm: string; nome: string; nota: number } | { semFoto: true; tentadoEm: string };

function lerCaptura(arquivo: string): ProdutoCapturado[] {
  return readFileSync(arquivo, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((linha) => {
      const [id, nome, preco, promo, categoria, indisponivel] = linha.split("|");
      const kyteId = `${id}${SUFIXO_KYTE}`;
      return {
        id: kyteId,
        name: nome,
        salePrice: Number(preco) || 0,
        salePromotionalPrice: Number(promo) || null,
        category: { name: (categoria || "").trim() || null } as { name?: string },
        active: indisponivel !== "X",
        showOnCatalog: true,
        url: `https://techsupri.kyte.site/pt-BR/p/produto/${kyteId}`,
      };
    });
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const [arquivo, ...opcoes] = process.argv.slice(2);
  if (!arquivo) throw new Error("Informe o arquivo da captura.");
  const semFotos = opcoes.includes("--sem-fotos");
  const produtos = lerCaptura(arquivo);
  const fotos: Record<string, Foto> = existsSync(ARQ_FOTOS) ? JSON.parse(readFileSync(ARQ_FOTOS, "utf8")) : {};

  if (!semFotos) {
    let feitos = 0;
    for (const p of produtos) {
      if (fotos[p.id]) continue;
      const busca = await buscarFotoNaKabum(p.name);
      if (!busca.ok) {
        console.error(`\n${busca.motivo}: ${busca.detalhe}`);
        if (busca.motivo === "bloqueado") break;
        await dormir(3000);
        continue;
      }
      fotos[p.id] = busca.achada
        ? { foto: busca.achada.foto, fotos: busca.achada.fotos.slice(0, 6), achadoEm: new Date().toISOString(), nome: busca.achada.nome, nota: Math.round(busca.achada.nota * 100) / 100 }
        : { semFoto: true, tentadoEm: new Date().toISOString() };
      feitos++;
      if (feitos % 20 === 0) {
        writeFileSync(ARQ_FOTOS, JSON.stringify(fotos, null, 1));
        process.stdout.write(`${feitos} `);
      }
      await dormir(1200);
    }
    writeFileSync(ARQ_FOTOS, JSON.stringify(fotos, null, 1));
  }

  const saida = produtos.map((p) => {
    const f = fotos[p.id];
    return f && "foto" in f ? { ...p, foto: f.foto, fotos: f.fotos } : p;
  });
  writeFileSync(ARQ_SAIDA, JSON.stringify({ capturadoEm: new Date().toISOString(), produtos: saida }, null, 1));
  const comFoto = saida.filter((p) => "foto" in p && p.foto).length;
  console.log(`\n${saida.length} produtos, ${comFoto} com foto, ${saida.length - comFoto} sem foto -> ${path.relative(RAIZ, ARQ_SAIDA)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
