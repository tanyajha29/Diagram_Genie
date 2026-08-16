import { Injectable } from '@nestjs/common';
import { IRendererAdapter } from '../interfaces/renderer-adapter.interface';
import { RendererAdapterRegistry } from '../registry/renderer-adapter.registry';
import { Diagram } from '../../../core/diagram-engine/diagram-engine.module';

export interface ReactFlowNode {
  id: string;
  type: string;
  data: { label: string; [key: string]: any };
  position: { x: number; y: number };
  width?: number;
  height?: number;
  style?: Record<string, any>;
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
  markerEnd?: {
    type: string;
    width?: number;
    height?: number;
    color?: string;
  };
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
    const category = (diagram.metadata?.sourceType || 'architecture').toLowerCase();

    // Determine category-aware edge type
    let defaultEdgeType = 'smoothstep'; // orthogonal elbow connectors for architecture / flows
    if (category.includes('mind') || category.includes('tree')) {
      defaultEdgeType = 'default'; // curved bezier paths for mindmaps
    } else if (category.includes('db') || category.includes('sql') || category.includes('er')) {
      defaultEdgeType = 'straight'; // straight path links for ER database diagrams
    }

    const nodes: ReactFlowNode[] = diagram.nodes.map((node) => {
      const isContainer = node.type === 'container' || node.type === 'group';
      return {
        id: node.id,
        type: node.type || 'default',
        position: node.position,
        width: node.width,
        height: node.height,
        style: isContainer ? { width: node.width, height: node.height, ...node.style } : node.style,
        data: {
          label: node.label,
          ...node.data,
          width: node.width,
          height: node.height,
        },
        parentId: node.parentId,
        extent: node.parentId ? 'parent' : undefined,
      };
    });

    const edges: ReactFlowEdge[] = diagram.edges.map((edge) => {
      const type = edge.type || defaultEdgeType;
      
      let markerType = 'arrowclosed';
      let edgeType = type;
      let animated = edge.animated;

      if (type === 'inheritance') {
        markerType = 'uml-inheritance';
        edgeType = 'straight';
        animated = false;
      } else if (type === 'aggregation') {
        markerType = 'uml-aggregation';
        edgeType = 'straight';
        animated = false;
      } else if (type === 'composition') {
        markerType = 'uml-composition';
        edgeType = 'straight';
        animated = false;
      } else if (type === 'dependency') {
        markerType = 'arrowclosed';
        edgeType = 'dashed';
        animated = true;
      } else if (type === 'association') {
        markerType = 'arrowclosed';
        edgeType = 'straight';
        animated = false;
      }

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edgeType,
        label: edge.label,
        animated,
        markerEnd: {
          type: markerType,
          width: 15,
          height: 15,
          color: '#64748b',
        },
      };
    });

    return { nodes, edges };
  }
}
