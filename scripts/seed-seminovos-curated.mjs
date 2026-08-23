import { createClient } from '@libsql/client';
import { randomUUID } from 'crypto';

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const iphones = [
  {
    name: "iPhone 11 64GB Preto Seminovo - Bateria 85%+",
    price: "R$ 1.699,00",
    image: "https://images.kabum.com.br/produtos/fotos/104764/104764_1570539824_index_gg.jpg",
    category: "iPhones Seminovos",
    slug: "iphone-11-64gb-preto-seminovo",
    description: "iPhone 11 64GB Seminovo em excelente estado de conservação. 100% testado e revisado, saúde de bateria acima de 85%, acompanha cabo Lightning e carregador, garantia de 3 meses Balão da Informática.",
    specs: { "Armazenamento": "64GB", "Condição": "Seminovo Grade A", "Bateria": "85%+", "Garantia": "90 dias", "Tela": "Liquid Retina HD 6.1\"" }
  },
  {
    name: "iPhone 11 128GB Branco Seminovo - Bateria 86%+",
    price: "R$ 1.899,00",
    image: "https://images.kabum.com.br/produtos/fotos/104765/104765_1570540024_index_gg.jpg",
    category: "iPhones Seminovos",
    slug: "iphone-11-128gb-branco-seminovo",
    description: "iPhone 11 128GB Branco Seminovo. Impecável, sem marcas de uso profundas, câmeras e Face ID 100% operacionais, garantia direta em Campinas com suporte humano.",
    specs: { "Armazenamento": "128GB", "Condição": "Seminovo Grade A", "Bateria": "86%+", "Garantia": "90 dias", "Tela": "Liquid Retina HD 6.1\"" }
  },
  {
    name: "iPhone 12 128GB Azul Seminovo - Bateria 88%+",
    price: "R$ 2.399,00",
    image: "https://images.kabum.com.br/produtos/fotos/130190/130190_1603977341_index_gg.jpg",
    category: "iPhones Seminovos",
    slug: "iphone-12-128gb-azul-seminovo",
    description: "iPhone 12 128GB Azul 5G Seminovo. Tela Super Retina XDR OLED, chip A14 Bionic ultra rápido, Ceramic Shield resistente. Revisado e garantido pela equipe técnica Balão Castelo.",
    specs: { "Armazenamento": "128GB", "Conectividade": "5G", "Condição": "Seminovo Impecável", "Bateria": "88%+", "Garantia": "90 dias" }
  },
  {
    name: "iPhone 12 128GB Preto Seminovo - Bateria 87%+",
    price: "R$ 2.399,00",
    image: "https://images.kabum.com.br/produtos/fotos/130188/130188_1603977114_index_gg.jpg",
    category: "iPhones Seminovos",
    slug: "iphone-12-128gb-preto-seminovo",
    description: "iPhone 12 128GB Preto 5G Seminovo. Alto desempenho, gravação em 4K Dolby Vision, Face ID e bateria com excelente autonomia. Retirada imediata no Cambuí/Campinas.",
    specs: { "Armazenamento": "128GB", "Conectividade": "5G", "Condição": "Seminovo Impecável", "Bateria": "87%+", "Garantia": "90 dias" }
  },
  {
    name: "iPhone 13 128GB Meia-Noite Seminovo - Bateria 90%+",
    price: "R$ 2.999,00",
    image: "https://images.kabum.com.br/produtos/fotos/274474/iphone-13-apple-128gb-meia-noite-tela-de-6-1-camera-dupla-de-12mp-mlpf3br-a_1634569502_original.jpg",
    category: "iPhones Seminovos",
    slug: "iphone-13-128gb-meia-noite-seminovo",
    description: "iPhone 13 128GB Meia-Noite Seminovo. Bateria com autonomia estendida (90%+), modo Cinema nas câmeras, chip A15 Bionic. Estado de novo com 3 meses de garantia.",
    specs: { "Armazenamento": "128GB", "Condição": "Grade A+ (Como Novo)", "Bateria": "90%+", "Garantia": "90 dias" }
  },
  {
    name: "iPhone 13 128GB Estelar Seminovo - Bateria 91%+",
    price: "R$ 2.999,00",
    image: "https://images.kabum.com.br/produtos/fotos/274475/iphone-13-apple-128gb-estelar-tela-de-6-1-camera-dupla-de-12mp-mlpg3br-a_1634569941_original.jpg",
    category: "iPhones Seminovos",
    slug: "iphone-13-128gb-estelar-seminovo",
    description: "iPhone 13 128GB Estelar Seminovo. Linda cor branca/estelar, fotos cinematográficas, tela OLED brilhante. Totalmente revisado pela Balão da Informática.",
    specs: { "Armazenamento": "128GB", "Condição": "Grade A+ (Como Novo)", "Bateria": "91%+", "Garantia": "90 dias" }
  },
  {
    name: "iPhone 13 Pro 128GB Grafite Seminovo - Bateria 89%+",
    price: "R$ 3.699,00",
    image: "https://images.kabum.com.br/produtos/fotos/274530/iphone-13-pro-apple-128gb-grafite-tela-de-6-1-camera-tripla-de-12mp-mleb3br-a_1634575815_original.jpg",
    category: "iPhones Seminovos",
    slug: "iphone-13-pro-128gb-grafite-seminovo",
    description: "iPhone 13 Pro 128GB Grafite Seminovo. Tela ProMotion 120Hz fluida, câmera tripla com zoom óptico 3x e scanner LiDAR. Aço inoxidável cirúrgico, top de linha.",
    specs: { "Armazenamento": "128GB", "Tela": "Super Retina XDR 120Hz", "Condição": "Seminovo Premium", "Bateria": "89%+", "Garantia": "90 dias" }
  },
  {
    name: "iPhone 14 128GB Estelar Seminovo - Bateria 94%+",
    price: "R$ 3.599,00",
    image: "https://images.kabum.com.br/produtos/fotos/395689/iphone-14-apple-128gb-estelar-6-1-camera-dupla-12mp-mpur3br-a_1664536647_original.jpg",
    category: "iPhones Seminovos",
    slug: "iphone-14-128gb-estelar-seminovo",
    description: "iPhone 14 128GB Estelar Seminovo. Detecção de acidente, modo Ação nas filmagens, bateria em estado praticamente novo (94%+). Garantia total de 3 meses.",
    specs: { "Armazenamento": "128GB", "Condição": "Grade A+ Impecável", "Bateria": "94%+", "Garantia": "90 dias" }
  },
  {
    name: "iPhone 14 Pro Max 256GB Roxo-Profundo Seminovo - Bateria 92%+",
    price: "R$ 5.299,00",
    image: "https://images.kabum.com.br/produtos/fotos/395759/iphone-14-pro-max-apple-256gb-roxo-profundo-6-7-camera-tripla-48mp-mq9e3br-a_1664540445_original.jpg",
    category: "iPhones Seminovos",
    slug: "iphone-14-pro-max-256gb-roxo-seminovo",
    description: "iPhone 14 Pro Max 256GB Roxo Profundo Seminovo. Dynamic Island, câmera principal de 48MP, tela gigante de 6.7\" Always-On ProMotion. Aparelho premium completo.",
    specs: { "Armazenamento": "256GB", "Tela": "6.7\" ProMotion 120Hz", "Condição": "Seminovo Premium", "Bateria": "92%+", "Garantia": "90 dias" }
  },
  {
    name: "iPhone 15 128GB Preto Seminovo - Bateria 97%+",
    price: "R$ 4.399,00",
    image: "https://images.kabum.com.br/produtos/fotos/494668/iphone-15-apple-128gb-preto-tela-de-6-1-camera-dupla-de-48mp-mtp03br-a_1695738875_original.jpg",
    category: "iPhones Seminovos",
    slug: "iphone-15-128gb-preto-seminovo",
    description: "iPhone 15 128GB Preto com entrada USB-C e Dynamic Island. Câmera de 48MP de altíssima resolução. Saúde de bateria 97%+, aparelho como novo.",
    specs: { "Armazenamento": "128GB", "Conexão": "USB-C", "Condição": "Como Novo", "Bateria": "97%+", "Garantia": "90 dias" }
  }
];

