import { Injectable } from '@nestjs/common';
import { IRendererAdapter } from '../interfaces/renderer-adapter.interface';
import { RendererAdapterRegistry } from '../registry/renderer-adapter.registry';
import { Diagram } from '../../../core/diagram-engine/diagram-engine.module';

export interface CytoscapeElement {
  data: { id: string; source?: string; target?: string; label?: string; [key: string]: any };
  position?: { x: number; y: number };
}

@Injectable()
export class CytoscapeAdapter implements IRendererAdapter<CytoscapeElement[]> {
  readonly id = 'cytoscape';

  constructor(private readonly registry: RendererAdapterRegistry) {
    this.registry.register(this);
  }

  adapt(diagram: Diagram): CytoscapeElement[] {
    const elements: CytoscapeElement[] = [];

    // Map nodes
    diagram.nodes.forEach((node) => {
      elements.push({
        data: { id: node.id, label: node.label, ...node.data },
        position: node.position,
      });
    });

    // Map edges
    diagram.edges.forEach((edge) => {
      elements.push({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
        },
      });
    });

    return elements;
  }
}
