import { Injectable } from '@nestjs/common';
import { AbstractParser, ParserContext } from './abstract.parser';
import { ParserRegistry } from '../registry/parser.registry';
import { Token, TokenType } from './lexer';
import { NodeClassifier } from './node-classifier.service';

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
  }
}
