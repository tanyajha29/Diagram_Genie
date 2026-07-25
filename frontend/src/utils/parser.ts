export interface UDMNode {
  id: string;
  type: 'architecture' | 'database' | 'decision' | 'api' | 'cloud' | 'service' | 'mindmap' | 'sequence' | 'default';
  label: string;
  description?: string;
  properties?: Record<string, string>;
  theme?: string;
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

/**
 * Normalizes labels and IDs by trimming whitespace and cleaning symbols
 */
const cleanId = (str: string): string => {
  return str.trim().replace(/[\[\]\{\}\(\):\-]/g, '').trim().toLowerCase();
};

/**
 * Universal text parser mapping various formats into the UDM
 */
export const parseTextToUDM = (text: string, parserType: string): { nodes: UDMNode[]; edges: UDMEdge[] } => {
  const nodes: UDMNode[] = [];
  const edges: UDMEdge[] = [];
  const nodeMap = new Map<string, UDMNode>();

  const addNode = (id: string, label: string, type: UDMNode['type'], properties?: Record<string, string>) => {
    const cid = cleanId(id);
    if (!cid) return;
    if (!nodeMap.has(cid)) {
      const node: UDMNode = {
        id: cid,
        label: label.trim(),
        type,
        properties
      };
      nodes.push(node);
      nodeMap.set(cid, node);
    } else if (properties) {
      // Merge properties if node already exists
      const existing = nodeMap.get(cid)!;
      existing.properties = { ...existing.properties, ...properties };
    }
  };

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  if (parserType === 'er') {
    // ER database parser supporting DBML-like syntax
    // Table Users { id int pk, name varchar }
    let currentTableId: string | null = null;
    let currentProperties: Record<string, string> = {};

    lines.forEach((line) => {
      // Start table
      if (line.toLowerCase().startsWith('table ') && line.includes('{')) {
        const tableName = line.split('{')[0].replace(/table/i, '').trim();
        currentTableId = cleanId(tableName);
        currentProperties = {};
        addNode(currentTableId, tableName, 'database', {});
      } 
      // End table
      else if (line === '}' && currentTableId) {
        addNode(currentTableId, currentTableId, 'database', currentProperties);
        currentTableId = null;
      } 
      // Table field line
      else if (currentTableId) {
        const parts = line.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
          const fieldName = parts[0];
          const fieldType = parts[1].replace(/\[.*\]/g, ''); // strip attributes
          currentProperties[fieldName] = fieldType;

          // Check if it's a foreign key reference inside brackets
          // e.g. userId int [ref: > Users.id]
          if (line.includes('ref:')) {
            const refMatch = line.match(/ref:\s*>\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/);
            if (refMatch) {
              const targetTable = cleanId(refMatch[1]);
              edges.push({
                id: `e-${currentTableId}-${targetTable}`,
                source: currentTableId,
                target: targetTable,
                label: `${fieldName} ➔ ${refMatch[2]}`,
                type: 'default'
              });
            }
          }
        }
      }
      // Inline relations
      // Users ||--o{ Orders
      else if (line.includes('--') || line.includes('->')) {
        const delimiter = line.includes('--') ? '--' : '->';
        const parts = line.split(delimiter);
        if (parts.length === 2) {
          const t1 = cleanId(parts[0]);
          const t2 = cleanId(parts[1]);
          addNode(t1, parts[0].trim(), 'database');
          addNode(t2, parts[1].trim(), 'database');
          edges.push({
            id: `e-${t1}-${t2}`,
            source: t1,
            target: t2,
            type: 'default'
          });
        }
      }
    });
  } 
  
  else if (parserType === 'mindmap') {
    // Mindmap indented tree list parser
    // - Root
    //   - Child 1
    //   - Child 2
    const indentStack: { id: string; level: number }[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(\s*)([-*+])\s*(.*)$/);
      if (!match) return;

      const indent = match[1].length;
      const content = match[3].trim();
      const nodeId = cleanId(content);
      
      addNode(nodeId, content, 'mindmap');

      // Find parent node
      while (indentStack.length > 0 && indentStack[indentStack.length - 1].level >= indent) {
        indentStack.pop();
      }

      if (indentStack.length > 0) {
        const parent = indentStack[indentStack.length - 1];
        edges.push({
          id: `e-${parent.id}-${nodeId}`,
          source: parent.id,
          target: nodeId,
          type: 'default'
        });
      }

      indentStack.push({ id: nodeId, level: indent });
    });
  } 
  
  else if (parserType === 'sequence') {
    // Sequence diagram parser
    // User -> Server: HTTP request
    // Server --> User: Response
    lines.forEach((line, idx) => {
      const isDashed = line.includes('-->');
      const delimiter = isDashed ? '-->' : '->';
      
      if (line.includes(delimiter) && line.includes(':')) {
        const parts = line.split(':');
        const edgeLabel = parts[1].trim();
        const connection = parts[0].split(delimiter);
        
        if (connection.length === 2) {
          const actor1 = connection[0].trim();
          const actor2 = connection[1].trim();
          const a1Id = cleanId(actor1);
          const a2Id = cleanId(actor2);

          addNode(a1Id, actor1, 'sequence');
          addNode(a2Id, actor2, 'sequence');

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
  
  else {
    // Flowchart, Cloud, and Architecture default connectors
    // A -> B : text
    // A {Decision Node} -> B
    lines.forEach((line, idx) => {
      if (line.includes('->') || line.includes('-->')) {
        const delimiter = line.includes('-->') ? '-->' : '->';
        const parts = line.split(delimiter);
        
        if (parts.length === 2) {
          let left = parts[0].trim();
          let right = parts[1].trim();
          let edgeLabel = '';

          // Check if right side has an edge text (e.g. NodeB : Description text)
          if (right.includes(':')) {
            const rightParts = right.split(':');
            right = rightParts[0].trim();
            edgeLabel = rightParts[1].trim();
          }

          // Parse left node shape/details
          let leftType: UDMNode['type'] = parserType === 'cloud' ? 'cloud' : 'architecture';
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

          // Parse right node shape/details
          let rightType: UDMNode['type'] = parserType === 'cloud' ? 'cloud' : 'architecture';
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
        // Standalone node definitions
        // e.g. [API Gateway] or TableA
        let label = line;
        let id = cleanId(line);
        let type: UDMNode['type'] = parserType === 'cloud' ? 'cloud' : 'architecture';

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

  // If we couldn't parse anything, return a default node placeholder
  if (nodes.length === 0) {
    nodes.push({
      id: 'n1',
      label: 'Empty Diagram Workspace',
      type: 'default',
      description: 'Start typing relationships to render nodes.'
    });
  }

  return { nodes, edges };
};
