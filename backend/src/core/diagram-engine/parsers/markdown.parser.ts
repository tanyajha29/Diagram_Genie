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
export class MarkdownParser extends AbstractParser {
  readonly id = 'markdown-parser';

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
    return type === 'markdown' || type === 'md';
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

    const headingStack: { id: string; level: number }[] = [];
    const listStack: { id: string; indent: number }[] = [];
    
    let nodeCounter = 1;
    let edgeCounter = 1;

    for (const [lineNum, lineTokens] of linesOfTokens.entries()) {
      // Find indentation size
      const indentToken = lineTokens.find(t => t.type === TokenType.INDENT);
      const indentSize = indentToken ? indentToken.value.length : 0;

      // Filter active tokens
      const activeTokens = lineTokens.filter(t => t.type !== TokenType.INDENT && t.type !== TokenType.NEWLINE);
      if (activeTokens.length === 0) {
        context.ignoredLines++;
        continue;
      }

      const firstToken = activeTokens[0];

      // 1. Check if Heading
      if (firstToken.value === '#') {
        // Count consecutive '#' heading level
        let headingLevel = 0;
        while (headingLevel < activeTokens.length && activeTokens[headingLevel].value === '#') {
          headingLevel++;
        }

        const labelTokens = activeTokens.slice(headingLevel);
        const label = labelTokens.map(t => t.value).join(' ').trim();
        
        if (!label) {
          this.addWarning(context, `Empty heading on line ${lineNum}`);
          continue;
        }

        const headingId = `heading_${nodeCounter++}`;
        this.createNode(context, headingId, label, 'architecture');

        // Link to parent heading in the stack
        while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= headingLevel) {
          headingStack.pop();
        }

        if (headingStack.length > 0) {
          const parentHeading = headingStack[headingStack.length - 1];
          this.createEdge(context, `edge_${edgeCounter++}`, parentHeading.id, headingId, undefined, 'default', false);
        }

        headingStack.push({ id: headingId, level: headingLevel });
        // Clear list stack as we entered a new heading section
        listStack.length = 0;

      } else if (['-','*','+'].includes(firstToken.value) || /^\d+\.?$/.test(firstToken.value)) {
        // 2. It is a List Item
        const labelTokens = activeTokens.slice(1);
        const label = labelTokens.map(t => t.value).join(' ').trim();
        
        if (!label) {
          context.ignoredLines++;
          continue;
        }

        const listId = `list_${nodeCounter++}`;
        this.createNode(context, listId, label, 'architecture');

        // Find parent list item in list stack with smaller indentation size
        while (listStack.length > 0 && listStack[listStack.length - 1].indent >= indentSize) {
          listStack.pop();
        }

        if (listStack.length > 0) {
          const parentList = listStack[listStack.length - 1];
          this.createEdge(context, `edge_${edgeCounter++}`, parentList.id, listId, undefined, 'default', true);
        } else {
          // If no parent list, link to current heading in heading stack
          if (headingStack.length > 0) {
            const currentHeading = headingStack[headingStack.length - 1];
            this.createEdge(context, `edge_${edgeCounter++}`, currentHeading.id, listId, undefined, 'default', true);
          }
        }

        listStack.push({ id: listId, indent: indentSize });
      } else {
        // Non-heading, non-list text line: parse as a simple paragraph node under parent context
        const label = activeTokens.map(t => t.value).join(' ').trim();
        if (label) {
          const textId = `text_${nodeCounter++}`;
          this.createNode(context, textId, label, 'architecture');

          if (listStack.length > 0) {
            const parentList = listStack[listStack.length - 1];
            this.createEdge(context, `edge_${edgeCounter++}`, parentList.id, textId, undefined, 'default', true);
          } else if (headingStack.length > 0) {
            const currentHeading = headingStack[headingStack.length - 1];
            this.createEdge(context, `edge_${edgeCounter++}`, currentHeading.id, textId, undefined, 'default', true);
          }
        }
      }
    }
