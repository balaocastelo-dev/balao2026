import { describe, it, expect } from 'vitest';
import { isValidKabumUrl } from '@/lib/kabum/validators';

describe('kabum/validators', () => {
  it('should accept kabum.com.br hosts', () => {
    expect(isValidKabumUrl('https://www.kabum.com.br/produto/123')).toBe(true);
    expect(isValidKabumUrl('https://kabum.com.br/produto/123')).toBe(true);
  });

  it('should reject other domains and invalid URLs', () => {
    expect(isValidKabumUrl('https://google.com')).toBe(false);
    expect(isValidKabumUrl('not a url')).toBe(false);
    expect(isValidKabumUrl('ftp://www.kabum.com.br/x')).toBe(false);
  });
});

