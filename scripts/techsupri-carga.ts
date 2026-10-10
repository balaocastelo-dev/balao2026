// ============================================================
// Monta data/techsupri-catalogo.json a partir da captura do catálogo da
// TechSupri (feita pelo navegador da loja) e procura uma foto de cada
// produto na KaBuM! — as fotos da TechSupri têm marca d'água e não são usadas.
//
// Uso:
//   npx tsx scripts/techsupri-carga.ts <captura.txt> [--sem-fotos] [--reconferir]
//
// --reconferir passa as fotos já achadas pela regra de semelhança atual e
// descarta (para buscar de novo) as que não passam mais.
//
// Formato da captura, uma linha por produto:
//   <id kyte sem o sufixo>|<nome>|<preço>|<preço promocional>|<categoria kyte>|<X se indisponível>
//
// Pode ser interrompido e rodado de novo: as fotos já achadas ficam guardadas
// em data/techsupri-fotos.json e não são buscadas outra vez.
// ============================================================

import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { buscarFotoNaAmericanas, buscarFotoNaKabum, buscarFotoNaKalunga, NOTA_MINIMA, semelhanca, termoCurto } from "../lib/precos/fotos";
import { marcaDoTechsupri } from "../lib/precos/techsupri";
import type { ProdutoCapturado } from "../lib/precos/techsupri";

const SUFIXO_KYTE = "-X5mQX";
const RAIZ = path.join(__dirname, "..");
const ARQ_FOTOS = path.join(RAIZ, "data", "techsupri-fotos.json");
const ARQ_SAIDA = path.join(RAIZ, "data", "techsupri-catalogo.json");

type Foto =
  | { foto: string; fotos: string[]; achadoEm: string; nome: string; nota: number; origem?: string }
  | { semFoto: true; tentadoEm: string; kalunga?: boolean; curto?: boolean; americanas?: boolean };

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

  if (opcoes.includes("--reconferir")) {
    const nomes = new Map(produtos.map((p) => [p.id, p.name]));
    let descartadas = 0;
    for (const [id, f] of Object.entries(fotos)) {
      if (!("foto" in f) || !nomes.has(id)) continue;
      if (semelhanca(nomes.get(id)!, f.nome) < NOTA_MINIMA) {
        delete fotos[id];
        descartadas++;
      }
    }
    console.log(`reconferência: ${descartadas} fotos descartadas`);
    writeFileSync(ARQ_FOTOS, JSON.stringify(fotos, null, 1));
  }

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

    // Segunda tentativa, na Kalunga, para quem a KaBuM! não tinha.
    let naKalunga = 0;
    for (const p of produtos) {
      const f = fotos[p.id];
      if (!f || !("semFoto" in f) || f.kalunga) continue;
      const busca = await buscarFotoNaKalunga(p.name);
      if (!busca.ok) {
        console.error(`\nKalunga ${busca.motivo}: ${busca.detalhe}`);
        if (busca.motivo === "bloqueado") break;
        await dormir(3000);
        continue;
      }
      fotos[p.id] = busca.achada
        ? { foto: busca.achada.foto, fotos: busca.achada.fotos, achadoEm: new Date().toISOString(), nome: busca.achada.nome, nota: Math.round(busca.achada.nota * 100) / 100, origem: "kalunga" }
        : { semFoto: true, tentadoEm: new Date().toISOString(), kalunga: true };
      if (busca.achada) naKalunga++;
      if (++feitos % 20 === 0) writeFileSync(ARQ_FOTOS, JSON.stringify(fotos, null, 1));
      await dormir(1200);
    }
    writeFileSync(ARQ_FOTOS, JSON.stringify(fotos, null, 1));
    console.log(`\nKalunga: ${naKalunga} fotos a mais`);

    // Terceira tentativa, na KaBuM! com o termo curto (marca + modelo).
    let curtas = 0;
    for (const p of produtos) {
      const f = fotos[p.id];
      if (!f || !("semFoto" in f) || f.curto) continue;
      const termo = termoCurto(p.name, marcaDoTechsupri(p.name));
      if (!termo || termo === p.name) {
        fotos[p.id] = { ...f, curto: true };
        continue;
      }
      const busca = await buscarFotoNaKabum(p.name, fetch, termo);
      if (!busca.ok) {
        if (busca.motivo === "bloqueado") break;
        await dormir(3000);
        continue;
      }
      fotos[p.id] = busca.achada
        ? { foto: busca.achada.foto, fotos: busca.achada.fotos.slice(0, 6), achadoEm: new Date().toISOString(), nome: busca.achada.nome, nota: Math.round(busca.achada.nota * 100) / 100, origem: "kabum-curto" }
        : { ...f, curto: true };
      if (busca.achada) curtas++;
      if (++feitos % 20 === 0) writeFileSync(ARQ_FOTOS, JSON.stringify(fotos, null, 1));
      await dormir(1200);
    }
    writeFileSync(ARQ_FOTOS, JSON.stringify(fotos, null, 1));
    console.log(`KaBuM! (termo curto): ${curtas} fotos a mais`);

    // Quarta tentativa: Americanas (muito acessório de marketplace).
    let naAmericanas = 0;
    for (const p of produtos) {
      const f = fotos[p.id];
      if (!f || !("semFoto" in f) || f.americanas) continue;
      const curto = termoCurto(p.name, marcaDoTechsupri(p.name));
      const busca = await buscarFotoNaAmericanas(p.name, fetch, curto ? [curto] : []);
      if (!busca.ok) {
        console.error(`\nAmericanas ${busca.motivo}: ${busca.detalhe}`);
        if (busca.motivo === "bloqueado") break;
        await dormir(3000);
        continue;
      }
      fotos[p.id] = busca.achada
        ? { foto: busca.achada.foto, fotos: busca.achada.fotos, achadoEm: new Date().toISOString(), nome: busca.achada.nome, nota: Math.round(busca.achada.nota * 100) / 100, origem: "americanas" }
        : { ...f, americanas: true };
      if (busca.achada) naAmericanas++;
      if (++feitos % 20 === 0) writeFileSync(ARQ_FOTOS, JSON.stringify(fotos, null, 1));
      await dormir(1000);
    }
    writeFileSync(ARQ_FOTOS, JSON.stringify(fotos, null, 1));
    console.log(`Americanas: ${naAmericanas} fotos a mais`);
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
