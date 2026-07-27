import { Injectable } from '@nestjs/common';
import { IRendererAdapter } from '../interfaces/renderer-adapter.interface';
import { RendererAdapterRegistry } from '../registry/renderer-adapter.registry';
import { Diagram } from '../../../core/diagram-engine/diagram-engine.module';

@Injectable()
export class MermaidAdapter implements IRendererAdapter<string> {
  readonly id = 'mermaid';

  constructor(private readonly registry: RendererAdapterRegistry) {
    this.registry.register(this);
  }

  adapt(diagram: Diagram): string {
    let output = 'graph TD\n';
    
    // Append nodes
    diagram.nodes.forEach((node) => {
      const nodeLabel = node.label.replace(/"/g, '\\"');
      output += `    ${node.id}["${nodeLabel}"]\n`;
    });

    // Append edges
    diagram.edges.forEach((edge) => {
      if (edge.label) {
        const edgeLabel = edge.label.replace(/"/g, '\\"');
        output += `    ${edge.source} -- "${edgeLabel}" --> ${edge.target}\n`;
      } else {
        output += `    ${edge.source} --> ${edge.target}\n`;
      }
    });

    return output;
  }
}
