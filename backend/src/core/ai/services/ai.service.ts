import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAIService } from '../interfaces/ai-service.interface';
import { IAIRequest } from '../interfaces/ai-request.interface';
import { IAIResponse } from '../interfaces/ai-response.interface';
import { ProviderFactory } from '../factory/provider.factory';

@Injectable()
export class AiService implements IAIService {
  private readonly defaultProviderName: string;

  constructor(
    private readonly providerFactory: ProviderFactory,
    private readonly configService: ConfigService
  ) {
    this.defaultProviderName = this.configService.get<string>('AI_DEFAULT_PROVIDER', 'gemini').toLowerCase();
  }

  async generate(request: IAIRequest, providerName?: string): Promise<IAIResponse> {
    const target = providerName || this.defaultProviderName;
    const provider = this.providerFactory.createProvider(target);
    return provider.generate(request);
  }

  async stream(request: IAIRequest, providerName?: string): Promise<AsyncGenerator<IAIResponse>> {
    const target = providerName || this.defaultProviderName;
    const provider = this.providerFactory.createProvider(target);
    return provider.stream(request);
  }

  async healthCheck(providerName?: string): Promise<boolean> {
    const target = providerName || this.defaultProviderName;
    const provider = this.providerFactory.createProvider(target);
    return provider.healthCheck();
  }
}
