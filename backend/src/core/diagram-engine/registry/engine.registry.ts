import { Injectable } from '@nestjs/common';
import { DiagramParser } from '../interfaces/parser.interface';
import { LayoutEngine } from '../interfaces/layout-engine.interface';

@Injectable()
export class DiagramEngineRegistry {
  private readonly parsers = new Map<string, DiagramParser>();
  private readonly layoutEngines = new Map<string, LayoutEngine>();

  registerParser(parser: DiagramParser): void {
    this.parsers.set(parser.id, parser);
  }

  getParser(id: string): DiagramParser | undefined {
    return this.parsers.get(id);
  }

  getParserForType(type: string): DiagramParser | undefined {
    return Array.from(this.parsers.values()).find((parser) =>
      parser.supportedTypes.includes(type.toLowerCase())
    );
  }

  registerLayoutEngine(engine: LayoutEngine): void {
    this.layoutEngines.set(engine.id, engine);
  }

  getLayoutEngine(id: string): LayoutEngine | undefined {
    return this.layoutEngines.get(id);
  }
}
