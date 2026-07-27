import { Injectable } from '@nestjs/common';
import { ILayout } from '../interfaces/layout.interface';
import { LayoutRegistry } from '../registry/layout.registry';
import { Diagram } from '../../interfaces';

@Injectable()
export class HierarchicalLayout implements ILayout {
  readonly id = 'hierarchical';

  constructor(private readonly registry: LayoutRegistry) {
    this.registry.register(this);
  }

  async layout(diagram: Diagram, options?: Record<string, any>): Promise<Diagram> {
    const spacingX = options?.spacingX || 180;
    const spacingY = options?.spacingY || 140;

    // Compute simple rank levels based on incoming path depths
    const ranks = new Map<string, number>();
    diagram.nodes.forEach(node => ranks.set(node.id, 0));

    let changed = true;
    let iterations = 0;
    
    // Iteratively resolve rank placements until stable (limit to 10 iterations to prevent infinite cycles)
    while (changed && iterations < 10) {
      changed = false;
      iterations++;
      
      diagram.edges.forEach((edge) => {
        const sourceRank = ranks.get(edge.source) || 0;
        const targetRank = ranks.get(edge.target) || 0;
        if (targetRank <= sourceRank) {
          ranks.set(edge.target, sourceRank + 1);
          changed = true;
        }
      });
    }

    // Group nodes by rank level
    const rankGroups = new Map<number, string[]>();
    ranks.forEach((rank, nodeId) => {
      if (!rankGroups.has(rank)) {
        rankGroups.set(rank, []);
      }
      rankGroups.get(rank)!.push(nodeId);
    });

    const positions = new Map<string, { x: number; y: number }>();

    // Calculate layout coordinates
    rankGroups.forEach((nodeIds, rank) => {
      const totalWidth = (nodeIds.length - 1) * spacingX;
      const startX = 100 - totalWidth / 2;
      const posY = rank * spacingY + 100;

      nodeIds.forEach((nodeId, idx) => {
        const posX = startX + idx * spacingX + 200; // Centered offsets
        positions.set(nodeId, { x: posX, y: posY });
      });
    });

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
