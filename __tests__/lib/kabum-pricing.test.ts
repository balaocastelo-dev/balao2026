import { describe, it, expect } from 'vitest';
import { calculateBalaoPrice, roundBrazilianRetailPrice } from '@/lib/kabum/pricing';

describe('kabum/pricing', () => {
  it('roundBrazilianRetailPrice should round to a Brazilian retail ending (x9,00)', () => {
    expect(roundBrazilianRetailPrice(1152.34)).toBe(1149);
    expect(roundBrazilianRetailPrice(1156)).toBe(1159);
    expect(roundBrazilianRetailPrice(1000)).toBe(999);
  });

  it('calculateBalaoPrice should apply kabum_plus_percentage', () => {
    const price = calculateBalaoPrice(1000, { percentage: 15, mode: 'kabum_plus_percentage', min_margin: 0 });
    expect(price).toBe(1149);
  });

  it('calculateBalaoPrice should apply kabum_minus_percentage', () => {
    const price = calculateBalaoPrice(1000, { percentage: 10, mode: 'kabum_minus_percentage', min_margin: 0 });
    expect(price).toBe(899);
  });

  it('calculateBalaoPrice should apply min_margin', () => {
    const price = calculateBalaoPrice(1000, { percentage: 0, mode: 'min_margin', min_margin: 120 });
    expect(price).toBe(1119);
  });
});

