import { randomUUID } from "crypto";
import { turso } from "@/lib/turso";
import { NextResponse } from "next/server";

type CategorySeed = {
  name: string;
  slug: string;
  icon?: string;
  children?: CategorySeed[];
};

const SEED_DATA: CategorySeed[] = [
  {
    name: "Computadores",
    slug: "computadores",
    icon: "Monitor",
    children: [
      { name: "PC Gamer", slug: "pc-gamer", icon: "Gamepad2" },
      { name: "PC Corporativo / EscritÃ³rio", slug: "pc-corporativo", icon: "Briefcase" },
      { name: "Workstation", slug: "workstation", icon: "Server" },
      { name: "Allâ€‘inâ€‘One", slug: "all-in-one", icon: "Monitor" },
      { name: "Mini PC", slug: "mini-pc", icon: "Box" }
    ]
  },
  {
    name: "Notebooks",
    slug: "notebooks",
    icon: "Laptop",
    children: [
      { name: "Notebook Gamer", slug: "notebook-gamer", icon: "Gamepad2" },
      { name: "Notebook Profissional", slug: "notebook-profissional", icon: "Briefcase" },
      { name: "Notebook Estudante", slug: "notebook-estudante", icon: "Book" },
      { name: "Ultrabook", slug: "ultrabook", icon: "Feather" },
      { name: "MacBook", slug: "macbook-notebooks", icon: "Laptop" }
    ]
  },
  {
    name: "Hardware",
    slug: "hardware",
    icon: "Cpu",
    children: [
      { name: "Processadores (CPU)", slug: "processadores", icon: "Cpu" },
      { name: "Placas de VÃ­deo (GPU)", slug: "placas-de-video", icon: "Aperture" },
      { name: "Placasâ€‘MÃ£e", slug: "placas-mae", icon: "CircuitBoard" },
      { name: "MemÃ³ria RAM", slug: "memoria-ram", icon: "MemoryStick" },
      { name: "SSD / HD / NVMe", slug: "ssd-hd-nvme", icon: "HardDrive" },
      { name: "Fontes de AlimentaÃ§Ã£o", slug: "fontes-alimentacao", icon: "Zap" },
      { name: "Gabinetes", slug: "gabinetes", icon: "Box" },
      { name: "Coolers e Water Cooler", slug: "coolers", icon: "Fan" },
      { name: "Placas de Rede / Som", slug: "placas-rede-som", icon: "Network" }
    ]
  },
  {
    name: "Smartphones",
    slug: "smartphones",
    icon: "Smartphone",
    children: [
      { name: "Smartphones Android", slug: "smartphones-android", icon: "Smartphone" },
      { name: "iPhone", slug: "iphone-smartphones", icon: "Smartphone" },
      { name: "Smartphones Gamer", slug: "smartphones-gamer", icon: "Gamepad2" },
      { name: "Capas e PelÃ­culas", slug: "capas-peliculas", icon: "Shield" },
      { name: "Carregadores e Cabos", slug: "carregadores-cabos-smartphones", icon: "Zap" },
      { name: "Suportes e Power Banks", slug: "suportes-power-banks", icon: "Battery" }
    ]
  },
  {
    name: "Monitores",
    slug: "monitores",
    icon: "Monitor",
    children: [
      { name: "Monitor Gamer", slug: "monitor-gamer", icon: "Gamepad2" },
      { name: "Monitor Curvo", slug: "monitor-curvo", icon: "Monitor" },
      { name: "Monitor Profissional", slug: "monitor-profissional", icon: "Briefcase" },
      { name: "Monitor Ultrawide", slug: "monitor-ultrawide", icon: "Monitor" },
      { name: "Monitor 4K", slug: "monitor-4k", icon: "Monitor" },
      { name: "Suportes para Monitor", slug: "suportes-monitor", icon: "Move" }
    ]
  },
  {
    name: "PerifÃ©ricos",
    slug: "perifericos",
    icon: "Keyboard",
    children: [
      { name: "Teclados Gamer e MecÃ¢nicos", slug: "teclados-gamer-mecanicos", icon: "Keyboard" },
      { name: "Mouses Gamer", slug: "mouses-gamer", icon: "Mouse" },
      { name: "Headsets e Fones", slug: "headsets-fones", icon: "Headphones" },
      { name: "Mousepads", slug: "mousepads", icon: "Square" },
      { name: "Controles / Joysticks", slug: "controles-joysticks", icon: "Gamepad" },
      { name: "Volantes e Simuladores", slug: "volantes-simuladores", icon: "Disc" },
      { name: "Webcams", slug: "webcams", icon: "Camera" },
      { name: "Microfones", slug: "microfones", icon: "Mic" }
    ]
  },
  {
    name: "AcessÃ³rios",
    slug: "acessorios",
    icon: "Plug",
    children: [
      { name: "Cabos (HDMI, DisplayPort, USB, Ãudio)", slug: "cabos-diversos", icon: "Cable" },
      { name: "Adaptadores e Conversores", slug: "adaptadores-conversores", icon: "RefreshCcw" },
      { name: "Hubs USB", slug: "hubs-usb", icon: "Usb" },
      { name: "Bases para Notebook", slug: "bases-notebook", icon: "Laptop" },
      { name: "Suportes para Headset", slug: "suportes-headset", icon: "Headphones" },
      { name: "Mochilas e Cases", slug: "mochilas-cases", icon: "Backpack" },
      { name: "IluminaÃ§Ã£o RGB", slug: "iluminacao-rgb", icon: "Lightbulb" },
      { name: "Filtros de Linha e Estabilizadores", slug: "filtros-estabilizadores", icon: "Zap" }
    ]
  },
  {
    name: "SeguranÃ§a",
    slug: "seguranca",
    icon: "Lock",
    children: [
      { name: "CÃ¢meras de SeguranÃ§a (IP / Wiâ€‘Fi)", slug: "cameras-seguranca", icon: "Video" },
      { name: "Kits CFTV", slug: "kits-cftv", icon: "Video" },
      { name: "DVR e NVR", slug: "dvr-nvr", icon: "HardDrive" },
      { name: "Alarmes Residenciais", slug: "alarmes-residenciais", icon: "Bell" },
      { name: "Sensores de Movimento", slug: "sensores-movimento", icon: "Radio" },
      { name: "Fechaduras EletrÃ´nicas", slug: "fechaduras-eletronicas", icon: "Lock" },
      { name: "VÃ­deo Porteiros", slug: "video-porteiros", icon: "Video" }
    ]
  },
  {
    name: "AutomaÃ§Ã£o",
    slug: "automacao",
    icon: "Home",
    children: [
      { name: "Casa Inteligente", slug: "casa-inteligente", icon: "Home" },
      { name: "Tomadas Inteligentes", slug: "tomadas-inteligentes", icon: "Power" },
      { name: "Interruptores Inteligentes", slug: "interruptores-inteligentes", icon: "ToggleLeft" },
      { name: "LÃ¢mpadas e Fitas LED Smart", slug: "lampadas-fitas-led", icon: "Lightbulb" },
      { name: "Sensores Inteligentes", slug: "sensores-inteligentes", icon: "Radio" },
      { name: "Assistentes Virtuais", slug: "assistentes-virtuais", icon: "Mic" },
      { name: "Centrais de AutomaÃ§Ã£o", slug: "centrais-automacao", icon: "Server" }
    ]
  },
  {
    name: "Geek",
    slug: "geek",
    icon: "Ghost",
    children: [
      { name: "Action Figures", slug: "action-figures", icon: "User" },
      { name: "ColecionÃ¡veis", slug: "colecionaveis", icon: "Star" },
      { name: "Funko Pop", slug: "funko-pop", icon: "Smile" },
      { name: "Camisetas e VestuÃ¡rio", slug: "camisetas-vestuario", icon: "Shirt" },
      { name: "Canecas e Copos", slug: "canecas-copos", icon: "Coffee" },
      { name: "DecoraÃ§Ã£o Geek", slug: "decoracao-geek", icon: "Image" },
      { name: "Brinquedos TemÃ¡ticos", slug: "brinquedos-tematicos", icon: "Gift" }
    ]
  },
  {
    name: "LicenÃ§as",
    slug: "licencas",
    icon: "Key",
    children: [
      { name: "Windows", slug: "windows", icon: "Monitor" },
      { name: "Microsoft Office", slug: "microsoft-office", icon: "FileText" },
      { name: "AntivÃ­rus", slug: "antivirus", icon: "Shield" },
      { name: "Softwares de Design", slug: "softwares-design", icon: "PenTool" },
      { name: "Softwares de EdiÃ§Ã£o", slug: "softwares-edicao", icon: "Video" }
    ]
  },
  {
    name: "EscritÃ³rio",
    slug: "escritorio",
    icon: "Armchair",
    children: [
      { name: "Cadeiras Gamer", slug: "cadeiras-gamer", icon: "Armchair" },
      { name: "Cadeiras ErgonÃ´micas", slug: "cadeiras-ergonomicas", icon: "Armchair" },
      { name: "Mesas Gamer", slug: "mesas-gamer", icon: "Table" },
      { name: "Mesas para EscritÃ³rio", slug: "mesas-escritorio", icon: "Table" },
      { name: "Suportes ErgonÃ´micos", slug: "suportes-ergonomicos", icon: "Move" },
      { name: "Organizadores", slug: "organizadores", icon: "Box" }
    ]
  },
  {
    name: "Games",
    slug: "games",
    icon: "Gamepad",
    children: [
      { name: "Jogos para PC", slug: "jogos-pc", icon: "Monitor" },
      { name: "Jogos para PlayStation", slug: "jogos-playstation", icon: "Gamepad" },
      { name: "Jogos para Xbox", slug: "jogos-xbox", icon: "Gamepad" },
      { name: "Jogos para Nintendo", slug: "jogos-nintendo", icon: "Gamepad" },
      { name: "Consoles", slug: "consoles", icon: "Tv" },
      { name: "Controles", slug: "controles-games", icon: "Gamepad2" },
      { name: "Assinaturas", slug: "assinaturas", icon: "CreditCard" },
      { name: "Gift Cards", slug: "gift-cards", icon: "Gift" }
    ]
  },
  {
    name: "Apple",
    slug: "apple",
    icon: "Apple",
    children: [
      { name: "MacBook", slug: "macbook-apple", icon: "Laptop" },
      { name: "iMac", slug: "imac", icon: "Monitor" },
      { name: "Mac Mini", slug: "mac-mini", icon: "Box" },
      { name: "iPad", slug: "ipad", icon: "Tablet" },
      { name: "iPhone", slug: "iphone", icon: "Smartphone" },
      { name: "Apple Watch", slug: "apple-watch", icon: "Watch" },
      { name: "AirPods", slug: "airpods", icon: "Headphones" },
      { name: "AcessÃ³rios Apple", slug: "acessorios-apple", icon: "Plug" }
    ]
  },
  {
    name: "ImpressÃ£o",
    slug: "impressao",
    icon: "Printer",
    children: [
      { name: "Impressoras Jato de Tinta", slug: "impressoras-jato-tinta", icon: "Printer" },
      { name: "Impressoras Laser", slug: "impressoras-laser", icon: "Printer" },
      { name: "Multifuncionais", slug: "multifuncionais", icon: "Copy" },
      { name: "Cartuchos de Tinta", slug: "cartuchos-tinta", icon: "Droplet" },
      { name: "Toners", slug: "toners", icon: "Cylinder" },
      { name: "Papel FotogrÃ¡fico", slug: "papel-fotografico", icon: "Image" },
      { name: "Etiquetas", slug: "etiquetas", icon: "Tag" },
      { name: "Scanners", slug: "scanners", icon: "Scan" }
    ]
  }
];

