import { Injectable, Logger } from '@nestjs/common';
import { IAIProvider } from '../interfaces/ai-provider.interface';

@Injectable()
export class ProviderRegistry {
  private readonly providers = new Map<string, IAIProvider>();
  private readonly logger = new Logger(ProviderRegistry.name);

  register(provider: IAIProvider): void {
    this.providers.set(provider.name.toLowerCase(), provider);
    this.logger.log(`Registered AI Provider strategy: ${provider.name}`);
  }

  getProvider(name: string): IAIProvider | undefined {
    return this.providers.get(name.toLowerCase());
  }

  getProviders(): IAIProvider[] {
    return Array.from(this.providers.values());
  }
}
