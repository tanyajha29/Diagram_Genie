import { Injectable } from '@nestjs/common';
import { ILayout } from '../interfaces/layout.interface';
import { LayoutRegistry } from '../registry/layout.registry';
import { Diagram } from '../../interfaces';

@Injectable()
export class ForceDirectedLayout implements ILayout {
  readonly id = 'force-directed';

  constructor(private readonly registry: LayoutRegistry) {
    this.registry.register(this);
  }

  async layout(diagram: Diagram, options?: Record<string, any>): Promise<Diagram> {
    if (diagram.nodes.length === 0) return diagram;

    const centerX = 400;
    const centerY = 300;
    const iterations = options?.iterations || 50;
    const k = options?.k || 120; // Ideal distance

    // Initialize positions in a small circle first to avoid overlap/coincident points
    const positions = new Map<string, { x: number; y: number }>();
    diagram.nodes.forEach((node, idx) => {
      const angle = (idx / diagram.nodes.length) * 2 * Math.PI;
      positions.set(node.id, {
        x: centerX + 50 * Math.cos(angle),
        y: centerY + 50 * Math.sin(angle),
      });
    });

    // Run simple spring physical forces simulation
    for (let step = 0; step < iterations; step++) {
      const displacements = new Map<string, { dx: number; dy: number }>();
      diagram.nodes.forEach(n => displacements.set(n.id, { dx: 0, dy: 0 }));

      // 1. Repulsive forces between all node pairs
      for (let i = 0; i < diagram.nodes.length; i++) {
        const u = diagram.nodes[i];
        for (let j = i + 1; j < diagram.nodes.length; j++) {
          const v = diagram.nodes[j];
          
          const posU = positions.get(u.id)!;
          const posV = positions.get(v.id)!;

          const dx = posU.x - posV.x;
          const dy = posU.y - posV.y;
          const dist = Math.hypot(dx, dy) || 0.1;

          // Repulsive force formula: f_r = k^2 / dist
          const force = (k * k) / dist;
          const du = displacements.get(u.id)!;
          const dv = displacements.get(v.id)!;

          displacements.set(u.id, {
            dx: du.dx + (dx / dist) * force,
            dy: du.dy + (dy / dist) * force,
          });
          displacements.set(v.id, {
            dx: dv.dx - (dx / dist) * force,
            dy: dv.dy - (dy / dist) * force,
          });
        }
      }

      // 2. Attractive forces along connected edges
      diagram.edges.forEach((edge) => {
        const posU = positions.get(edge.source);
        const posV = positions.get(edge.target);
        if (!posU || !posV) return;

        const dx = posU.x - posV.x;
        const dy = posU.y - posV.y;
        const dist = Math.hypot(dx, dy) || 0.1;

        // Attractive force formula: f_a = dist^2 / k
        const force = (dist * dist) / k;
        const du = displacements.get(edge.source)!;
        const dv = displacements.get(edge.target)!;

        displacements.set(edge.source, {
          dx: du.dx - (dx / dist) * force,
          dy: du.dy - (dy / dist) * force,
        });
        displacements.set(edge.target, {
          dx: dv.dx + (dx / dist) * force,
          dy: dv.dy + (dy / dist) * force,
        });
      });

      // 3. Apply displacements (damping/cooling values)
      const temperature = Math.max(0.1, 10 - step * 0.2);
      diagram.nodes.forEach((node) => {
        const pos = positions.get(node.id)!;
        const disp = displacements.get(node.id)!;

        const dispDist = Math.hypot(disp.dx, disp.dy) || 0.1;
        const limit = Math.min(dispDist, temperature);

        positions.set(node.id, {
          x: pos.x + (disp.dx / dispDist) * limit,
          y: pos.y + (disp.dy / dispDist) * limit,
        });
      });
    }

    const positionedNodes = diagram.nodes.map((node) => {
      const pos = positions.get(node.id) || { x: centerX, y: centerY };
      return {
        ...node,
        position: {
          x: Math.round(pos.x),
          y: Math.round(pos.y),
        },
      };
    });

    return {
      ...diagram,
      nodes: positionedNodes,
    };
  }
}
