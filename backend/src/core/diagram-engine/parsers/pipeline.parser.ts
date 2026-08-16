import { Injectable } from '@nestjs/common';
import { IParser } from '../interfaces/parser.interface';
import { ParserRegistry } from '../registry/parser.registry';
import { Diagram, DiagramNode, DiagramEdge } from '../interfaces';
import { ParserResult } from './parser-result.interface';

@Injectable()
export class PipelineDslParser implements IParser {
  readonly id = 'pipeline-parser';

  constructor(private readonly registry: ParserRegistry) {
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    const type = sourceType.toLowerCase();
    return type === 'pipeline' || type === 'aiml' || type === 'pipeline-dsl';
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
      if (lower.includes('data') || lower.includes('dataset') || lower.includes('s3') || lower.includes('ingest')) {
        return 'dataset';
      }
      if (lower.includes('clean') || lower.includes('transform') || lower.includes('process') || lower.includes('feature')) {
        return 'transform';
      }
      if (lower.includes('train') || lower.includes('model') || lower.includes('pytorch') || lower.includes('tensorflow')) {
        return 'model';
      }
      if (lower.includes('evaluate') || lower.includes('val') || lower.includes('test') || lower.includes('mlflow')) {
        return 'evaluation';
      }
      if (lower.includes('infer') || lower.includes('serve') || lower.includes('endpoint') || lower.includes('api')) {
        return 'serving';
      }
      return 'transform'; // Default
    };

    const addNode = (raw: string): string => {
      const label = raw.replace(/[\[\]]/g, '').trim();
      const cid = cleanId(label);
      if (!cid) return '';

      if (!nodeMap.has(cid)) {
        const node: DiagramNode = {
          id: cid,
          label,
          type: determineNodeType(label),
          position: { x: 0, y: 0 },
          data: {}
        };
        nodes.push(node);
        nodeMap.set(cid, node);
      }
      return cid;
    };

    const lines = source.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    lines.forEach((line, idx) => {
      if (line.includes('->')) {
        const parts = line.split('->');
        let prevId = '';

        parts.forEach((part) => {
          const rawNode = part.trim();
          if (rawNode.length > 0) {
            const nodeId = addNode(rawNode);
            if (prevId && nodeId) {
              edges.push({
                id: `e-pipe-${idx}-${prevId}-${nodeId}`,
                source: prevId,
                target: nodeId,
                animated: true
              });
            }
            prevId = nodeId;
          }
        });
      }
    });

    if (nodes.length === 0) {
      nodes.push({
        id: 'empty_pipeline',
        label: 'Empty ML Pipeline',
        type: 'dataset',
        position: { x: 0, y: 0 },
        data: {}
      });
    }

    const diagram = {
      id: `pipeline_${Date.now()}`,
      title: 'Machine Learning Ingestion Pipeline',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '2.0',
        sourceType: 'pipeline'
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
