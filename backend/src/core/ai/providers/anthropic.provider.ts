import { Injectable } from '@nestjs/common';
import { BaseAIProvider } from './base-ai.provider';
import { ProviderRegistry } from '../registry/provider.registry';
import { ConfigService } from '@nestjs/config';
import { IAIRequest } from '../interfaces/ai-request.interface';
import { IAIResponse } from '../interfaces/ai-response.interface';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AnthropicProvider extends BaseAIProvider {
  readonly name = 'anthropic';
  private anthropic!: Anthropic;

  constructor(
    configService: ConfigService,
    private readonly registry: ProviderRegistry
  ) {
    super(configService);
    this.registry.register(this);
    if (this.apiKey) {
      this.anthropic = new Anthropic({
        apiKey: this.apiKey,
        baseURL: this.endpoint || undefined
      });
    }
  }

  async generate(request: IAIRequest): Promise<IAIResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic API key is not configured.');
    }

    return this.executeWithPipeline(async (signal) => {
      const response = await this.anthropic.messages.create({
        model: request.options?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: request.maxTokens || 1024,
        system: request.systemInstruction,
        messages: [{ role: 'user', content: request.prompt }]
      }, { signal });

      const contentBlock = response.content[0];
      const text = contentBlock.type === 'text' ? contentBlock.text : '';

      return {
        text,
        rawResponse: response,
        usage: response.usage ? {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        } : undefined
      };
    }, request);
  }

  async stream(request: IAIRequest): Promise<AsyncGenerator<IAIResponse>> {
    if (!this.anthropic) {
      throw new Error('Anthropic API key is not configured.');
    }

    const responseStream = await this.anthropic.messages.create({
      model: request.options?.model || 'claude-3-5-sonnet-20241022',
      max_tokens: request.maxTokens || 1024,
      system: request.systemInstruction,
      messages: [{ role: 'user', content: request.prompt }],
      stream: true
    }, { signal: request.options?.abortSignal });

    async function* generator() {
      for await (const chunk of responseStream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield {
            text: chunk.delta.text,
            rawResponse: chunk
          };
        }
      }
    }

    return generator();
  }

  async healthCheck(): Promise<boolean> {
    return !!this.apiKey;
  }
}
