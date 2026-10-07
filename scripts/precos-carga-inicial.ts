// Lê na KaBuM! as categorias que formam o catálogo do site e grava:
//   data/catalogo-inicial.json  — os itens crus, por fonte (é o que a troca do
//                                 catálogo carrega no banco);
//   data/catalogo-backup.json   — o mesmo catálogo já com preço de venda, no
//                                 formato do site (a reserva estática que a loja
//                                 mostra se o banco e a VPS falharem juntos).
//
// Uso: npx tsx scripts/precos-carga-inicial.ts            (lê a KaBuM! de novo)
//      npx tsx scripts/precos-carga-inicial.ts --reusar   (remonta os arquivos com a última leitura)
//
// Uma página a cada 2 segundos. Se a KaBuM! recusar (403/429), o script para.

import fs from "fs";
import path from "path";
import { lerPaginaDaCategoria, type ItemDeOrigem } from "../lib/precos/kabum";
import { montarProduto, motivoDeRecusa, type RegrasDaFonte } from "../lib/precos/produto";
import { buildCategoryNodesFromPaths } from "../lib/utils";

const MARGEM = 33;
const PAUSA_MS = 2000;

interface Receita {
  id: string;
  nome: string;
  caminho: string;
  so_loja: boolean;
  preco_max?: number;
}

// A ordem aqui é a ordem do menu do site.
const FONTES: Receita[] = [
  { id: "kabum-hardware", nome: "Hardware", caminho: "hardware", so_loja: true },
  // A KaBuM! não vende PC gamer montado: aqui entram os lojistas do marketplace,
  // só como referência de configuração e preço. Acima de R$ 30 mil é anúncio absurdo.
  { id: "kabum-pc-gamer", nome: "PC Gamer", caminho: "computadores/pc/pc-gamer", so_loja: false, preco_max: 30000 },
  { id: "kabum-notebooks", nome: "Notebooks", caminho: "computadores/notebooks", so_loja: true },
  { id: "kabum-monitores", nome: "Monitores", caminho: "computadores/monitores", so_loja: true },
  { id: "kabum-redes", nome: "Redes", caminho: "conectividade", so_loja: true },
  { id: "kabum-desktop", nome: "Desktop e Office", caminho: "computadores/pc", so_loja: true },
  { id: "kabum-cadeiras-mesas-gamer", nome: "Cadeiras e Mesas Gamer", caminho: "espaco-gamer", so_loja: true },
  { id: "kabum-cadeiras-mesas-escritorio", nome: "Cadeiras e Mesas de Escritório", caminho: "escritorio", so_loja: true },
  { id: "kabum-celular", nome: "Celular", caminho: "celular-smartphone", so_loja: true },
  { id: "kabum-projetor", nome: "Projetor", caminho: "projetores", so_loja: true },
  { id: "kabum-audio", nome: "Áudio", caminho: "audio", so_loja: true },
  { id: "kabum-energia", nome: "Energia", caminho: "energia", so_loja: true },
  { id: "kabum-tablet", nome: "Tablet", caminho: "tablets-ipads-e-e-readers", so_loja: true },
  { id: "kabum-automacao", nome: "Automação", caminho: "automacao", so_loja: true },
  { id: "kabum-games", nome: "Games", caminho: "gamer", so_loja: true },
];

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function lerFonte(receita: Receita) {
  const itens = new Map<string, ItemDeOrigem>();
  let trilha = "";
  let total = 1;
  for (let pagina = 1; pagina <= total; pagina++) {
    if (pagina > 1) await dormir(PAUSA_MS);
    let leitura = await lerPaginaDaCategoria(receita.caminho, receita.so_loja, pagina);
    if (!leitura.ok && leitura.motivo !== "bloqueado") {
      await dormir(4000);
      leitura = await lerPaginaDaCategoria(receita.caminho, receita.so_loja, pagina);
    }
    if (!leitura.ok) throw new Error(`${receita.nome}, página ${pagina}: ${leitura.motivo} — ${leitura.detalhe}`);
    total = leitura.pagina.totalDePaginas;
    trilha = trilha || leitura.pagina.trilha;
    for (const item of leitura.pagina.itens) itens.set(item.codigo, { ...item, fotos: item.fotos.slice(0, 2) });
    process.stderr.write(`  ${receita.nome}: página ${pagina}/${total} (${itens.size})\n`);
  }
  return { itens: [...itens.values()], trilha };
}

