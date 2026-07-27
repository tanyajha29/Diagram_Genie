import { Injectable } from '@nestjs/common';
import { ILayout } from '../interfaces/layout.interface';
import { LayoutRegistry } from '../registry/layout.registry';
import { Diagram, DiagramNode } from '../../interfaces';

@Injectable()
export class TreeLayout implements ILayout {
  readonly id = 'tree';

  constructor(private readonly registry: LayoutRegistry) {
    this.registry.register(this);
  }

  async layout(diagram: Diagram, options?: Record<string, any>): Promise<Diagram> {
    const spacingX = options?.spacingX || 160;
    const spacingY = options?.spacingY || 120;
    
    // Find all root nodes (nodes with no incoming edges)
    const targets = new Set(diagram.edges.map(e => e.target));
    const roots = diagram.nodes.filter(n => !targets.has(n.id));

    // If no roots, fallback to the first node
    const actualRoots = roots.length > 0 ? roots : (diagram.nodes.length > 0 ? [diagram.nodes[0]] : []);

    const visited = new Set<string>();
    const positions = new Map<string, { x: number; y: number }>();

    // Helper to perform recursive layout positioning
    const layoutSubtree = (nodeId: string, depth: number, offsetX: number): number => {
      if (visited.has(nodeId)) return 0;
      visited.add(nodeId);

      const children = diagram.edges.filter(e => e.source === nodeId).map(e => e.target);
      
      let width = 0;
      if (children.length > 0) {
        let childOffsetX = offsetX;
        children.forEach((childId) => {
          const childWidth = layoutSubtree(childId, depth + 1, childOffsetX);
          width += childWidth;
          childOffsetX += childWidth;
        });
      } else {
        width = spacingX;
      }

      // Center parent above children
      const posX = offsetX + (width - spacingX) / 2;
      const posY = depth * spacingY + 100;
      positions.set(nodeId, { x: posX, y: posY });

      return width;
    };

    let nextRootOffsetX = 100;
    actualRoots.forEach((root) => {
      const rootWidth = layoutSubtree(root.id, 0, nextRootOffsetX);
      nextRootOffsetX += rootWidth + spacingX;
    });

    // Apply computed positions
    const positionedNodes = diagram.nodes.map((node) => {
      const pos = positions.get(node.id) || { x: 100, y: 100 };
      return {
        ...node,
        position: pos,
      };
    });

    return {
      ...diagram,
      nodes: positionedNodes,
    };
  }
}
