import { Injectable } from '@nestjs/common';
import { AbstractParser, ParserContext } from './abstract.parser';
import { ParserRegistry } from '../registry/parser.registry';
import { Token, TokenType } from './lexer';
import { NodeClassifier } from './node-classifier.service';

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
  }
}
