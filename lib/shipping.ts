
export const SHIPPING_CONFIG = {
  storeAddress: {
    street: "Av. Anchieta, 789",
    neighborhood: "Cambuí",
    city: "Campinas",
    state: "SP",
    cep: "13015-101" // CEP aproximado da Anchieta 789
  },
  campinasRules: {
    freeThreshold: 100.00,
    maxKmFree: 5,
    kmRate: 2.00,
    maxKmPaid: 15,
    maxPaidValue: 30.00
  },
  // Coordenadas aproximadas para cálculo de distância simples (Haversine)
  storeCoords: {
    lat: -22.9015,
    lng: -47.0545
  }
};

/**
 * Calcula distância entre dois pontos (Haversine) em KM
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em KM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Simula a obtenção de coordenadas via CEP (Em um cenário real usaria Google Maps ou outra API)
 * Aqui usaremos um mock baseado no CEP de Campinas para o desafio
 */
async function getCoordsFromCep(cep: string): Promise<{lat: number, lng: number} | null> {
  // Mock: CEPs de Campinas começam com 130 ou 131
  if (cep.startsWith('130') || cep.startsWith('131')) {
    // Retorna coordenadas aleatórias próximas à loja para teste
    const offset = (Math.random() - 0.5) * 0.1; // ~10km de variação
    return {
      lat: SHIPPING_CONFIG.storeCoords.lat + offset,
      lng: SHIPPING_CONFIG.storeCoords.lng + offset
    };
  }
  return null;
}

export async function calculateShipping(cep: string, cartTotal: number) {
  const cleanCep = cep.replace(/\D/g, '');
  
  // 1. Regra Campinas
  const isCampinas = cleanCep.startsWith('130') || cleanCep.startsWith('131');
  
  if (isCampinas) {
    const coords = await getCoordsFromCep(cleanCep);
    if (coords) {
      const distance = calculateDistance(
        SHIPPING_CONFIG.storeCoords.lat, 
        SHIPPING_CONFIG.storeCoords.lng,
        coords.lat,
        coords.lng
      );

      // Regra: Grátis acima de 100,00 até 5km
      if (cartTotal >= SHIPPING_CONFIG.campinasRules.freeThreshold && distance <= SHIPPING_CONFIG.campinasRules.maxKmFree) {
        return [{
          name: "Entrega Flash (Campinas)",
          days: "Até 24h",
          cost: 0,
          info: `Distância: ${distance.toFixed(1)}km`
        }];
      }

      // Regra: Até 15km cobra 2,00 por km (máximo 30,00)
      if (distance <= SHIPPING_CONFIG.campinasRules.maxKmPaid) {
        const cost = Math.min(distance * SHIPPING_CONFIG.campinasRules.kmRate, SHIPPING_CONFIG.campinasRules.maxPaidValue);
        return [{
          name: "Entrega Flash (Campinas)",
          days: "Até 24h",
          cost: cost,
          info: `Distância: ${distance.toFixed(1)}km`
        }];
      }
    }
  }

  // 2. Regra Correios (Simulação)
  // Em produção, aqui chamaria a API dos Correios ou Melhor Envio
  const isSP = cleanCep.startsWith('0') || cleanCep.startsWith('1');
  
  if (isSP) {
    return [
      { name: "PAC", days: "5 a 8 dias úteis", cost: 15.90 },
      { name: "SEDEX", days: "1 a 3 dias úteis", cost: 24.50 }
    ];
  }

  return [
    { name: "PAC", days: "10 a 15 dias úteis", cost: 29.90 },
    { name: "SEDEX", days: "3 a 7 dias úteis", cost: 48.90 }
  ];
}
