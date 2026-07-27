import { Injectable } from '@nestjs/common';
import { BaseAIProvider } from './base-ai.provider';
import { ProviderRegistry } from '../registry/provider.registry';
import { ConfigService } from '@nestjs/config';
import { IAIRequest } from '../interfaces/ai-request.interface';
import { IAIResponse } from '../interfaces/ai-response.interface';
import OpenAI from 'openai';

@Injectable()
export class OpenAIProvider extends BaseAIProvider {
  readonly name = 'openai';
  private openai!: OpenAI;

  constructor(
    configService: ConfigService,
    private readonly registry: ProviderRegistry
  ) {
    super(configService);
    this.registry.register(this);
    if (this.apiKey) {
      this.openai = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.endpoint || undefined
      });
    }
  }

  async generate(request: IAIRequest): Promise<IAIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI API key is not configured.');
    }

    return this.executeWithPipeline(async (signal) => {
      const response = await this.openai.chat.completions.create({
        model: request.options?.model || 'gpt-4o-mini',
        messages: [
          ...(request.systemInstruction ? [{ role: 'system', content: request.systemInstruction } as any] : []),
          { role: 'user', content: request.prompt }
        ],
        temperature: request.temperature,
        max_tokens: request.maxTokens,
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
    if (!this.openai) {
      throw new Error('OpenAI API key is not configured.');
    }

    const responseStream = await this.openai.chat.completions.create({
      model: request.options?.model || 'gpt-4o-mini',
      messages: [
        ...(request.systemInstruction ? [{ role: 'system', content: request.systemInstruction } as any] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.temperature,
      max_tokens: request.maxTokens,
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
    return !!this.apiKey;
  }
}
