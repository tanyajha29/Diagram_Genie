import { AIManager } from '../services/ai-manager';
import { AiObservabilityService } from '../observability/ai-observability.service';
import { PromptRegistry } from '../prompts/prompt.registry';
import { PromptBuilder } from '../prompts/prompt.builder';
import { ProviderRegistry } from '../registry/provider.registry';
import { ProviderFactory } from '../factory/provider.factory';
import { IAIProvider } from '../interfaces/ai-provider.interface';
import { IAIRequest } from '../interfaces/ai-request.interface';
import { IAIResponse } from '../interfaces/ai-response.interface';
import { ConfigService } from '@nestjs/config';

// Mock strategy provider for isolated unit testing
class MockTestProvider implements IAIProvider {
  readonly name = 'mock-test';
  public generateCalledCount = 0;
  public generateResponses: IAIResponse[] = [];
  public healthReturnValue = true;

  async generate(request: IAIRequest): Promise<IAIResponse> {
    this.generateCalledCount++;
    const idx = Math.min(this.generateCalledCount - 1, this.generateResponses.length - 1);
    const response = this.generateResponses[idx];
    if (!response) {
      return { text: '{}' };
    }
    return response;
  }

  async stream(request: IAIRequest): Promise<AsyncGenerator<IAIResponse>> {
    async function* generator() {
      yield { text: 'chunk 1' };
      yield { text: 'chunk 2' };
    }
    return generator();
  }

  async healthCheck(): Promise<boolean> {
    return this.healthReturnValue;
  }
}

describe('AI Module Core Logic', () => {
  let aiManager: AIManager;
  let observabilityService: AiObservabilityService;
  let promptRegistry: PromptRegistry;
  let promptBuilder: PromptBuilder;
  let providerRegistry: ProviderRegistry;
  let providerFactory: ProviderFactory;
  let mockProvider: MockTestProvider;

  beforeEach(() => {
    providerRegistry = new ProviderRegistry();
    mockProvider = new MockTestProvider();
    providerRegistry.register(mockProvider);

    providerFactory = new ProviderFactory(providerRegistry);
    promptRegistry = new PromptRegistry();
    promptBuilder = new PromptBuilder(promptRegistry);
    observabilityService = new AiObservabilityService();

    // Mock ConfigService configurations
    const mockConfig = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === 'AI_ENABLED') return 'true';
        if (key === 'AI_DEFAULT_PROVIDER') return 'mock-test';
        if (key === 'AI_GEMINI_API_KEY') return 'test_key';
        return defaultValue;
      })
    } as unknown as ConfigService;

    aiManager = new AIManager(providerFactory, promptBuilder, mockConfig, observabilityService);
  });

  describe('AIManager JSON parsing & repairing', () => {
    it('should successfully strip markdown blocks and parse valid JSON content', async () => {
      mockProvider.generateResponses = [
        { text: '```json\n{"nodes": [{"id": "n1", "label": "N1", "type": "frontend"}], "edges": []}\n```' }
      ];

      const response = await aiManager.executeExtraction('architecture', 'v1', { source: 'sample' });
      const parsed = JSON.parse(response.text);
      expect(parsed.nodes[0].id).toBe('n1');
      expect(mockProvider.generateCalledCount).toBe(1);
    });

    it('should successfully repair trailing commas and unbalanced closures', async () => {
      // Unbalanced curly brace at the end and trailing comma in array
      mockProvider.generateResponses = [
        { text: '{"nodes": [{"id": "n1", "label": "N1", "type": "frontend"},], "edges": []' }
      ];

      const response = await aiManager.executeExtraction('architecture', 'v1', { source: 'sample' });
      const parsed = JSON.parse(response.text);
      expect(parsed.nodes[0].id).toBe('n1');
      expect(mockProvider.generateCalledCount).toBe(1);
    });
  });

  describe('AIManager Validation Self-Correction Retry', () => {
    it('should retry once when schema validation fails initially, and succeed if second attempt yields valid JSON', async () => {
      mockProvider.generateResponses = [
        // 1st attempt: invalid JSON (bad nodes schema type)
        { text: '{"nodes": [{"id": "n1", "label": "N1", "type": "invalid_type"}], "edges": []}' },
        // 2nd attempt: corrected valid JSON schema
        { text: '{"nodes": [{"id": "n1", "label": "N1", "type": "frontend"}], "edges": []}' }
      ];

      const response = await aiManager.executeExtraction('architecture', 'v1', { source: 'sample' });
      const parsed = JSON.parse(response.text);
      expect(parsed.nodes[0].type).toBe('frontend');
      expect(mockProvider.generateCalledCount).toBe(2);
    });

    it('should throw AIValidationException if validation fails across all retries', async () => {
      mockProvider.generateResponses = [
        { text: '{"nodes": [{"id": "n1", "label": "N1", "type": "invalid_type"}], "edges": []}' },
        { text: '{"nodes": [{"id": "n1", "label": "N1", "type": "invalid_type"}], "edges": []}' }
      ];

      await expect(
        aiManager.executeExtraction('architecture', 'v1', { source: 'sample' })
      ).rejects.toThrow();
    });
  });

  describe('Provider streaming and health checks', () => {
    it('should support async generator stream iteration output', async () => {
      const streamGenerator = await mockProvider.stream({ prompt: 'test' });
      const chunks: string[] = [];
      for await (const chunk of streamGenerator) {
        chunks.push(chunk.text);
      }
      expect(chunks).toEqual(['chunk 1', 'chunk 2']);
    });

    it('should query health check statuses correctly', async () => {
      const active = await mockProvider.healthCheck();
      expect(active).toBe(true);

      mockProvider.healthReturnValue = false;
      const inactive = await mockProvider.healthCheck();
      expect(inactive).toBe(false);
    });
  });

  describe('AI Observability Telemetry calculations', () => {
    it('should correctly accumulate transaction metrics and output accurate rates', () => {
      observabilityService.logTransaction({
        correlationId: 'c1',
        provider: 'mock-test',
        model: 'model-a',
        latencyMs: 100,
        promptVersion: 'v1',
        retryCount: 0,
        validationStatus: 'success',
        fallbackUsed: false
      });

      observabilityService.logTransaction({
        correlationId: 'c2',
        provider: 'mock-test',
        model: 'model-a',
        latencyMs: 300,
        promptVersion: 'v1',
        retryCount: 1,
        validationStatus: 'failed',
        fallbackUsed: true,
        error: 'invalid format'
      });

      const metrics = observabilityService.getMetrics();
      expect(metrics.totalRequests).toBe(2);
      expect(metrics.averageResponseTimeMs).toBe(200);
      expect(metrics.successRatePercent).toBe(50);
      expect(metrics.totalRetries).toBe(1);
    });
  });
});
