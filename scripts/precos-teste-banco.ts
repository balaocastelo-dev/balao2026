/* eslint-disable @typescript-eslint/no-explicit-any */
// Teste de ponta a ponta das fontes de preço contra um MariaDB/MySQL DESCARTÁVEL.
//
// Apaga e recria `products`, `categories` e `fontes_preco` no banco apontado
// pelas variáveis MYSQL_*. Por isso só roda em 127.0.0.1/localhost.
//
// Uso (com um MariaDB local vazio):
//   MYSQL_HOST=127.0.0.1 MYSQL_PORT=33306 MYSQL_USER=teste MYSQL_PASSWORD=teste MYSQL_DATABASE=balao \
//     npx tsx scripts/precos-teste-banco.ts [catalogo-antigo.json]
//
// O passo 6 lê uma página de verdade na KaBuM! (categoria Projetores).

import fs from "fs";
import path from "path";
import { turso } from "../lib/turso";
import {
  aceitarRetidos, atualizarFonte, buscarFonte, desfazerTroca, listarFontes, listarRetidos,
  recalcularMargem, situacaoDaTroca, trocarCatalogo, type CargaInicial,
} from "../lib/precos/banco";
import { lerFonteAte } from "../lib/precos/coleta";
import { aplicarMargem, formatarNumero } from "../lib/precos/calculo";

if (!["127.0.0.1", "localhost"].includes(String(process.env.MYSQL_HOST))) {
  console.error("Este teste apaga tabelas. Só roda com MYSQL_HOST=127.0.0.1.");
  process.exit(2);
}

let falhas = 0;
function confere(nome: string, ok: boolean, detalhe: unknown = "") {
  console.log(`${ok ? "  ok " : "FALHOU"}  ${nome}${detalhe !== "" ? `  → ${typeof detalhe === "string" ? detalhe : JSON.stringify(detalhe)}` : ""}`);
  if (!ok) falhas++;
}
const um = async (sql: string, args: unknown[] = []) => (await turso.execute({ sql, args })).rows[0] as Record<string, any>;
const n = async (sql: string, args: unknown[] = []) => Number((await um(sql, args))?.n ?? 0);

