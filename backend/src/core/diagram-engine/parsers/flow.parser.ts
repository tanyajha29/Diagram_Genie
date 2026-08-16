import { Injectable } from '@nestjs/common';
import { AbstractParser, ParserContext } from './abstract.parser';
import { ParserRegistry } from '../registry/parser.registry';
import { Token, TokenType } from './lexer';
import { NodeClassifier } from './node-classifier.service';

@Injectable()
export class FlowParser extends AbstractParser {
  readonly id = 'flow-parser';

  constructor(
    private readonly registry: ParserRegistry,
    nodeClassifier: NodeClassifier
  ) {
    super(nodeClassifier);
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    const type = sourceType.toLowerCase();
    return type === 'flow' || type === 'flowchart';
  }

  protected async parseTokens(
    tokens: Token[], 
    context: ParserContext, 
    options?: Record<string, any>
  ): Promise<void> {
    // Group tokens by line
    const linesOfTokens = new Map<number, Token[]>();
    for (const token of tokens) {
      if (!linesOfTokens.has(token.line)) {
        linesOfTokens.set(token.line, []);
      }
      linesOfTokens.get(token.line)!.push(token);
    }

    let edgeCounter = 1;
    let nodeCounter = 1;
    
    // Track sequential step nodes to link them automatically
    const sequentialNodes: string[] = [];

    for (const [lineNum, lineTokens] of linesOfTokens.entries()) {
      const activeTokens = lineTokens.filter(t => t.type !== TokenType.INDENT && t.type !== TokenType.NEWLINE);
      if (activeTokens.length === 0) {
        context.ignoredLines++;
        continue;
      }

      // Check if line contains arrows
      const arrowIndices: number[] = [];
      activeTokens.forEach((t, idx) => {
        if (t.type === TokenType.ARROW) {
          arrowIndices.push(idx);
        }
      });

      if (arrowIndices.length > 0) {
        // Linear flowchart syntax (e.g. Start -> Process -> Decision {Is valid?} -> End)
        const segments: string[] = [];
        let startIdx = 0;
        
        activeTokens.forEach((t, idx) => {
          if (t.type === TokenType.ARROW) {
            const segStr = activeTokens.slice(startIdx, idx).map(token => token.value).join(' ');
            segments.push(segStr);
            startIdx = idx + 1;
          }
        });
        const finalSeg = activeTokens.slice(startIdx).map(token => token.value).join(' ');
        segments.push(finalSeg);

        const cleanSegments = segments.map(s => s.trim()).filter(s => s.length > 0);
        if (cleanSegments.length < 2) {
          this.addWarning(context, `Malformed flowchart flow line ${lineNum}`);
          continue;
        }

        const resolvedIds: string[] = [];

        cleanSegments.forEach(seg => {
          let label = seg;
          let nodeType = 'architecture';

          // Check if decision node wrapped in curly braces
          if (label.startsWith('{') && label.endsWith('}')) {
            label = label.slice(1, -1).trim();
            nodeType = 'decision';
          }

          const id = label.replace(/[\[\]\{\}\(\):\-]/g, '').trim().toLowerCase().replace(/\s+/g, '_');
          this.createNode(context, id, label, nodeType);
          resolvedIds.push(id);
        });

        // Link segments
        for (let i = 0; i < resolvedIds.length - 1; i++) {
          this.createEdge(context, `flow_edge_${edgeCounter++}`, resolvedIds[i], resolvedIds[i + 1]);
        }
      } else {
        // Check for numbered flow steps (e.g. "1. Start", "2. Do processing")
        const firstToken = activeTokens[0];
        let stepText = '';

        if (/^\d+\.?$/.test(firstToken.value) && activeTokens.length > 1) {
          stepText = activeTokens.slice(1).map(t => t.value).join(' ').trim();
        } else if (['-','*','+'].includes(firstToken.value) && activeTokens.length > 1) {
          stepText = activeTokens.slice(1).map(t => t.value).join(' ').trim();
        } else {
          stepText = activeTokens.map(t => t.value).join(' ').trim();
        }

        if (stepText) {
          let label = stepText;
          let nodeType = 'architecture';

          if (label.startsWith('{') && label.endsWith('}')) {
            label = label.slice(1, -1).trim();
            nodeType = 'decision';
          }

          const id = `flow_step_${nodeCounter++}`;
          this.createNode(context, id, label, nodeType);
          
          // Automatically link sequentially
          if (sequentialNodes.length > 0) {
            const prevId = sequentialNodes[sequentialNodes.length - 1];
            this.createEdge(context, `flow_edge_${edgeCounter++}`, prevId, id);
          }
          sequentialNodes.push(id);
        }
      }
    }
  }
}
