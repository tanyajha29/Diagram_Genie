import { Injectable } from '@nestjs/common';
import { AbstractParser, ParserContext } from './abstract.parser';
import { ParserRegistry } from '../registry/parser.registry';
<<<<<<< HEAD
import { Token, TokenType } from './lexer';
import { NodeClassifier } from './node-classifier.service';
=======
import { Diagram, DiagramNode, DiagramEdge } from '../interfaces';
>>>>>>> fdce0a732d6c96fc85c15858dec625355568c3ce

@Injectable()
export class ArchitectureParser extends AbstractParser {
  readonly id = 'architecture-parser';

  constructor(
    private readonly registry: ParserRegistry,
    nodeClassifier: NodeClassifier
  ) {
    super(nodeClassifier);
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    const type = sourceType.toLowerCase();
<<<<<<< HEAD
    return type === 'architecture' || type === 'system' || type === 'plain_text';
  }

  validate(source: string): boolean {
    // Valid if source has arrows or simple content
    return !!source && source.trim().length > 0;
  }

  protected async parseTokens(
    tokens: Token[], 
    context: ParserContext, 
    options?: Record<string, any>
  ): Promise<void> {
    // 1. Group tokens by line
    const linesOfTokens = new Map<number, Token[]>();
    for (const token of tokens) {
      if (!linesOfTokens.has(token.line)) {
        linesOfTokens.set(token.line, []);
      }
      linesOfTokens.get(token.line)!.push(token);
    }

    let edgeCounter = 1;

    for (const [lineNum, lineTokens] of linesOfTokens.entries()) {
      const activeTokens = lineTokens.filter(t => t.type !== TokenType.INDENT && t.type !== TokenType.NEWLINE);
      if (activeTokens.length === 0) {
        context.ignoredLines++;
        continue;
      }

      // Check if line contains any arrow
      const arrowIndices: number[] = [];
      let colonIndex = -1;

      activeTokens.forEach((t, idx) => {
        if (t.type === TokenType.ARROW) {
          arrowIndices.push(idx);
        } else if (t.value === ':' && colonIndex === -1) {
          colonIndex = idx;
        }
      });

      if (arrowIndices.length > 0) {
        // Line has connections
        // 1. Extract label if colon exists (only if colon is after the last arrow)
        let edgeLabel = '';
        let connectionTokens = activeTokens;
        
        const lastArrowIdx = arrowIndices[arrowIndices.length - 1];
        if (colonIndex > lastArrowIdx) {
          edgeLabel = activeTokens.slice(colonIndex + 1).map(t => t.value).join(' ');
          connectionTokens = activeTokens.slice(0, colonIndex);
        }

        // 2. Segment by arrow operators
        const segments: string[] = [];
        let startIdx = 0;
        
        connectionTokens.forEach((t, idx) => {
          if (t.type === TokenType.ARROW) {
            const segStr = connectionTokens.slice(startIdx, idx).map(token => token.value).join(' ');
            segments.push(segStr);
            startIdx = idx + 1;
          }
        });
        // Push final segment
        const finalSeg = connectionTokens.slice(startIdx).map(token => token.value).join(' ');
        segments.push(finalSeg);

        // 3. Clean segments and construct nodes/edges
        const cleanSegments = segments.map(s => this.cleanNodeString(s)).filter(s => s.length > 0);
        
        if (cleanSegments.length < 2) {
          this.addWarning(context, `Malformed connection syntax on line ${lineNum}: ${activeTokens.map(t => t.value).join(' ')}`);
          continue;
        }

        // Create nodes
        cleanSegments.forEach(seg => {
          const id = this.generateId(seg);
          this.createNode(context, id, seg);
        });

        // Create edges
        for (let i = 0; i < cleanSegments.length - 1; i++) {
          const sourceId = this.generateId(cleanSegments[i]);
          const targetId = this.generateId(cleanSegments[i + 1]);
          const edgeId = `edge_${edgeCounter++}`;
          this.createEdge(context, edgeId, sourceId, targetId, edgeLabel || undefined);
        }
      } else {
        // Line does not have connections. Treat as node properties declaration (e.g. "A : label" or "A")
        if (colonIndex > 0) {
          const nodePart = activeTokens.slice(0, colonIndex).map(t => t.value).join(' ');
          const labelPart = activeTokens.slice(colonIndex + 1).map(t => t.value).join(' ');
          
          const cleanName = this.cleanNodeString(nodePart);
          if (cleanName) {
            const id = this.generateId(cleanName);
            this.createNode(context, id, cleanName, undefined, { description: labelPart });
          }
        } else {
          // Simple single node line
          const nodeStr = activeTokens.map(t => t.value).join(' ');
          const cleanName = this.cleanNodeString(nodeStr);
          if (cleanName) {
            const id = this.generateId(cleanName);
            this.createNode(context, id, cleanName);
          }
        }
      }
    }
  }

