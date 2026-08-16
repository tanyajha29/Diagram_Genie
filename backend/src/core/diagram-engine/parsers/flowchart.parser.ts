import { Injectable } from '@nestjs/common';
import { IParser } from '../interfaces/parser.interface';
import { ParserRegistry } from '../registry/parser.registry';
import { Diagram, DiagramNode, DiagramEdge } from '../interfaces';
import { ParserResult } from './parser-result.interface';

@Injectable()
export class FlowchartParser implements IParser {
  readonly id = 'flow-parser';

  constructor(private readonly registry: ParserRegistry) {
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    const type = sourceType.toLowerCase();
    return type === 'flow' || type === 'flowchart' || type === 'flow-dsl';
  }

  validate(source: string): boolean {
    return source.trim().length > 0 && source.includes('->');
  }

  async parse(source: string, options?: Record<string, any>): Promise<ParserResult> {
    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];
    const nodeMap = new Map<string, DiagramNode>();

    const cleanId = (str: string): string => {
      return str.trim().replace(/[\[\]\{\}\(\):\-]/g, '').trim().toLowerCase().replace(/\s+/g, '_');
    };

    const determineNodeType = (label: string): string => {
      const lower = label.toLowerCase();
      if (lower === 'start' || lower === 'end' || lower === 'finish') {
        return 'terminal';
      }
      if (label.includes('{') && label.includes('}')) {
        return 'decision';
      }
      return 'process';
    };

    const addNode = (raw: string): string => {
      let label = raw.trim();
      const hasBraces = label.includes('{') && label.includes('}');
      
      // Extract name from braces Choice{Is valid?} -> Choice
      let nodeLabel = label;
      if (hasBraces) {
        nodeLabel = label.substring(label.indexOf('{') + 1, label.indexOf('}')).trim();
      }

      const cleanLabel = label.replace(/\{.*\}/g, '').trim();
      const cid = cleanId(cleanLabel);
      if (!cid) return '';

      if (!nodeMap.has(cid)) {
        nodes.push({
          id: cid,
          label: nodeLabel,
          type: determineNodeType(label),
          position: { x: 0, y: 0 },
          data: {}
        });
        nodeMap.set(cid, nodes[nodes.length - 1]);
      }
      return cid;
    };

    const lines = source.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    lines.forEach((line, idx) => {
      if (line.includes('->')) {
        // Parse line with potential condition e.g. "Decision -> [Yes] -> Step1"
        const parts = line.split('->').map(p => p.trim());
        let i = 0;
        
        while (i < parts.length - 1) {
          const left = parts[i];
          const right = parts[i + 1];

          // If the right side is a choice condition like "[Yes]"
          if (right.startsWith('[') && right.endsWith(']') && i + 2 < parts.length) {
            const edgeLabel = right.substring(1, right.length - 1).trim();
            const target = parts[i + 2];

            const sId = addNode(left);
            const tId = addNode(target);

            if (sId && tId) {
              edges.push({
                id: `e-flow-${idx}-${sId}-${tId}`,
                source: sId,
                target: tId,
                label: edgeLabel,
                animated: false
              });
            }
            i += 2; // Jump over condition and target
          } else {
            const sId = addNode(left);
            const tId = addNode(right);

            // Avoid drawing link to/from edge annotations if unmatched
            if (sId && tId && !left.startsWith('[') && !right.startsWith('[')) {
              edges.push({
                id: `e-flow-${idx}-${sId}-${tId}`,
                source: sId,
                target: tId,
                animated: false
              });
            }
            i++;
          }
        }
      }
    });

    if (nodes.length === 0) {
      nodes.push({
        id: 'empty_flow',
        label: 'Empty Flowchart Workspace',
        type: 'terminal',
        position: { x: 0, y: 0 },
        data: {}
      });
    }

    const diagram = {
      id: `flow_${Date.now()}`,
      title: 'Workflow Process Map',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '2.0',
        sourceType: 'flowchart'
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
