import fs from 'fs';
import { createClient } from '@libsql/client';
import { randomUUID } from 'crypto';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const filePath = 'C:\\Users\\user\\Desktop\\PRODUTOS APENAS KABUM';

const margins = {
  'Computadores': 0.33,
  'Smartphones': 0.33,
  'Notebooks Seminovos': 0.35,
  'Monitores': 0.38,
  'Hardware': 0.40,
  'Games': 0.45,
  'Periféricos': 0.55,
  'Segurança': 0.60,
  'Impressão': 0.65,
  'Acessórios': 0.85,
  '🔑  Licenças': 0.99
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90);
}

function categorize(name) {
  const n = name.toLowerCase();
  
  if (n.includes('notebook') || n.includes('laptop') || n.includes('macbook') || n.includes('chromebook')) {
    return 'Notebooks Seminovos';
  }
  if (n.includes('computador gamer') || n.includes('pc gamer') || n.includes('desktop gamer') || (n.includes('computador') && (n.includes('core') || n.includes('ryzen') || n.includes('desktop')))) {
    return 'Computadores';
  }
  if (n.includes('placa de vídeo') || n.includes('placa de video') || n.includes('geforce') || n.includes('radeon') || n.includes('rtx') || n.includes('gtx') || n.includes('rx 6') || n.includes('rx 7')) {
    return 'Hardware';
  }
  if (n.includes('processador') || n.includes('intel core') || n.includes('amd ryzen') || n.includes('placa-mãe') || n.includes('placa mae') || n.includes('placa mãe') || n.includes('memória ram') || n.includes('memoria ram') || n.includes('ddr4') || n.includes('ddr5') || n.includes('ssd') || n.includes('nvme') || n.includes('fonte ') || n.includes('water cooler') || n.includes('cooler') || n.includes('gabinete')) {
    return 'Hardware';
  }
  if (n.includes('monitor') || n.includes('displayport') || n.includes('144hz') || n.includes('165hz') || n.includes('240hz') || n.includes('ips') || n.includes('curvo')) {
    return 'Monitores';
  }
  if (n.includes('teclado') || n.includes('mouse') || n.includes('headset') || n.includes('fone') || n.includes('mousepad') || n.includes('microfone') || n.includes('webcam') || n.includes('som gamer') || n.includes('caixa de som')) {
    return 'Periféricos';
  }
  if (n.includes('cadeira gamer') || n.includes('console') || n.includes('playstation') || n.includes('ps5') || n.includes('ps4') || n.includes('xbox') || n.includes('nintendo') || n.includes('controle') || n.includes('gamepad') || n.includes('jogos')) {
    return 'Games';
  }
  if (n.includes('smartphone') || n.includes('celular') || n.includes('iphone') || n.includes('galaxy') || n.includes('xiaomi') || n.includes('redmi') || n.includes('motorola')) {
    return 'Smartphones';
  }
  if (n.includes('cabo') || n.includes('adaptador') || n.includes('filtro de linha') || n.includes('hub') || n.includes('suporte') || n.includes('pasta térmica') || n.includes('pendrive') || n.includes('carregador')) {
    return 'Acessórios';
  }
  if (n.includes('impressora') || n.includes('toner') || n.includes('cartucho') || n.includes('papel') || n.includes('scanner') || n.includes('filamento')) {
    return 'Impressão';
  }
  if (n.includes('roteador') || n.includes('switch') || n.includes('câmera') || n.includes('camera') || n.includes('dvr') || n.includes('nobreak') || n.includes('fechadura') || n.includes('alarme') || n.includes('sensor')) {
    return 'Segurança';
  }
  if (n.includes('windows') || n.includes('office') || n.includes('antivírus') || n.includes('licença')) {
    return '🔑  Licenças';
  }

  return 'Hardware';
}

function parsePrice(str) {
  if (!str) return 0;
  const clean = str.replace(/[^\d.,]/g, '').trim();
  if (clean.includes(',') && clean.includes('.')) {
    return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
  } else if (clean.includes(',')) {
    return parseFloat(clean.replace(',', '.'));
  }
  return parseFloat(clean) || 0;
}

