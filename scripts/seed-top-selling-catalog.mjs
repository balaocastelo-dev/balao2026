import { createClient } from '@libsql/client';
import { randomUUID } from 'crypto';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const products = [
  // 1. Computadores Gamer
  {
    name: "PC Gamer Neologic AMD Ryzen 5 5600GT, 16GB RAM DDR4, SSD 512GB NVMe, Fonte 500W 80 Plus, Gabinete RGB",
    price: "R$ 2.499,00",
    category: "Computadores",
    image: "https://images.kabum.com.br/produtos/fotos/506720/computador-gamer-neologic-amd-ryzen-5-5600gt-16gb-ddr4-radeon-graphics-ssd-480gb-500w-80-plus-nli85984_1707921609_gg.jpg",
    slug: "pc-gamer-ryzen-5-5600gt-16gb-ssd-512gb",
    specs: { "Processador": "AMD Ryzen 5 5600GT 6-Core", "Memória": "16GB DDR4 3200MHz", "Armazenamento": "512GB SSD NVMe M.2", "Gráficos": "Radeon Vega 7 Integrada", "Fonte": "500W 80 Plus Bronze", "Garantia": "1 Ano Balão Castelo" }
  },
  {
    name: "PC Gamer Intel Core i5 12400F, GeForce RTX 3060 12GB, 16GB RAM DDR4, SSD 1TB NVMe, Fonte 600W 80 Plus",
    price: "R$ 4.299,00",
    category: "Computadores",
    image: "https://images.kabum.com.br/produtos/fotos/476274/computador-gamer-neologic-intel-core-i5-12400f-16gb-geforce-rtx-3060-12gb-ssd-480gb-500w-80-plus-nli85669_1692288339_gg.jpg",
    slug: "pc-gamer-core-i5-12400f-rtx-3060-12gb-16gb-ssd-1tb",
    specs: { "Processador": "Intel Core i5-12400F 12ª Ger", "Placa de Vídeo": "NVIDIA GeForce RTX 3060 12GB GDDR6", "Memória": "16GB DDR4", "Armazenamento": "1TB SSD NVMe", "Fonte": "600W 80 Plus", "Garantia": "1 Ano Balão Castelo" }
  },
  {
    name: "PC Gamer AMD Ryzen 7 5700X, GeForce RTX 4060 8GB, 32GB RAM DDR4, SSD 1TB NVMe Gen4, Water Cooler 240mm RGB",
    price: "R$ 5.499,00",
    category: "Computadores",
    image: "https://images.kabum.com.br/produtos/fotos/506725/computador-gamer-neologic-amd-ryzen-7-5700x-32gb-geforce-rtx-4060-8gb-ssd-1tb-600w-80-plus-water-cooler-nli85989_1707923485_gg.jpg",
    slug: "pc-gamer-ryzen-7-5700x-rtx-4060-32gb-1tb-ssd-water-cooler",
    specs: { "Processador": "AMD Ryzen 7 5700X 8-Core", "Placa de Vídeo": "GeForce RTX 4060 8GB DLSS 3", "Memória": "32GB DDR4 3200MHz", "Armazenamento": "1TB NVMe Gen4", "Refrigeração": "Water Cooler 240mm RGB", "Garantia": "1 Ano" }
  },
  {
    name: "PC Gamer Intel Core i7 13700KF, GeForce RTX 4070 Super 12GB, 32GB DDR5 6000MHz, SSD 2TB NVMe, Fonte 750W Gold",
    price: "R$ 9.899,00",
    category: "Computadores",
    image: "https://images.kabum.com.br/produtos/fotos/506727/computador-gamer-neologic-intel-core-i7-13700kf-32gb-ddr5-geforce-rtx-4070-super-12gb-ssd-1tb-750w-80-plus-water-cooler-nli85991_1707924294_gg.jpg",
    slug: "pc-gamer-core-i7-13700kf-rtx-4070-super-32gb-ddr5-2tb",
    specs: { "Processador": "Intel Core i7-13700KF 16-Core", "Placa de Vídeo": "RTX 4070 Super 12GB GDDR6X", "Memória": "32GB DDR5 6000MHz", "Armazenamento": "2TB NVMe", "Garantia": "1 Ano Balão Castelo" }
  },

  // 2. Notebooks
  {
    name: "Notebook Lenovo IdeaPad 1 Intel Core i5 1235U, 16GB RAM, SSD 512GB NVMe, Tela 15.6\" Full HD Antirreflexo",
    price: "R$ 2.699,00",
    category: "Notebooks",
    image: "https://images.kabum.com.br/produtos/fotos/473210/notebook-lenovo-ideapad-1-intel-core-i5-1235u-16gb-ram-ssd-512gb-15-6-full-hd-intel-iris-xe-windows-11-cinza-82vy000ybr_1690553755_gg.jpg",
    slug: "notebook-lenovo-ideapad-1-i5-1235u-16gb-512gb-ssd",
    specs: { "Processador": "Intel Core i5-1235U 12ª Ger", "Memória": "16GB DDR4", "Armazenamento": "512GB SSD NVMe", "Tela": "15.6\" Full HD Antirreflexo", "Sistema": "Windows 11 Home", "Garantia": "1 Ano" }
  },
  {
    name: "Notebook Gamer Acer Nitro V15 Intel Core i5 13420H, GeForce RTX 3050 6GB, 16GB RAM DDR5, SSD 512GB, Tela 144Hz",
    price: "R$ 4.499,00",
    category: "Notebooks",
    image: "https://images.kabum.com.br/produtos/fotos/525642/notebook-gamer-acer-nitro-v15-intel-core-i5-13420h-16gb-ram-rtx-3050-ssd-512gb-15-6-fhd-144hz-linux-preto-anv15-51-58az_1710339575_gg.jpg",
    slug: "notebook-gamer-acer-nitro-v15-i5-13420h-rtx-3050-16gb-ddr5-144hz",
    specs: { "Processador": "Intel Core i5-13420H 13ª Ger", "Placa de Vídeo": "RTX 3050 6GB GDDR6", "Memória": "16GB DDR5 5200MHz", "Armazenamento": "512GB SSD NVMe Gen4", "Tela": "15.6\" FHD IPS 144Hz" }
  },
  {
    name: "MacBook Air 13.3\" Apple M1, 8GB RAM, SSD 256GB, Tela Retina True Tone, Bateria até 18h - Cinza Espacial",
    price: "R$ 4.899,00",
    category: "Notebooks",
    image: "https://images.kabum.com.br/produtos/fotos/133694/133694_1605898083_gg.jpg",
    slug: "macbook-air-13-m1-8gb-256gb-cinza-espacial",
    specs: { "Processador": "Apple Silicon M1 8-Core", "Memória": "8GB Unificada", "Armazenamento": "256GB SSD", "Tela": "13.3\" Retina True Tone", "Bateria": "Até 18 Horas" }
  },
  {
    name: "Notebook Dell Inspiron 15 Intel Core i7 1355U, 16GB RAM, SSD 512GB, Tela 15.6\" Full HD 120Hz, Windows 11",
    price: "R$ 3.899,00",
    category: "Notebooks",
    image: "https://images.kabum.com.br/produtos/fotos/476288/notebook-dell-inspiron-15-intel-core-i7-1355u-16gb-ram-ssd-512gb-15-6-full-hd-120hz-intel-iris-xe-windows-11-home-preto-i15-i1300-a40p_1692290130_gg.jpg",
    slug: "notebook-dell-inspiron-15-i7-1355u-16gb-512gb-120hz",
    specs: { "Processador": "Intel Core i7-1355U 13ª Ger (10 Núcleos)", "Memória": "16GB DDR4", "Armazenamento": "512GB SSD", "Tela": "15.6\" FHD 120Hz WVA", "Sistema": "Windows 11" }
  },

  // 3. Monitores
  {
    name: "Monitor Gamer LG UltraGear 24\" IPS, 144Hz, 1ms MBR, Full HD, HDR10, FreeSync Premium, HDMI/DisplayPort",
    price: "R$ 849,00",
    category: "Monitores",
    image: "https://images.kabum.com.br/produtos/fotos/156100/monitor-gamer-lg-ultragear-24-ips-full-hd-144hz-1ms-freesync-hdr10-displayport-e-hdmi-24gn60r-b_1621535787_gg.jpg",
    slug: "monitor-gamer-lg-ultragear-24-ips-144hz-1ms-fhd",
    specs: { "Tamanho": "24 Polegadas", "Painel": "IPS Full HD (1920x1080)", "Taxa de Atualização": "144Hz", "Tempo de Resposta": "1ms MBR", "Tecnologia": "AMD FreeSync Premium, HDR10" }
  },
  {
    name: "Monitor Gamer Samsung Odyssey G30 24\" FHD, 144Hz, 1ms, DisplayPort/HDMI, Ajuste de Altura e Pivô",
    price: "R$ 899,00",
    category: "Monitores",
    image: "https://images.kabum.com.br/produtos/fotos/386000/monitor-gamer-samsung-odyssey-g30-24-full-hd-144hz-1ms-freesync-premium-hdmi-displayport-ajuste-de-altura-preto-ls24ag300nlxzd_1663183579_gg.jpg",
    slug: "monitor-gamer-samsung-odyssey-g30-24-144hz-1ms",
    specs: { "Tamanho": "24 Polegadas", "Resolução": "Full HD 1080p", "Taxa": "144Hz", "Ergonomia": "Ajuste de Altura, Inclinação e Pivô 90°" }
  },
  {
    name: "Monitor Gamer Curvo Samsung Odyssey G5 34\" UltraWide WQHD (3440x1440), 165Hz, 1ms, 1000R, HDR10",
    price: "R$ 2.499,00",
    category: "Monitores",
    image: "https://images.kabum.com.br/produtos/fotos/156103/monitor-gamer-samsung-odyssey-g5-34-ultrawide-wqhd-165hz-1ms-1000r-freesync-premium-hdr10-hdmi-dp-lc34g55twwlxzd_1621537242_gg.jpg",
    slug: "monitor-gamer-curvo-samsung-odyssey-g5-34-ultrawide-165hz-1ms",
    specs: { "Tamanho": "34\" UltraWide 21:9", "Resolução": "WQHD 3440x1440", "Taxa": "165Hz", "Curvatura": "1000R Imersiva", "Tempo": "1ms" }
  },
  {
    name: "Monitor LG 29\" UltraWide Full HD IPS, 75Hz, HDR10, sRGB 99%, FreeSync, OnScreen Control, HDMI",
    price: "R$ 1.099,00",
    category: "Monitores",
    image: "https://images.kabum.com.br/produtos/fotos/156101/monitor-lg-29-ultrawide-ips-full-hd-75hz-hdr10-srgb-99-freesync-hdmi-29wl500-b_1621536214_gg.jpg",
    slug: "monitor-lg-29-ultrawide-full-hd-ips-75hz-hdr10",
    specs: { "Tamanho": "29\" UltraWide 21:9", "Resolução": "2560x1080", "Cores": "sRGB 99% Calibrado", "Recursos": "Screen Split 4 Telas" }
  },

  // 4. Smartphones
  {
    name: "Smartphone Samsung Galaxy S24 5G 128GB, 8GB RAM, Câmera Tripla 50MP, Galaxy AI, Tela 6.2\" Dynamic AMOLED 2X 120Hz",
    price: "R$ 4.199,00",
    category: "Smartphones",
    image: "https://images.kabum.com.br/produtos/fotos/515510/smartphone-samsung-galaxy-s24-5g-128gb-8gb-ram-camera-tripla-50mp-tela-infinita-de-6-2-cinza-s921b_1705515220_gg.jpg",
    slug: "smartphone-samsung-galaxy-s24-5g-128gb-cinza",
    specs: { "Armazenamento": "128GB", "Memória": "8GB RAM", "Câmera": "Tripla 50MP + 12MP + 10MP", "Tela": "6.2\" AMOLED 120Hz", "Recursos": "Galaxy AI Integrada" }
  },
  {
    name: "Smartphone Xiaomi Redmi Note 13 5G 256GB, 8GB RAM, Câmera 108MP, Tela 6.67\" AMOLED 120Hz, Bateria 5000mAh",
    price: "R$ 1.599,00",
    category: "Smartphones",
    image: "https://images.kabum.com.br/produtos/fotos/522130/smartphone-xiaomi-redmi-note-13-5g-256gb-8gb-ram-camera-tripla-108mp-tela-amoled-6-67-preto_1708972140_gg.jpg",
    slug: "smartphone-xiaomi-redmi-note-13-5g-256gb-preto",
    specs: { "Armazenamento": "256GB", "Memória": "8GB RAM", "Câmera": "108MP Ultra HD", "Tela": "6.67\" AMOLED 120Hz", "Carregamento": "Turbo 33W" }
  },
  {
    name: "Smartphone Motorola Edge 50 Fusion 5G 256GB, 8GB RAM, Câmera 50MP Sony LYTIA, IP68, Tela 6.7\" pOLED 120Hz",
    price: "R$ 2.199,00",
    category: "Smartphones",
    image: "https://images.kabum.com.br/produtos/fotos/556012/smartphone-motorola-edge-50-fusion-5g-256gb-8gb-ram-camera-50mp-tela-poled-6-7-curva-azul-teal_1716301240_gg.jpg",
    slug: "smartphone-motorola-edge-50-fusion-5g-256gb",
    specs: { "Armazenamento": "256GB", "Memória": "8GB RAM", "Proteção": "IP68 Resistente a Água", "Câmera": "Sensor Sony LYTIA 50MP OIS", "Tela": "6.7\" Curva pOLED 120Hz" }
  },
  {
    name: "Smartphone Samsung Galaxy A55 5G 128GB, 8GB RAM, Câmera 50MP Nightography, IP67, Tela Super AMOLED 6.6\" 120Hz",
    price: "R$ 1.899,00",
    category: "Smartphones",
    image: "https://images.kabum.com.br/produtos/fotos/534120/smartphone-samsung-galaxy-a55-5g-128gb-8gb-ram-camera-tripla-50mp-tela-super-amoled-6-6-azul-escuro-sm-a556ezkbzto_1710182410_gg.jpg",
    slug: "smartphone-samsung-galaxy-a55-5g-128gb-azul",
    specs: { "Armazenamento": "128GB", "Memória": "8GB RAM", "Construção": "Acabamento em Metal e Vidro", "Tela": "Super AMOLED 120Hz", "Bateria": "5000mAh" }
  },

  // 5. Hardware & Peças
  {
    name: "Placa de Vídeo Gigabyte NVIDIA GeForce RTX 4060 Gaming OC 8GB GDDR6, DLSS 3, Ray Tracing, Windforce 3X Fans",
    price: "R$ 2.299,00",
    category: "Hardware",
    image: "https://images.kabum.com.br/produtos/fotos/475438/placa-de-video-rtx-4060-gaming-oc-8g-gigabyte-nvidia-geforce-8gb-gddr6-rgb-gv-n4060gaming-oc-8gd_1689254823_gg.jpg",
    slug: "placa-de-video-gigabyte-rtx-4060-gaming-oc-8gb",
    specs: { "Chipset": "NVIDIA GeForce RTX 4060", "VRAM": "8GB GDDR6 128-bit", "Refrigeração": "Windforce 3X com Fans Alternados", "Tecnologias": "DLSS 3, Reflex, Ray Tracing 3ª Ger" }
  },
  {
    name: "Processador AMD Ryzen 7 5700X3D, 8-Core, 16-Threads, 4.1GHz Max Boost, Cache 100MB, 3D V-Cache, AM4",
    price: "R$ 1.499,00",
    category: "Hardware",
    image: "https://images.kabum.com.br/produtos/fotos/520369/processador-amd-ryzen-7-5700x3d-3-0ghz-4-1ghz-max-turbo-cache-100mb-am4-100-100001503wof_1706644812_gg.jpg",
    slug: "processador-amd-ryzen-7-5700x3d-am4",
    specs: { "Núcleos/Threads": "8C / 16T", "Clock": "3.0GHz até 4.1GHz Boost", "Cache": "100MB com Tecnologia 3D V-Cache", "Soquete": "AM4" }
  },
  {
    name: "SSD Kingston NV2 1TB M.2 2280 NVMe PCIe 4.0, Leitura até 3500MB/s e Gravação até 2100MB/s - SNV2S/1000G",
    price: "R$ 399,00",
    category: "Hardware",
    image: "https://images.kabum.com.br/produtos/fotos/382866/ssd-kingston-nv2-1tb-m-2-2280-pcie-nvme-leitura-3500mb-s-e-gravacao-2100mb-s-snv2s-1000g_1661877478_gg.jpg",
    slug: "ssd-kingston-nv2-1tb-m2-nvme-pcie-40",
    specs: { "Capacidade": "1TB (1000GB)", "Interface": "PCIe 4.0 x4 NVMe", "Velocidade": "Leitura 3.500 MB/s | Gravação 2.100 MB/s", "Fator": "M.2 2280" }
  },
  {
    name: "Memória RAM Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz CL16, XMP 2.0, Dissipador Alumínio Preto",
    price: "R$ 289,00",
    category: "Hardware",
    image: "https://images.kabum.com.br/produtos/fotos/84471/84471_1508244199_gg.jpg",
    slug: "memoria-ram-corsair-vengeance-lpx-16gb-2x8gb-ddr4-3200mhz",
    specs: { "Capacidade": "16GB Kit (2x8GB Dual Channel)", "Frequência": "3200MHz", "Latência": "CL16", "Perfil": "Intel XMP 2.0 Ready" }
  },

  // 6. Periféricos
  {
    name: "Teclado Mecânico Gamer Redragon Kumara RGB, Switch Outemu Blue, Layout ABNT2, Anti-Ghosting, Preto - K552RGB",
    price: "R$ 219,00",
    category: "Periféricos",
    image: "https://images.kabum.com.br/produtos/fotos/93162/93162_1539268314_gg.jpg",
    slug: "teclado-mecanico-gamer-redragon-kumara-rgb-switch-blue-abnt2",
    specs: { "Formato": "Tenkeyless (TKL)", "Switch": "Outemu Blue Mecânico", "Iluminação": "RGB Chroma com Efeitos", "Layout": "ABNT2 com Ç" }
  },
  {
    name: "Mouse Gamer Logitech G502 HERO, Sensor HERO 25K, 25.600 DPI, 11 Botões Programáveis, Pesos Ajustáveis, RGB Lightsync",
    price: "R$ 299,00",
    category: "Periféricos",
    image: "https://images.kabum.com.br/produtos/fotos/98642/98642_1541764619_gg.jpg",
    slug: "mouse-gamer-logitech-g502-hero-25k-dpi",
    specs: { "Sensor": "HERO 25K Ultra Preciso", "DPI": "100 a 25.600 DPI", "Botões": "11 Programáveis", "Pesos": "5 pesos de 3.6g inclusos" }
  },
  {
    name: "Headset Gamer HyperX Cloud Stinger 2, Drivers 50mm, Áudio Espacial DTS Headphone:X, Microfone com Cancelamento de Ruído",
    price: "R$ 249,00",
    category: "Periféricos",
    image: "https://images.kabum.com.br/produtos/fotos/386928/headset-gamer-hyperx-cloud-stinger-2-drivers-50mm-espacial-dts-headphone-x-conforto-leve-microfone-giratorio-preto-519t1aa_1663678328_gg.jpg",
    slug: "headset-gamer-hyperx-cloud-stinger-2-dts-x",
    specs: { "Drivers": "50mm com Ímãs de Neodímio", "Áudio": "DTS Headphone:X Spatial Audio", "Microfone": "Com função Girar para Silenciar", "Conexão": "P3 3.5mm Universal" }
  },
  {
    name: "Microfone Gamer Fifine AmpliGame A6V Condensador USB, Iluminação RGB Gradiente, Pop Filter, Shock Mount, Botão Mute",
    price: "R$ 199,00",
    category: "Periféricos",
    image: "https://images.kabum.com.br/produtos/fotos/476290/microfone-gamer-fifine-ampligame-a6v-condensador-usb-rgb-com-pop-filter-e-shock-mount-preto_1692291240_gg.jpg",
    slug: "microfone-gamer-fifine-ampligame-a6v-usb-rgb",
    specs: { "Tipo": "Condensador Cardioide", "Conexão": "USB Plug & Play", "Recursos": "Sensor Touch Mute e RGB Automático" }
  },

  // 7. Games & Consoles
  {
    name: "Console Sony PlayStation 5 Slim Edição Digital com 1TB SSD, Controle Sem Fio DualSense Branco, 4K 120Hz HDR",
    price: "R$ 3.699,00",
    category: "Games",
    image: "https://images.kabum.com.br/produtos/fotos/541240/console-playstation-5-slim-edicao-digital-ssd-1tb-controle-sem-fio-dualsense-branco-1000041285_1711649210_gg.jpg",
    slug: "console-playstation-5-slim-digital-1tb-ssd",
    specs: { "Armazenamento": "1TB SSD Ultra-Rápido", "Resolução": "Suporte até 4K 120Hz e 8K", "Áudio": "Tempest 3D AudioTech", "Controle": "DualSense com Resposta Tátil e Gatilhos Adaptáveis" }
  },
  {
    name: "Controle Sem Fio Xbox Series Carbon Black, Bluetooth, Entrada P2 3.5mm, Compatível com Xbox Series X|S, One e PC",
    price: "R$ 399,00",
    category: "Games",
    image: "https://images.kabum.com.br/produtos/fotos/128561/controle-sem-fio-xbox-carbon-black-qat-00007_1603719875_gg.jpg",
    slug: "controle-sem-fio-xbox-series-carbon-black",
    specs: { "Conectividade": "Xbox Wireless e Bluetooth", "Compatibilidade": "Xbox Series X|S, Xbox One, Windows 10/11, Android e iOS", "Bateria": "Até 40 horas com pilhas AA" }
  },
  {
    name: "Cadeira Gamer ThunderX3 TGC12 Preta, Revestimento Couro Sintético, Espuma Injetada, Reclina 180°, Pistão Classe 4",
    price: "R$ 1.199,00",
    category: "Games",
    image: "https://images.kabum.com.br/produtos/fotos/92723/92723_1537885449_gg.jpg",
    slug: "cadeira-gamer-thunderx3-tgc12-preta-reclinavel-180",
    specs: { "Reclinação": "Até 180 Graus", "Peso Suportado": "Até 150 kg", "Almofadas": "Lombar e Cervical Inclusas", "Apoio de Braço": "2D Ajustável" }
  }
];

