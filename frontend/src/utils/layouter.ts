import type { Node, Edge } from '@xyflow/react';
import type { UDMNode, UDMEdge } from './parser';

/**
 * Assigns x, y coordinates to nodes based on their diagram format
 */
export const layoutUniversalDiagram = (
  rawNodes: UDMNode[],
  rawEdges: UDMEdge[],
  type: string
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Setup basic React Flow Edge maps
  rawEdges.forEach((edge) => {
    edges.push({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: edge.animated ?? true,
      style: edge.type === 'dashed' ? { strokeDasharray: '5,5' } : {},
      type: 'smoothstep'
    });
  });

  if (type === 'sequence') {
    // ----------------------------------------------------
    // SEQUENCE DIAGRAM LAYOUT
    // ----------------------------------------------------
    // Actors are placed horizontally in the top row.
    // Lifelines extend vertically.
    // Messages are laid out vertically down the page.
    const actorNodes = rawNodes.filter(n => n.type === 'sequence');
    const actorSpacing = 280;

    // Lay out Actors
    actorNodes.forEach((actor, idx) => {
      nodes.push({
        id: actor.id,
        type: 'sequenceActor',
        position: { x: idx * actorSpacing + 50, y: 30 },
        data: { label: actor.label }
      });
    });

    // Create message nodes to represent steps down the timeline
    const messageEdges = rawEdges.filter(e => e.id.startsWith('e-seq-'));
    messageEdges.forEach((msg, idx) => {
      const sourceActorIdx = actorNodes.findIndex(a => a.id === msg.source);
      const targetActorIdx = actorNodes.findIndex(a => a.id === msg.target);

      const sourceX = sourceActorIdx * actorSpacing + 50 + 120; // center of actor
      const targetX = targetActorIdx * actorSpacing + 50 + 120;
      
      const x = Math.min(sourceX, targetX) + Math.abs(sourceX - targetX) / 2;
      const y = (idx + 1) * 90 + 100;

      // Add a helper message node on the canvas
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
  
  else if (type === 'mindmap') {
    // ----------------------------------------------------
    // MIND MAP LAYOUT (Hierarchical tree branching)
    // ----------------------------------------------------
    // First node is central node. Direct children branch left/right.
    if (rawNodes.length > 0) {
      const root = rawNodes[0];
      const rootX = 400;
      const rootY = 300;

      nodes.push({
        id: root.id,
        type: 'mindmap',
        position: { x: rootX, y: rootY },
        data: { label: root.label }
      });

      // Find children
      const getChildren = (parentId: string): string[] => {
        return rawEdges.filter(e => e.source === parentId).map(e => e.target);
      };

      const rootChildren = getChildren(root.id);
      
      rootChildren.forEach((childId, idx) => {
        const childNode = rawNodes.find(n => n.id === childId);
        if (!childNode) return;

        // Distribute left vs right
        const direction = idx % 2 === 0 ? 1 : -1; 
        const x = rootX + direction * 280;
        const y = rootY + (Math.floor(idx / 2) - (rootChildren.length - 1) / 4) * 160;

        nodes.push({
          id: childId,
          type: 'mindmap',
          position: { x, y },
          data: { label: childNode.label }
        });

        // Child node level 2
        const subChildren = getChildren(childId);
        subChildren.forEach((subId, sIdx) => {
          const subNode = rawNodes.find(n => n.id === subId);
          if (!subNode) return;

          const sx = x + direction * 240;
          const sy = y + (sIdx - (subChildren.length - 1) / 2) * 80;

          nodes.push({
            id: subId,
            type: 'mindmap',
            position: { x: sx, y: sy },
            data: { label: subNode.label }
          });
        });
      });
    }
  } 
  
  else if (type === 'er') {
    // ----------------------------------------------------
    // ER DATABASE LAYOUT (Grid arrangement)
    // ----------------------------------------------------
    const cols = Math.min(Math.ceil(Math.sqrt(rawNodes.length)), 3);
    const colWidth = 320;
    const rowHeight = 240;

    rawNodes.forEach((node, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      nodes.push({
        id: node.id,
        type: 'database',
        position: { x: c * colWidth + 50, y: r * rowHeight + 50 },
        data: { 
          label: node.label,
          properties: node.properties || {}
        }
      });
    });
  } 
  
  else {
    // ----------------------------------------------------
    // FLOWCHART, ARCHITECTURE, CLOUD (Layered/Dependency Layout)
    // ----------------------------------------------------
    // Count incoming edges to calculate hierarchy ranks
    const rankMap = new Map<string, number>();
    
    // Initialize ranks
    rawNodes.forEach(node => rankMap.set(node.id, 0));

    // Simple relaxation to determine ranks
    let changed = true;
    for (let iter = 0; iter < 10 && changed; iter++) {
      changed = false;
      rawEdges.forEach(edge => {
        const sourceRank = rankMap.get(edge.source) || 0;
        const targetRank = rankMap.get(edge.target) || 0;
        if (targetRank <= sourceRank) {
          rankMap.set(edge.target, sourceRank + 1);
          changed = true;
        }
      });
    }

    // Group nodes by ranks
    const rankGroups: Record<number, string[]> = {};
    rawNodes.forEach(node => {
      const r = rankMap.get(node.id) || 0;
      if (!rankGroups[r]) rankGroups[r] = [];
      rankGroups[r].push(node.id);
    });

    // Position nodes based on rank layers
    const dx = 280; // horizontal spacing
    const dy = 160; // vertical spacing

    rawNodes.forEach((node) => {
      const rank = rankMap.get(node.id) || 0;
      const group = rankGroups[rank];
      const index = group.indexOf(node.id);
      
      // Center vertical alignment for each layer
      const x = rank * dx + 50;
      const y = (index - (group.length - 1) / 2) * dy + 200;

      let nodeType = 'architecture';
      if (node.type === 'decision') nodeType = 'decision';
      if (node.type === 'cloud') nodeType = 'cloud';
      if (node.type === 'service') nodeType = 'service';

      nodes.push({
        id: node.id,
        type: nodeType,
        position: { x, y },
        data: { label: node.label }
      });
    });
  }

  return { nodes, edges };
};