async function main() {
  const raiz = process.cwd();
  const esquema = fs.readFileSync(path.join(raiz, "supabase", "mysql_schema.sql"), "utf8");
  const criar = (tabela: string) => {
    const m = esquema.match(new RegExp(`CREATE TABLE IF NOT EXISTS ${tabela} \\([\\s\\S]*?\\) CHARACTER SET[^;]*;`));
    if (!m) throw new Error(`Não achei a tabela ${tabela} no esquema`);
    return m[0];
  };
  for (const t of ["fontes_preco", "products_antes_da_troca", "categories_antes_da_troca", "products", "categories"]) {
    await turso.execute(`DROP TABLE IF EXISTS ${t}`);
  }
  await turso.execute(criar("products"));
  await turso.execute(criar("categories"));

  // --- catálogo antigo, como está no ar hoje ---
  const arquivoAntigo = process.argv[2];
  const antigos: any[] = arquivoAntigo
    ? JSON.parse(fs.readFileSync(arquivoAntigo, "utf8")).produtos
    : Array.from({ length: 300 }, (_, i) => ({ id: `velho-${i}`, name: `Produto antigo ${i}`, price: "10,00", image: "x", category: "Antiga", slug: `velho-${i}` }));
  for (let i = 0; i < antigos.length; i += 200) {
    const lote = antigos.slice(i, i + 200);
    await turso.execute({
      sql: `INSERT INTO products (id, name, price, image, category, slug) VALUES ${lote.map(() => "(?, ?, ?, ?, ?, ?)").join(", ")}`,
      args: lote.flatMap((p) => [String(p.id), p.name, String(p.price), p.image || "", p.category || "", p.slug || ""]),
    });
  }
  await turso.execute("INSERT INTO categories (id, name, slug, active, full_path) VALUES ('Antiga', 'Antiga', 'antiga', 1, 'Antiga')");

  const carga = JSON.parse(fs.readFileSync(path.join(raiz, "data", "catalogo-inicial.json"), "utf8")) as CargaInicial;
  const sobrevivente = antigos.find((a) => carga.fontes.some((f) => f.itens.some((i) => i.codigo === String(a.id))));

  console.log("\n1. Antes da troca");
  const antes = await situacaoDaTroca();
  confere("catálogo antigo carregado", antes.produtos === antigos.length && antes.comFonte === 0, antes);

  console.log("\n2. Troca que falha no meio não pode mexer em nada");
  const quebrada: CargaInicial = JSON.parse(JSON.stringify(carga));
  const ultima = quebrada.fontes[quebrada.fontes.length - 1];
  ultima.itens.push({ ...ultima.itens[0], codigo: "x".repeat(400) });
  let erro = "";
  await trocarCatalogo(quebrada).catch((e) => (erro = String(e?.message || e)));
  confere("a troca quebrada deu erro", erro.length > 0, erro.slice(0, 90));
  confere("o catálogo antigo continua inteiro", (await n("SELECT COUNT(*) AS n FROM products")) === antigos.length);
  confere("nenhuma fonte ficou gravada", (await n("SELECT COUNT(*) AS n FROM fontes_preco")) === 0);

  console.log("\n3. Troca de verdade");
  const t0 = Date.now();
  const troca = await trocarCatalogo(carga);
  console.log(`     ${Date.now() - t0} ms`, JSON.stringify({ ...troca, porFonte: undefined }));
  confere("entraram os produtos das fontes", troca.produtos > 4000 && (await n("SELECT COUNT(*) AS n FROM products")) === troca.produtos, troca.produtos);
  confere("todo produto tem fonte e preço de origem", (await n("SELECT COUNT(*) AS n FROM products WHERE fonte_id IS NULL OR origem_pix IS NULL OR origem_pix <= 0")) === 0);
  confere("a cópia de segurança tem o catálogo antigo", troca.reserva === antigos.length, troca.reserva);
  confere("15 fontes gravadas", (await listarFontes()).length === 15);
  confere("menu de categorias refeito", (await n("SELECT COUNT(*) AS n FROM categories")) === troca.categorias && troca.categorias > 100, troca.categorias);
  confere("nenhum produto de marketplace nas fontes 'só loja'", (await n("SELECT COUNT(*) AS n FROM products p JOIN fontes_preco f ON f.id = p.fonte_id WHERE f.so_loja = 1 AND p.supplier <> 'KaBuM!'")) === 0);
  confere("PC gamer acima de R$ 30 mil ficou de fora", (await n("SELECT COUNT(*) AS n FROM products WHERE fonte_id = 'kabum-pc-gamer' AND origem_pix > 30000")) === 0);
  if (sobrevivente) {
    const linha = await um("SELECT slug FROM products WHERE id = ?", [String(sobrevivente.id)]);
    confere("produto que continuou manteve o endereço antigo", linha?.slug === sobrevivente.slug, linha?.slug);
  }
  const amostra = await um("SELECT * FROM products WHERE fonte_id = 'kabum-hardware' ORDER BY origem_pix DESC LIMIT 1");
  confere("preço à vista = origem + 33%", amostra.price === formatarNumero(aplicarMargem(amostra.origem_pix, 33)), `${amostra.origem_pix} → ${amostra.price}`);
  confere("preço no cartão = origem cartão + 33%", amostra.price_card === `R$ ${formatarNumero(aplicarMargem(amostra.origem_cartao, 33))}`, `${amostra.origem_cartao} → ${amostra.price_card}`);
  let repetida = "";
  // A rota barra a segunda troca; aqui confere só que a reserva não é sobrescrita.
  await trocarCatalogo(carga).catch((e) => (repetida = String(e?.message || e)));
  confere("trocar de novo não sobrescreve a cópia de segurança", (await n("SELECT COUNT(*) AS n FROM products_antes_da_troca")) === antigos.length, repetida);

  console.log("\n4. Mudar a margem de 33 para 40");
  const projetor = await atualizarFonte("kabum-projetor", { margem: 40 });
  const mudados = await recalcularMargem(projetor!);
  const linhas = (await turso.execute("SELECT origem_pix, origem_cartao, price, price_card FROM products WHERE fonte_id = 'kabum-projetor'")).rows as any[];
  confere("todos os produtos da fonte foram reprecificados", mudados === linhas.length && linhas.length > 5, mudados);
  confere("à vista e cartão com 40%", linhas.every((l) => l.price === formatarNumero(aplicarMargem(l.origem_pix, 40)) && l.price_card === `R$ ${formatarNumero(aplicarMargem(l.origem_cartao, 40))}`));
  confere("as outras fontes não mudaram", (await um("SELECT price FROM products WHERE id = ?", [amostra.id])).price === amostra.price);

  console.log("\n5. Preparando: um produto que sumiu da fonte, uma queda brusca, uma alta");
  await turso.execute("INSERT INTO products (id, name, price, image, category, slug, fonte_id, origem_pix, origem_cartao, origem_visto_em) VALUES ('sumiu-1', 'Projetor que saiu de linha', '1,00', '', 'Projetores', 'sumiu-1', 'kabum-projetor', 100, 110, '2026-01-01T00:00:00.000Z')");
  const [queda, alta] = (await turso.execute("SELECT id, origem_pix FROM products WHERE fonte_id = 'kabum-projetor' AND id <> 'sumiu-1' ORDER BY id LIMIT 2")).rows as any[];
  await turso.execute({ sql: "UPDATE products SET origem_pix = origem_pix * 3, origem_cartao = origem_cartao * 3, price = '999.999,00' WHERE id = ?", args: [queda.id] });
  await turso.execute({ sql: "UPDATE products SET origem_pix = origem_pix / 3, origem_cartao = origem_cartao / 3, price = '0,01', name = 'Nome ajustado à mão' WHERE id = ?", args: [alta.id] });

  console.log("\n6. Releitura de verdade na KaBuM! (Projetores)");
  let passo = await lerFonteAte("kabum-projetor", Date.now() + 40_000);
  for (let i = 0; i < 5 && passo.estado === "em_andamento"; i++) passo = await lerFonteAte("kabum-projetor", Date.now() + 40_000);
  console.log("    ", JSON.stringify(passo));
  confere("a leitura terminou", passo.estado === "concluida", passo.estado);
  confere("o produto que sumiu da fonte saiu do site", passo.removidos === 1 && (await n("SELECT COUNT(*) AS n FROM products WHERE id = 'sumiu-1'")) === 0, passo.removidos);
  const q = await um("SELECT price, origem_pix, retido_pix, retido_desde FROM products WHERE id = ?", [queda.id]);
  confere("a queda de mais da metade ficou retida", passo.retidos === 1 && q.retido_desde != null && Math.abs(q.origem_pix - queda.origem_pix * 3) < 0.01 && q.retido_pix > 0, q);
  confere("o preço de venda retido segue o da origem anterior", q.price === formatarNumero(aplicarMargem(q.origem_pix, 40)), q.price);
  const a = await um("SELECT name, price, origem_pix, retido_desde FROM products WHERE id = ?", [alta.id]);
  confere("a alta foi aplicada na hora", a.retido_desde == null && a.price === formatarNumero(aplicarMargem(a.origem_pix, 40)) && Math.abs(a.origem_pix - alta.origem_pix) < 0.01, a.price);
  confere("o nome ajustado à mão sobreviveu à releitura", a.name === "Nome ajustado à mão");
  const f = await buscarFonte("kabum-projetor");
  confere("a fonte ficou 'ok', destravada e sem passada aberta", f?.ultimo_status === "ok" && f.passo_pagina === 0 && f.travada_ate == null, { s: f?.ultimo_status, p: f?.passo_pagina });

  console.log("\n7. Aceitar a queda retida");
  const retidos = await listarRetidos();
  confere("a queda aparece na lista", retidos.length === 1 && retidos[0].id === String(queda.id), retidos.length);
  confere("aceitar aplica o preço novo", (await aceitarRetidos(f!, [String(queda.id)])) === 1);
  const q2 = await um("SELECT price, origem_pix, retido_desde FROM products WHERE id = ?", [queda.id]);
  confere("preço novo no ar e retenção limpa", q2.retido_desde == null && q2.price === formatarNumero(aplicarMargem(q2.origem_pix, 40)) && Math.abs(q2.origem_pix - queda.origem_pix) < 0.01, q2);

  console.log("\n8. Leitura pequena demais não apaga nada");
  await turso.execute("INSERT INTO products (id, name, price, image, category, slug, fonte_id, origem_pix, origem_cartao, origem_visto_em) " +
    Array.from({ length: 60 }, (_, i) => `SELECT 'extra-${i}', 'Extra ${i}', '1,00', '', 'Projetores', 'extra-${i}', 'kabum-projetor', 100, 110, '2026-01-01T00:00:00.000Z'`).join(" UNION ALL "));
  const pequena = await lerFonteAte("kabum-projetor", Date.now() + 40_000);
  confere("a passada foi marcada como suspeita", pequena.estado === "suspeita" && pequena.removidos === 0, pequena.estado);
  confere("os 60 produtos continuam lá", (await n("SELECT COUNT(*) AS n FROM products WHERE id LIKE 'extra-%'")) === 60);

  console.log("\n9. Desfazer a troca");
  const volta = await desfazerTroca();
  confere("o catálogo antigo voltou inteiro", volta.restaurados === antigos.length && (await n("SELECT COUNT(*) AS n FROM products")) === antigos.length, volta);
  confere("as categorias antigas voltaram", (await n("SELECT COUNT(*) AS n FROM categories")) === 1);
  confere("as fontes ficaram pausadas", (await listarFontes()).every((x) => !x.ativa));

  console.log(falhas === 0 ? "\nTudo certo." : `\n${falhas} conferência(s) falharam.`);
  await turso.close();
  process.exit(falhas === 0 ? 0 : 1);
}

main().catch(async (erro) => {
  console.error("Erro:", erro);
  await turso.close().catch(() => {});
  process.exit(1);
});
