import { Injectable } from '@nestjs/common';
import { IParser } from '../interfaces/parser.interface';
import { ParserRegistry } from '../registry/parser.registry';
import { Diagram } from '../interfaces/diagram.interface';

@Injectable()
export class MarkdownParser implements IParser {
  readonly id = 'markdown-parser';

  constructor(private readonly registry: ParserRegistry) {
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    return sourceType.toLowerCase() === 'markdown' || sourceType.toLowerCase() === 'md';
  }

  validate(source: string): boolean {
    return source.trim().startsWith('#') || source.trim().startsWith('-');
  }

  async parse(source: string, options?: Record<string, any>): Promise<Diagram> {
    return {
      id: `md_${Date.now()}`,
      title: 'Parsed Markdown Documentation Map',
      nodes: [],
      edges: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '1.0',
        sourceType: 'markdown',
      },
    };
  }
}
