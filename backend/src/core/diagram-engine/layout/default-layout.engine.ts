import { Injectable } from '@nestjs/common';
import { LayoutEngine } from '../interfaces/layout-engine.interface';
import { Diagram } from '../interfaces/diagram.interface';
import { DiagramEngineRegistry } from '../registry/engine.registry';

@Injectable()
export class DefaultLayoutEngine implements LayoutEngine {
  readonly id = 'default';

  constructor(private readonly registry: DiagramEngineRegistry) {
    // Automatically register layout engine upon DI initialization
    this.registry.registerLayoutEngine(this);
  }

  async layout(diagram: Diagram, options?: Record<string, any>): Promise<Diagram> {
    const spacing = 150;
    const nodesPerRow = 3;

    // Simple grid layout fallback positioning for coordinates
    const positionedNodes = diagram.nodes.map((node, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      
      return {
        ...node,
        position: {
          x: node.position.x || col * spacing + 100,
          y: node.position.y || row * spacing + 100,
        },
      };
    });

    return {
      ...diagram,
      nodes: positionedNodes,
    };
  }
}
