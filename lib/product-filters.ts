
import { Product } from "@/lib/utils";

export interface FilterTag {
  name: string;
  count: number;
}

// Lista de termos irrelevantes para ignorar na geração de tags
const IGNORED_TERMS = new Set([
  "de", "para", "com", "em", "a", "o", "e", "do", "da", "no", "na", 
  "pc", "computador", "notebook", "gamer", "kit", "oferta", "promocao", 
  "novo", "usado", "venda", "preco", "loja", "balao", "informatica"
]);

// Lista de termos prioritários (always include if found)
const PRIORITY_TERMS = [
  "RTX", "GTX", "RADEON", "INTEL", "AMD", "RYZEN", "CORE", 
  "I3", "I5", "I7", "I9", "DDR3", "DDR4", "DDR5", 
  "4GB", "8GB", "16GB", "32GB", "64GB", "128GB",
  "SSD", "HDD", "NVME", "M2",
  "DELL", "HP", "LENOVO", "ACER", "ASUS", "SAMSUNG", "LG",
  "WINDOWS", "LINUX", "PRO", "HOME"
];

/**
 * Extrai tags relevantes de uma lista de produtos
 */
export function extractTags(products: Product[]): FilterTag[] {
  const tagCounts = new Map<string, number>();

  products.forEach(product => {
    // Normaliza o nome para facilitar a busca
    const name = product.name.toUpperCase();
    
    // 1. Buscar termos prioritários explicitamente
    PRIORITY_TERMS.forEach(term => {
      // Regex para garantir que pegamos a palavra inteira ou parte significativa (ex: RTX 3060 contém RTX)
      // Mas para termos como "I5", queremos evitar "WIFI5".
      // Vamos usar uma verificação simples de inclusão para começar, e refinar se necessário.
      // Para garantir precisão, usamos boundary ou split.
      
      const regex = new RegExp(`\\b${term}\\b`, 'i'); // Word boundary
      if (regex.test(name) || name.includes(term)) {
         // Se o termo for muito curto (ex: I5), boundary é importante.
         // Se for algo como "16GB", as vezes está colado "DDR4 16GB".
         // Vamos simplificar: se a string contém o termo, adiciona.
         // Mas cuidado com falsos positivos. Ex: "AMD" em "DAMADO".
         // Vamos usar split por separadores não alfanuméricos.
         
         const tokens = name.split(/[^A-Z0-9]+/);
         if (tokens.includes(term)) {
             tagCounts.set(term, (tagCounts.get(term) || 0) + 1);
         } else {
             // Tenta match parcial para casos como RTX3060 -> RTX
             if (term.length > 2 && name.includes(term)) {
                 tagCounts.set(term, (tagCounts.get(term) || 0) + 1);
             }
         }
      }
    });

    // 2. Extrair números de polegadas (ex: 19", 19pol, 19 pol)
    const inchMatch = name.match(/(\d{2})["']|(\d{2})\s*(POL|POLEGADAS)/);
    if (inchMatch) {
        const size = inchMatch[1] || inchMatch[2];
        const tag = `${size}"`;
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  });

  // Converter para array e ordenar
  return Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
        // Ordenar tags numéricas (polegadas, GB) de forma lógica?
        // Por enquanto, ordenar por contagem (mais populares primeiro)
        return b.count - a.count;
    })
    .slice(0, 20); // Limitar a 20 tags principais para não poluir
}

/**
 * Filtra produtos baseado nas tags selecionadas (Lógica AND)
 */
export function filterProductsByTags(products: Product[], selectedTags: string[]): Product[] {
  if (!selectedTags || selectedTags.length === 0) return products;

  return products.filter(product => {
    const name = product.name.toUpperCase();
    // O produto deve conter TODAS as tags selecionadas
    return selectedTags.every(tag => {
        // Lógica de match similar à extração
        if (tag.endsWith('"')) { // Polegadas
             const size = tag.replace('"', '');
             return name.includes(size + '"') || name.includes(size + "'") || name.includes(size + " POL");
        }
        return name.includes(tag);
    });
  });
}
