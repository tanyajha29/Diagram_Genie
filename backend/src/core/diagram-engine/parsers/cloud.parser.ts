import { Injectable } from '@nestjs/common';
import { IParser } from '../interfaces/parser.interface';
import { ParserRegistry } from '../registry/parser.registry';
import { Diagram, DiagramNode, DiagramEdge } from '../interfaces';
import { ParserResult } from './parser-result.interface';

@Injectable()
export class CloudDslParser implements IParser {
  readonly id = 'cloud-parser';

  constructor(private readonly registry: ParserRegistry) {
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    const type = sourceType.toLowerCase();
    return type === 'cloud' || type === 'cloud-dsl' || type === 'infra';
  }

  validate(source: string): boolean {
    return source.trim().length > 0 && (source.includes('contains:') || source.includes('->'));
  }

  async parse(source: string, options?: Record<string, any>): Promise<ParserResult> {
    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];
    const nodeMap = new Map<string, DiagramNode>();

    const cleanId = (str: string): string => {
      return str.trim().replace(/[\[\]\{\}\(\):\-]/g, '').trim().toLowerCase().replace(/\s+/g, '_');
    };

    const addNode = (raw: string, type = 'cloud-node', parentId?: string): string => {
      const label = raw.replace(/[\[\]]/g, '').trim();
      const cid = cleanId(label);
      if (!cid) return '';

      if (!nodeMap.has(cid)) {
        nodes.push({
          id: cid,
          label,
          type,
          parentId,
          position: { x: 0, y: 0 },
          data: { description: `Cloud Resource: ${label}` }
        });
        nodeMap.set(cid, nodes[nodes.length - 1]);
      } else if (parentId) {
        // Update parent if discovered in containment block
        const node = nodeMap.get(cid)!;
        node.parentId = parentId;
      }
      return cid;
    };

    const lines = source.split(/\r?\n/);
    let currentContainerId: string | null = null;
    let containerIndent = 0;

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.length === 0) return;

      const indent = line.search(/\S/);

      // Check if container group ends
      if (currentContainerId && indent <= containerIndent) {
        currentContainerId = null;
      }

      // Check for containment start e.g. "[VPC main] contains:"
      const containMatch = trimmed.match(/^\[([^\]]+)\]\s+contains\s*:/);
      if (containMatch) {
        const containerLabel = containMatch[1];
        currentContainerId = addNode(containerLabel, 'container');
        containerIndent = indent;
        return;
      }

      // Parse child items inside containment block
      if (currentContainerId && indent > containerIndent && trimmed.startsWith('[') && trimmed.endsWith(']')) {
        addNode(trimmed, 'cloud-node', currentContainerId);
        return;
      }

      // Parse connection lines e.g. "[Subnet public] -> [Router]"
      if (trimmed.includes('->')) {
        const parts = trimmed.split('->').map(p => p.trim());
        let prevId = '';

        parts.forEach((part) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const nodeId = addNode(part, 'cloud-node', currentContainerId || undefined);
            if (prevId && nodeId) {
              edges.push({
                id: `e-cloud-${idx}-${prevId}-${nodeId}`,
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
        id: 'empty_cloud',
        label: 'Empty Cloud Architecture',
        type: 'container',
        position: { x: 0, y: 0 },
        data: {}
      });
    }

    const diagram = {
      id: `cloud_${Date.now()}`,
      title: 'Cloud Infrastructure Diagram',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '2.0',
        sourceType: 'cloud'
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
