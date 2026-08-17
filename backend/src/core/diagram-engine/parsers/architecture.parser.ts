import { Injectable } from '@nestjs/common';
import { AbstractParser, ParserContext } from './abstract.parser';
import { ParserRegistry } from '../registry/parser.registry';
import { Token, TokenType } from './lexer';
import { NodeClassifier } from './node-classifier.service';
import { ParserResult } from './parser-result.interface';

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
    return type === 'architecture' || type === 'system' || type === 'flow' || type === 'plain_text' || type === 'plain-text' || type === 'uml' || type === 'class';
  }

  validate(source: string): boolean {
    // Valid if source has arrows or simple content
    return !!source && source.trim().length > 0;
  }

  override async parse(source: string, options?: Record<string, any>): Promise<ParserResult> {
    const isUml = (options?.sourceType === 'uml' || options?.sourceType === 'class' || 
                   source.toLowerCase().includes('class ') || source.toLowerCase().includes('interface '));
    if (isUml) {
      return this.parseUmlClass(source, options);
    }
    return super.parse(source, options);
  }

  private async parseUmlClass(source: string, options?: Record<string, any>): Promise<ParserResult> {
    const startTime = Date.now();
    const context: ParserContext = {
      nodes: new Map(),
      edges: new Map(),
      warnings: [],
      linesParsed: source.split('\n').length,
      nodesCreated: 0,
      edgesCreated: 0,
      ignoredLines: 0
    };

    const cleanId = (str: string): string => {
      return str.trim().replace(/[\[\]\{\}\(\):\-]/g, '').trim().toLowerCase().replace(/\s+/g, '_');
    };

    const lines = source.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    let currentClass: { id: string; name: string; type: string; attributes: string[]; methods: string[] } | null = null;
    let edgeCounter = 1;

    lines.forEach((line) => {
      const classMatch = line.match(/^(class|interface|abstract\s+class)\s+([a-zA-Z0-9_]+)/i);
      if (classMatch) {
        const type = classMatch[1].toLowerCase().includes('interface') ? 'interface' : 'class';
        const name = classMatch[2];
        const id = cleanId(name);
        currentClass = { id, name, type, attributes: [], methods: [] };

        const extendsMatch = line.match(/(extends|implements)\s+([a-zA-Z0-9_]+)/i);
        if (extendsMatch) {
          const parentName = extendsMatch[2];
          const parentId = cleanId(parentName);
          if (!context.nodes.has(parentId)) {
            context.nodes.set(parentId, {
              id: parentId,
              label: parentName,
              type: 'class',
              position: { x: 0, y: 0 },
              data: { attributes: [], methods: [] }
            });
          }
          const edgeId = `edge_${edgeCounter++}`;
          this.createEdge(context, edgeId, id, parentId, undefined, 'inheritance', false);
        }
        return;
      }

      if (line.includes('}') && currentClass) {
        context.nodes.set(currentClass.id, {
          id: currentClass.id,
          label: currentClass.name,
          type: currentClass.type,
          position: { x: 0, y: 0 },
          data: {
            attributes: currentClass.attributes,
            methods: currentClass.methods
          }
        });
        currentClass = null;
        return;
      }

      if (currentClass) {
        if (line.includes('(')) {
          currentClass.methods.push(line);
        } else if (line !== '{') {
          currentClass.attributes.push(line);
        }
        return;
      }

      if (line.includes('->') || line.includes('<|--') || line.includes('--|>') || line.includes('-->') || line.includes('--')) {
        const isInheritance = line.includes('<|--') || line.includes('--|>');
        const delimiter = line.includes('<|--') ? '<|--' : 
                          (line.includes('--|>') ? '--|>' : 
                          (line.includes('-->') ? '-->' : 
                          (line.includes('->') ? '->' : '--')));
        const parts = line.split(delimiter);
        if (parts.length === 2) {
          const leftName = parts[0].trim();
          const rightName = parts[1].trim();
          const leftId = cleanId(leftName);
          const rightId = cleanId(rightName);

          if (leftId && rightId) {
            if (!context.nodes.has(leftId)) {
              context.nodes.set(leftId, {
                id: leftId,
                label: leftName,
                type: 'class',
                position: { x: 0, y: 0 },
                data: { attributes: [], methods: [] }
              });
            }
            if (!context.nodes.has(rightId)) {
              context.nodes.set(rightId, {
                id: rightId,
                label: rightName,
                type: 'class',
                position: { x: 0, y: 0 },
                data: { attributes: [], methods: [] }
              });
            }

            const edgeId = `edge_${edgeCounter++}`;
            this.createEdge(context, edgeId, leftId, rightId, undefined, isInheritance ? 'inheritance' : 'association', false);
          }
        }
      }
    });

    const duration = Date.now() - startTime;
    const diagram = this.buildDiagram(context, options);

    return {
      diagram,
      warnings: context.warnings,
      statistics: {
        linesParsed: context.linesParsed,
        nodesCreated: context.nodes.size,
        edgesCreated: context.edges.size,
        ignoredLines: context.ignoredLines,
        parseDurationMs: duration
      }
    };
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