const notebooks = [
  {
    name: "MacBook Air 13.3\" M1 8GB RAM 256GB SSD Cinza-Espacial Seminovo",
    price: "R$ 4.299,00",
    image: "https://images.kabum.com.br/produtos/fotos/133694/133694_1605898083_index_gg.jpg",
    category: "Notebooks Seminovos",
    slug: "macbook-air-m1-8gb-256gb-cinza-seminovo",
    description: "MacBook Air M1 com 8GB de memória unificada e 256GB SSD ultra veloz. Bateria com até 18 horas de duração, teclado retroiluminado Magic Keyboard, Touch ID. Sem marcas de uso, revisado com garantia.",
    specs: { "Processador": "Apple Silicon M1 8-Core", "Memória": "8GB RAM", "Armazenamento": "256GB SSD NVMe", "Tela": "13.3\" Retina True Tone", "Bateria": "Excelente (Saúde 90%+)", "Garantia": "90 dias" }
  },
  {
    name: "Dell Latitude 5420 Intel Core i5 11ª Ger 16GB RAM 512GB SSD Seminovo",
    price: "R$ 2.499,00",
    image: "https://images.kabum.com.br/produtos/fotos/157297/notebook-dell-latitude-3420-intel-core-i5-1135g7-8gb-ssd-256gb-windows-10-pro-tela-14-cinza-210-aywq-nb420_1622060950_original.jpg",
    category: "Notebooks Seminovos",
    slug: "dell-latitude-5420-i5-16gb-512gb-seminovo",
    description: "Notebook Corporativo Dell Latitude 5420 de alta durabilidade. Equipado com Core i5 11ª Geração, 16GB de RAM e 512GB SSD. Ideal para empresas, estudos e produtividade pesada. Teclado confortável e carcaça reforçada.",
    specs: { "Processador": "Intel Core i5-1135G7", "Memória": "16GB DDR4", "Armazenamento": "512GB SSD NVMe", "Tela": "14\" Full HD Antirreflexo", "Garantia": "90 dias", "Sistema": "Windows 11 Pro" }
  },
  {
    name: "Lenovo ThinkPad T14 Intel Core i7 16GB RAM 512GB SSD Seminovo",
    price: "R$ 3.199,00",
    image: "https://images.kabum.com.br/produtos/fotos/383110/notebook-lenovo-thinkpad-e14-intel-core-i7-1255u-16gb-ram-ssd-512gb-14-full-hd-intel-iris-xe-windows-11-pro-preto-21e4000jbo_1661870634_original.jpg",
    category: "Notebooks Seminovos",
    slug: "lenovo-thinkpad-t14-i7-16gb-512gb-seminovo",
    description: "O lendário Lenovo ThinkPad T14. Processador Intel Core i7, 16GB RAM e 512GB SSD. Padrão militar de resistência MIL-STD-810G, teclado com TrackPoint e leitor de impressão digital.",
    specs: { "Processador": "Intel Core i7 10ª/11ª Ger", "Memória": "16GB RAM", "Armazenamento": "512GB SSD", "Tela": "14\" FHD IPS", "Garantia": "90 dias", "Sistema": "Windows 11 Pro" }
  },
  {
    name: "Acer Nitro 5 Core i5 10ª Ger 16GB RAM 512GB SSD GTX 1650 4GB Seminovo",
    price: "R$ 3.499,00",
    image: "https://images.kabum.com.br/produtos/fotos/115222/115222_1593003058_index_gg.jpg",
    category: "Notebooks Seminovos",
    slug: "acer-nitro-5-i5-16gb-512gb-gtx1650-seminovo",
    description: "Notebook Gamer Acer Nitro 5 com placa de vídeo dedicada NVIDIA GeForce GTX 1650 de 4GB. Roda jogos como GTA V, Fortnite, Valorant, CS2 e softwares de engenharia/edição com fluidez. Sistema de refrigeração dupla.",
    specs: { "Processador": "Intel Core i5-10300H", "Placa de Vídeo": "NVIDIA GTX 1650 4GB GDDR6", "Memória": "16GB DDR4", "Armazenamento": "512GB SSD", "Tela": "15.6\" Full HD 144Hz", "Garantia": "90 dias" }
  },
  {
    name: "HP EliteBook 840 G6 Intel Core i5 16GB RAM 256GB SSD Seminovo",
    price: "R$ 1.999,00",
    image: "https://images.kabum.com.br/produtos/fotos/110903/110903_1587565747_index_gg.jpg",
    category: "Notebooks Seminovos",
    slug: "hp-elitebook-840-g6-i5-16gb-256gb-seminovo",
    description: "HP EliteBook corporativo em alumínio prata escovado ultrafino. Core i5, 16GB RAM, som Bang & Olufsen premium, teclado iluminado. Perfeito para home office, escritório e transporte diário.",
    specs: { "Processador": "Intel Core i5 8ª/9ª Ger", "Memória": "16GB DDR4", "Armazenamento": "256GB SSD NVMe", "Tela": "14\" IPS Full HD", "Garantia": "90 dias" }
  },
  {
    name: "MacBook Pro 13.3\" M2 8GB RAM 512GB SSD Cinza-Espacial Seminovo",
    price: "R$ 6.199,00",
    image: "https://images.kabum.com.br/produtos/fotos/360676/macbook-pro-apple-13-chip-m2-8gb-512gb-ssd-cinza-espacial-mnej3bz-a_1656093557_original.jpg",
    category: "Notebooks Seminovos",
    slug: "macbook-pro-13-m2-8gb-512gb-seminovo",
    description: "MacBook Pro M2 com Touch Bar ativa, 512GB SSD de alta velocidade e bateria lendária de até 20 horas. Alto desempenho com ventoinha ativa para renderização contínua sem throttling.",
    specs: { "Processador": "Apple Silicon M2", "Memória": "8GB Unificada", "Armazenamento": "512GB SSD", "Tela": "13.3\" Retina 500 nits", "Touch Bar": "Sim", "Garantia": "90 dias" }
  },
  {
    name: "Asus ZenBook 14 Intel Core i7 16GB RAM 512GB SSD Seminovo Ultrafino",
    price: "R$ 3.899,00",
    image: "https://images.kabum.com.br/produtos/fotos/114532/114532_1592317769_index_gg.jpg",
    category: "Notebooks Seminovos",
    slug: "asus-zenbook-14-i7-16gb-512gb-seminovo",
    description: "ZenBook 14 ultraleve com tela NanoEdge de bordas ultrafinas, NumberPad integrado no touchpad e acabamento metálico azul real. Core i7 de alto desempenho com 16GB de RAM.",
    specs: { "Processador": "Intel Core i7 11ª Ger", "Memória": "16GB LPDDR4X", "Armazenamento": "512GB SSD NVMe", "Peso": "1.17 kg", "Garantia": "90 dias" }
  },
  {
    name: "Dell Inspiron 15 3520 Intel Core i5 12ª Ger 16GB RAM 512GB SSD Seminovo",
    price: "R$ 2.699,00",
    image: "https://images.kabum.com.br/produtos/fotos/410884/notebook-dell-inspiron-15-3520-intel-core-i5-1235u-8gb-ram-ssd-256gb-15-6-full-hd-120hz-intel-iris-xe-windows-11-home-preto-i15-i120k-a20p_1672322692_original.jpg",
    category: "Notebooks Seminovos",
    slug: "dell-inspiron-15-3520-i5-16gb-512gb-seminovo",
    description: "Dell Inspiron 15 com tela fluida de 120Hz Full HD, teclado numérico dedicado e processador Intel Core i5 de 12ª Geração (10 núcleos). 16GB RAM e 512GB SSD para máxima produtividade.",
    specs: { "Processador": "Intel Core i5-1235U 12ª Ger", "Memória": "16GB DDR4", "Armazenamento": "512GB SSD", "Tela": "15.6\" Full HD 120Hz", "Garantia": "90 dias" }
  }
];

