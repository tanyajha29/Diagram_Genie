import { Injectable, BadRequestException } from '@nestjs/common';
import { ProviderRegistry } from '../registry/provider.registry';
import { IAIProvider } from '../interfaces/ai-provider.interface';

@Injectable()
export class ProviderFactory {
  constructor(private readonly registry: ProviderRegistry) {}

  createProvider(name: string): IAIProvider {
    const provider = this.registry.getProvider(name);
    if (!provider) {
      throw new BadRequestException(`AI Provider Strategy '${name}' is not registered or supported.`);
    }
    return provider;
  }
}
