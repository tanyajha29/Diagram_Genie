import { Injectable } from '@nestjs/common';
import { ILayout } from '../interfaces/layout.interface';
import { LayoutRegistry } from '../registry/layout.registry';
import { Diagram } from '../../interfaces';

@Injectable()
export class GridLayout implements ILayout {
  readonly id = 'grid';

  constructor(private readonly registry: LayoutRegistry) {
    this.registry.register(this);
  }

  async layout(diagram: Diagram, options?: Record<string, any>): Promise<Diagram> {
    const spacingX = options?.spacingX || 160;
    const spacingY = options?.spacingY || 140;
    const columns = options?.columns || Math.ceil(Math.sqrt(diagram.nodes.length)) || 3;

    const positionedNodes = diagram.nodes.map((node, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;

      return {
        ...node,
        position: {
          x: col * spacingX + 100,
          y: row * spacingY + 100,
        },
      };
    });

    return {
      ...diagram,
      nodes: positionedNodes,
    };
  }
}