  private cleanNodeString(str: string): string {
    let clean = str.trim();
    if (clean.startsWith('[') && clean.endsWith(']')) {
      clean = clean.slice(1, -1).trim();
    }
    return clean;
  }

  private generateId(str: string): string {
    return str.replace(/[\[\]\{\}\(\):\-]/g, '').trim().toLowerCase().replace(/\s+/g, '_');
=======
    return type === 'architecture' || type === 'system' || type === 'flow' || type === 'plain-text';
  }

  validate(source: string): boolean {
    return source.trim().length > 0;
  }

  async parse(source: string, options?: Record<string, any>): Promise<Diagram> {
    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];

    // Clean inputs and standardize flow arrow shapes to a common delimiter
    const delimiter = '||FLOW_DELIM||';
    const normalizedSource = source
      .replace(/[\n\r]+/g, '\n')
      .replace(/(?:\r?\n)?(?:↓|->|-->|=>|➔|▼)(?:\r?\n)?/g, delimiter)
      .trim();

    // Split tokens by connector delimiters
    const tokens = normalizedSource
      .split(delimiter)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const nodeMap = new Map<string, string>(); // maps normalized ID to original label string

    tokens.forEach((token) => {
      const nodeId = token.toLowerCase().replace(/[^a-z0-9]/g, '_');
      if (!nodeMap.has(nodeId)) {
        nodeMap.set(nodeId, token);
      }
    });

    // Construct UDM Nodes list (without coordinates)
    nodeMap.forEach((label, id) => {
      nodes.push({
        id,
        type: this.determineNodeType(label),
        label,
        position: { x: 0, y: 0 },
        style: this.getNodeStyleForLabel(label)
      });
    });

    // Construct UDM sequential flow Edges list
    for (let i = 0; i < tokens.length - 1; i++) {
      const sourceId = tokens[i].toLowerCase().replace(/[^a-z0-9]/g, '_');
      const targetId = tokens[i + 1].toLowerCase().replace(/[^a-z0-9]/g, '_');

      edges.push({
        id: `flow_edge_${sourceId}_${targetId}_${i}`,
        source: sourceId,
        target: targetId,
        animated: true,
        style: {
          strokeColor: '#3b82f6',
          strokeWidth: 2
        }
      });
    }

    return {
      id: `flow_${Date.now()}`,
      title: 'Plain Text Flow Diagram',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '1.0',
        sourceType: 'flow'
      }
    };
>>>>>>> fdce0a732d6c96fc85c15858dec625355568c3ce
  }

  private determineNodeType(label: string): string {
    const l = label.toLowerCase();
    if (l === 'start' || l === 'end') return 'terminal';
    if (l.includes('decision') || l.includes('?') || l === 'check') return 'decision';
    return 'process';
  }

  private getNodeStyleForLabel(label: string) {
    const type = this.determineNodeType(label);
    const styles: Record<string, any> = {
      terminal: { backgroundColor: '#0f172a', borderColor: '#10b981', textColor: '#10b981', borderRadius: 20, borderWidth: 2 },
      decision: { backgroundColor: '#0f172a', borderColor: '#f59e0b', textColor: '#f59e0b', borderWidth: 2 },
      process: { backgroundColor: '#0f172a', borderColor: '#3b82f6', textColor: '#f8fafc', borderWidth: 2 }
    };
    return styles[type] || { backgroundColor: '#0f172a', borderColor: '#94a3b8', textColor: '#f8fafc', borderWidth: 1 };
  }
}
