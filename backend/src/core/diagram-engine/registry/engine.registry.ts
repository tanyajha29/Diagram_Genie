import { Injectable } from '@nestjs/common';
import { LayoutEngine } from '../interfaces/layout-engine.interface';

@Injectable()
export class DiagramEngineRegistry {
  private readonly layoutEngines = new Map<string, LayoutEngine>();

  registerLayoutEngine(engine: LayoutEngine): void {
    this.layoutEngines.set(engine.id, engine);
  }

  getLayoutEngine(id: string): LayoutEngine | undefined {
    return this.layoutEngines.get(id);
  }
}
