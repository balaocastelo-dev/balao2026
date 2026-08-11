import { describe, it, expect } from 'vitest';
import { fallbackCompareProducts } from '@/lib/ai/llama-agent';

describe('ai/llama-agent fallback', () => {
  it('should detect same product with high confidence for very similar titles', () => {
    const r = fallbackCompareProducts(
      'Placa de Vídeo ASUS GeForce RTX 4060 8GB GDDR6',
      'Placa de Video GeForce RTX 4060 ASUS 8GB GDDR6'
    );
    expect(r.sameProduct).toBe(true);
    expect(r.confidence).toBeGreaterThanOrEqual(0.75);
  });

  it('should detect different products with low confidence', () => {
    const r = fallbackCompareProducts('SSD NVMe 1TB Gen4', 'Fonte 600W 80 Plus Bronze');
    expect(r.sameProduct).toBe(false);
    expect(r.confidence).toBeLessThan(0.75);
  });
});