=======
    return type === 'markdown' || type === 'md' || type === 'readme';
  }

  validate(source: string): boolean {
    return source.length > 0;
  }

  async parse(source: string, options?: Record<string, any>): Promise<Diagram> {
    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];
    const lines = source.split('\n');

    // Rule-based service type catalogs
    const services = {
      frontend: { label: 'Frontend App', keywords: ['react', 'next.js', 'nextjs', 'vue', 'angular', 'svelte', 'frontend', 'client', 'ui', 'dashboard', 'web app'], type: 'frontend' },
      backend: { label: 'Backend API', keywords: ['nestjs', 'nest.js', 'express', 'node.js', 'django', 'flask', 'fastapi', 'spring boot', 'backend', 'api server', 'microservice'], type: 'backend' },
      database: { label: 'Database Service', keywords: ['postgres', 'postgresql', 'mysql', 'mongodb', 'redis', 'prisma', 'sqlite', 'mariadb', 'dynamodb', 'cassandra', 'db'], type: 'database' },
      queue: { label: 'Message Broker', keywords: ['rabbitmq', 'kafka', 'sqs', 'bullmq', 'redis queue', 'activemq', 'message broker', 'queue'], type: 'queue' },
      external: { label: 'External API', keywords: ['stripe', 'sendgrid', 'auth0', 'firebase auth', 'google maps', 'twilio', 'external api', 'paypal', 'sentry'], type: 'external' }
    };

    const detectedNodes = new Map<string, { id: string; label: string; type: string }>();

    // 1. Scan for key architectural keywords in lines
    lines.forEach((line) => {
      const lowerLine = line.toLowerCase();
      
      Object.entries(services).forEach(([key, serviceConfig]) => {
        serviceConfig.keywords.forEach((keyword) => {
          if (lowerLine.includes(keyword)) {
            const nodeId = key;
            if (!detectedNodes.has(nodeId)) {
              detectedNodes.set(nodeId, {
                id: nodeId,
                label: serviceConfig.label,
                type: serviceConfig.type
              });
            }
          }
        });
      });
    });

    // 2. Scan for list item definitions (e.g. "- **PostgreSQL**: stores user data")
    lines.forEach((line) => {
      const match = line.match(/^[-*+]\s+\*\*(.*?)\*\*:\s*(.*)/);
      if (match) {
        const name = match[1].trim();
        const nameLower = name.toLowerCase();

        let type = 'service';
        if (nameLower.includes('db') || nameLower.includes('postgres') || nameLower.includes('redis') || nameLower.includes('sql') || nameLower.includes('mongo')) {
          type = 'database';
        } else if (nameLower.includes('api') || nameLower.includes('server') || nameLower.includes('service') || nameLower.includes('backend')) {
          type = 'backend';
        } else if (nameLower.includes('ui') || nameLower.includes('client') || nameLower.includes('app') || nameLower.includes('frontend')) {
          type = 'frontend';
        } else if (nameLower.includes('queue') || nameLower.includes('kafka') || nameLower.includes('rabbit')) {
          type = 'queue';
        }

        const nodeId = nameLower.replace(/\s+/g, '_');
        detectedNodes.set(nodeId, {
          id: nodeId,
          label: name,
          type: type
        });
      }
    });

    // Fallback: If no architectural components detected, fallback to header structure maps
    if (detectedNodes.size === 0) {
      return this.parseMarkdownAsTree(lines);
    }

    // Create UDM Node models without coordinates
    detectedNodes.forEach((node, id) => {
      nodes.push({
        id,
        type: node.type,
        label: node.label,
        position: { x: 0, y: 0 },
        style: this.getNodeStyleForType(node.type)
      });
    });

    // 3. Scan sentences/lines for relationship keywords/arrows to draw edges
    lines.forEach((line) => {
      const lowerLine = line.toLowerCase();

      const connectionKeywords = [
        { terms: ['connect', 'talk', 'call', 'query', 'request', 'send', 'write', 'read', 'use'], label: 'uses' },
        { terms: ['->', '-->', '=>'], label: 'connects' }
      ];

      detectedNodes.forEach((nodeA, idA) => {
        detectedNodes.forEach((nodeB, idB) => {
          if (idA === idB) return;

          const mentionsA = lowerLine.includes(nodeA.label.toLowerCase()) || lowerLine.includes(idA);
          const mentionsB = lowerLine.includes(nodeB.label.toLowerCase()) || lowerLine.includes(idB);

          if (mentionsA && mentionsB) {
            let actionLabel = 'connects';
            connectionKeywords.forEach((rule) => {
              rule.terms.forEach((term) => {
                if (lowerLine.includes(term)) {
                  actionLabel = rule.label;
                }
              });
            });

            const exists = edges.some(e => e.source === idA && e.target === idB);
            if (!exists) {
              edges.push({
                id: `edge_${idA}_${idB}`,
                source: idA,
                target: idB,
                label: actionLabel,
                animated: true
              });
            }
          }
        });
      });
    });

    // Fallback links if no edges were found
    if (edges.length === 0) {
      const hasFrontend = detectedNodes.has('frontend');
      const hasBackend = detectedNodes.has('backend');
      const hasDatabase = detectedNodes.has('database');
      const hasQueue = detectedNodes.has('queue');

      if (hasFrontend && hasBackend) {
        edges.push({ id: 'edge_fe_be', source: 'frontend', target: 'backend', label: 'API Request', animated: true });
      }
      if (hasBackend && hasDatabase) {
        edges.push({ id: 'edge_be_db', source: 'backend', target: 'database', label: 'Queries', animated: false });
      }
      if (hasBackend && hasQueue) {
        edges.push({ id: 'edge_be_q', source: 'backend', target: 'queue', label: 'Publishes', animated: true });
      }
    }

    return {
      id: `readme_${Date.now()}`,
      title: 'Extracted Architecture Diagram',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '1.0',
        sourceType: 'readme'
      }
    };
