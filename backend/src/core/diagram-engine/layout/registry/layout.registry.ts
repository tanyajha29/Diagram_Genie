import { Injectable, Logger } from '@nestjs/common';
import { ILayout } from '../interfaces/layout.interface';

@Injectable()
export class LayoutRegistry {
  private readonly layouts = new Map<string, ILayout>();
  private readonly logger = new Logger(LayoutRegistry.name);

  register(layout: ILayout): void {
    this.layouts.set(layout.id, layout);
    this.logger.log(`Registered layout algorithm: ${layout.id}`);
  }

  getLayout(id: string): ILayout | undefined {
    return this.layouts.get(id);
  }

  getLayouts(): ILayout[] {
    return Array.from(this.layouts.values());
  }
}
