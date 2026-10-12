// "Qual seminovo é para mim?" — três respostas viram uma configuração
// recomendada. É o que o vendedor faria no balcão; o resultado vai junto no
// pedido do WhatsApp, para ele já chegar com as opções certas.

export type Uso = "estudo" | "escritorio" | "programacao" | "design" | "empresa";
export type Prioridade = "leveza" | "desempenho" | "tela" | "preco";

export interface PerfilRecomendado {
  titulo: string;
  configuracao: string[];
  procurePor: string[];
  dica: string;
}

const BASE: Record<Uso, PerfilRecomendado> = {
  estudo: {
    titulo: "Notebook leve para estudar o dia todo",
    configuracao: ["Intel Core i5 (8ª geração ou mais nova) ou Ryzen 5", "8 GB de memória (16 GB se abre muitas abas)", "SSD de 256 GB", "Tela de 14 polegadas Full HD"],
    procurePor: ["Lenovo ThinkPad T480s / T14", "Dell Latitude 5400 / 5410", "HP EliteBook 840"],
    dica: "Para faculdade, bateria e peso pesam mais que processador. Peça para ver a saúde da bateria no laudo.",
  },
  escritorio: {
    titulo: "Máquina de trabalho que não trava",
    configuracao: ["Intel Core i5 (8ª geração ou mais nova)", "16 GB de memória", "SSD de 256 a 512 GB", "Tela de 14 polegadas Full HD", "Webcam e microfone para reunião"],
    procurePor: ["Dell Latitude 5410 / 5420", "Lenovo ThinkPad T14 / L14", "HP ProBook 440 / EliteBook 840"],
    dica: "Planilha grande, ERP e videochamada ao mesmo tempo pedem 16 GB. Dá para subir a memória na hora da compra.",
  },
  programacao: {
    titulo: "Seminovo para programar com folga",
    configuracao: ["Intel Core i7 ou Ryzen 7 (ou Core i5 de 10ª geração em diante)", "16 a 32 GB de memória", "SSD NVMe de 512 GB", "Teclado de linha corporativa"],
    procurePor: ["Lenovo ThinkPad T14 / T490", "Dell Latitude 7410 / 5420", "MacBook Air ou Pro com chip M1"],
    dica: "Docker, máquina virtual e várias IDEs abertas consomem memória antes de processador: priorize 32 GB se usa contêineres.",
  },
  design: {
    titulo: "Para foto, vídeo e design",
    configuracao: ["Core i7 / Ryzen 7 ou chip Apple M1 em diante", "16 GB de memória ou mais", "SSD de 512 GB ou 1 TB", "Tela IPS Full HD com boa fidelidade de cor"],
    procurePor: ["MacBook Air / Pro M1", "Dell Latitude série 7000", "Lenovo ThinkPad série P (workstation)"],
    dica: "Tela é onde o seminovo mais varia. Venha ver o aparelho ligado na loja antes de fechar.",
  },
  empresa: {
    titulo: "Lote padronizado para a empresa",
    configuracao: ["Mesma linha e mesma configuração para todo mundo", "Core i5 de 8ª geração em diante", "16 GB de memória", "SSD de 256 GB ou mais", "Windows 11 Pro"],
    procurePor: ["Dell Latitude 5000", "Lenovo ThinkPad T e L", "HP EliteBook / ProBook"],
    dica: "Equipamento igual para a equipe facilita suporte e peça de reposição. Pergunte por lote com nota fiscal.",
  },
};

const AJUSTE: Record<Prioridade, (p: PerfilRecomendado) => PerfilRecomendado> = {
  leveza: (p) => ({ ...p, configuracao: [...p.configuracao, "Abaixo de 1,5 kg, bateria com boa saúde"] }),
  desempenho: (p) => ({ ...p, configuracao: p.configuracao.map((c) => c.replace("8 GB de memória (16 GB se abre muitas abas)", "16 GB de memória")) }),
  tela: (p) => ({ ...p, configuracao: p.configuracao.map((c) => c.replace(/Tela de 14 polegadas/, "Tela de 15,6 polegadas")) }),
  preco: (p) => ({ ...p, dica: `${p.dica} Para economizar, uma geração anterior com SSD novo costuma render quase igual.` }),
};

export function perfilRecomendado(uso: Uso, prioridade: Prioridade): PerfilRecomendado {
  const base = BASE[uso] ?? BASE.escritorio;
  return (AJUSTE[prioridade] ?? ((p) => p))(base);
}

export function resumoDoPerfil(p: PerfilRecomendado) {
  return `Perfil sugerido no site: ${p.configuracao.join(", ")}.`;
}
