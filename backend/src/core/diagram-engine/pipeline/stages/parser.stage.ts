import { Injectable } from '@nestjs/common';
import { PipelineStage } from '../pipeline-stage.interface';
import { GenerationContext } from '../../context/generation.context';
import { ParserFactory } from '../../factory/parser.factory';
import { Diagram, DiagramNode } from '../../interfaces';

export function normalizeUdmDiagram(diagram: Diagram): Diagram {
  const nodes = diagram.nodes.map((node: DiagramNode) => {
    const rawType = (node.type || '').toLowerCase();
    const isDb = rawType === 'database-table' || rawType === 'database' || rawType === 'table' || 
                 (node.label && (node.label.toLowerCase().includes('database') || node.label.toLowerCase().includes('table')));
    
    const isUml = rawType === 'uml-class' || rawType === 'uml-interface' || rawType === 'class' || rawType === 'interface';

    // 1. Normalization for Database Table Nodes
    if (isDb) {
      const data = node.data || {};
      const columns = data.columns || node.columns || [];
      const properties = data.properties || node.properties || {};
      
      let normColumns: any[] = [];
      if (Array.isArray(columns) && columns.length > 0) {
        normColumns = columns.map((col: any) => ({
          name: col.name || '',
          type: col.type || 'VARCHAR',
          primaryKey: col.primaryKey !== undefined ? col.primaryKey : (col.isPrimaryKey !== undefined ? col.isPrimaryKey : false),
          foreignKey: col.foreignKey !== undefined ? col.foreignKey : (col.isForeignKey !== undefined ? col.isForeignKey : false),
          nullable: col.nullable !== undefined ? col.nullable : (col.isNullable !== undefined ? col.isNullable : false),
          default: col.default !== undefined ? col.default : (col.defaultValue !== undefined ? col.defaultValue : undefined),
          unique: col.unique !== undefined ? col.unique : (col.isUnique !== undefined ? col.isUnique : false)
        }));
      } else if (properties && typeof properties === 'object' && !Array.isArray(properties)) {
        normColumns = Object.entries(properties).map(([name, type]) => {
          const typeStr = String(type);
          const isId = name.toLowerCase() === 'id' || name.toLowerCase().endsWith('_id');
          return {
            name,
            type: typeStr,
            primaryKey: isId && name.toLowerCase() === 'id',
            foreignKey: isId && name.toLowerCase() !== 'id',
            nullable: false,
            default: undefined,
            unique: false
          };
        });
      }

      // Preserve mirror formats for compatibility
      const legacyProps: Record<string, string> = {};
      normColumns.forEach(c => {
        legacyProps[c.name] = c.type;
        // Keep both formats in the column object for backward compatibility with react-flow DatabaseNode
        c.isPrimaryKey = c.primaryKey;
        c.isForeignKey = c.foreignKey;
      });

      return {
        ...node,
        type: 'database-table', // Canonical type
        data: {
          ...data,
          columns: normColumns,
          properties: legacyProps
        }
      };
    }

    // 2. Normalization for UML Class Nodes
    if (isUml) {
      const data = node.data || {};
      const properties = data.properties || node.properties || {};
      const methods = data.methods || node.methods || [];
      const attributes = data.attributes || data.fields || [];

      // If attributes is empty but properties has fields
      let normAttributes = [...attributes];
      if (normAttributes.length === 0 && properties && typeof properties === 'object') {
        normAttributes = Object.entries(properties).map(([name, type]) => `+ ${name}: ${type}`);
      }

      const legacyProps: Record<string, string> = {};
      normAttributes.forEach(attr => {
        if (typeof attr === 'string') {
          // Parse string format e.g. "+ id: int" or "id: int"
          const cleanAttr = attr.replace(/^[+\-#~]\s*/, '').trim();
          const parts = cleanAttr.split(':').map(p => p.trim());
          if (parts.length >= 2) {
            legacyProps[parts[0]] = parts[1];
          } else {
            legacyProps[cleanAttr] = 'string';
          }
        }
      });

      // Standardize methods
      const normMethods = Array.isArray(methods) ? methods.map((m: any) => {
        if (typeof m === 'string') return m;
        // Map object methods: { visibility, name, returnType }
        const vis = m.visibility || '+';
        const name = m.name || '';
        const ret = m.returnType ? `: ${m.returnType}` : '';
        return `${vis} ${name}()${ret}`;
      }) : [];

      return {
        ...node,
        type: rawType === 'interface' ? 'interface' : 'class', // Standard type
        data: {
          ...data,
          attributes: normAttributes,
          properties: legacyProps,
          methods: normMethods
        }
      };
    }

    return node;
  });

  return {
    ...diagram,
    nodes
  };
}

@Injectable()
export class ParserStage implements PipelineStage {
  readonly id = 'parser-stage';
  readonly order = 40;
  readonly enabled = true;
  readonly required = true;

  constructor(private readonly parserFactory: ParserFactory) {}

  supports(context: GenerationContext): boolean {
    return !!context.metadata.tool;
  }

  async execute(context: GenerationContext): Promise<void> {
    const tool = context.metadata.tool;
    const { source, options } = context.request;

    // 1. Resolve parser plugin via factory
    const parser = this.parserFactory.createParser(tool.parserId);

    // 2. Validate input source syntax format
    if (!parser.validate(source)) {
      throw new Error(`Syntax validation failed for parser: ${parser.id}`);
    }

    // 3. Extract logical entities into intermediate Universal Diagram Model
    const result = await parser.parse(source, options);
    const normalized = normalizeUdmDiagram(result.diagram);
    context.parserOutput = normalized;
    context.diagram = normalized; // Initialize diagram structure for downstream layout mutation
    context.warnings.push(...result.warnings);
    context.metadata.parserStatistics = result.statistics;
  }
}
