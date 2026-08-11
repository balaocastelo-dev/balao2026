import { describe, it, expect } from 'vitest';
import { categorizeProductName } from '@/lib/ai/category-agent';

describe('ai/category-agent', () => {
  it('should pick Fonte category using fallback', async () => {
    const categories = ['Computadores & Informática > Fontes', 'Computadores & Informática > Gabinetes', 'Hardware'];
    const r = await categorizeProductName('Fonte Corsair CX650 650W 80 Plus Bronze', categories);
    expect(r.category).toBe('Computadores & Informática > Fontes');
  });

  it('should pick Gabinetes category using fallback', async () => {
    const categories = ['Computadores & Informática > Fontes', 'Computadores & Informática > Gabinetes', 'Hardware'];
    const r = await categorizeProductName('Gabinete Gamer Mid Tower com vidro temperado', categories);
    expect(r.category).toBe('Computadores & Informática > Gabinetes');
  });

  it('should map Kabum breadcrumbs to a full Balão path', async () => {
    const categories = ['Eletrônicos > Fontes', 'Computadores & Informática > Fontes', 'Hardware'];
    const r = await categorizeProductName('Fonte CX650', categories, {
      kabumBreadcrumbs: ['Computadores', 'Hardware', 'Fontes']
    });
    expect(r.category).toBe('Computadores & Informática > Fontes');
    expect(r.confidence).toBeGreaterThanOrEqual(0.9);
  });
});
