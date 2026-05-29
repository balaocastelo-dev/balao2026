export type PremiumPlatform = "Intel" | "AMD Ryzen" | "AMD Threadripper";

export type PremiumCatalogItem = {
  name: string;
  tier?: string;
  recommendedFor?: string;
  platform?: PremiumPlatform;
  style?: string;
  price?: number | null;
};

export const premiumPartsCatalog = {
  platforms: ["Intel", "AMD Ryzen", "AMD Threadripper"] as const,
  processors: [
    {
      name: "Intel Core Ultra 5 245KF",
      platform: "Intel",
      tier: "Intermediário premium",
      recommendedFor: "Jogos, estudos, trabalho e multitarefas",
      price: 1599.99,
    },
    {
      name: "Intel Core Ultra 7 265KF",
      platform: "Intel",
      tier: "Alta performance",
      recommendedFor: "Jogos pesados, edição, streaming e produtividade",
      price: 1899.99,
    },
    {
      name: "Intel Core Ultra 9 285K",
      platform: "Intel",
      tier: "Topo de linha",
      recommendedFor: "Performance extrema, multitarefas pesadas e uso profissional",
      price: 3309.99,
    },
    {
      name: "AMD Ryzen 9 9900X",
      platform: "AMD Ryzen",
      tier: "Alta performance",
      recommendedFor: "Workstation, renderização, edição e jogos pesados",
      price: 2599.99,
    },
    {
      name: "AMD Ryzen 9 9950X",
      platform: "AMD Ryzen",
      tier: "Topo de linha",
      recommendedFor: "Renderização, edição, engenharia e alto desempenho",
      price: 4999.99,
    },
    {
      name: "AMD Ryzen 9 9950X3D",
      platform: "AMD Ryzen",
      tier: "Topo gamer/profissional",
      recommendedFor: "Jogos extremos, criação e tarefas pesadas",
      price: 7000.0,
    },
    {
      name: "AMD Ryzen Threadripper PRO 9975WX",
      platform: "AMD Threadripper",
      tier: "Workstation extrema",
      recommendedFor: "Simulação, render pesado, engenharia e uso profissional extremo",
      price: null,
    },
    {
      name: "AMD Ryzen Threadripper PRO 9985WX",
      platform: "AMD Threadripper",
      tier: "Workstation extrema",
      recommendedFor: "Produção pesada, renderização, ciência de dados e engenharia",
      price: null,
    },
    {
      name: "AMD Ryzen Threadripper PRO 9995WX",
      platform: "AMD Threadripper",
      tier: "Máximo desempenho",
      recommendedFor: "Workstation de altíssimo nível e projetos extremos",
      price: null,
    },
  ] as const,
  motherboards: [
    {
      name: "MSI PRO H810M-B DDR5",
      platform: "Intel",
      tier: "Base",
      recommendedFor: "Configurações Intel de entrada premium",
      price: 885.99,
    },
    {
      name: "Asus Prime Z890-P WiFi DDR5",
      platform: "Intel",
      tier: "Premium",
      recommendedFor: "Configurações Intel com DDR5 e alta performance",
      price: 2109.99,
    },
    {
      name: "MSI PRO B850M-P WiFi DDR5",
      platform: "AMD Ryzen",
      tier: "Base premium",
      recommendedFor: "Configurações Ryzen de alta performance",
      price: 1529.99,
    },
    {
      name: "Asus Prime X870-P WiFi",
      platform: "AMD Ryzen",
      tier: "Premium",
      recommendedFor: "Ryzen 9, upgrades e máquinas mais fortes",
      price: 3133.22,
    },
    {
      name: "Asus Pro WS WRX90E-SAGE SE",
      platform: "AMD Threadripper",
      tier: "Workstation extrema",
      recommendedFor: "Threadripper PRO e workstations profissionais",
      price: 13799.9,
    },
  ] as const,
  waterCoolers: [
    {
      name: "Antec Vortex 360 ARGB",
      tier: "Premium",
      recommendedFor: "PC gamer e workstation de alto desempenho",
      price: 899.99,
    },
    {
      name: "Corsair iCUE H150i 360mm",
      tier: "Premium",
      recommendedFor: "Processadores fortes e uso intenso",
      price: 1626.21,
    },
    {
      name: "NZXT Kraken Elite 360",
      tier: "Extreme",
      recommendedFor: "Projetos premium, visual diferenciado e refrigeração superior",
      price: 2217.6,
    },
  ] as const,
  gpus: [
    {
      name: "RTX 5060 8GB",
      tier: "Intermediária",
      recommendedFor: "Full HD, jogos competitivos e uso geral",
      price: 2684.91,
    },
    {
      name: "RTX 5070 12GB",
      tier: "Alta performance",
      recommendedFor: "Jogos pesados, 1440p, streaming e edição",
      price: 5999.99,
    },
    {
      name: "RTX 5070 Ti 16GB",
      tier: "Alta performance plus",
      recommendedFor: "Jogos pesados, edição, 2K e trabalhos gráficos",
      price: 7299.9,
    },
    {
      name: "RTX 5080 16GB",
      tier: "Extreme",
      recommendedFor: "4K, criação pesada, renderização e projetos premium",
      price: 13999.99,
    },
    {
      name: "RTX 5090 32GB",
      tier: "Máximo desempenho",
      recommendedFor: "PC extremo, IA, 4K, renderização e workstation premium",
      price: 55555.54,
    },
  ] as const,
  memories: [
    {
      name: "16GB DDR5 6000MHz",
      tier: "Essencial",
      recommendedFor: "Jogos, estudos e uso diário",
      price: 1649.99,
    },
    {
      name: "32GB DDR5 6000MHz",
      tier: "Recomendado",
      recommendedFor: "Jogos pesados, edição, streaming e multitarefas",
      price: 3299.99,
    },
    {
      name: "64GB DDR5 6000MHz",
      tier: "Profissional",
      recommendedFor: "Edição pesada, arquitetura, engenharia e workstation",
      price: 6999.99,
    },
    {
      name: "128GB DDR5",
      tier: "Workstation",
      recommendedFor: "Renderização, simulação, projetos grandes e uso profissional intenso",
      price: 15294.11,
    },
    {
      name: "192GB DDR5",
      tier: "Workstation extrema",
      recommendedFor: "Projetos extremos, engenharia, ciência de dados e render pesado",
      price: null,
    },
  ] as const,
  ssds: [
    {
      name: "SSD NVMe 1TB",
      tier: "Rápido",
      recommendedFor: "Sistema, jogos e programas",
      price: 1299.99,
    },
    {
      name: "SSD NVMe 2TB",
      tier: "Recomendado",
      recommendedFor: "Jogos, edição e armazenamento principal",
      price: 4147.99,
    },
    {
      name: "SSD NVMe 4TB",
      tier: "Profissional",
      recommendedFor: "Projetos grandes, vídeos, jogos e arquivos pesados",
      price: 10694.0,
    },
    {
      name: "SSD NVMe 8TB",
      tier: "Extreme",
      recommendedFor: "Workstation, produção audiovisual e alto volume de dados",
      price: null,
    },
  ] as const,
  ssdQuantities: ["1 unidade", "2 unidades", "3 unidades"] as const,
  hds: [
    {
      name: "Sem HD",
      tier: "Somente SSD",
      recommendedFor: "Quem prefere velocidade e armazenamento em SSD",
      price: 0,
    },
    {
      name: "HD 2TB",
      tier: "Armazenamento extra",
      recommendedFor: "Arquivos, backup e biblioteca de jogos",
      price: 787.52,
    },
    {
      name: "HD 4TB",
      tier: "Armazenamento amplo",
      recommendedFor: "Vídeos, projetos e backups",
      price: 1399.99,
    },
    {
      name: "HD 8TB",
      tier: "Profissional",
      recommendedFor: "Arquivos grandes, projetos e acervo",
      price: 2399.0,
    },
    {
      name: "HD 20TB",
      tier: "Extreme",
      recommendedFor: "Produção audiovisual, empresas e grande volume de dados",
      price: 4299.99,
    },
  ] as const,
  hdQuantities: ["Nenhum", "1 unidade", "2 unidades", "3 unidades"] as const,
  powerSupplies: [
    {
      name: "Fonte 800W 80 Plus Gold",
      tier: "Premium",
      recommendedFor: "PC gamer e workstation de alta performance",
      price: 599.99,
    },
    {
      name: "Fonte 1050W 80 Plus Gold",
      tier: "Alta performance",
      recommendedFor: "GPUs fortes e configurações avançadas",
      price: 1267.69,
    },
    {
      name: "Fonte 1200W Platinum",
      tier: "Extreme",
      recommendedFor: "RTX topo de linha, Threadripper e projetos extremos",
      price: 749.99,
    },
    {
      name: "Fonte Asus ROG Thor 1200P2 Platinum",
      tier: "Extreme",
      recommendedFor: "Projetos premium com foco máximo em estabilidade e eficiência",
      price: 2466.9,
    },
  ] as const,
  cases: [
    {
      name: "Masterbox K501L",
      style: "Gamer",
      recommendedFor: "PC gamer com bom visual e custo-benefício",
      price: 771.12,
    },
    {
      name: "Masterbox TD500 Mesh",
      style: "Gamer premium",
      recommendedFor: "PC gamer com airflow e visual moderno",
      price: 699.9,
    },
    {
      name: "Corsair 4000D",
      style: "Clean premium",
      recommendedFor: "Montagens elegantes e organizadas",
      price: 699.99,
    },
    {
      name: "NZXT H7 Elite",
      style: "Premium",
      recommendedFor: "Projetos sofisticados e setup de alto padrão",
      price: null,
    },
    {
      name: "Asus ROG Hyperion GR701",
      style: "Extreme",
      recommendedFor: "Projetos exclusivos, grandes e de vitrine",
      price: 4976.46,
    },
  ] as const,
  purposes: [
    "Jogos competitivos",
    "Jogos pesados",
    "Streaming",
    "Edição de vídeo",
    "Arquitetura",
    "AutoCAD / Revit",
    "Blender / Renderização",
    "Engenharia",
    "Trabalho empresarial",
    "Estudos",
    "Projeto extremo personalizado",
  ] as const,
  budgets: [
    "Até R$ 4.000",
    "R$ 4.000 a R$ 6.000",
    "R$ 6.000 a R$ 9.000",
    "R$ 9.000 a R$ 13.000",
    "R$ 13.000 a R$ 20.000",
    "Acima de R$ 20.000",
  ] as const,
} as const;
