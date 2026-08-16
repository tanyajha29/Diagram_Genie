import type { Node, Edge } from '@xyflow/react';
import type { UDMNode, UDMEdge } from './parser';

/**
 * Utility to wrap text to a maximum line length in characters.
 */
function wrapTextBackend(text: string, maxCharsPerLine: number): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Assigns x, y coordinates and groups to nodes based on their diagram format.
 */
export const layoutUniversalDiagram = (
  rawNodes: UDMNode[],
  rawEdges: UDMEdge[],
  type: string
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const category = (type || 'architecture').toLowerCase();

  // Cast to any[] to bypass strict typescript definitions on UDMNode
  const rawNodesAny = rawNodes as any[];

  // Setup basic React Flow Edges with category-aware default routing
  let defaultEdgeType = 'smoothstep';
  if (category.includes('mind') || category.includes('tree')) {
    defaultEdgeType = 'default';
  } else if (category.includes('db') || category.includes('sql') || category.includes('er')) {
    defaultEdgeType = 'straight';
  }

  rawEdges.forEach((edge) => {
    const type = edge.type || defaultEdgeType;
    
    let markerType = 'arrowclosed';
    let edgeType = type;
    let animated = edge.animated ?? true;

    if (type === 'inheritance') {
      markerType = 'uml-inheritance';
      edgeType = 'straight';
      animated = false;
    } else if (type === 'aggregation') {
      markerType = 'uml-aggregation';
      edgeType = 'straight';
      animated = false;
    } else if (type === 'composition') {
      markerType = 'uml-composition';
      edgeType = 'straight';
      animated = false;
    } else if (type === 'dependency') {
      markerType = 'arrowclosed';
      edgeType = 'dashed';
      animated = true;
    } else if (type === 'association') {
      markerType = 'arrowclosed';
      edgeType = 'straight';
      animated = false;
    }

    edges.push({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated,
      type: edgeType,
      markerEnd: {
        type: markerType as any,
        width: 15,
        height: 15,
        color: '#64748b',
      },
    });
  });

  const padding = 60;
  const spacingX = 240;
  const spacingY = 160;

  if (category.includes('sequence')) {
    // ----------------------------------------------------
    // SEQUENCE DIAGRAM LAYOUT
    // ----------------------------------------------------
    const actorNodes = rawNodesAny.filter(n => n.type === 'sequence');
    const actorSpacing = 280;

    actorNodes.forEach((actor, idx) => {
      nodes.push({
        id: actor.id,
        type: 'sequenceActor',
        position: { x: idx * actorSpacing + 50, y: 30 },
        data: { label: actor.label }
      });
    });

    const messageEdges = rawEdges.filter(e => e.id.startsWith('e-seq-'));
    messageEdges.forEach((msg, idx) => {
      const sourceActorIdx = actorNodes.findIndex(a => a.id === msg.source);
      const targetActorIdx = actorNodes.findIndex(a => a.id === msg.target);
      const sourceX = sourceActorIdx * actorSpacing + 50 + 120;
      const targetX = targetActorIdx * actorSpacing + 50 + 120;
      const x = Math.min(sourceX, targetX) + Math.abs(sourceX - targetX) / 2;
      const y = (idx + 1) * 90 + 100;

      nodes.push({
        id: `msg-node-${idx}`,
        type: 'sequenceMessage',
        position: { x: x - 90, y },
        data: { 
          label: msg.label || 'Message', 
          isReturn: msg.type === 'dashed',
          direction: targetX > sourceX ? 'right' : 'left'
        }
      });
    });
  } 
  
  else if (category.includes('mindmap') || category.includes('tree')) {
    // ----------------------------------------------------
    // MIND MAP RADIAL/TREE LAYOUT
    // ----------------------------------------------------
    if (rawNodesAny.length > 0) {
      let root = rawNodesAny.find(n => !n.parentId && !rawEdges.some(e => e.target === n.id));
      if (!root) root = rawNodesAny[0];
      const rootX = 600;
      const rootY = 400;

      nodes.push({
        id: root.id,
        type: 'mindmap',
        position: { x: rootX, y: rootY },
        width: 180,
        height: 60,
        style: { width: 180, height: 60 },
        data: { label: root.label, type: 'mindmap' }
      });

      const getChildren = (parentId: string): string[] => {
        return rawEdges.filter(e => e.source === parentId).map(e => e.target);
      };

      const rootChildren = getChildren(root.id);
      
      rootChildren.forEach((childId, idx) => {
        const childNode = rawNodesAny.find(n => n.id === childId);
        if (!childNode) return;

        const isRight = idx % 2 === 0;
        const direction = isRight ? 1 : -1; 
        const x = rootX + direction * 280;
        const y = rootY + (Math.floor(idx / 2) - (rootChildren.length - 1) / 4) * 160;

        nodes.push({
          id: childId,
          type: 'mindmap',
          position: { x, y },
          width: 160,
          height: 50,
          style: { width: 160, height: 50 },
          data: { label: childNode.label, type: 'mindmap' }
        });

        const subChildren = getChildren(childId);
        subChildren.forEach((subId, sIdx) => {
          const subNode = rawNodesAny.find(n => n.id === subId);
          if (!subNode) return;

          const sx = x + direction * 240;
          const sy = y + (sIdx - (subChildren.length - 1) / 2) * 80;

          nodes.push({
            id: subId,
            type: 'mindmap',
            position: { x: sx, y: sy },
            width: 140,
            height: 44,
            style: { width: 140, height: 44 },
            data: { label: subNode.label, type: 'mindmap' }
          });
        });
      });

      rawNodesAny.forEach(n => {
        if (!nodes.some(fn => fn.id === n.id)) {
          nodes.push({
            id: n.id,
            type: 'mindmap',
            position: { x: rootX, y: rootY + 300 },
            width: 140,
            height: 44,
            style: { width: 140, height: 44 },
            data: { label: n.label, type: 'mindmap' }
          });
        }
      });
    }
  } 
  
  else if (category.includes('db') || category.includes('sql') || category.includes('er') || category.includes('database')) {
    // ----------------------------------------------------
    // DATABASE / ER GRID OVERLAP-FREE LAYOUT
    // ----------------------------------------------------
    const getDatabaseNodeDimensions = (n: any) => {
      const label = n.label || '';
      const columns = n.columns || n.data?.columns || [];
      const properties = n.properties || n.data?.properties || {};

      let colsList = columns;
      if (colsList.length === 0 && properties && typeof properties === 'object' && !Array.isArray(properties)) {
        colsList = Object.entries(properties).map(([name, type]) => ({
          name,
          type: String(type),
          isPrimaryKey: name.toLowerCase() === 'id' || name.toLowerCase().endsWith('_id'),
          isForeignKey: false
        }));
      }

      let maxColWidth = 0;
      colsList.forEach((col: any) => {
        const isPk = col.primaryKey || col.isPrimaryKey;
        const isFk = col.foreignKey || col.isForeignKey;
        const isUniq = col.unique || col.isUnique;
        const isNull = col.nullable;
        const defVal = col.default;

        const pkFkLen = (isPk ? 3 : 0) + (isFk ? 3 : 0) + (isUniq ? 3 : 0);
        const nameLen = (col.name || '').length;
        const typeLen = `${col.type || 'VARCHAR'}${isNull ? ' NULL' : ''}${defVal !== undefined ? ' =' + defVal : ''}`.length;
        const required = (pkFkLen + nameLen + typeLen + 3) * 7.5 + 32;
        if (required > maxColWidth) maxColWidth = required;
      });

      const headerTextWidth = (label.length + 5) * 8 + 32;
      const width = Math.max(256, headerTextWidth, maxColWidth);

      const headerHeight = 40;
      const rowHeight = 22;
      const paddingVal = 24;
      const height = Math.max(76, headerHeight + colsList.length * rowHeight + paddingVal);

      return { width, height, columns: colsList };
    };

    const colsCount = Math.min(Math.ceil(Math.sqrt(rawNodesAny.length)), 3);
    const colMaxWidths: number[] = [];
    const rowMaxHeights: number[] = [];

    const sizedNodes = rawNodesAny.map(node => {
      const dims = getDatabaseNodeDimensions(node);
      return { node, dims };
    });

    sizedNodes.forEach(({ dims }, index) => {
      const row = Math.floor(index / colsCount);
      const col = index % colsCount;
      colMaxWidths[col] = Math.max(colMaxWidths[col] || 0, dims.width);
      rowMaxHeights[row] = Math.max(rowMaxHeights[row] || 0, dims.height);
    });

    sizedNodes.forEach(({ node, dims }, index) => {
      const row = Math.floor(index / colsCount);
      const col = index % colsCount;

      let xOffset = 100;
      for (let c = 0; c < col; c++) {
        xOffset += colMaxWidths[c] + 120;
      }

      let yOffset = 100;
      for (let r = 0; r < row; r++) {
        yOffset += rowMaxHeights[r] + 100;
      }

      nodes.push({
        id: node.id,
        type: 'database-table',
        position: { x: xOffset, y: yOffset },
        width: dims.width,
        height: dims.height,
        style: { width: dims.width, height: dims.height },
        data: {
          label: node.label,
          type: 'database-table',
          columns: dims.columns,
          properties: node.properties
        }
      });
    });
  } 

  else if (category.includes('uml')) {
    // ----------------------------------------------------
    // UML CLASS HIERARCHICAL LAYOUT
    // ----------------------------------------------------
    const getUMLNodeDimensions = (n: any) => {
      const label = n.label || '';
      const isInterface = n.type === 'interface';
      const properties = n.properties || {};
      const methods = n.methods || [];

      let maxTextLen = label.length + (isInterface ? 14 : 0);
      Object.entries(properties).forEach(([name, type]) => {
        const len = name.length + String(type).length + 6;
        if (len > maxTextLen) maxTextLen = len;
      });
      methods.forEach((m: any) => {
        const sig = typeof m === 'string' ? m : `${m.visibility || '+'}${m.name || ''}()${m.returnType ? ': ' + m.returnType : ''}`;
        if (sig.length > maxTextLen) maxTextLen = sig.length;
      });

      const charWidth = 7;
      const paddingVal = 32;
      const width = Math.max(200, maxTextLen * charWidth + paddingVal);

      const headerHeight = 36;
      const rowHeight = 18;
      const compartmentDividerHeight = 10;
      const height = headerHeight + (Object.keys(properties).length * rowHeight) + (methods.length * rowHeight) + compartmentDividerHeight + 16;
      return { width, height };
    };

    const ranks = new Map<string, number>();
    rawNodesAny.forEach(n => ranks.set(n.id, 0));

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 15) {
      changed = false;
      iterations++;
      rawEdges.forEach(edge => {
        const sourceRank = ranks.get(edge.source) || 0;
        const targetRank = ranks.get(edge.target) || 0;
        if (targetRank <= sourceRank) {
          ranks.set(edge.target, sourceRank + 1);
          changed = true;
        }
      });
    }

    const rankGroups = new Map<number, string[]>();
    ranks.forEach((rank, nodeId) => {
      if (!rankGroups.has(rank)) rankGroups.set(rank, []);
      rankGroups.get(rank)!.push(nodeId);
    });

    let currentY = 100;
    const horizontalGap = 80;

    rankGroups.forEach((nodeIds, _rank) => {
      const totalWidth = nodeIds.reduce((acc, nodeId, idx) => {
        const node = rawNodesAny.find(n => n.id === nodeId);
        if (!node) return acc;
        const dims = getUMLNodeDimensions(node);
        return acc + dims.width + (idx < nodeIds.length - 1 ? horizontalGap : 0);
      }, 0);

      const startX = 400 - totalWidth / 2;
      let maxH = 60;

      nodeIds.forEach((nodeId, idx) => {
        const node = rawNodesAny.find(n => n.id === nodeId);
        if (node) {
          const dims = getUMLNodeDimensions(node);
          maxH = Math.max(maxH, dims.height);
          
          nodes.push({
            id: node.id,
            type: node.type || 'class',
            position: {
              x: startX + idx * (dims.width + horizontalGap),
              y: currentY
            },
            width: dims.width,
            height: dims.height,
            style: { width: dims.width, height: dims.height },
            data: {
              label: node.label,
              type: node.type || 'class',
              properties: node.properties || {},
              methods: node.methods || []
            }
          });
        }
      });

      currentY += maxH + 120;
    });
  }

  else if (category.includes('cloud')) {
    // ----------------------------------------------------
    // CLOUD RECURSIVE CONTAINMENT LAYOUT
    // ----------------------------------------------------
    const containers = rawNodesAny.filter(n => n.type === 'container' || n.type === 'group' || n.label.toLowerCase() === 'vpc' || n.label.toLowerCase().includes('subnet'));
    containers.forEach(c => { c.type = 'container'; });

    const resources = rawNodesAny.filter(n => !containers.some(c => c.id === n.id));

    const vpc = containers.find(c => c.id === 'vpc' || c.label.toLowerCase() === 'vpc');
    const publicSubnet = containers.find(c => c.id === 'public_subnet' || c.label.toLowerCase().includes('public'));
    const privateSubnet = containers.find(c => c.id === 'private_subnet' || c.label.toLowerCase().includes('private'));

    resources.forEach(node => {
      if (!node.parentId) {
        const label = node.label.toLowerCase();
        const type = (node.type || '').toLowerCase();
        
        if (label.includes('internet gateway') || label.includes('igw') || label.includes('client') || label.includes('user')) {
          if (vpc) node.parentId = vpc.id;
        } else if (
          label.includes('public') || 
          label.includes('load balancer') || 
          label.includes('elb') || 
          label.includes('alb') || 
          label.includes('web') || 
          label.includes('nginx') || 
          type === 'frontend'
        ) {
          if (publicSubnet) node.parentId = publicSubnet.id;
          else if (vpc) node.parentId = vpc.id;
        } else {
          if (privateSubnet) node.parentId = privateSubnet.id;
          else if (vpc) node.parentId = vpc.id;
        }
      }
    });

    containers.forEach(c => {
      if (c.id !== 'vpc' && c.label.toLowerCase() !== 'vpc' && vpc) {
        if (!c.parentId) c.parentId = vpc.id;
      }
    });

    const layoutContainer = (container: any) => {
      const children = rawNodesAny.filter(n => n.parentId === container.id);
      if (children.length === 0) {
        container.width = 300;
        container.height = 200;
        return;
      }

      children.forEach(child => {
        if (containers.some(c => c.id === child.id)) {
          layoutContainer(child);
        } else {
          child.width = child.width || (child.type === 'database' || child.label.toLowerCase().includes('database') ? 256 : 208);
          child.height = child.height || (child.type === 'database' || child.label.toLowerCase().includes('database') ? 140 : 76);
        }
      });

      const isSubnet = container.label.toLowerCase().includes('subnet');
      const isVpc = container.label.toLowerCase() === 'vpc' || container.id === 'vpc';

      if (isSubnet) {
        let currentX = padding;
        let maxHeight = 0;
        children.forEach(child => {
          child.position = { x: currentX, y: padding + 20 };
          currentX += (child.width || 208) + 60;
          maxHeight = Math.max(maxHeight, child.height || 76);
        });
        container.width = Math.max(300, currentX + padding - 60);
        container.height = maxHeight + padding * 2 + 20;
      } else if (isVpc) {
        const directVpcChildren = children.filter(c => !containers.some(parent => parent.id === c.id));
        const subnetChildren = children.filter(c => containers.some(parent => parent.id === c.id));

        let currentY = padding + 30;
        let maxW = 300;

        directVpcChildren.forEach(child => {
          maxW = Math.max(maxW, child.width || 208);
          child.position = {
            x: padding + 20,
            y: currentY
          };
          currentY += (child.height || 76) + 40;
        });

        subnetChildren.forEach(child => {
          maxW = Math.max(maxW, child.width || 300);
          child.position = {
            x: padding,
            y: currentY
          };
          currentY += (child.height || 200) + 40;
        });

        subnetChildren.forEach(child => {
          child.width = maxW;
        });

        container.width = maxW + padding * 2;
        container.height = currentY + padding - 20;
      } else {
        const cols = Math.min(Math.ceil(Math.sqrt(children.length)), 3);
        let currentX = padding;
        let currentY = padding + 20;
        let rowMaxH = 0;
        let maxW = 200;

        children.forEach((child, idx) => {
          const col = idx % cols;
          if (col === 0 && idx > 0) {
            currentX = padding;
            currentY += rowMaxH + 40;
            rowMaxH = 0;
          }
          child.position = { x: currentX, y: currentY };
          currentX += (child.width || 208) + 40;
          rowMaxH = Math.max(rowMaxH, child.height || 76);
          maxW = Math.max(maxW, currentX);
        });

        container.width = maxW + padding;
        container.height = currentY + rowMaxH + padding;
      }
    };

    const rootContainers = containers.filter(c => !c.parentId);
    let startX = 100;
    rootContainers.forEach(container => {
      layoutContainer(container);
      container.position = { x: startX, y: 100 };
      startX += (container.width || 400) + 120;
    });

    let externalY = 100;
    resources.forEach(node => {
      if (!node.parentId) {
        node.width = node.width || 208;
        node.height = node.height || 76;
        node.position = {
          x: startX,
          y: externalY
        };
        externalY += node.height + 60;
      }
    });

    // Push containers first (so they sit in the background of resources)
    containers.forEach(c => {
      nodes.push({
        id: c.id,
        type: 'container',
        position: c.position,
        width: c.width,
        height: c.height,
        style: { width: c.width, height: c.height },
        parentId: c.parentId,
        data: { 
          label: c.label,
          width: c.width,
          height: c.height
        }
      });
    });

    resources.forEach(r => {
      let nodeType = 'cloud';
      const rawType = (r.type || '').toLowerCase();
      if (rawType === 'frontend') nodeType = 'frontend';
      if (rawType === 'backend') nodeType = 'backend';
      if (rawType === 'database') nodeType = 'database';
      if (rawType === 'queue') nodeType = 'queue';

      nodes.push({
        id: r.id,
        type: nodeType,
        position: r.position,
        width: r.width,
        height: r.height,
        parentId: r.parentId,
        data: {
          label: r.label,
          type: r.type || nodeType,
          properties: r.properties,
          width: r.width,
          height: r.height
        }
      });
    });
  } 

  else if (category.includes('aiml') || category.includes('pipeline')) {
    // ----------------------------------------------------
    // AI/ML DYNAMIC WRAPPING PIPELINE LAYOUT
    // ----------------------------------------------------
    if (rawNodesAny.length <= 5) {
      // Small pipeline -> layout horizontally
      const ranks = new Map<string, number>();
      rawNodesAny.forEach(n => ranks.set(n.id, 0));

      let changed = true;
      let iterations = 0;
      while (changed && iterations < 15) {
        changed = false;
        iterations++;
        rawEdges.forEach(edge => {
          const sourceRank = ranks.get(edge.source) || 0;
          const targetRank = ranks.get(edge.target) || 0;
          if (targetRank <= sourceRank) {
            ranks.set(edge.target, sourceRank + 1);
            changed = true;
          }
        });
      }

      const rankGroups = new Map<number, string[]>();
      ranks.forEach((rank, nodeId) => {
        if (!rankGroups.has(rank)) rankGroups.set(rank, []);
        rankGroups.get(rank)!.push(nodeId);
      });

      let currentX = 100;
      const verticalGap = spacingY - 40;

      rankGroups.forEach((nodeIds, _rank) => {
        const totalHeight = nodeIds.reduce((acc, nodeId) => {
          const node = rawNodesAny.find(n => n.id === nodeId);
          if (!node) return acc;
          const h = (node.type === 'database' || node.label.toLowerCase().includes('database')) ? 140 : 76;
          return acc + h + verticalGap;
        }, 0);

        const startY = 250 - totalHeight / 2;
        let maxW = 208;
        let currentY = startY;

        nodeIds.forEach((nodeId) => {
          const node = rawNodesAny.find(n => n.id === nodeId);
          if (node) {
            const isDb = node.type === 'database' || node.label.toLowerCase().includes('database');
            const w = isDb ? 256 : Math.max(176, node.label.length * 7.5 + 32);
            const h = isDb ? 140 : 76;
            maxW = Math.max(maxW, w);
            
            nodes.push({
              id: node.id,
              type: node.type || 'default',
              position: { x: currentX, y: currentY },
              width: w,
              height: h,
              style: { width: w, height: h },
              data: {
                label: node.label,
                type: node.type || 'default',
                properties: node.properties,
                width: w,
                height: h
              }
            });
            currentY += h + verticalGap;
          }
        });
        currentX += maxW + 140;
      });
    } else {
      // Large pipeline -> layout wrapped in grid
      const ranks = new Map<string, number>();
      rawNodesAny.forEach(n => ranks.set(n.id, 0));

      let changed = true;
      let iterations = 0;
      while (changed && iterations < 15) {
        changed = false;
        iterations++;
        rawEdges.forEach(edge => {
          const sourceRank = ranks.get(edge.source) || 0;
          const targetRank = ranks.get(edge.target) || 0;
          if (targetRank <= sourceRank) {
            ranks.set(edge.target, sourceRank + 1);
            changed = true;
          }
        });
      }

      const sortedNodes = [...rawNodesAny].sort((a, b) => (ranks.get(a.id) || 0) - (ranks.get(b.id) || 0));
      const cols = 4;
      const gapX = 140;
      const gapY = 120;

      sortedNodes.forEach((node, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const w = 208;
        const h = 76;

        nodes.push({
          id: node.id,
          type: node.type || 'default',
          position: {
            x: 100 + col * (w + gapX),
            y: 100 + row * (h + gapY)
          },
          width: w,
          height: h,
          style: { width: w, height: h },
          data: {
            label: node.label,
            type: node.type || 'default',
            properties: node.properties,
            width: w,
            height: h
          }
        });
      });
    }
  }

  else if (category.includes('api')) {
    // ----------------------------------------------------
    // API GATEWAY HORIZONTAL TOPOLOGICAL LAYOUT
    // ----------------------------------------------------
    const ranks = new Map<string, number>();
    rawNodesAny.forEach(n => ranks.set(n.id, 0));

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 15) {
      changed = false;
      iterations++;
      rawEdges.forEach(edge => {
        const sourceRank = ranks.get(edge.source) || 0;
        const targetRank = ranks.get(edge.target) || 0;
        if (targetRank <= sourceRank) {
          ranks.set(edge.target, sourceRank + 1);
          changed = true;
        }
      });
    }

    const rankGroups = new Map<number, string[]>();
    ranks.forEach((rank, nodeId) => {
      if (!rankGroups.has(rank)) rankGroups.set(rank, []);
      rankGroups.get(rank)!.push(nodeId);
    });

    let currentX = 100;
    const verticalGap = spacingY - 40;

    rankGroups.forEach((nodeIds, _rank) => {
      const totalHeight = nodeIds.reduce((acc, nodeId) => {
        const node = rawNodesAny.find(n => n.id === nodeId);
        if (!node) return acc;
        const h = (node.type === 'database' || node.label.toLowerCase().includes('database')) ? 140 : 76;
        return acc + h + verticalGap;
      }, 0);

      const startY = 250 - totalHeight / 2;
      let maxW = 208;
      let currentY = startY;

      nodeIds.forEach((nodeId) => {
        const node = rawNodesAny.find(n => n.id === nodeId);
        if (node) {
          const isDb = node.type === 'database' || node.label.toLowerCase().includes('database');
          const w = isDb ? 256 : Math.max(176, node.label.length * 7.5 + 32);
          const h = isDb ? 140 : 76;
          maxW = Math.max(maxW, w);
          
          nodes.push({
            id: node.id,
            type: node.type || 'default',
            position: { x: currentX, y: currentY },
            width: w,
            height: h,
            style: { width: w, height: h },
            data: {
              label: node.label,
              type: node.type || 'default',
              properties: node.properties,
              width: w,
              height: h
            }
          });
          currentY += h + verticalGap;
        }
      });
      currentX += maxW + 140;
    });
  } 

  else if (category.includes('flowchart') || category.includes('flow')) {
    // ----------------------------------------------------
    // FLOWCHART DYNAMIC SIZING LAYOUT
    // ----------------------------------------------------
    const getFlowchartNodeDimensions = (n: any) => {
      const label = n.label || '';
      const type = (n.type || '').toLowerCase();

      const isDecision = type === 'decision' || label.includes('?') || label.toLowerCase().includes('decision');
      const isTerminal = type === 'terminal' || label.toLowerCase() === 'start' || label.toLowerCase() === 'end' || label.toLowerCase() === 'exit' || label.toLowerCase() === 'stop';
      const isDatabase = type === 'database' || type === 'database-cylinder' || label.toLowerCase().includes('database') || label.toLowerCase().includes(' store') || label.toLowerCase() === 'db';
      const isInputOutput = type === 'input-output' || type === 'parallelogram' || label.toLowerCase().includes('input') || label.toLowerCase().includes('output') || label.toLowerCase().includes('read') || label.toLowerCase().includes('write');
      const isDocument = type === 'document' || label.toLowerCase().includes('doc') || label.toLowerCase().includes('report') || label.toLowerCase().includes('pdf');

      if (isDecision) {
        const lines = wrapTextBackend(label, 14);
        const width = Math.max(144, lines.length * 28);
        return { width, height: width, nodeType: 'decision' };
      }
      if (isTerminal) {
        const lines = wrapTextBackend(label, 16);
        const height = Math.max(44, 20 + lines.length * 16);
        const maxLineLen = Math.max(...lines.map(l => l.length), 5);
        const width = Math.max(144, 32 + maxLineLen * 7.5);
        return { width, height, nodeType: 'terminal' };
      }
      if (isDatabase) {
        return { width: 144, height: 96, nodeType: 'database-cylinder' };
      }
      if (isInputOutput) {
        return { width: 176, height: 60, nodeType: 'input-output' };
      }
      if (isDocument) {
        return { width: 160, height: 72, nodeType: 'document' };
      }

      const lines = wrapTextBackend(label, 20);
      const height = Math.max(52, 24 + lines.length * 16);
      const maxLineLen = Math.max(...lines.map(l => l.length), 5);
      const width = Math.max(144, 32 + maxLineLen * 7.5);
      return { width, height, nodeType: 'process' };
    };

    const ranks = new Map<string, number>();
    rawNodesAny.forEach(n => ranks.set(n.id, 0));

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 15) {
      changed = false;
      iterations++;
      rawEdges.forEach(edge => {
        const sourceRank = ranks.get(edge.source) || 0;
        const targetRank = ranks.get(edge.target) || 0;
        if (targetRank <= sourceRank) {
          ranks.set(edge.target, sourceRank + 1);
          changed = true;
        }
      });
    }

    const rankGroups = new Map<number, string[]>();
    ranks.forEach((rank, nodeId) => {
      if (!rankGroups.has(rank)) rankGroups.set(rank, []);
      rankGroups.get(rank)!.push(nodeId);
    });

    let currentY = 100;
    const horizontalGap = 80;

    rankGroups.forEach((nodeIds, _rank) => {
      const totalWidth = nodeIds.reduce((acc, nodeId, idx) => {
        const node = rawNodesAny.find(n => n.id === nodeId);
        if (!node) return acc;
        const dims = getFlowchartNodeDimensions(node);
        return acc + dims.width + (idx < nodeIds.length - 1 ? horizontalGap : 0);
      }, 0);

      const startX = 400 - totalWidth / 2;
      let maxH = 60;

      nodeIds.forEach((nodeId, idx) => {
        const node = rawNodesAny.find(n => n.id === nodeId);
        if (node) {
          const dims = getFlowchartNodeDimensions(node);
          maxH = Math.max(maxH, dims.height);
          
          nodes.push({
            id: node.id,
            type: dims.nodeType,
            position: {
              x: startX + idx * (dims.width + horizontalGap),
              y: currentY
            },
            width: dims.width,
            height: dims.height,
            style: { width: dims.width, height: dims.height },
            data: {
              label: node.label,
              type: dims.nodeType
            }
          });
        }
      });

      currentY += maxH + 120;
    });
  } 

  else {
    // ----------------------------------------------------
    // SEMANTIC ARCHITECTURE LAYERED LAYOUT WITH GROUPS
    // ----------------------------------------------------
    const layers = {
      presentation: [] as any[],
      application: [] as any[],
      business: [] as any[],
      data: [] as any[],
      external: [] as any[]
    };

    rawNodesAny.forEach(node => {
      const type = (node.type || '').toLowerCase();
      const label = node.label.toLowerCase();

      if (
        type === 'external' || 
        label.includes('external') || 
        label.includes('stripe') || 
        label.includes('sendgrid') || 
        label.includes('mail') || 
        label.includes('payment gateway') ||
        label.includes('email') || 
        label.includes('analytics') || 
        label.includes('logging') || 
        label.includes('monitoring') || 
        label.includes('prometheus') || 
        label.includes('sentry')
      ) {
        layers.external.push(node);
      } else if (
        type === 'frontend' || 
        label.includes('client') || 
        label.includes('web') || 
        label.includes('ui') || 
        label.includes('mobile') || 
        label.includes('frontend') ||
        label.includes('interface')
      ) {
        layers.presentation.push(node);
      } else if (
        type === 'gateway' || 
        label.includes('gateway') || 
        label.includes('proxy') || 
        label.includes('balancer') || 
        label.includes('load balancer')
      ) {
        layers.application.push(node);
      } else if (
        type === 'database' || 
        type === 'table' || 
        label.includes('db') || 
        label.includes('database') || 
        label.includes('postgres') || 
        label.includes('redis') || 
        label.includes('sql') || 
        label.includes('mongo') ||
        label.includes('cache')
      ) {
        layers.data.push(node);
      } else {
        layers.business.push(node);
      }
    });

    const absolutePositions = new Map<string, { x: number; y: number }>();
    const layerY = {
      presentation: 100,
      application: 100 + spacingY,
      business: 100 + spacingY * 2,
      data: 100 + spacingY * 3
    };

    const getNodeWidth = (n: any) => (n.type === 'database' || n.label.toLowerCase().includes('database') ? 256 : 208);
    const getNodeHeight = (n: any) => (n.type === 'database' || n.label.toLowerCase().includes('database') ? 140 : 76);

    const primaryKeys: Array<'presentation' | 'application' | 'business' | 'data'> = [
      'presentation',
      'application',
      'business',
      'data'
    ];

    primaryKeys.forEach((key, layerIdx) => {
      const layerNodes = layers[key];
      if (layerNodes.length === 0) return;

      if (layerIdx > 0) {
        layerNodes.sort((a, b) => {
          const getAverageConnectedX = (node: any) => {
            const connected = rawEdges.filter(e => e.source === node.id || e.target === node.id);
            if (connected.length === 0) return 0;
            let sumX = 0;
            let count = 0;
            connected.forEach(e => {
              const neighborId = e.source === node.id ? e.target : e.source;
              const pos = absolutePositions.get(neighborId);
              if (pos) {
                sumX += pos.x;
                count++;
              }
            });
            return count > 0 ? sumX / count : 0;
          };
          return getAverageConnectedX(a) - getAverageConnectedX(b);
        });
      }

      const totalWidth = layerNodes.reduce((acc, n, idx) => acc + getNodeWidth(n) + (idx < layerNodes.length - 1 ? spacingX - 100 : 0), 0);
      const startX = 200 - totalWidth / 2;

      let currentX = startX;
      layerNodes.forEach((node) => {
        const x = currentX;
        const y = layerY[key];
        absolutePositions.set(node.id, { x, y });
        currentX += getNodeWidth(node) + (spacingX - 100);
      });
    });

    let maxLayersRight = 500;
    primaryKeys.forEach(key => {
      layers[key].forEach(node => {
        const pos = absolutePositions.get(node.id);
        if (pos) {
          const r = pos.x + getNodeWidth(node);
          if (r > maxLayersRight) {
            maxLayersRight = r;
          }
        }
      });
    });

    const externalStartX = maxLayersRight + spacingX - 50;
    let currentExternalY = 100;
    layers.external.forEach((node) => {
      absolutePositions.set(node.id, { x: externalStartX + padding, y: currentExternalY + padding });
      currentExternalY += getNodeHeight(node) + 40;
    });

    const groupTypes: Array<{ key: 'presentation' | 'application' | 'business' | 'data'; label: string; id: string }> = [
      { key: 'presentation', label: 'Presentation Layer', id: 'group_presentation' },
      { key: 'application', label: 'Application Layer', id: 'group_application' },
      { key: 'business', label: 'Business Logic Layer', id: 'group_business' },
      { key: 'data', label: 'Data Storage Layer', id: 'group_data' }
    ];

    groupTypes.forEach(g => {
      const layerNodes = layers[g.key] as any[];
      if (layerNodes.length === 0) return;

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      layerNodes.forEach(node => {
        const pos = absolutePositions.get(node.id) || { x: 100, y: 100 };
        const w = getNodeWidth(node);
        const h = getNodeHeight(node);
        if (pos.x < minX) minX = pos.x;
        if (pos.y < minY) minY = pos.y;
        if (pos.x + w > maxX) maxX = pos.x + w;
        if (pos.y + h > maxY) maxY = pos.y + h;
      });

      const groupWidth = maxX - minX + padding * 2;
      const groupHeight = maxY - minY + padding * 2;
      const groupX = minX - padding;
      const groupY = minY - padding;

      nodes.push({
        id: g.id,
        type: 'group',
        position: { x: groupX, y: groupY },
        data: { label: g.label },
        width: groupWidth,
        height: groupHeight,
        style: { width: groupWidth, height: groupHeight }
      });

      layerNodes.forEach(node => {
        const absPos = absolutePositions.get(node.id) || { x: 100, y: 100 };
        const rawType = (node.type as string || '').toLowerCase();
        let nodeType = 'architecture';
        if (rawType === 'frontend') nodeType = 'frontend';
        if (rawType === 'backend') nodeType = 'backend';
        if (rawType === 'database') nodeType = 'database';
        if (rawType === 'queue') nodeType = 'queue';

        nodes.push({
          id: node.id,
          type: nodeType,
          parentId: g.id,
          position: {
            x: absPos.x - groupX,
            y: absPos.y - groupY
          },
          data: {
            label: node.label,
            type: node.type || nodeType,
            description: node.description,
            properties: node.properties
          }
        });
      });
    });

    if (layers.external.length > 0) {
      const groupWidth = 208 + padding * 2 + 20;
      const groupHeight = currentExternalY + padding;
      const groupX = externalStartX;
      const groupY = 100 - padding;

      nodes.push({
        id: 'group_external',
        type: 'group',
        position: { x: groupX, y: groupY },
        data: { label: 'External Services' },
        width: groupWidth,
        height: groupHeight,
        style: { width: groupWidth, height: groupHeight }
      });

      layers.external.forEach(node => {
        const absPos = absolutePositions.get(node.id) || { x: 100, y: 100 };
        let nodeType = 'external';

        nodes.push({
          id: node.id,
          type: nodeType,
          parentId: 'group_external',
          position: {
            x: absPos.x - groupX,
            y: absPos.y - groupY
          },
          data: {
            label: node.label,
            type: node.type || nodeType,
            description: node.description,
            properties: node.properties
          }
        });
      });
    }
  }

  // Prevent Node Overlaps pass
  const thresholdX = 160;
  const thresholdY = 60;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i];
      const nodeB = nodes[j];
      if (nodeA.type === 'group' || nodeB.type === 'group') continue;
      if (nodeA.parentId !== nodeB.parentId) continue;

      const dx = Math.abs(nodeA.position.x - nodeB.position.x);
      const dy = Math.abs(nodeA.position.y - nodeB.position.y);

      if (dx < thresholdX && dy < thresholdY) {
        if (dx < thresholdX) {
          nodeB.position.x += spacingX - dx;
        } else {
          nodeB.position.y += spacingY - dy;
        }
      }
    }
  }

  return { nodes, edges };
};
