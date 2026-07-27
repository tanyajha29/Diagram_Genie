import { Injectable } from '@nestjs/common';
import { ILayout } from '../interfaces/layout.interface';
import { LayoutRegistry } from '../registry/layout.registry';
import { Diagram } from '../../interfaces';

@Injectable()
export class DagLayout implements ILayout {
  readonly id = 'dag';

  constructor(private readonly registry: LayoutRegistry) {
    this.registry.register(this);
  }

  async layout(diagram: Diagram, options?: Record<string, any>): Promise<Diagram> {
    const spacingX = options?.spacingX || 200;
    const spacingY = options?.spacingY || 130;

    // Standard topological ranking logic for Directed Acyclic Graphs (DAGs)
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();
    
    diagram.nodes.forEach((node) => {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    });

    diagram.edges.forEach((edge) => {
      if (adjList.has(edge.source) && inDegree.has(edge.target)) {
        adjList.get(edge.source)!.push(edge.target);
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      }
    });

    // Kahn's algorithm or simple queue mapping to resolve layered ranks
    const queue: string[] = [];
    const ranks = new Map<string, number>();
    
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
        ranks.set(nodeId, 0);
      }
    });

    while (queue.length > 0) {
      const u = queue.shift()!;
      const currentRank = ranks.get(u) || 0;
      
      const neighbors = adjList.get(u) || [];
      neighbors.forEach((v) => {
        inDegree.set(v, (inDegree.get(v) || 1) - 1);
        
        // Push rank forward
        const prevRank = ranks.get(v) || 0;
        ranks.set(v, Math.max(prevRank, currentRank + 1));
        
        if (inDegree.get(v) === 0) {
          queue.push(v);
        }
      });
    }

    // Rank groups arrangement
    const rankGroups = new Map<number, string[]>();
    ranks.forEach((rank, nodeId) => {
      if (!rankGroups.has(rank)) {
        rankGroups.set(rank, []);
      }
      rankGroups.get(rank)!.push(nodeId);
    });

    const positions = new Map<string, { x: number; y: number }>();

    rankGroups.forEach((nodeIds, rank) => {
      nodeIds.forEach((nodeId, idx) => {
        positions.set(nodeId, {
          x: idx * spacingX + 150,
          y: rank * spacingY + 100,
        });
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
