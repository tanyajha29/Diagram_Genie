import { Injectable } from '@nestjs/common';
import { AbstractParser, ParserContext } from './abstract.parser';
import { ParserRegistry } from '../registry/parser.registry';
<<<<<<< HEAD
import { Token, TokenType } from './lexer';
import { NodeClassifier } from './node-classifier.service';
=======
import { Diagram, DiagramNode, DiagramEdge } from '../interfaces';

interface ColumnInfo {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}
>>>>>>> fdce0a732d6c96fc85c15858dec625355568c3ce

@Injectable()
export class SqlParser extends AbstractParser {
  readonly id = 'sql-parser';

<<<<<<< HEAD
  constructor(
    private readonly registry: ParserRegistry,
    nodeClassifier: NodeClassifier
  ) {
    super(nodeClassifier);
=======
  constructor(private readonly registry: ParserRegistry) {
>>>>>>> fdce0a732d6c96fc85c15858dec625355568c3ce
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    const type = sourceType.toLowerCase();
<<<<<<< HEAD
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
=======
    return type === 'sql' || type === 'database' || type === 'er';
  }

  validate(source: string): boolean {
    const lower = source.toLowerCase();
    return lower.includes('table') || lower.includes('create');
  }

  async parse(source: string, options?: Record<string, any>): Promise<Diagram> {
    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];

    // Remove SQL comment headers
    const cleanSql = source
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();

    // Regular expression matching CREATE TABLE blocks
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_\`"]+)\s*\(([\s\S]*?)\)(?:\s*;|\s*$|\s*ENGINE|\s*WITH)/gi;
    let match;

    const tableColumnsMap = new Map<string, ColumnInfo[]>();
    const tableForeignKeys: { fromTable: string; fromCol: string; toTable: string; toCol: string }[] = [];

    while ((match = createTableRegex.exec(cleanSql)) !== null) {
      const rawTableName = match[1];
      const tableName = rawTableName.replace(/[\`\"\[\]]/g, '').trim();
      const body = match[2];

      const columns: ColumnInfo[] = [];
      const primaryKeys = new Set<string>();

      // Split lines by comma ignoring internal decimals/key parentheses bounds
      const defs = this.splitSqlDefinitions(body);

      defs.forEach((def) => {
        const trimmedDef = def.trim();
        const upperDef = trimmedDef.toUpperCase();

        if (upperDef.startsWith('CONSTRAINT') || upperDef.startsWith('PRIMARY KEY') || upperDef.startsWith('FOREIGN KEY')) {
          if (upperDef.includes('PRIMARY KEY')) {
            const pkMatch = trimmedDef.match(/PRIMARY\s+KEY\s*\((.*?)\)/i);
            if (pkMatch) {
              pkMatch[1].split(',').forEach(col => primaryKeys.add(col.replace(/[\`\"\[\]\s]/g, '')));
            }
          } else if (upperDef.includes('FOREIGN KEY')) {
            const fkMatch = trimmedDef.match(/FOREIGN\s+KEY\s*\((.*?)\)\s*REFERENCES\s*([a-zA-Z0-9_\`"]+)\s*\((.*?)\)/i);
            if (fkMatch) {
              const fromCol = fkMatch[1].replace(/[\`\"\[\]\s]/g, '');
              const toTable = fkMatch[2].replace(/[\`\"\[\]]/g, '');
              const toCol = fkMatch[3].replace(/[\`\"\[\]\s]/g, '');
              tableForeignKeys.push({ fromTable: tableName, fromCol, toTable, toCol });
            }
          }
        } else {
          // Column level definition
          const tokens = trimmedDef.split(/\s+/);
          if (tokens.length >= 2) {
            const colName = tokens[0].replace(/[\`\"\[\]]/g, '');
            const colType = tokens[1];

            const isPk = upperDef.includes('PRIMARY KEY');
            if (isPk) {
              primaryKeys.add(colName);
            }

            let isFk = false;
            const inlineFkMatch = trimmedDef.match(/REFERENCES\s+([a-zA-Z0-9_\`"]+)\s*\((.*?)\)/i);
            if (inlineFkMatch) {
              const toTable = inlineFkMatch[1].replace(/[\`\"\[\]]/g, '');
              const toCol = inlineFkMatch[2].replace(/[\`\"\[\]\s]/g, '');
              tableForeignKeys.push({ fromTable: tableName, fromCol: colName, toTable, toCol });
              isFk = true;
            }

            columns.push({
              name: colName,
              type: colType,
              isPrimaryKey: false,
              isForeignKey: isFk
            });
          }
        }
      });

      columns.forEach((col) => {
        if (primaryKeys.has(col.name)) {
          col.isPrimaryKey = true;
        }
      });

      tableColumnsMap.set(tableName, columns);
    }

    // Parse external ALTER TABLE foreign key references
    const alterFkRegex = /ALTER\s+TABLE\s+([a-zA-Z0-9_\`"]+)\s+ADD\s+(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(([a-zA-Z0-9_\`"]+)\)\s*REFERENCES\s*([a-zA-Z0-9_\`"]+)\s*\(([a-zA-Z0-9_\`"]+)\)/gi;
    let alterMatch;
    while ((alterMatch = alterFkRegex.exec(cleanSql)) !== null) {
      const fromTable = alterMatch[1].replace(/[\`\"\[\]]/g, '').trim();
      const fromCol = alterMatch[2].replace(/[\`\"\[\]]/g, '').trim();
      const toTable = alterMatch[3].replace(/[\`\"\[\]]/g, '').trim();
      const toCol = alterMatch[4].replace(/[\`\"\[\]]/g, '').trim();

      tableForeignKeys.push({ fromTable, fromCol, toTable, toCol });

      const cols = tableColumnsMap.get(fromTable);
      if (cols) {
        const col = cols.find(c => c.name === fromCol);
        if (col) col.isForeignKey = true;
      }
    }

    // Build UDM Node representations (without coordinates)
    tableColumnsMap.forEach((cols, tableName) => {
      nodes.push({
        id: tableName,
        type: 'database-table',
        label: tableName,
        position: { x: 0, y: 0 },
        data: {
          columns: cols
        },
        style: {
          backgroundColor: '#0f172a',
          borderColor: '#f59e0b',
          textColor: '#f8fafc',
          borderWidth: 2
        }
      });
    });

    // Build UDM Edge relationships
    tableForeignKeys.forEach((fk, index) => {
      const edgeId = `fk_${fk.fromTable}_${fk.toTable}_${index}`;
      edges.push({
        id: edgeId,
        source: fk.fromTable,
        target: fk.toTable,
        label: `${fk.fromCol} -> ${fk.toCol}`,
        type: 'default',
        animated: false
      });
    });

    return {
      id: `sql_er_${Date.now()}`,
      title: 'Database ER Diagram',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '1.0',
        sourceType: 'sql'
      }
    };
>>>>>>> fdce0a732d6c96fc85c15858dec625355568c3ce
  }

  private splitSqlDefinitions(body: string): string[] {
    const results: string[] = [];
    let current = '';
    let parenDepth = 0;

    for (let i = 0; i < body.length; i++) {
      const char = body[i];
      if (char === '(') parenDepth++;
      if (char === ')') parenDepth--;

      if (char === ',' && parenDepth === 0) {
        results.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      results.push(current);
    }
    return results;
  }
}