async function insertCategory(category: CategorySeed, parentId: string | null, order: number) {
  // 1. Verifica se já existe (por slug)
  const existing = await turso.execute({
    sql: 'SELECT id FROM categories WHERE slug = ? LIMIT 1',
    args: [category.slug],
  });

  let categoryId: string;

  if (existing.rows.length === 0) {
    categoryId = randomUUID();
    try {
      await turso.execute({
        sql: `INSERT INTO categories (id, name, slug, parent_id, icon, display_order, active)
              VALUES (?, ?, ?, ?, ?, ?, 1)`,
        args: [categoryId, category.name, category.slug, parentId, category.icon ?? null, order],
      });
    } catch (error) {
      console.error(`Error inserting ${category.name}:`, error);
      throw error;
    }
  } else {
    // Atualiza se existir para garantir a hierarquia
    categoryId = String((existing.rows[0] as any).id);
    await turso.execute({
      sql: `UPDATE categories SET name = ?, parent_id = ?, icon = ?, display_order = ? WHERE id = ?`,
      args: [category.name, parentId, category.icon ?? null, order, categoryId],
    });
  }

  // 2. Insere as subcategorias
  if (category.children && category.children.length > 0) {
    for (let i = 0; i < category.children.length; i++) {
      await insertCategory(category.children[i], categoryId, i);
    }
  }
}

export async function GET() {
  try {
    for (let i = 0; i < SEED_DATA.length; i++) {
      await insertCategory(SEED_DATA[i], null, i);
    }
    return NextResponse.json({ success: true, message: "Categories seeded successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
