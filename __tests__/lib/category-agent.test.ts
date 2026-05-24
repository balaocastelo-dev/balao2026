import { describe, it, expect } from 'vitest';
import { categorizeProductName } from '@/lib/ai/category-agent';

describe('ai/category-agent', () => {
  it('should pick Fonte category using fallback', async () => {
    const categories = ['Hardware', 'Fontes', 'Gabinetes'];
    const r = await categorizeProductName('Fonte Corsair CX650 650W 80 Plus Bronze', categories);
    expect(r.category).toBe('Fontes');
  });

  it('should pick Gabinetes category using fallback', async () => {
    const categories = ['Hardware', 'Fontes', 'Gabinetes'];
    const r = await categorizeProductName('Gabinete Gamer Mid Tower com vidro temperado', categories);
    expect(r.category).toBe('Gabinetes');
  });
});

