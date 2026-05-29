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
      name: "Intel Core Ultra 5",
      platform: "Intel",
      tier: "Intermediário premium",
      recommendedFor: "Jogos, estudos, trabalho e multitarefas",
      price: null,
    },
    {
      name: "Intel Core Ultra 7",
      platform: "Intel",
      tier: "Alta performance",
      recommendedFor: "Jogos pesados, edição, streaming e produtividade",
      price: null,
    },
    {
      name: "Intel Core Ultra 9",
      platform: "Intel",
      tier: "Topo de linha",
      recommendedFor: "Performance extrema, multitarefas pesadas e uso profissional",
      price: null,
    },
    {
      name: "AMD Ryzen 9 9900X",
      platform: "AMD Ryzen",
      tier: "Alta performance",
      recommendedFor: "Workstation, renderização, edição e jogos pesados",
      price: null,
    },
    {
      name: "AMD Ryzen 9 9950X",
      platform: "AMD Ryzen",
      tier: "Topo de linha",
      recommendedFor: "Renderização, edição, engenharia e alto desempenho",
      price: null,
    },
    {
      name: "AMD Ryzen 9 9950X3D",
      platform: "AMD Ryzen",
      tier: "Topo gamer/profissional",
      recommendedFor: "Jogos extremos, criação e tarefas pesadas",
      price: null,
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
      name: "H810M",
      platform: "Intel",
      tier: "Base",
      recommendedFor: "Configurações Intel de entrada premium",
      price: null,
    },
    {
      name: "Asus Z890-P DDR5",
      platform: "Intel",
      tier: "Premium",
      recommendedFor: "Configurações Intel com DDR5 e alta performance",
      price: null,
    },
    {
      name: "B850M",
      platform: "AMD Ryzen",
      tier: "Base premium",
      recommendedFor: "Configurações Ryzen de alta performance",
      price: null,
    },
    {
      name: "Asus X870",
      platform: "AMD Ryzen",
      tier: "Premium",
      recommendedFor: "Ryzen 9, upgrades e máquinas mais fortes",
      price: null,
    },
    {
      name: "WRX90E-Sage SE",
      platform: "AMD Threadripper",
      tier: "Workstation extrema",
      recommendedFor: "Threadripper PRO e workstations profissionais",
      price: null,
    },
  ] as const,
  waterCoolers: [
    {
      name: "Vortex 360 ARGB",
      tier: "Premium",
      recommendedFor: "PC gamer e workstation de alto desempenho",
      price: null,
    },
    {
      name: "Corsair H150i",
      tier: "Premium",
      recommendedFor: "Processadores fortes e uso intenso",
      price: null,
    },
    {
      name: "NZXT Kraken Elite 360",
      tier: "Extreme",
      recommendedFor: "Projetos premium, visual diferenciado e refrigeração superior",
      price: null,
    },
  ] as const,
  gpus: [
    {
      name: "NVIDIA GeForce RTX 5060 8GB",
      tier: "Intermediária",
      recommendedFor: "Full HD, jogos competitivos e uso geral",
      price: null,
    },
    {
      name: "NVIDIA GeForce RTX 5070 12GB",
      tier: "Alta performance",
      recommendedFor: "Jogos pesados, 1440p, streaming e edição",
      price: null,
    },
    {
      name: "NVIDIA GeForce RTX 5070 Ti",
      tier: "Alta performance plus",
      recommendedFor: "Jogos pesados, edição, 2K e trabalhos gráficos",
      price: null,
    },
    {
      name: "NVIDIA GeForce RTX 5080",
      tier: "Extreme",
      recommendedFor: "4K, criação pesada, renderização e projetos premium",
      price: null,
    },
    {
      name: "NVIDIA GeForce RTX 5090",
      tier: "Máximo desempenho",
      recommendedFor: "PC extremo, IA, 4K, renderização e workstation premium",
      price: null,
    },
  ] as const,
  memories: [
    {
      name: "16GB DDR5 6000MHz",
      tier: "Essencial",
      recommendedFor: "Jogos, estudos e uso diário",
      price: null,
    },
    {
      name: "32GB DDR5 6000MHz",
      tier: "Recomendado",
      recommendedFor: "Jogos pesados, edição, streaming e multitarefas",
      price: null,
    },
    {
      name: "64GB DDR5 6000MHz",
      tier: "Profissional",
      recommendedFor: "Edição pesada, arquitetura, engenharia e workstation",
      price: null,
    },
    {
      name: "128GB DDR5",
      tier: "Workstation",
      recommendedFor: "Renderização, simulação, projetos grandes e uso profissional intenso",
      price: null,
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
      price: null,
    },
    {
      name: "SSD NVMe 2TB",
      tier: "Recomendado",
      recommendedFor: "Jogos, edição e armazenamento principal",
      price: null,
    },
    {
      name: "SSD NVMe 4TB",
      tier: "Profissional",
      recommendedFor: "Projetos grandes, vídeos, jogos e arquivos pesados",
      price: null,
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
      price: null,
    },
    {
      name: "HD 2TB",
      tier: "Armazenamento extra",
      recommendedFor: "Arquivos, backup e biblioteca de jogos",
      price: null,
    },
    {
      name: "HD 4TB",
      tier: "Armazenamento amplo",
      recommendedFor: "Vídeos, projetos e backups",
      price: null,
    },
    {
      name: "HD 8TB",
      tier: "Profissional",
      recommendedFor: "Arquivos grandes, projetos e acervo",
      price: null,
    },
    {
      name: "HD 20TB",
      tier: "Extreme",
      recommendedFor: "Produção audiovisual, empresas e grande volume de dados",
      price: null,
    },
  ] as const,
  hdQuantities: ["Nenhum", "1 unidade", "2 unidades", "3 unidades"] as const,
  powerSupplies: [
    {
      name: "Fonte 800W 80 Plus Gold",
      tier: "Premium",
      recommendedFor: "PC gamer e workstation de alta performance",
      price: null,
    },
    {
      name: "Fonte 1050W 80 Plus Gold",
      tier: "Alta performance",
      recommendedFor: "GPUs fortes e configurações avançadas",
      price: null,
    },
    {
      name: "Fonte 1200W Platinum",
      tier: "Extreme",
      recommendedFor: "RTX topo de linha, Threadripper e projetos extremos",
      price: null,
    },
  ] as const,
  cases: [
    {
      name: "Masterbox K501L",
      style: "Gamer",
      recommendedFor: "PC gamer com bom visual e custo-benefício",
      price: null,
    },
    {
      name: "Masterbox TD 500",
      style: "Gamer premium",
      recommendedFor: "PC gamer com airflow e visual moderno",
      price: null,
    },
    {
      name: "Corsair 4000D",
      style: "Clean premium",
      recommendedFor: "Montagens elegantes e organizadas",
      price: null,
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
      price: null,
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
