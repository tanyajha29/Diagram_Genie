export interface UDMNode {
  id: string;
  type: string;
  label: string;
  description?: string;
  properties?: Record<string, string>;
  columns?: Array<{
    name: string;
    type: string;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
  }>;
  theme?: string;
  parentId?: string;
  data?: any;
  methods?: any[];
  attributes?: string[];
}

export interface UDMEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'animated' | 'dashed';
  animated?: boolean;
}

export interface UniversalDiagram {
  nodes: UDMNode[];
  edges: UDMEdge[];
  metadata: {
    title: string;
    description: string;
    type: string;
    createdAt: string;
  };
}

const cleanId = (str: string): string => {
  return str.trim().replace(/[\[\]\{\}\(\):\-]/g, '').trim().toLowerCase().replace(/\s+/g, '_');
};

export const parseTextToUDM = (text: string, parserType: string): { nodes: UDMNode[]; edges: UDMEdge[] } => {
  const nodes: UDMNode[] = [];
  const edges: UDMEdge[] = [];
  const nodeMap = new Map<string, UDMNode>();

  const addNode = (
    id: string,
    label: string,
    type: UDMNode['type'],
    properties?: Record<string, string>,
    columns?: UDMNode['columns'],
    parentId?: string
  ) => {
    const cid = cleanId(id);
    if (!cid) return;
    if (!nodeMap.has(cid)) {
      const node: UDMNode = {
        id: cid,
        label: label.trim(),
        type,
        properties,
        columns,
        parentId
      };
      nodes.push(node);
      nodeMap.set(cid, node);
    } else {
      const existing = nodeMap.get(cid)!;
      if (properties) existing.properties = { ...existing.properties, ...properties };
      if (columns) existing.columns = columns;
      if (parentId) existing.parentId = parentId;
    }
  };

  const lines = text.split('\n').map(l => l.trimEnd()).filter(l => l.trim().length > 0);

  if (parserType === 'er' || parserType === 'sql') {
    // Standard SQL DDL & DBML-like parser
    let currentTableId: string | null = null;
    let currentProperties: Record<string, string> = {};

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().startsWith('table ') && trimmed.includes('{')) {
        const tableName = trimmed.split('{')[0].replace(/table/i, '').trim();
        currentTableId = cleanId(tableName);
        currentProperties = {};
        addNode(currentTableId, tableName, 'database-table', {});
      } else if (trimmed === '}' && currentTableId) {
        const cols = Object.entries(currentProperties).map(([name, type]) => ({
          name,
          type,
          isPrimaryKey: name.toLowerCase() === 'id',
          isForeignKey: false
        }));
        addNode(currentTableId, currentTableId, 'database-table', undefined, cols);
        currentTableId = null;
      } else if (currentTableId) {
        const parts = trimmed.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
          const fieldName = parts[0];
          const fieldType = parts[1].replace(/\[.*\]/g, '');
          currentProperties[fieldName] = fieldType;

          if (trimmed.includes('ref:')) {
            const refMatch = trimmed.match(/ref:\s*>\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/);
            if (refMatch) {
              const targetTable = cleanId(refMatch[1]);
              edges.push({
                id: `e-${currentTableId}-${targetTable}`,
                source: currentTableId,
                target: targetTable,
                label: `${fieldName} ➔ ${refMatch[2]}`
              });
            }
          }
        }
      } else if (trimmed.toLowerCase().startsWith('create table')) {
        const match = trimmed.match(/create\s+table\s+([a-zA-Z0-9_]+)/i);
        if (match) {
          currentTableId = cleanId(match[1]);
          currentProperties = {};
          addNode(currentTableId, match[1], 'database-table', {});
        }
      } else if (trimmed.startsWith(')') && currentTableId) {
        const cols = Object.entries(currentProperties).map(([name, type]) => ({
          name,
          type,
          isPrimaryKey: name.toLowerCase() === 'id',
          isForeignKey: false
        }));
        addNode(currentTableId, currentTableId, 'database-table', undefined, cols);
        currentTableId = null;
      } else if (currentTableId && trimmed.includes(' ')) {
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) {
          const fieldName = parts[0].replace(/['"`]/g, '');
          const fieldType = parts[1].replace(/,/g, '');
          if (!trimmed.toLowerCase().startsWith('primary') && !trimmed.toLowerCase().startsWith('foreign') && !trimmed.toLowerCase().startsWith('constraint')) {
            currentProperties[fieldName] = fieldType;
          }
        }
      }
    });
  } 
  
  else if (parserType === 'prisma') {
    let currentModel: string | null = null;
    const modelColumns = new Map<string, Array<{ name: string; type: string; isPrimaryKey: boolean; isForeignKey: boolean }>>();
    const modelRelations: Array<{ source: string; target: string; relationStr: string }> = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('model ')) {
        const match = trimmed.match(/^model\s+([a-zA-Z0-9_]+)\s*\{/);
        if (match) {
          currentModel = match[1];
          modelColumns.set(currentModel, []);
        }
      } else if (trimmed.startsWith('}') && currentModel) {
        currentModel = null;
      } else if (currentModel && trimmed.length > 0) {
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) {
          const fieldName = parts[0];
          const fieldType = parts[1];
          const rest = parts.slice(2).join(' ');

          const columns = modelColumns.get(currentModel)!;

          if (rest.includes('@relation')) {
            modelRelations.push({
              source: currentModel,
              target: fieldType.replace('?', ''),
              relationStr: rest
            });
          } else {
            const isPrimaryKey = rest.includes('@id');
            const isArray = fieldType.endsWith('[]');
            const isObjectLink = /^[A-Z]/.test(fieldType);

            if (!isArray && !isObjectLink) {
              columns.push({
                name: fieldName,
                type: fieldType,
                isPrimaryKey,
                isForeignKey: false
              });
            }
          }
        }
      }
    });

    modelColumns.forEach((cols, modelName) => {
      const nodeId = cleanId(modelName);
      addNode(nodeId, modelName, 'database-table', undefined, cols);
    });

    modelRelations.forEach((rel) => {
      const sId = cleanId(rel.source);
      const tId = cleanId(rel.target);
      const fieldsMatch = rel.relationStr.match(/fields:\s*\[([^\]]+)\]/);
      const refMatch = rel.relationStr.match(/references:\s*\[([^\]]+)\]/);

      if (fieldsMatch && refMatch) {
        const fkFields = fieldsMatch[1].split(',').map(f => f.trim());
        const cols = modelColumns.get(rel.source);
        if (cols) {
          fkFields.forEach((fkF) => {
            const col = cols.find(c => c.name === fkF);
            if (col) col.isForeignKey = true;
          });
        }

        edges.push({
          id: `e-prisma-${sId}-${tId}`,
          source: sId,
          target: tId,
          label: `${fieldsMatch[1]} ➔ ${refMatch[1]}`
        });
      } else {
        edges.push({
          id: `e-prisma-${sId}-${tId}`,
          source: sId,
          target: tId
        });
      }
    });
  }

  else if (parserType === 'sequence') {
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      const isDashed = trimmed.includes('-->');
      const delimiter = isDashed ? '-->' : '->';

      if (trimmed.includes(delimiter) && trimmed.includes(':')) {
        const parts = trimmed.split(':');
        const edgeLabel = parts[1].trim();
        const connection = parts[0].split(delimiter);

        if (connection.length === 2) {
          const actor1 = connection[0].trim();
          const actor2 = connection[1].trim();
          const a1Id = cleanId(actor1);
          const a2Id = cleanId(actor2);

          addNode(a1Id, actor1, 'uml-class');
          addNode(a2Id, actor2, 'uml-class');

          edges.push({
            id: `e-seq-${idx}`,
            source: a1Id,
            target: a2Id,
            label: edgeLabel,
            type: isDashed ? 'dashed' : 'default',
            animated: !isDashed
          });
        }
      }
    });
  }

  else if (parserType === 'terraform') {
    interface TfRes {
      id: string;
      type: string;
      name: string;
      lines: string[];
    }
    const resources: TfRes[] = [];
    let currentRes: TfRes | null = null;
    let braceCount = 0;

    lines.forEach((line) => {
      const trimmed = line.trim();
      const resMatch = trimmed.match(/^resource\s+"([^"]+)"\s+"([^"]+)"\s*\{/);
      if (resMatch) {
        currentRes = { id: `${resMatch[1]}.${resMatch[2]}`, type: resMatch[1], name: resMatch[2], lines: [] };
        braceCount = 1;
        resources.push(currentRes);
        return;
      }
      if (currentRes) {
        if (trimmed.includes('{')) braceCount++;
        if (trimmed.includes('}')) braceCount--;
        if (braceCount === 0) currentRes = null;
        else currentRes.lines.push(trimmed);
      }
    });

    resources.forEach((res) => {
      const cid = cleanId(res.id);
      let parentId: string | undefined = undefined;
      const dependencies: string[] = [];

      res.lines.forEach((l) => {
        resources.forEach((other) => {
          if (other.id !== res.id && l.includes(other.id)) {
            dependencies.push(other.id);
            if (res.type.includes('subnet') && other.type === 'aws_vpc') {
              parentId = cleanId(other.id);
            }
          }
        });
      });

      addNode(cid, `${res.type}\n"${res.name}"`, res.type === 'aws_vpc' ? 'container' : 'cloud-node', undefined, undefined, parentId);

      dependencies.forEach((dep) => {
        edges.push({
          id: `e-tf-${cid}-${cleanId(dep)}`,
          source: cid,
          target: cleanId(dep),
          animated: true
        });
      });
    });
  }

  else if (parserType === 'docker-compose') {
    let inServices = false;
    let serviceIndent = 0;
    const services = new Map<string, { name: string; dependsOn: string[]; image?: string }>();
    let currentService: { name: string; dependsOn: string[]; image?: string } | null = null;
    let inDependsOn = false;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.length === 0 || trimmed.startsWith('#')) return;

      const indent = line.search(/\S/);

      if (trimmed === 'services:') {
        inServices = true;
        currentService = null;
        return;
      }

      if (inServices) {
        if (indent === 0 && trimmed.includes(':')) {
          inServices = false;
          currentService = null;
          return;
        }

        if (trimmed.endsWith(':') && !trimmed.startsWith('-')) {
          const sName = trimmed.slice(0, -1).trim();
          if (!currentService || indent <= serviceIndent) {
            serviceIndent = indent;
            currentService = { name: sName, dependsOn: [] };
            services.set(sName, currentService);
            inDependsOn = false;
            addNode(cleanId(sName), sName, 'cloud-node');
          }
        }

        if (currentService) {
          if (trimmed === 'depends_on:') {
            inDependsOn = true;
          } else if (trimmed.includes(':') && !trimmed.startsWith('-')) {
            inDependsOn = false;
            if (trimmed.startsWith('image:')) {
              currentService.image = trimmed.replace('image:', '').trim().replace(/['"]/g, '');
            }
          } else if (trimmed.startsWith('-') && inDependsOn) {
            const dep = trimmed.slice(1).trim().replace(/['"]/g, '');
            currentService.dependsOn.push(dep);
          }
        }
      }
    });

    services.forEach((service, name) => {
      const cleanServiceId = cleanId(name);
      service.dependsOn.forEach((dep) => {
        const depCleanId = cleanId(dep);
        edges.push({
          id: `e-compose-${cleanServiceId}-${depCleanId}`,
          source: cleanServiceId,
          target: depCleanId,
          animated: true
        });
      });
    });
  }

  else if (parserType === 'openapi') {
    let currentPath = '';
    const endpoints: Array<{ path: string; method: string }> = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.length === 0 || trimmed.startsWith('#')) return;

      const pathMatch = trimmed.match(/^"\/([^"]+)"\s*:/) || trimmed.match(/^\/([a-zA-Z0-9_\-\{\}/]+)\s*:/);
      if (pathMatch) {
        currentPath = trimmed.slice(0, trimmed.indexOf(':')).replace(/"/g, '').trim();
      } else if (currentPath && trimmed.match(/^(get|post|put|delete|patch)\s*:/i)) {
        const method = trimmed.split(':')[0].trim().toUpperCase();
        endpoints.push({ path: currentPath, method });
      }
    });

    addNode('api_gateway', 'API Gateway Ingress', 'service');

    endpoints.forEach((ep) => {
      const cid = `ep_${ep.method.toLowerCase()}_${ep.path.replace(/[\/\{\}\-]/g, '_')}`;
      addNode(cid, `${ep.method} ${ep.path}`, 'api');
      edges.push({
        id: `e-api-${cid}`,
        source: 'api_gateway',
        target: cid,
        animated: true
      });
    });
  }

  else if (parserType === 'pipeline') {
    lines.forEach((line, idx) => {
      if (line.includes('->')) {
        const parts = line.split('->').map(p => p.trim());
        let prevId = '';

        parts.forEach((part) => {
          const label = part.replace(/[\[\]]/g, '').trim();
          const cid = cleanId(label);
          if (cid) {
            addNode(cid, label, 'process');
            if (prevId) {
              edges.push({
                id: `e-pipe-${idx}-${prevId}-${cid}`,
                source: prevId,
                target: cid,
                animated: true
              });
            }
            prevId = cid;
          }
        });
      }
    });
  }

  else if (parserType === 'mindmap' || parserType === 'markdown-outline') {
    const indentStack: { id: string; level: number }[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(\s*)([-*+])\s*(.*)$/);
      if (match) {
        const indent = match[1].length;
        const content = match[3].trim();
        const nodeId = cleanId(content);
        
        addNode(nodeId, content, 'mindmap-node');

        while (indentStack.length > 0 && indentStack[indentStack.length - 1].level >= indent) {
          indentStack.pop();
        }

        if (indentStack.length > 0) {
          const parent = indentStack[indentStack.length - 1];
          edges.push({
            id: `e-${parent.id}-${nodeId}`,
            source: parent.id,
            target: nodeId
          });
        }

        indentStack.push({ id: nodeId, level: indent });
      } else {
        const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const content = headerMatch[2].trim();
          const nodeId = cleanId(content);

          addNode(nodeId, content, 'mindmap-node');

          while (indentStack.length > 0 && indentStack[indentStack.length - 1].level >= level) {
            indentStack.pop();
          }

          if (indentStack.length > 0) {
            const parent = indentStack[indentStack.length - 1];
            edges.push({
              id: `e-${parent.id}-${nodeId}`,
              source: parent.id,
              target: nodeId
            });
          }

          indentStack.push({ id: nodeId, level: level });
        }
      }
    });
  } 
  
  else {
    // Flowchart, Cloud, UML DSL and Architecture default connectors
    lines.forEach((line, idx) => {
      if (line.includes('->') || line.includes('-->')) {
        const delimiter = line.includes('-->') ? '-->' : '->';
        const parts = line.split(delimiter);
        
        if (parts.length === 2) {
          let left = parts[0].trim();
          let right = parts[1].trim();
          let edgeLabel = '';

          if (right.includes(':')) {
            const rightParts = right.split(':');
            right = rightParts[0].trim();
            edgeLabel = rightParts[1].trim();
          }

          let leftType: UDMNode['type'] = 'architecture';
          let leftLabel = left;
          let leftId = cleanId(left);

          if (left.includes('{') && left.includes('}')) {
            const match = left.match(/(.*?)\{(.*?)\}/);
            if (match) {
              leftId = cleanId(match[1]);
              leftLabel = match[2];
              leftType = 'decision';
            }
          } else if (left.startsWith('[') && left.endsWith(']')) {
            leftLabel = left.slice(1, -1);
            leftId = cleanId(leftLabel);
          }

          let rightType: UDMNode['type'] = 'architecture';
          let rightLabel = right;
          let rightId = cleanId(right);

          if (right.includes('{') && right.includes('}')) {
            const match = right.match(/(.*?)\{(.*?)\}/);
            if (match) {
              rightId = cleanId(match[1]);
              rightLabel = match[2];
              rightType = 'decision';
            }
          } else if (right.startsWith('[') && right.endsWith(']')) {
            rightLabel = right.slice(1, -1);
            rightId = cleanId(rightLabel);
          }

          addNode(leftId, leftLabel, leftType);
          addNode(rightId, rightLabel, rightType);

          edges.push({
            id: `e-flow-${idx}`,
            source: leftId,
            target: rightId,
            label: edgeLabel || undefined,
            type: delimiter === '-->' ? 'dashed' : 'default',
            animated: delimiter === '->'
          });
        }
      } else {
        let label = line;
        let id = cleanId(line);
        let type: UDMNode['type'] = 'architecture';

        if (line.includes('{') && line.includes('}')) {
          const match = line.match(/(.*?)\{(.*?)\}/);
          if (match) {
            id = cleanId(match[1]);
            label = match[2];
            type = 'decision';
          }
        } else if (line.startsWith('[') && line.endsWith(']')) {
          label = line.slice(1, -1);
          id = cleanId(label);
        }

        addNode(id, label, type);
      }
    });
  }

  if (nodes.length === 0) {
    nodes.push({
      id: 'n1',
      label: 'Empty Diagram Workspace',
      type: 'default',
      description: 'Start typing relationships to render nodes.'
    });
  }

  // UDM Normalization Layer
  const normalizedNodes = nodes.map((node) => {
    const rawType = (node.type || '').toLowerCase();
    const isDb = rawType === 'database-table' || rawType === 'database' || rawType === 'table' || 
                 (node.label && (node.label.toLowerCase().includes('database') || node.label.toLowerCase().includes('table')));
    
    const isUml = rawType === 'uml-class' || rawType === 'uml-interface' || rawType === 'class' || rawType === 'interface';

    // 1. Database table normalization
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

      // Legacy mirroring for compatibility
      const legacyProps: Record<string, string> = {};
      normColumns.forEach(c => {
        legacyProps[c.name] = c.type;
        c.isPrimaryKey = c.primaryKey;
        c.isForeignKey = c.foreignKey;
      });

      return {
        ...node,
        type: 'database-table',
        properties: legacyProps,
        data: {
          ...data,
          columns: normColumns,
          properties: legacyProps
        }
      };
    }

    // 2. UML Class normalization
    if (isUml) {
      const data = node.data || {};
      const properties = data.properties || node.properties || {};
      const methods = data.methods || node.methods || [];
      const attributes = data.attributes || data.fields || [];

      let normAttributes = [...attributes];
      if (normAttributes.length === 0 && properties && typeof properties === 'object') {
        normAttributes = Object.entries(properties).map(([name, type]) => `+ ${name}: ${type}`);
      }

      const legacyProps: Record<string, string> = {};
      normAttributes.forEach(attr => {
        if (typeof attr === 'string') {
          const cleanAttr = attr.replace(/^[+\-#~]\s*/, '').trim();
          const parts = cleanAttr.split(':').map(p => p.trim());
          if (parts.length >= 2) {
            legacyProps[parts[0]] = parts[1];
          } else {
            legacyProps[cleanAttr] = 'string';
          }
        }
      });

      const normMethods = Array.isArray(methods) ? methods.map((m: any) => {
        if (typeof m === 'string') return m;
        const vis = m.visibility || '+';
        const name = m.name || '';
        const ret = m.returnType ? `: ${m.returnType}` : '';
        return `${vis} ${name}()${ret}`;
      }) : [];

      return {
        ...node,
        type: rawType === 'interface' ? 'interface' : 'class',
        properties: legacyProps,
        methods: normMethods,
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

  return { nodes: normalizedNodes, edges };
};