>>>>>>> fdce0a732d6c96fc85c15858dec625355568c3ce
  }

  private parseMarkdownAsTree(lines: string[]): Diagram {
    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];
    let lastHeaderId: string | null = null;
    let index = 0;

    lines.forEach((line) => {
      const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();
        const nodeId = `hdr_${index++}`;

        nodes.push({
          id: nodeId,
          type: level === 1 ? 'root' : 'header',
          label: title,
          position: { x: 0, y: 0 }
        });

        if (lastHeaderId) {
          edges.push({
            id: `edge_${lastHeaderId}_${nodeId}`,
            source: lastHeaderId,
            target: nodeId
          });
        }
        lastHeaderId = nodeId;
      }
    });

    return {
      id: `md_tree_${Date.now()}`,
      title: 'Markdown Header Structure',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '1.0',
        sourceType: 'markdown'
      }
    };
  }

  private getNodeStyleForType(type: string) {
    const styles: Record<string, any> = {
      frontend: { backgroundColor: '#0f172a', borderColor: '#3b82f6', textColor: '#3b82f6', borderWidth: 2 },
      backend: { backgroundColor: '#0f172a', borderColor: '#10b981', textColor: '#10b981', borderWidth: 2 },
      database: { backgroundColor: '#0f172a', borderColor: '#f59e0b', textColor: '#f59e0b', borderWidth: 2 },
      queue: { backgroundColor: '#0f172a', borderColor: '#8b5cf6', textColor: '#8b5cf6', borderWidth: 2 },
      external: { backgroundColor: '#0f172a', borderColor: '#ec4899', textColor: '#ec4899', borderWidth: 2 }
    };
    return styles[type] || { backgroundColor: '#0f172a', borderColor: '#94a3b8', textColor: '#94a3b8', borderWidth: 1 };
  }
}
