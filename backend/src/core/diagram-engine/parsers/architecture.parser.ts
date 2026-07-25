import { Injectable } from '@nestjs/common';
import { IParser } from '../interfaces/parser.interface';
import { ParserRegistry } from '../registry/parser.registry';
import { Diagram } from '../interfaces/diagram.interface';

@Injectable()
export class ArchitectureParser implements IParser {
  readonly id = 'architecture-parser';

  constructor(private readonly registry: ParserRegistry) {
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    return sourceType.toLowerCase() === 'architecture' || sourceType.toLowerCase() === 'system';
  }

  validate(source: string): boolean {
    return source.includes('->') || source.includes('=>');
  }

  async parse(source: string, options?: Record<string, any>): Promise<Diagram> {
    return {
      id: `arch_${Date.now()}`,
      title: 'Parsed System Architecture Map',
      nodes: [],
      edges: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '1.0',
        sourceType: 'architecture',
      },
    };
  }
}
