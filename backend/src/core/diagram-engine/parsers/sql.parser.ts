import { Injectable } from '@nestjs/common';
import { IParser } from '../interfaces/parser.interface';
import { ParserRegistry } from '../registry/parser.registry';
import { Diagram } from '../interfaces/diagram.interface';

@Injectable()
export class SqlParser implements IParser {
  readonly id = 'sql-parser';

  constructor(private readonly registry: ParserRegistry) {
    // Automatically register with the registry via DI injection lifecycle
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    return sourceType.toLowerCase() === 'sql' || sourceType.toLowerCase() === 'database';
  }

  validate(source: string): boolean {
    return source.trim().toLowerCase().includes('table') || source.trim().toLowerCase().includes('create table');
  }

  async parse(source: string, options?: Record<string, any>): Promise<Diagram> {
    return {
      id: `sql_${Date.now()}`,
      title: 'Parsed SQL DB Schema',
      nodes: [],
      edges: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '1.0',
        sourceType: 'sql',
      },
    };
  }
}
