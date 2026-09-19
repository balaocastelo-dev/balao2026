
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enrichProductWithAI, formatImportedProductDescription } from '@/lib/ai-service';

// Mock GoogleGenerativeAI
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent
}));

// Properly mock the class constructor
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn(function() {
      return {
        getGenerativeModel: mockGetGenerativeModel
      };
    })
  };
});

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_API_KEY = 'test-key';
  });

  it('should throw error if product name is missing', async () => {
    await expect(enrichProductWithAI('')).rejects.toThrow("Product name is required");
  });

  it('should call Gemini API and return formatted result', async () => {
    const mockResponse = {
      response: {
        text: () => JSON.stringify({
          specs: { "CPU": "M1" },
          description: "A great laptop"
        })
      }
    };
    mockGenerateContent.mockResolvedValue(mockResponse);

    const result = await enrichProductWithAI('MacBook Air');

    expect(mockGetGenerativeModel).toHaveBeenCalledWith({ model: "gemini-1.5-flash" });
    expect(mockGenerateContent).toHaveBeenCalled();
    expect(result.specs).toEqual({ "CPU": "M1" });
    expect(result.description).toBe("A great laptop");
    expect(result.source).toBe("Google Gemini 1.5 Flash");
  });

  it('should handle markdown code blocks in response', async () => {
    const mockResponse = {
      response: {
        text: () => "```json\n" + JSON.stringify({
          specs: { "RAM": "16GB" },
          description: "Fast"
        }) + "\n```"
      }
    };
    mockGenerateContent.mockResolvedValue(mockResponse);

    const result = await enrichProductWithAI('Gaming PC');

    expect(result.specs).toEqual({ "RAM": "16GB" });
  });

  it('should fallback to mock if API key is missing', async () => {
    delete process.env.GOOGLE_API_KEY;
    
    // We expect it to NOT throw, but return mock data
    // The current implementation calls mockEnrichment which has a delay
    // We should mock setTimeout to speed up test or just await
    
    const result = await enrichProductWithAI('iPhone 13');
    expect(result.source).toContain("AI Knowledge Base");
  });

  it('should fallback to mock if API call fails', async () => {
    mockGenerateContent.mockRejectedValue(new Error("API Error"));

    const result = await enrichProductWithAI('Samsung TV');
    
    // Should fallback to mock data
    expect(result.source).toContain("AI Knowledge Base");
    // And should have some data
    expect(result.specs).toBeDefined();
  });

  it('should format imported description with emojis when API key is missing', async () => {
    delete process.env.GOOGLE_API_KEY;
    const result = await formatImportedProductDescription({
      productName: 'Fonte 850W',
      description: 'Eficiência 80 PLUS Ouro. Ventoinha de 120mm com baixo ruído. Proteções UVP OVP OPP.'
    });

    expect(result.source).toBe('heuristic');
    expect(result.description).toContain('✅');
    expect(result.description.split('\n').length).toBeGreaterThan(1);
  });

  it('should call Gemini API to format imported description when API key exists', async () => {
    const mockResponse = {
      response: {
        text: () => JSON.stringify({
          description: "✅ Linha 1\n🔌 Linha 2"
        })
      }
    };
    mockGenerateContent.mockResolvedValue(mockResponse);

    const result = await formatImportedProductDescription({
      productName: 'Fonte 850W',
      description: 'Texto bruto'
    });

    expect(mockGetGenerativeModel).toHaveBeenCalledWith({ model: "gemini-1.5-flash" });
    expect(result.source).toBe('Google Gemini 1.5 Flash');
    expect(result.description).toContain('✅');
  });
});