async function seed() {
  console.log("=== INSERINDO PRODUTOS CURADOS DE IPHONES SEMINOVOS ===");
  for (const item of iphones) {
    const existing = await db.execute({ sql: "SELECT id FROM products WHERE slug = ? OR name = ?", args: [item.slug, item.name] });
    const id = existing.rows.length > 0 ? String(existing.rows[0].id) : randomUUID();
    await db.execute({
      sql: `INSERT INTO products (id, name, price, image, image_urls, category, slug, description, specs, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              price = excluded.price,
              image = excluded.image,
              image_urls = excluded.image_urls,
              category = excluded.category,
              slug = excluded.slug,
              description = excluded.description,
              specs = excluded.specs`,
      args: [
        id,
        item.name,
        item.price,
        item.image,
        JSON.stringify([item.image]),
        item.category,
        item.slug,
        item.description,
        JSON.stringify(item.specs)
      ]
    });
    console.log(`✅ iPhone gravado: ${item.name}`);
  }

  console.log("\n=== INSERINDO PRODUTOS CURADOS DE NOTEBOOKS SEMINOVOS ===");
  for (const item of notebooks) {
    const existing = await db.execute({ sql: "SELECT id FROM products WHERE slug = ? OR name = ?", args: [item.slug, item.name] });
    const id = existing.rows.length > 0 ? String(existing.rows[0].id) : randomUUID();
    await db.execute({
      sql: `INSERT INTO products (id, name, price, image, image_urls, category, slug, description, specs, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              price = excluded.price,
              image = excluded.image,
              image_urls = excluded.image_urls,
              category = excluded.category,
              slug = excluded.slug,
              description = excluded.description,
              specs = excluded.specs`,
      args: [
        id,
        item.name,
        item.price,
        item.image,
        JSON.stringify([item.image]),
        item.category,
        item.slug,
        item.description,
        JSON.stringify(item.specs)
      ]
    });
    console.log(`✅ Notebook gravado: ${item.name}`);
  }

  console.log("\n=== VERIFICANDO QUANTIDADE ===");
  const iphonesCount = await db.execute("SELECT COUNT(*) as c FROM products WHERE category = 'iPhones Seminovos'");
  const notebooksCount = await db.execute("SELECT COUNT(*) as c FROM products WHERE category = 'Notebooks Seminovos'");
  console.log(`iPhones Seminovos no banco: ${iphonesCount.rows[0].c}`);
  console.log(`Notebooks Seminovos no banco: ${notebooksCount.rows[0].c}`);
}

seed().catch(console.error);
