
import { describe, it, expect, vi } from 'vitest';
import { enrichProductWithAI } from '@/lib/ai-service';

// Mock the API to avoid rate limits and costs during load testing
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn(function() {
      return {
        getGenerativeModel: vi.fn(() => ({
          generateContent: vi.fn().mockImplementation(async () => {
            // Simulate random network delay 100ms - 500ms (faster for test)
            await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));
            return {
              response: {
                text: () => JSON.stringify({
                  specs: { "Load Test": "True" },
                  description: "Load test description"
                })
              }
            };
          })
        }))
      };
    })
  };
});

describe('AI Service Load Test', () => {
  it('should handle 50 concurrent requests successfully', async () => {
    process.env.GOOGLE_API_KEY = 'test-key';
    const CONCURRENCY = 50;
    const requests = Array.from({ length: CONCURRENCY }, (_, i) => 
      enrichProductWithAI(`Product ${i}`)
    );

    const start = Date.now();
    const results = await Promise.all(requests);
    const end = Date.now();

    expect(results).toHaveLength(CONCURRENCY);
    results.forEach(result => {
      expect(result.specs).toBeDefined();
      expect(result.source).toBe("Google Gemini 1.5 Flash");
    });

    console.log(`Processed ${CONCURRENCY} requests in ${(end - start) / 1000}s`);
  }, 30000); // 30s timeout
});
