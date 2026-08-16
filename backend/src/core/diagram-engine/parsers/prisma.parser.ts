import { Injectable } from '@nestjs/common';
import { IParser } from '../interfaces/parser.interface';
import { ParserRegistry } from '../registry/parser.registry';
import { Diagram, DiagramNode, DiagramEdge } from '../interfaces';
import { ParserResult } from './parser-result.interface';

@Injectable()
export class PrismaParser implements IParser {
  readonly id = 'prisma-parser';

  constructor(private readonly registry: ParserRegistry) {
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    const type = sourceType.toLowerCase();
    return type === 'prisma' || type === 'prisma-schema';
  }

  validate(source: string): boolean {
    return source.trim().length > 0 && source.includes('model ');
  }

  async parse(source: string, options?: Record<string, any>): Promise<ParserResult> {
    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];
    const models = new Map<string, {
      name: string;
      columns: Array<{ name: string; type: string; isPrimaryKey: boolean; isForeignKey: boolean }>;
      relations: Array<{ field: string; type: string; relationStr: string }>;
    }>();

    const cleanId = (str: string): string => {
      return str.trim().toLowerCase().replace(/\s+/g, '_');
    };

    const lines = source.split(/\r?\n/).map(l => l.trim());
    let currentModel: string | null = null;

    lines.forEach((line) => {
      if (line.startsWith('model ')) {
        const match = line.match(/^model\s+([a-zA-Z0-9_]+)\s*\{/);
        if (match) {
          currentModel = match[1];
          models.set(currentModel, {
            name: currentModel,
            columns: [],
            relations: []
          });
        }
        return;
      }

      if (line.startsWith('}') && currentModel) {
        currentModel = null;
        return;
      }

      if (currentModel && line.length > 0) {
        // Parse fields: fieldName fieldType attributes
        // Examples:
        // id Int @id @default(autoincrement())
        // author User @relation(fields: [authorId], references: [id])
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          const fieldName = parts[0];
          const fieldType = parts[1];
          const rest = parts.slice(2).join(' ');

          const modelInfo = models.get(currentModel)!;

          if (rest.includes('@relation')) {
            modelInfo.relations.push({
              field: fieldName,
              type: fieldType,
              relationStr: rest
            });
          } else {
            const isPrimaryKey = rest.includes('@id');
            const isForeignKey = false; // Resolved in next pass
            
            // Standard columns (filter out arrays and target objects)
            const isArray = fieldType.endsWith('[]');
            const isObjectLink = /^[A-Z]/.test(fieldType); // Convention: model references start with capital letter

            if (!isArray && !isObjectLink) {
              modelInfo.columns.push({
                name: fieldName,
                type: fieldType,
                isPrimaryKey,
                isForeignKey
              });
            }
          }
        }
      }
    });

    // Second pass: resolve foreign keys and relations
    models.forEach((model, modelName) => {
      const nodeId = cleanId(modelName);

      // Create model node
      nodes.push({
        id: nodeId,
        label: model.name,
        type: 'database-table',
        position: { x: 0, y: 0 },
        data: {
          columns: model.columns
        }
      });

      // Map relation edges
      model.relations.forEach((rel) => {
        const targetModelName = rel.type.replace('?', '');
        const targetNodeId = cleanId(targetModelName);

        // Find FK columns inside the local model block
        // e.g. @relation(fields: [authorId], references: [id])
        const fieldsMatch = rel.relationStr.match(/fields:\s*\[([^\]]+)\]/);
        const refMatch = rel.relationStr.match(/references:\s*\[([^\]]+)\]/);

        if (fieldsMatch && refMatch) {
          const fkFields = fieldsMatch[1].split(',').map(f => f.trim());
          
          // Mark those columns as Foreign Keys
          fkFields.forEach((fkF) => {
            const col = model.columns.find(c => c.name === fkF);
            if (col) {
              col.isForeignKey = true;
            }
          });

          edges.push({
            id: `e-prisma-${nodeId}-${targetNodeId}`,
            source: nodeId,
            target: targetNodeId,
            label: `${fieldsMatch[1]} -> ${refMatch[1]}`,
            animated: false
          });
        } else {
          // Default association edge if details are simplified
          edges.push({
            id: `e-prisma-${nodeId}-${targetNodeId}`,
            source: nodeId,
            target: targetNodeId,
            animated: false
          });
        }
      });
    });

    if (nodes.length === 0) {
      nodes.push({
        id: 'empty_prisma',
        label: 'Empty Prisma Schema',
        type: 'database-table',
        position: { x: 0, y: 0 },
        data: { columns: [] }
      });
    }

    const diagram = {
      id: `prisma_${Date.now()}`,
      title: 'Prisma Relational Map',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '2.0',
        sourceType: 'prisma'
      }
    };

    return {
      diagram,
      warnings: [],
      statistics: {
        linesParsed: source.split('\n').length,
        nodesCreated: nodes.length,
        edgesCreated: edges.length,
        ignoredLines: 0,
        parseDurationMs: 0
      }
    };
  }
}
