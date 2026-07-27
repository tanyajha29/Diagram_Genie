import { Injectable, Logger } from '@nestjs/common';
import { IRendererAdapter } from '../interfaces/renderer-adapter.interface';

@Injectable()
export class RendererAdapterRegistry {
  private readonly adapters = new Map<string, IRendererAdapter>();
  private readonly logger = new Logger(RendererAdapterRegistry.name);

  register(adapter: IRendererAdapter): void {
    this.adapters.set(adapter.id, adapter);
    this.logger.log(`Registered renderer adapter plugin: ${adapter.id}`);
  }

  getAdapter<T = any>(id: string): IRendererAdapter<T> | undefined {
    return this.adapters.get(id) as IRendererAdapter<T> | undefined;
  }

  getAdapters(): IRendererAdapter[] {
    return Array.from(this.adapters.values());
  }
}
