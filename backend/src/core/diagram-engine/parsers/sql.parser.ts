import { Injectable } from '@nestjs/common';
import { AbstractParser, ParserContext } from './abstract.parser';
import { ParserRegistry } from '../registry/parser.registry';
import { Token } from './lexer';
import { NodeClassifier } from './node-classifier.service';
import { ParserResult } from './parser-result.interface';
import { Diagram, DiagramNode, DiagramEdge } from '../interfaces';

/**
 * Canonical column representation for ER/database table nodes.
 * This is the single source of truth for `data.columns` across the engine —
 * always an array, never a bare `{name: type}` map, so downstream ER
 * rendering/export logic never has to branch on shape.
 */
export interface ColumnInfo {
  name: string;
  type: string;
  primaryKey: boolean;
  foreignKey: boolean;
  nullable: boolean;
}

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
    return type === 'sql' || type === 'database' || type === 'er';
  }

  validate(source: string): boolean {
    const lower = source.toLowerCase();
    return !!source && (lower.includes('table') || lower.includes('create'));
  }

  /**
   * SQL DDL parsing needs multi-line, paren-aware scanning of full CREATE TABLE
   * bodies (columns, inline/standalone PK & FK constraints) that doesn't map
   * cleanly onto the per-line token model the base class's `parseTokens` hook
   * assumes. So `parse()` is overridden directly here rather than going through
   * `parseTokens` — `parseTokens` below is an unreachable stub kept only to
   * satisfy the abstract base contract.
   */
  async parse(source: string, options?: Record<string, any>): Promise<ParserResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];

    // Strip SQL comments
    const cleanSql = source
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();

    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_`"]+)\s*\(([\s\S]*?)\)(?:\s*;|\s*$|\s*ENGINE|\s*WITH)/gi;
    let match: RegExpExecArray | null;

    const tableColumnsMap = new Map<string, ColumnInfo[]>();
    const tableForeignKeys: { fromTable: string; fromCol: string; toTable: string; toCol: string }[] = [];

    while ((match = createTableRegex.exec(cleanSql)) !== null) {
      const rawTableName = match[1];
      const tableName = rawTableName.replace(/[`"[\]]/g, '').trim().toLowerCase();
      const body = match[2];

      const columns: ColumnInfo[] = [];
      const primaryKeys = new Set<string>();

      const defs = this.splitSqlDefinitions(body);

      defs.forEach((def) => {
        const trimmedDef = def.trim();
        if (!trimmedDef) return;
        const upperDef = trimmedDef.toUpperCase();

        if (upperDef.startsWith('CONSTRAINT') || upperDef.startsWith('PRIMARY KEY') || upperDef.startsWith('FOREIGN KEY')) {
          if (upperDef.includes('PRIMARY KEY')) {
            const pkMatch = trimmedDef.match(/PRIMARY\s+KEY\s*\((.*?)\)/i);
            if (pkMatch) {
              pkMatch[1].split(',').forEach((col) => primaryKeys.add(col.replace(/[`"[\]\s]/g, '')));
            }
          }
          if (upperDef.includes('FOREIGN KEY')) {
            const fkMatch = trimmedDef.match(/FOREIGN\s+KEY\s*\((.*?)\)\s*REFERENCES\s*([a-zA-Z0-9_`"]+)\s*\((.*?)\)/i);
            if (fkMatch) {
              const fromCol = fkMatch[1].replace(/[`"[\]\s]/g, '');
              const toTable = fkMatch[2].replace(/[`"[\]]/g, '').toLowerCase();
              const toCol = fkMatch[3].replace(/[`"[\]\s]/g, '');
              tableForeignKeys.push({ fromTable: tableName, fromCol, toTable, toCol });
            }
          }
        } else {
          const tokens = trimmedDef.split(/\s+/);
          if (tokens.length >= 2) {
            const colName = tokens[0].replace(/[`"[\]]/g, '');
            const colType = tokens[1].replace(/,$/, '');

            const isPk = upperDef.includes('PRIMARY KEY');
            if (isPk) primaryKeys.add(colName);

            const isNullable = !upperDef.includes('NOT NULL') && !isPk;

            let isFk = false;
            const inlineFkMatch = trimmedDef.match(/REFERENCES\s+([a-zA-Z0-9_`"]+)\s*\((.*?)\)/i);
            if (inlineFkMatch) {
              const toTable = inlineFkMatch[1].replace(/[`"[\]]/g, '').toLowerCase();
              const toCol = inlineFkMatch[2].replace(/[`"[\]\s]/g, '');
              tableForeignKeys.push({ fromTable: tableName, fromCol: colName, toTable, toCol });
              isFk = true;
            }

            columns.push({
              name: colName,
              type: colType,
              primaryKey: false, // resolved below once the full PK set is known
              foreignKey: isFk,
              nullable: isNullable,
            });
          }
        }
      });

      columns.forEach((col) => {
        if (primaryKeys.has(col.name)) {
          col.primaryKey = true;
          col.nullable = false;
        }
      });

      if (columns.length === 0) {
        warnings.push(`Table '${tableName}' matched CREATE TABLE but no columns could be parsed.`);
      }

      tableColumnsMap.set(tableName, columns);
    }

    // Second pass: mark columns referenced by any FK (inline OR standalone constraint) as foreignKey
    tableForeignKeys.forEach((fk) => {
      const cols = tableColumnsMap.get(fk.fromTable);
      if (cols) {
        const col = cols.find((c) => c.name === fk.fromCol);
        if (col) col.foreignKey = true;
      }
    });

    if (tableColumnsMap.size === 0) {
      warnings.push('No CREATE TABLE statements could be parsed from the source.');
    }

    // ALTER TABLE ... ADD FOREIGN KEY
    const alterFkRegex = /ALTER\s+TABLE\s+([a-zA-Z0-9_`"]+)\s+ADD\s+(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(([a-zA-Z0-9_`"]+)\)\s*REFERENCES\s*([a-zA-Z0-9_`"]+)\s*\(([a-zA-Z0-9_`"]+)\)/gi;
    let alterMatch: RegExpExecArray | null;
    while ((alterMatch = alterFkRegex.exec(cleanSql)) !== null) {
      const fromTable = alterMatch[1].replace(/[`"[\]]/g, '').trim().toLowerCase();
      const fromCol = alterMatch[2].replace(/[`"[\]]/g, '').trim();
      const toTable = alterMatch[3].replace(/[`"[\]]/g, '').trim().toLowerCase();
      const toCol = alterMatch[4].replace(/[`"[\]]/g, '').trim();

      tableForeignKeys.push({ fromTable, fromCol, toTable, toCol });

      const cols = tableColumnsMap.get(fromTable);
      if (cols) {
        const col = cols.find((c) => c.name === fromCol);
        if (col) col.foreignKey = true;
      }
    }

    // Build UDM nodes — `data.columns` is always the canonical ColumnInfo[] array
    tableColumnsMap.forEach((cols, tableName) => {
      nodes.push({
        id: tableName,
        type: 'database-table',
        label: tableName,
        position: { x: 0, y: 0 },
        data: { columns: cols },
        style: {
          backgroundColor: '#0f172a',
          borderColor: '#f59e0b',
          textColor: '#f8fafc',
          borderWidth: 2,
        },
      });
    });

    // Build UDM edges from FK relationships, skipping edges to unknown tables
    tableForeignKeys.forEach((fk, index) => {
      if (!tableColumnsMap.has(fk.fromTable) || !tableColumnsMap.has(fk.toTable)) {
        warnings.push(`Foreign key on '${fk.fromTable}.${fk.fromCol}' references unknown table '${fk.toTable}' — edge skipped.`);
        return;
      }
      edges.push({
        id: `fk_${fk.fromTable}_${fk.toTable}_${index}`,
        source: fk.fromTable,
        target: fk.toTable,
        label: `${fk.fromCol} -> ${fk.toCol}`,
        type: 'default',
        animated: false,
      });
    });

    const diagram: Diagram = {
      id: `sql_er_${Date.now()}`,
      title: options?.title || 'Database ER Diagram',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '1.0',
        sourceType: this.id,
      },
    };

    return {
      diagram,
      warnings,
      statistics: {
        linesParsed: source.split('\n').length,
        nodesCreated: nodes.length,
        edgesCreated: edges.length,
        ignoredLines: 0,
        parseDurationMs: Date.now() - startTime,
      },
    };
  }

  /** Unused: `parse()` is overridden above. Required only to satisfy AbstractParser. */
  protected async parseTokens(_tokens: Token[], _context: ParserContext): Promise<void> {
    return;
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
