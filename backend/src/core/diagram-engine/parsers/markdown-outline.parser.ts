import { Injectable } from '@nestjs/common';
import { IParser } from '../interfaces/parser.interface';
import { ParserRegistry } from '../registry/parser.registry';
import { Diagram, DiagramNode, DiagramEdge } from '../interfaces';
import { ParserResult } from './parser-result.interface';

@Injectable()
export class MarkdownOutlineParser implements IParser {
  readonly id = 'markdown-outline-parser';

  constructor(private readonly registry: ParserRegistry) {
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    const type = sourceType.toLowerCase();
    return type === 'markdown-outline' || type === 'mindmap' || type === 'markdown' || type === 'md';
  }

  validate(source: string): boolean {
    return source.trim().length > 0;
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
          type: 'mindmap-node',
          position: { x: 0, y: 0 },
          data: {}
        };
        nodes.push(node);
        nodeMap.set(cid, node);
      }
    };

    const lines = source.split(/\r?\n/).map(l => l.trimEnd()).filter(l => l.trim().length > 0);
    const indentStack: { id: string; level: number }[] = [];

    lines.forEach((line) => {
      // Look for standard bullet item: "- Content", "* Content", "+ Content"
      const match = line.match(/^(\s*)([-*+])\s*(.*)$/);
      if (match) {
        const indent = match[1].length;
        const content = match[3].trim();
        const nodeId = cleanId(content);
        
        addNode(nodeId, content);

        while (indentStack.length > 0 && indentStack[indentStack.length - 1].level >= indent) {
          indentStack.pop();
        }

        if (indentStack.length > 0) {
          const parent = indentStack[indentStack.length - 1];
          const edgeId = `e-${parent.id}-${nodeId}`;
          edges.push({
            id: edgeId,
            source: parent.id,
            target: nodeId,
            animated: false
          });
        }

        indentStack.push({ id: nodeId, level: indent });
      } else {
        // Also support Markdown headers as root / fallback nodes
        const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const content = headerMatch[2].trim();
          const nodeId = cleanId(content);

          addNode(nodeId, content);

          while (indentStack.length > 0 && indentStack[indentStack.length - 1].level >= level) {
            indentStack.pop();
          }

          if (indentStack.length > 0) {
            const parent = indentStack[indentStack.length - 1];
            const edgeId = `e-${parent.id}-${nodeId}`;
            edges.push({
              id: edgeId,
              source: parent.id,
              target: nodeId,
              animated: false
            });
          }

          indentStack.push({ id: nodeId, level: level });
        }
      }
    });

    // Default node if empty
    if (nodes.length === 0) {
      nodes.push({
        id: 'n1',
        label: 'Empty Outline Workspace',
        type: 'mindmap-node',
        position: { x: 0, y: 0 },
        data: {}
      });
    }

    const diagram = {
      id: `mindmap_${Date.now()}`,
      title: 'Markdown Outline Diagram',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '2.0',
        sourceType: 'mindmap'
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
