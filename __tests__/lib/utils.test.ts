import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { compressImage, enhanceImageUrl } from '@/lib/utils';

describe('utils', () => {
  describe('enhanceImageUrl', () => {
    it('should replace Kabum low res suffixes with _g', () => {
      expect(enhanceImageUrl('https://static.kabum.com.br/produtos/fotos/123456/123456_m.jpg')).toBe('https://static.kabum.com.br/produtos/fotos/123456/123456_g.jpg');
      expect(enhanceImageUrl('https://static.kabum.com.br/produtos/fotos/123456/123456_p.jpg')).toBe('https://static.kabum.com.br/produtos/fotos/123456/123456_g.jpg');
      expect(enhanceImageUrl('https://static.kabum.com.br/produtos/fotos/123456/123456_peq.jpg')).toBe('https://static.kabum.com.br/produtos/fotos/123456/123456_g.jpg');
    });

    it('should remove query parameters', () => {
      expect(enhanceImageUrl('https://example.com/image.jpg?w=100&h=100')).toBe('https://example.com/image.jpg');
    });

    it('should return original url if no changes needed', () => {
      expect(enhanceImageUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
    });
  });

  describe('compressImage', () => {
    let originalCreateObjectURL: typeof URL.createObjectURL;
    let originalRevokeObjectURL: typeof URL.revokeObjectURL;

    beforeEach(() => {
      originalCreateObjectURL = global.URL.createObjectURL;
      originalRevokeObjectURL = global.URL.revokeObjectURL;

      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();

      // Mock Canvas toBlob
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        writable: true,
        value: function(callback: BlobCallback) {
          callback(new Blob(['mock-blob-content'], { type: 'image/webp' }));
        }
      });
      
      // Mock Canvas getContext
      const mockContext = {
          drawImage: vi.fn(),
      };
      
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
          writable: true,
          value: vi.fn(() => mockContext)
      });
    });

    afterEach(() => {
      global.URL.createObjectURL = originalCreateObjectURL;
      global.URL.revokeObjectURL = originalRevokeObjectURL;
      vi.restoreAllMocks();
    });

    it('should return original file if not an image', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = await compressImage(file);
      expect(result).toBe(file);
    });

    it('should compress image larger than 1920x1080', async () => {
        // Mock Image loading
        const originalImage = global.Image;
        global.Image = class extends originalImage {
            constructor() {
                super();
                setTimeout(() => {
                    Object.defineProperty(this, 'width', { value: 3840 });
                    Object.defineProperty(this, 'height', { value: 2160 });
                    this.onload?.(new Event('load'));
                }, 10);
            }
        };

        const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
        const result = await compressImage(file);

        expect(result).not.toBe(file); // Should be a new file
        expect(result.type).toBe('image/webp');
        expect(result.name).toBe('test.webp');
        
        global.Image = originalImage;
    });

    it('should handle image loading errors gracefully', async () => {
        const originalImage = global.Image;
        global.Image = class extends originalImage {
            constructor() {
                super();
                setTimeout(() => {
                    this.onerror?.(new Event('error'));
                }, 10);
            }
        };

        const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
        const result = await compressImage(file);

        expect(result).toBe(file); // Should return original on error
        
        global.Image = originalImage;
    });
  });
});
