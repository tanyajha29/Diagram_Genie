import { Injectable } from '@nestjs/common';
import { IParser } from '../interfaces/parser.interface';
import { ParserRegistry } from '../registry/parser.registry';
import { Diagram, DiagramNode, DiagramEdge } from '../interfaces';
import { ParserResult } from './parser-result.interface';

@Injectable()
export class UmlSequenceParser implements IParser {
  readonly id = 'sequence-parser';

  constructor(private readonly registry: ParserRegistry) {
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    const type = sourceType.toLowerCase();
    return type === 'sequence' || type === 'uml-sequence' || type === 'sequence-dsl';
  }

  validate(source: string): boolean {
    return source.trim().length > 0 && (source.includes('->') || source.includes('-->'));
  }

  async parse(source: string, options?: Record<string, any>): Promise<ParserResult> {
    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];
    const nodeMap = new Map<string, DiagramNode>();

    const cleanId = (str: string): string => {
      return str.trim().replace(/[\[\]\{\}\(\):\-]/g, '').trim().toLowerCase().replace(/\s+/g, '_');
    };

    const addNode = (id: string, label: string) => {
      const cid = cleanId(id);
      if (!cid) return;
      if (!nodeMap.has(cid)) {
        const node: DiagramNode = {
          id: cid,
          label: label.trim(),
          type: 'uml-class',
          position: { x: 0, y: 0 },
          data: { attributes: [], methods: [] }
        };
        nodes.push(node);
        nodeMap.set(cid, node);
      }
    };

    const lines = source.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    let currentClass: any = null;

    lines.forEach((line, idx) => {
      // Allow embedded class declarations in Sequence files
      const classMatch = line.match(/^(class|interface)\s+([a-zA-Z0-9_]+)\s*\{?$/i);
      if (classMatch) {
        const name = classMatch[2];
        const id = cleanId(name);
        currentClass = { id, name, properties: {}, methods: [] };
        return;
      }

      if (line === '}' && currentClass) {
        if (!nodeMap.has(currentClass.id)) {
          nodeMap.set(currentClass.id, {
            id: currentClass.id,
            label: currentClass.name,
            type: 'uml-class',
            position: { x: 0, y: 0 },
            data: { attributes: Object.keys(currentClass.properties), methods: currentClass.methods }
          });
          nodes.push(nodeMap.get(currentClass.id)!);
        }
        currentClass = null;
        return;
      }

      if (currentClass) {
        if (line.includes('(')) {
          currentClass.methods.push(line.replace(/\(\)/g, '').trim());
        } else if (line.includes(':')) {
          const parts = line.split(':');
          currentClass.properties[parts[0].trim()] = parts[1].trim();
        } else {
          currentClass.properties[line] = 'string';
        }
        return;
      }

      // Process sequence messaging transitions
      const isDashed = line.includes('-->');
      const delimiter = isDashed ? '-->' : '->';

      if (line.includes(delimiter) && line.includes(':')) {
        const parts = line.split(':');
        const edgeLabel = parts[1].trim();
        const connection = parts[0].split(delimiter);

        if (connection.length === 2) {
          const actor1 = connection[0].trim();
          const actor2 = connection[1].trim();
          const a1Id = cleanId(actor1);
          const a2Id = cleanId(actor2);

          addNode(a1Id, actor1);
          addNode(a2Id, actor2);

          edges.push({
            id: `e-seq-${idx}`,
            source: a1Id,
            target: a2Id,
            label: edgeLabel,
            type: isDashed ? 'dashed' : 'default',
            animated: !isDashed,
            data: { sequenceIndex: idx }
          });
        }
      }
    });

    if (nodes.length === 0) {
      nodes.push({
        id: 'empty_sequence',
        label: 'Empty Sequence Workspace',
        type: 'uml-class',
        position: { x: 0, y: 0 },
        data: {}
      });
    }

    const diagram = {
      id: `sequence_${Date.now()}`,
      title: 'UML Sequence Diagram',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '2.0',
        sourceType: 'sequence'
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
