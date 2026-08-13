/* eslint-disable */
import * as fs from "node:fs";
import * as path from "node:path";

// Demo rápida: gera TXT amostra com os 4 switches do usuario + 6 extras via API scrape local
// Usa o servidor Next.js ja rodando em localhost:3000
const OUTPUT = path.resolve(process.cwd(), "./kabum-export-amostra-10prod.txt");

async function fetchJson(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await res.json();
}

const LINHAS_FIXAS = [
  {
    url: "https://www.kabum.com.br/produto/180914/switch-tp-link-5-portas-ls105g",
    imagem:
      "https://images.kabum.com.br/produtos/fotos/sync_mirakl/180914/medium/Switch-TP-Link-5-portas-LS105G_1785309519.jpg",
    nome: "Switch TP-Link, 5 portas – LS105G",
    preco: "25,66",
    categoria: "Hardware > Redes e Roteadores > Switches",
  },
  {
    url: "https://www.kabum.com.br/produto/291268/switch-tp-link-10-100mbps-fast-ethernet-5-portas-tpn0249",
    imagem:
      "https://images.kabum.com.br/produtos/fotos/sync_mirakl/291268/medium/Switch-Tp-link-10-100Mbps-Fast-Ethernet-5-Portas-TPN0249_1781271520.jpg",
    nome: "Switch Tp-link 10/100Mbps, Fast Ethernet, 5 Portas - TPN0249",
    preco: "30,00",
    categoria: "Hardware > Redes e Roteadores > Switches",
  },
  {
    url: "https://www.kabum.com.br/produto/933045/switch-cudy-de-mesa-5-portas-10-100mbps-branco-fs105d-v3-0",
    imagem:
      "https://images.kabum.com.br/produtos/fotos/sync_mirakl/933045/medium/Switch-Cudy-De-Mesa-5-Portas-10-100mbps-Branco-Fs105d-V3-0_1774610320.jpg",
    nome: "Switch Cudy De Mesa 5 Portas 10/100mbps Branco Fs105d V3.0",
    preco: "40,59",
    categoria: "Hardware > Redes e Roteadores > Switches",
  },
  {
    url: "https://www.kabum.com.br/produto/169239/switch-tp-link-5-portas-easy-smart-gigabit-tl-sg105e",
    imagem:
      "https://images.kabum.com.br/produtos/fotos/sync_mirakl/169239/medium/Switch-TP-Link-5-Portas-Easy-Smart-Gigabit-TL-SG105E_1781271520.jpg",
    nome: "Switch TP-Link 5 Portas, Easy Smart Gigabit - TL-SG105E",
    preco: "25,12",
    categoria: "Hardware > Redes e Roteadores > Switches",
  },
];

async function main() {
  console.log("Gerando amostra TXT de 10 produtos Kabum (4 fixos + 6 via scrape local)...");
  const headers = [
    "ProductURL",
    "ImageURL_1",
    "ImageURL_2",
    "ImageURL_3",
    "ImageURL_4",
    "ImageURL_5",
    "Nome",
    "Preço",
    "Categoria",
  ];
  const TAB = "\t";
  const EOL = "\r\n";
  const lines: string[] = [headers.join(TAB)];

  const addRow = (args: {
    url: string;
    imagens: string[];
    nome: string;
    preco: string;
    categoria: string;
  }) => {
    const imgs = args.imagens.slice(0, 5);
    while (imgs.length < 5) imgs.push("");
    const price = args.preco.startsWith("R$") ? args.preco : `R$ ${args.preco}`;
    lines.push([args.url, ...imgs, args.nome, price, args.categoria].join(TAB));
  };

  for (const l of LINHAS_FIXAS) {
    let imagens = [l.imagem];
    let nome = l.nome;
    let preco = l.preco;
    let categoria = l.categoria;
    try {
      const r = await fetchJson("http://localhost:3000/api/scrape/product", { url: l.url });
      if (r && Array.isArray(r.images) && r.images.length > 0) imagens = r.images;
      if (r && r.description) {
        // (descricao nao vai para TXT mas podemos usar para validar)
      }
    } catch (e) {
      // ignorar: fallback p/ dados fixos do usuario
    }
    addRow({ url: l.url, imagens, nome, preco, categoria });
  }

  const OUTROS_PRODUTOS_EXTRA = [
    {
      url: "https://www.kabum.com.br/produto/320797/processador-amd-ryzen-7-5700x-3-4ghz-4-6ghz-max-turbo-cache-36mb-8-nucleos-16-threads-am4-sem-video-integrado-100-100000926wof",
      cat: "Hardware > Processadores",
    },
    {
      url: "https://www.kabum.com.br/produto/621162/ssd-kingston-nv3-1-tb-m-2-2280-pcie-4-0-x4-nvme-leitura-6000-mb-s-gravacao-4000-mb-s-azul-snv3s-1000g",
      cat: "Hardware > SSD e HD > SSD",
    },
    {
      url: "https://www.kabum.com.br/produto/369658/fonte-msi-mag-a650bn-650w-80-plus-bronze-pfc-ativo-com-cabo-preto-306-7zp2b22-ce0",
      cat: "Hardware > Fontes",
    },
    {
      url: "https://www.kabum.com.br/produto/1037468/notebook-lenovo-ideapad-slim-3-amd-ryzen-5-7535hs-8gb-amd-radeon-graphics-ssd-512gb-15-3-wuxga-1920x1200-linux-83mms00300",
      cat: "Notebooks",
    },
    {
      url: "https://www.kabum.com.br/produto/907601/fonte-gigabyte-ud850gm-850w-80-plus-gold-modular-pfc-ativo-preto-28200-ud850g-1arr",
      cat: "Hardware > Fontes",
    },
    {
      url: "https://www.kabum.com.br/produto/907602/fonte-gigabyte-ud850gm-pg5-v2-850w-80-plus-gold-modular-pfc-ativo-preto-28200-u85gb-1cbrr",
      cat: "Hardware > Fontes",
    },
  ];

  for (const p of OUTROS_PRODUTOS_EXTRA) {
    try {
      const r = await fetchJson("http://localhost:3000/api/scrape/product", { url: p.url });
      const imagens: string[] = Array.isArray(r?.images) ? r.images : [];
      const nome = (typeof r?.description === "string" ? r.description : "") || "";
      const price = (r as any)?.["price"] || "";
      addRow({
        url: p.url,
        imagens: imagens.length > 0 ? imagens : ["https://www.kabum.com.br/favicon.ico"],
        nome: nome || p.url.split("/").pop() || "",
        preco: price || "0,00",
        categoria: p.cat,
      });
    } catch {
      addRow({
        url: p.url,
        imagens: [],
        nome: p.url.split("/").pop() || "",
        preco: "0,00",
        categoria: p.cat,
      });
    }
  }

  fs.writeFileSync(OUTPUT, lines.join(EOL), "utf8");
  const sizeKb = (fs.statSync(OUTPUT).size / 1024).toFixed(1);
  console.log(`\n✅ AMOSTRA PRONTA: ${OUTPUT}`);
  console.log(`   ${lines.length - 1} produtos • ${sizeKb} KB`);
  console.log("\nCole esse conteúdo diretamente em https://www.balao.info/admin/importacao e clique em Analisar Colunas.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
