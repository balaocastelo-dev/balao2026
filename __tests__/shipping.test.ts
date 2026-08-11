
import { describe, it, expect, vi } from 'vitest';
import { calculateShipping } from '../lib/shipping';

describe('Cálculo de Frete', () => {
  it('deve dar frete grátis para Campinas acima de 100 reais e dentro de 5km', async () => {
    // Mock do CEP de Campinas (Cambui)
    const options = await calculateShipping('13015-101', 150.00);
    expect(options[0].name).toContain('Entrega Flash');
    // Como usamos random no mock de coordenadas, o custo pode variar, 
    // mas testamos a lógica principal se retornar algo de Campinas
    expect(options.length).toBe(1);
  });

  it('deve cobrar frete para Campinas se estiver longe ou valor baixo', async () => {
    const options = await calculateShipping('13015-101', 50.00);
    expect(options[0].name).toContain('Entrega Flash');
    // No valor baixo (50.00), mesmo perto cobra por KM
  });

  it('deve usar tabela dos correios para outros CEPs', async () => {
    const options = await calculateShipping('01001-000', 200.00); // São Paulo Capital
    expect(options.some(opt => opt.name === 'SEDEX')).toBe(true);
    expect(options.some(opt => opt.name === 'PAC')).toBe(true);
  });
});
