import { Injectable } from '@nestjs/common';
import { ILayout } from '../interfaces/layout.interface';
import { LayoutRegistry } from '../registry/layout.registry';
import { Diagram } from '../../interfaces';

@Injectable()
export class RadialLayout implements ILayout {
  readonly id = 'radial';

  constructor(private readonly registry: LayoutRegistry) {
    this.registry.register(this);
  }

  async layout(diagram: Diagram, options?: Record<string, any>): Promise<Diagram> {
    if (diagram.nodes.length === 0) return diagram;

    const centerX = options?.centerX || 400;
    const centerY = options?.centerY || 300;
    const initialRadius = options?.initialRadius || 120;
    const radiusGrowth = options?.radiusGrowth || 100;
    const maxNodesPerRing = options?.maxNodesPerRing || 6;

    const positions = new Map<string, { x: number; y: number }>();

    // Root node goes in the center
    const rootId = diagram.nodes[0].id;
    positions.set(rootId, { x: centerX, y: centerY });

    // Place remaining nodes in concentric circles
    const remainingNodes = diagram.nodes.slice(1);
    
    let currentRing = 1;
    let nodesInCurrentRing = 0;
    let currentRadius = initialRadius;

    remainingNodes.forEach((node, index) => {
      // Determine max nodes for the current ring level
      const maxInRing = maxNodesPerRing * currentRing;
      
      // Calculate angle
      const angle = (nodesInCurrentRing / maxInRing) * 2 * Math.PI;
      const x = centerX + currentRadius * Math.cos(angle);
      const y = centerY + currentRadius * Math.sin(angle);

      positions.set(node.id, { x, y });

      nodesInCurrentRing++;
      if (nodesInCurrentRing >= maxInRing) {
        currentRing++;
        nodesInCurrentRing = 0;
        currentRadius += radiusGrowth;
      }
    });

    const positionedNodes = diagram.nodes.map((node) => {
      const pos = positions.get(node.id) || { x: centerX, y: centerY };
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
