import { Injectable } from '@nestjs/common';
import { IRendererAdapter } from '../interfaces/renderer-adapter.interface';
import { RendererAdapterRegistry } from '../registry/renderer-adapter.registry';
import { Diagram } from '../../../core/diagram-engine/diagram-engine.module';

export interface ReactFlowNode {
  id: string;
  type: string;
  data: { label: string; [key: string]: any };
  position: { x: number; y: number };
  parentId?: string;
  extent?: 'parent';
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  animated?: boolean;
}

export interface ReactFlowGraph {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
}

@Injectable()
export class ReactFlowAdapter implements IRendererAdapter<ReactFlowGraph> {
  readonly id = 'react-flow';

  constructor(private readonly registry: RendererAdapterRegistry) {
    // Automatically register with the registry via constructor injection
    this.registry.register(this);
  }

  adapt(diagram: Diagram): ReactFlowGraph {
    const nodes: ReactFlowNode[] = diagram.nodes.map((node) => ({
      id: node.id,
      type: node.type || 'default',
      position: node.position,
      data: {
        label: node.label,
        ...node.data,
      },
      parentId: node.parentId,
      extent: node.parentId ? 'parent' : undefined,
    }));

    const edges: ReactFlowEdge[] = diagram.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      label: edge.label,
      animated: edge.animated,
    }));

    return { nodes, edges };
  }
}
