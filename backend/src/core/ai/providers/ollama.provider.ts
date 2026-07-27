import { Injectable } from '@nestjs/common';
import { BaseAIProvider } from './base-ai.provider';
import { ProviderRegistry } from '../registry/provider.registry';
import { ConfigService } from '@nestjs/config';
import { IAIRequest } from '../interfaces/ai-request.interface';
import { IAIResponse } from '../interfaces/ai-response.interface';
import OpenAI from 'openai';

@Injectable()
export class OllamaProvider extends BaseAIProvider {
  readonly name = 'ollama';
  private ollamaClient!: OpenAI;

  constructor(
    configService: ConfigService,
    private readonly registry: ProviderRegistry
  ) {
    super(configService);
    this.registry.register(this);
    // Ollama operates locally and is OpenAI API compatible
    const targetEndpoint = this.endpoint || 'http://localhost:11434/v1';
    this.ollamaClient = new OpenAI({
      apiKey: 'ollama', // placeholder
      baseURL: targetEndpoint
    });
  }

  async generate(request: IAIRequest): Promise<IAIResponse> {
    return this.executeWithPipeline(async (signal) => {
      const modelName = request.options?.model || 'llama3';
      const response = await this.ollamaClient.chat.completions.create({
        model: modelName,
        messages: [
          ...(request.systemInstruction ? [{ role: 'system', content: request.systemInstruction } as any] : []),
          { role: 'user', content: request.prompt }
        ],
        temperature: request.temperature,
        response_format: request.responseMimeType === 'application/json' ? { type: 'json_object' } : undefined
      }, { signal });

      const choice = response.choices[0];
      return {
        text: choice.message.content || '',
        rawResponse: response,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens
        } : undefined
      };
    }, request);
  }

  async stream(request: IAIRequest): Promise<AsyncGenerator<IAIResponse>> {
    const modelName = request.options?.model || 'llama3';
    const responseStream = await this.ollamaClient.chat.completions.create({
      model: modelName,
      messages: [
        ...(request.systemInstruction ? [{ role: 'system', content: request.systemInstruction } as any] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.temperature,
      stream: true
    }, { signal: request.options?.abortSignal });

    async function* generator() {
      for await (const chunk of responseStream) {
        yield {
          text: chunk.choices[0]?.delta?.content || '',
          rawResponse: chunk
        };
      }
    }

    return generator();
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Basic ping test to confirm Ollama local server is responding
      const targetEndpoint = this.endpoint || 'http://localhost:11434';
      const cleanUrl = targetEndpoint.replace(/\/v1\/?$/, ''); // strip out /v1 prefix for root health checks
      
      const res = await fetch(`${cleanUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }
}