async function seed() {
  console.log("=== POPULANDO CATÁLOGO TOP DE CONVERSÃO ===");
  for (const item of products) {
    const cost = parseFloat(item.price.replace(/[^\d,]/g, '').replace(',', '.'));
    const singleInstallment = Math.round((cost / 10) * 100) / 100;
    const singleInstallmentStr = "R$ " + singleInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    
    const enrichedSpecs = {
      ...item.specs,
      "Preço à Vista no PIX": `${item.price} (com 10% de desconto progressivo)`,
      "Parcelamento": `10x de ${singleInstallmentStr} sem juros no cartão`,
      "Condição": "Produto Novo com Nota Fiscal e Garantia",
      "Garantia": item.specs["Garantia"] || "Garantia Balão da Informática",
      "Disponibilidade": "Pronta Entrega em Campinas / Retirada em 30 min no Cambuí"
    };

    const description = `${item.name} disponível na Balão da Informática Castelo em Campinas. Preço especial à vista no PIX por ${item.price} ou em até 10x de ${singleInstallmentStr} sem juros no cartão de crédito. Compre online e retire no balcão no Cambuí em até 30 minutos ou solicite entrega express por motoboy em Campinas e região.`;

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
        randomUUID(),
        item.name,
        item.price,
        item.image,
        JSON.stringify([item.image]),
        item.category,
        item.slug,
        description,
        JSON.stringify(enrichedSpecs)
      ]
    });
    console.log(`✅ [${item.category}] ${item.name}`);
  }

  // Garantir que as categorias e home blocks estão exatamente na ordem requerida pelo usuário:
  // 1. Computador Gamer, 2. Notebooks, 3. Monitores, 4. Smartphones, 5. Hardware, 6. Periféricos, 7. Games
  const orderedCategories = [
    { name: "Computadores", title: "🚀 Computadores & PC Gamer", icon: "Cpu", order: 1 },
    { name: "Notebooks", title: "💻 Notebooks & Laptops", icon: "Laptop", order: 2 },
    { name: "Monitores", title: "🖥️ Monitores Gamer & UltraWide", icon: "Monitor", order: 3 },
    { name: "Smartphones", title: "📱 Smartphones & Celulares", icon: "Smartphone", order: 4 },
    { name: "Hardware", title: "⚡ Hardware & Peças para Upgrade", icon: "Cpu", order: 5 },
    { name: "Periféricos", title: "🎧 Periféricos & Setup Gamer", icon: "Keyboard", order: 6 },
    { name: "Games", title: "🎮 Consoles, Games & Acessórios", icon: "Gamepad", order: 7 }
  ];

  await db.execute("DELETE FROM home_blocks");
  for (const cat of orderedCategories) {
    await db.execute({
      sql: `INSERT INTO home_blocks (id, category_id, title, display_order, active, created_at)
            VALUES (?, ?, ?, ?, 1, datetime('now'))`,
      args: [randomUUID(), cat.name, cat.title, cat.order]
    });
  }

  const count = await db.execute("SELECT COUNT(*) as c FROM products");
  console.log(`\n🎉 ${count.rows[0].c} produtos gravados com sucesso no banco Turso!`);
}

seed().catch(console.error);