async function main() {
  const raiz = process.cwd();
  const arquivoInicial = path.join(raiz, "data", "catalogo-inicial.json");
  const anteriorInicial =
    process.argv.includes("--reusar") && fs.existsSync(arquivoInicial)
      ? (JSON.parse(fs.readFileSync(arquivoInicial, "utf8")) as { coletadoEm: string; fontes: { id: string; trilha: string | null; itens: ItemDeOrigem[] }[] })
      : null;
  const coletadoEm = anteriorInicial?.coletadoEm || new Date().toISOString();
  const fontes = [];
  const produtos: Record<string, unknown>[] = [];
  const caminhos: string[] = [];
  const usados = new Set<string>();

  for (const [ordem, receita] of FONTES.entries()) {
    const guardada = anteriorInicial?.fontes.find((f) => f.id === receita.id);
    const { itens, trilha } = guardada
      ? { itens: guardada.itens.map((i) => ({ ...i, fotos: i.fotos.slice(0, 2) })), trilha: guardada.trilha || "" }
      : await lerFonte(receita);
    const regras: RegrasDaFonte = {
      id: receita.id,
      nome: receita.nome,
      so_loja: receita.so_loja,
      margem: MARGEM,
      preco_min: null,
      preco_max: receita.preco_max ?? null,
      trilha: trilha || null,
      categoria_destino: null,
    };

    let entram = 0;
    for (const item of itens) {
      if (usados.has(item.codigo) || motivoDeRecusa(item, regras)) continue;
      usados.add(item.codigo);
      const p = montarProduto(item, regras);
      // Reserva enxuta: só o que as páginas mostram. Este arquivo vai dentro
      // de quase toda função do site, então cada campo a mais pesa.
      produtos.push({
        id: p.id, name: p.name, price: p.venda.price, image: p.image, category: p.category, slug: p.slug,
        brand: p.brand ?? undefined, installment: p.venda.installment, discount_pix: p.venda.discount_pix,
        price_card: p.venda.price_card, availability: p.availability,
      });
      caminhos.push(p.category);
      entram++;
    }

    fontes.push({
      ...regras,
      site: "kabum",
      url: `https://www.kabum.com.br/${receita.caminho}`,
      caminho: receita.caminho,
      ativa: true,
      intervalo_min: 120,
      ordem,
      itens,
    });
    console.log(`${receita.nome}: ${itens.length} lidos, ${entram} entram`);
    if (!guardada) await dormir(PAUSA_MS);
  }

  fs.writeFileSync(arquivoInicial, JSON.stringify({ coletadoEm, fontes }));

  // A reserva estática mantém banners e blog que já estavam lá.
  const arquivoReserva = path.join(raiz, "data", "catalogo-backup.json");
  const anterior = JSON.parse(fs.readFileSync(arquivoReserva, "utf8"));
  const categorias = buildCategoryNodesFromPaths(caminhos).map((no) => ({
    id: no.id, name: no.name, slug: no.slug, parent_id: no.parent_id, display_order: no.display_order,
    icon: null, active: true, full_path: no.full_path,
  }));
  fs.writeFileSync(
    arquivoReserva,
    JSON.stringify({
      atualizadoEm: coletadoEm,
      total: produtos.length,
      origem: "https://www.balao.info",
      produtos,
      categorias,
      banners: Array.isArray(anterior?.banners) ? anterior.banners : [],
      blog: Array.isArray(anterior?.blog) ? anterior.blog : [],
    })
  );
  console.log(`\nTOTAL: ${produtos.length} produtos em ${fontes.length} fontes, ${categorias.length} categorias. Coletado em ${coletadoEm}.`);
}

main().catch((erro) => {
  console.error("Falhou:", erro?.message || erro);
  process.exit(1);
});
