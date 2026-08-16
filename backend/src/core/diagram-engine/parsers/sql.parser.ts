import { Injectable } from '@nestjs/common';
import { AbstractParser, ParserContext } from './abstract.parser';
import { ParserRegistry } from '../registry/parser.registry';
import { Token, TokenType } from './lexer';
import { NodeClassifier } from './node-classifier.service';

@Injectable()
export class SqlParser extends AbstractParser {
  readonly id = 'sql-parser';

  constructor(
    private readonly registry: ParserRegistry,
    nodeClassifier: NodeClassifier
  ) {
    super(nodeClassifier);
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    const type = sourceType.toLowerCase();
    return type === 'sql' || type === 'database';
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

    let currentTable: string | null = null;
    let edgeCounter = 1;

    for (const [lineNum, lineTokens] of linesOfTokens.entries()) {
      const activeText = lineTokens
        .filter(t => t.type !== TokenType.INDENT && t.type !== TokenType.NEWLINE)
        .map(t => t.value)
        .join(' ')
        .trim();

      if (!activeText) {
        context.ignoredLines++;
        continue;
      }

      // Check for table creation start statement
      const createMatch = activeText.match(/create\s+table\s+(\w+)/i);
      if (createMatch) {
        currentTable = createMatch[1].toLowerCase();
        this.createNode(context, currentTable, createMatch[1], 'database', { columns: {} });
        continue;
      }

      if (currentTable) {
        // Check for table end bracket
        if (activeText.startsWith(')') || activeText.includes(');')) {
          currentTable = null;
          continue;
        }

        // Check for standalone foreign key constraint declarations
        const fkMatch = activeText.match(/foreign\s+key\s*\((.*?)\)\s*references\s+(\w+)/i);
        if (fkMatch) {
          const fkCol = fkMatch[1].replace(/[`"'\s]/g, '');
          const targetTable = fkMatch[2].toLowerCase();
          this.createEdge(context, `fk_${edgeCounter++}`, currentTable, targetTable, `FK (${fkCol})`, 'default', true);
          continue;
        }

        // Skip non-column index/constraint declarations
        if (/^(?:constraint|primary\s+key|unique|index|check|key)\b/i.test(activeText)) {
          continue;
        }

        // Check for column and type definition
        const colMatch = activeText.match(/^\s*([a-zA-Z_0-9]+)\s+([a-zA-Z_0-9]+\s*(?:\(\s*[\d,\s]+\s*\))?)/i);
        if (colMatch) {
          const colName = colMatch[1];
          const colType = colMatch[2].replace(/\s+/g, '');
          
          const node = context.nodes.get(currentTable);
          if (node) {
            node.data = node.data || {};
            node.data.columns = node.data.columns || {};
            node.data.columns[colName] = colType;
            
            node.data.properties = node.data.properties || {};
            node.data.properties[colName] = colType;
          }

          // Check for inline references constraint
          const inlineRefMatch = activeText.match(/references\s+(\w+)/i);
          if (inlineRefMatch) {
            const targetTable = inlineRefMatch[1].toLowerCase();
            this.createEdge(context, `fk_${edgeCounter++}`, currentTable, targetTable, `FK (${colName})`, 'default', true);
          }
        }
      } else {
        context.ignoredLines++;
      }
    }
  }
}
