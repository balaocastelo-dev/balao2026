import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/products/migrate-images/route';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Mock dependencies
vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn()
      }))
    }
  }
}));

vi.mock('sharp', () => {
  return {
    default: vi.fn(() => ({
      metadata: vi.fn().mockResolvedValue({ format: 'jpeg' }),
      resize: vi.fn().mockReturnThis(),
      webp: vi.fn().mockReturnThis(),
      toBuffer: vi.fn().mockResolvedValue(Buffer.from('processed-image-buffer'))
    }))
  };
});

global.fetch = vi.fn();

describe('Migrate Images API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process valid images successfully', async () => {
    // Mock Supabase fetch product
    const mockFrom = vi.mocked(supabaseAdmin.from);
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'prod-1',
        image: 'http://example.com/image.jpg',
        title: 'Test Product'
      },
      error: null
    });
    
    // Fix: update().eq() chain
    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    mockFrom.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
      update: mockUpdate
    } as any);

    // Mock Fetch Image
    (global.fetch as any).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(Buffer.from('original-image')),
      headers: new Headers({ 'content-type': 'image/jpeg' })
    });

    // Mock Supabase Storage
    const mockUpload = vi.fn().mockResolvedValue({ data: { path: 'path/to/image.webp' }, error: null });
    const mockGetPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'https://supabase.co/image.webp' } });
    
    vi.mocked(supabaseAdmin.storage.from).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl
    } as any);

    const request = new Request('http://localhost/api/products/migrate-images', {
      method: 'POST',
      body: JSON.stringify({ ids: ['prod-1'] })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.results[0].status).toBe('success');
    expect(mockUpload).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
            migration_status: 'migrated',
            original_image: 'http://example.com/image.jpg'
        })
    );
  });

  it('should skip products already on Supabase', async () => {
    const mockFrom = vi.mocked(supabaseAdmin.from);
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'prod-2',
          image: 'https://xyz.supabase.co/storage/v1/object/public/products/image.jpg'
        },
        error: null
      })
    } as any);

    const request = new Request('http://localhost/api/products/migrate-images', {
      method: 'POST',
      body: JSON.stringify({ ids: ['prod-2'] })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.results[0].status).toBe('skipped');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle image download failures', async () => {
     const mockFrom = vi.mocked(supabaseAdmin.from);
     
     // Fix: update().eq() chain
     const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
     const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

     mockFrom.mockReturnValue({
       select: vi.fn().mockReturnThis(),
       eq: vi.fn().mockReturnThis(),
       single: vi.fn().mockResolvedValue({
         data: { id: 'prod-3', image: 'http://fail.com/img.jpg' },
         error: null
       }),
       update: mockUpdate
     } as any);

     (global.fetch as any).mockResolvedValue({
       ok: false,
       statusText: 'Not Found'
     });

     const request = new Request('http://localhost/api/products/migrate-images', {
       method: 'POST',
       body: JSON.stringify({ ids: ['prod-3'] })
     });

     const response = await POST(request);
     const data = await response.json();

     expect(data.results[0].status).toBe('error');
     expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ migration_status: 'error' }));
  });
});
