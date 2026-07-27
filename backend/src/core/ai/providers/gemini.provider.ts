import { Injectable } from '@nestjs/common';
import { BaseAIProvider } from './base-ai.provider';
import { ProviderRegistry } from '../registry/provider.registry';
import { ConfigService } from '@nestjs/config';
import { IAIRequest } from '../interfaces/ai-request.interface';
import { IAIResponse } from '../interfaces/ai-response.interface';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiProvider extends BaseAIProvider {
  readonly name = 'gemini';
  private genAI!: GoogleGenerativeAI;

  constructor(
    configService: ConfigService,
    private readonly registry: ProviderRegistry
  ) {
    super(configService);
    this.registry.register(this);
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  async generate(request: IAIRequest): Promise<IAIResponse> {
    if (!this.genAI) {
      throw new Error('Gemini API key is not configured.');
    }

    return this.executeWithPipeline(async () => {
      const modelName = request.options?.model || 'gemini-2.5-flash';
      const model = this.genAI.getGenerativeModel({ model: modelName });
      
      const contents = [];
      if (request.systemInstruction) {
        contents.push({ role: 'user', parts: [{ text: `System Instructions: ${request.systemInstruction}` }] });
      }
      contents.push({ role: 'user', parts: [{ text: request.prompt }] });

      const response = await model.generateContent({
        contents,
        generationConfig: {
          temperature: request.temperature,
          maxOutputTokens: request.maxTokens,
          responseMimeType: request.responseMimeType
        }
      });

      const res = response.response;
      return {
        text: res.text() || '',
        rawResponse: res,
        usage: res.usageMetadata ? {
          promptTokens: res.usageMetadata.promptTokenCount,
          completionTokens: res.usageMetadata.candidatesTokenCount,
          totalTokens: res.usageMetadata.totalTokenCount
        } : undefined
      };
    }, request);
  }

  async stream(request: IAIRequest): Promise<AsyncGenerator<IAIResponse>> {
    if (!this.genAI) {
      throw new Error('Gemini API key is not configured.');
    }

    const modelName = request.options?.model || 'gemini-2.5-flash';
    const model = this.genAI.getGenerativeModel({ model: modelName });

    const contents = [];
    if (request.systemInstruction) {
      contents.push({ role: 'user', parts: [{ text: `System Instructions: ${request.systemInstruction}` }] });
    }
    contents.push({ role: 'user', parts: [{ text: request.prompt }] });

    const responseStream = await model.generateContentStream({
      contents,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,
        responseMimeType: request.responseMimeType
      }
    });

    async function* generator() {
      for await (const chunk of responseStream.stream) {
        yield {
          text: chunk.text() || '',
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
