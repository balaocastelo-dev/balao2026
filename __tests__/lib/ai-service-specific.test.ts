
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enrichProductWithAI } from '@/lib/ai-service';

describe('AI Service Specific Product Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_API_KEY = 'test-key';
  });

  it('should return specific hardcoded data for "Celular Vita 4G P9225"', async () => {
    const result = await enrichProductWithAI('Celular Vita 4G P9225');
    
    expect(result.specs).toBeDefined();
    expect(result.specs["Marca"]).toBe("Multilaser");
    expect(result.specs["Modelo"]).toBe("P9225");
    expect(result.specs["Anatel"]).toBe("17346-23-03111");
    expect(result.specs["Memória Interna"]).toBe("32 MB");
    expect(result.seo_title).toContain("Smartphone Multilaser Vita 4G P9225");
    expect(result.json_ld).toBeDefined();
    expect(result.json_ld["gtin13"]).toBe("7899838896357");
    expect(result.source).toContain("Manual Correction");
  });

  it('should return specific hardcoded data for "Celular Multilaser Vita 4G P9225 Preto"', async () => {
    const result = await enrichProductWithAI('Celular Multilaser Vita 4G P9225 Preto');
    expect(result.specs["Modelo"]).toBe("P9225");
  });
});