function formatBRL(val) {
  return "R$ " + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function run() {
  console.log("=== 1. LENDO ARQUIVO DE PRODUTOS KABUM ===");
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log(`Total de linhas no arquivo: ${lines.length}`);

  console.log("\n=== 2. PARSEANDO E CALCULANDO PREÇOS COM MARGENS ===");
  const productsToInsert = [];
  const seenUrls = new Set();
  const seenSlugs = new Set();

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length < 4) continue;

    const productUrl = parts[0]?.trim();
    let imageUrl = parts[1]?.trim();
    const name = parts[2]?.trim();
    const costStr = parts[3]?.trim();

    if (!name || !costStr || seenUrls.has(productUrl)) continue;
    seenUrls.add(productUrl);

    const cost = parsePrice(costStr);
    if (cost <= 0) continue;

    const category = categorize(name);
    const margin = margins[category] || 0.40;

    // Preço à vista no PIX com margem de lucro
    const pixPriceNum = Math.round((cost * (1 + margin)) * 100) / 100;
    // Preço parcelado em 10x com 1% a mais por parcela (10% total)
    const installmentPriceNum = Math.round((pixPriceNum * 1.10) * 100) / 100;
    const singleInstallmentNum = Math.round((installmentPriceNum / 10) * 100) / 100;

    const pixPriceFormatted = formatBRL(pixPriceNum);
    const installmentPriceFormatted = formatBRL(installmentPriceNum);
    const singleInstallmentFormatted = formatBRL(singleInstallmentNum);

    // Ajustar imagem para alta resolução se for Kabum
    if (imageUrl && imageUrl.includes('_m.jpg')) {
      imageUrl = imageUrl.replace('_m.jpg', '_gg.jpg');
    }

    // Extrair ID ou código único do link para o slug
    const codeMatch = productUrl.match(/\/produto\/(\d+)\//);
    const code = codeMatch ? codeMatch[1] : String(i);

    let baseSlug = slugify(name);
    let finalSlug = `${baseSlug}-${code}`;
    if (seenSlugs.has(finalSlug)) {
      finalSlug = `${finalSlug}-${randomUUID().slice(0, 4)}`;
    }
    seenSlugs.add(finalSlug);

    const specs = {
      "Preço à Vista (PIX)": `${pixPriceFormatted} (com 10% de desconto)`,
      "Parcelamento": `10x de ${singleInstallmentFormatted} sem juros no cartão (${installmentPriceFormatted})`,
      "Condição": "Produto Novo e Original com Nota Fiscal",
      "Garantia": "Garantia Balão da Informática - 90 dias a 1 ano",
      "Disponibilidade": "Pronta Entrega em Campinas / Envio Imediato",
      "Categoria": category,
      "Margem Aplicada": `${Math.round(margin * 100)}%`
    };

    const description = `${name} disponível na Balão da Informática Castelo em Campinas. Aproveite o melhor preço à vista no PIX por ${pixPriceFormatted} com desconto progressivo ou parcele em até 10x de ${singleInstallmentFormatted} sem juros. Compre online com entrega rápida para Campinas e região ou retire diretamente no balcão no Cambuí. Garantia total, procedência garantida e suporte técnico especializado.`;

    productsToInsert.push({
      id: randomUUID(),
      name,
      price: pixPriceFormatted,
      image: imageUrl || "/logo.png",
      image_urls: JSON.stringify([imageUrl || "/logo.png"]),
      product_url: productUrl,
      description,
      specs: JSON.stringify(specs),
      category,
      slug: finalSlug
    });
  }

  console.log(`✅ ${productsToInsert.length} produtos estruturados e prontos para inserção.`);

  console.log("\n=== 3. INSERINDO NO BANCO TURSO EM LOTES ===");
  const batchSize = 100;
  for (let i = 0; i < productsToInsert.length; i += batchSize) {
    const batch = productsToInsert.slice(i, i + batchSize);
    const stmts = batch.map(p => ({
      sql: `INSERT INTO products (id, name, price, image, image_urls, product_url, description, specs, category, slug, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [p.id, p.name, p.price, p.image, p.image_urls, p.product_url, p.description, p.specs, p.category, p.slug]
    }));

    await db.batch(stmts, "write");
    process.stdout.write(`\rInseridos: ${Math.min(i + batchSize, productsToInsert.length)} / ${productsToInsert.length}...`);
  }

  console.log("\n\n=== 4. CONFIGURANDO CATEGORIAS E HOME BLOCKS ===");
  // Garantir que as categorias e home blocks principais estejam ativos
  const mainCategories = [
    { name: "Hardware", icon: "Cpu", order: 1 },
    { name: "Notebooks Seminovos", icon: "Laptop", order: 2 },
    { name: "Periféricos", icon: "Keyboard", order: 3 },
    { name: "Monitores", icon: "Monitor", order: 4 },
    { name: "Computadores", icon: "Cpu", order: 5 },
    { name: "Games", icon: "Gamepad", order: 6 },
    { name: "Smartphones", icon: "Smartphone", order: 7 },
    { name: "Acessórios", icon: "Cable", order: 8 },
    { name: "Segurança", icon: "Shield", order: 9 }
  ];

  await db.execute("DELETE FROM home_blocks");
  for (const cat of mainCategories) {
    await db.execute({
      sql: `INSERT INTO home_blocks (id, category_id, title, display_order, active, created_at)
            VALUES (?, ?, ?, ?, 1, datetime('now'))`,
      args: [randomUUID(), cat.name, cat.name, cat.order]
    });
  }
  console.log("✅ Home blocks atualizados para as melhores categorias!");

  const totalCount = await db.execute("SELECT COUNT(*) as c FROM products");
  console.log(`\n🎉 PROCESSO CONCLUÍDO! Total de produtos no banco: ${totalCount.rows[0].c}`);
}

run().catch(console.error);
