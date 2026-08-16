import { IParser } from '../interfaces/parser.interface';
import { Diagram } from '../interfaces/diagram.interface';
import { DiagramNode } from '../interfaces/node.interface';
import { DiagramEdge } from '../interfaces/edge.interface';
import { ParserResult } from './parser-result.interface';
import { Token, Lexer } from './lexer';
import { NodeClassifier } from './node-classifier.service';

export interface ParserContext {
  nodes: Map<string, DiagramNode>;
  edges: Map<string, DiagramEdge>;
  warnings: string[];
  linesParsed: number;
  nodesCreated: number;
  edgesCreated: number;
  ignoredLines: number;
}

/**
 * Base AbstractParser class providing token management, validation wraps,
 * and node/edge deduplication operations.
 */
export abstract class AbstractParser implements IParser {
  abstract readonly id: string;

  constructor(
    protected readonly nodeClassifier: NodeClassifier
  ) {}

  abstract supports(sourceType: string): boolean;
  
  /**
   * Basic validation ensuring source has content.
   * Concrete parsers can override to check syntax viability.
   */
  validate(source: string): boolean {
    return !!source && source.trim().length > 0;
  }

  /**
   * Parsers override this to consume the Lexer token stream.
   */
  protected abstract parseTokens(
    tokens: Token[], 
    context: ParserContext, 
    options?: Record<string, any>
  ): Promise<void>;

  async parse(source: string, options?: Record<string, any>): Promise<ParserResult> {
    const startTime = Date.now();
    const normalized = this.normalizeInput(source);
    
    // Tokenize text into lexical stream
    const tokens = Lexer.tokenize(normalized);
    const linesParsed = source.split('\n').length;

    const context: ParserContext = {
      nodes: new Map(),
      edges: new Map(),
      warnings: [],
      linesParsed,
      nodesCreated: 0,
      edgesCreated: 0,
      ignoredLines: 0
    };

    try {
      await this.parseTokens(tokens, context, options);
    } catch (err: any) {
      context.warnings.push(`Parsing failure: ${err.message}`);
    }

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

  protected normalizeInput(source: string): string {
    return source.replace(/\r\n/g, '\n');
  }

  /**
   * Helper utility creating a unique DiagramNode with classified layout attributes.
   */
  protected createNode(
    context: ParserContext, 
    id: string, 
    label: string, 
    type?: string, 
    data?: Record<string, any>
  ): void {
    const key = id.trim().toLowerCase();
    if (!key) return;

    if (!context.nodes.has(key)) {
      const resolvedType = type || this.nodeClassifier.classify(label);
      context.nodes.set(key, {
        id: key,
        label: label.trim(),
        type: resolvedType,
        position: { x: 0, y: 0 }, // Parser generates Pure UDM without coordinates
        data: data || {}
      });
      context.nodesCreated++;
    } else if (data) {
      // Merge properties if node already created by a connection edge
      const existing = context.nodes.get(key)!;
      existing.data = { ...existing.data, ...data };
    }
  }

  /**
   * Helper utility creating a deduplicated DiagramEdge.
   */
  protected createEdge(
    context: ParserContext, 
    id: string, 
    source: string, 
    target: string, 
    label?: string, 
    type?: string, 
    animated?: boolean
  ): void {
    const sKey = source.trim().toLowerCase();
    const tKey = target.trim().toLowerCase();
    
    if (!sKey || !tKey) return;
    
    const edgeKey = `${sKey}->${tKey}`;
    if (!context.edges.has(edgeKey)) {
      context.edges.set(edgeKey, {
        id,
        source: sKey,
        target: tKey,
        label: label ? label.trim() : undefined,
        type: type || 'default',
        animated: animated !== undefined ? animated : true
      });
      context.edgesCreated++;
    }
  }

  protected addWarning(context: ParserContext, warning: string): void {
    context.warnings.push(warning);
  }

  protected buildDiagram(context: ParserContext, options?: Record<string, any>): Diagram {
    const nodes = Array.from(context.nodes.values());
    const edges = Array.from(context.edges.values());

    // Provide default node workspace if UDM parses completely empty
    if (nodes.length === 0) {
      nodes.push({
        id: 'empty_workspace',
        label: 'Workspace Nodes List',
        type: 'default',
        position: { x: 0, y: 0 },
        data: { description: 'Provide elements declarations to render.' }
      });
    }

    return {
      id: `${this.id}_${Date.now()}`,
      title: options?.title || 'System Diagram',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '1.0',
        sourceType: this.id,
      }
    };
  }
}
